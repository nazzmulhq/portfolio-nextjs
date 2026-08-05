import { randomBytes, createHash } from "crypto";
import * as argon2 from "argon2";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { DataSource, IsNull } from "typeorm";
import { User, Session, Device, UserIdentity } from "../../entities";

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 30;
export const TRIAL_DAYS = 30;

export interface SessionMeta {
    deviceId?: string;
    product?: string;
    appVersion?: string;
    os?: string;
    arch?: string;
    ip?: string;
    country?: string;
}

function sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

function newRefreshToken(): string {
    return randomBytes(32).toString("base64url");
}

export class AuthService {
    constructor(private readonly dataSource: DataSource) {}

    private get users() { return this.dataSource.getRepository(User); }
    private get sessions() { return this.dataSource.getRepository(Session); }
    private get devices() { return this.dataSource.getRepository(Device); }
    private get identities() { return this.dataSource.getRepository(UserIdentity); }

    async issueForUser(userId: string, meta: SessionMeta) {
        const user = await this.users.findOneOrFail({ where: { id: userId } });
        if (user.status !== "active") throw new Error("This account is suspended.");
        return this.issue(user, meta);
    }

    async upsertOAuthUser(provider: "github" | "google", providerUid: string, email: string | null, name: string | null): Promise<string> {
        return this.dataSource.transaction(async (tx) => {
            const identities = tx.getRepository(UserIdentity);
            const users = tx.getRepository(User);

            const existingIdentity = await identities.findOne({ where: { provider, providerUid } });
            if (existingIdentity) return existingIdentity.userId;

            if (!email) throw new Error(`Email is required from ${provider} to create an account.`);

            const normalizedEmail = email.trim().toLowerCase();
            let user = await users.findOne({ where: { email: normalizedEmail } });

            if (!user) {
                const isRoot = !!process.env.QUICKDB_ROOT_EMAIL && process.env.QUICKDB_ROOT_EMAIL.trim().toLowerCase() === normalizedEmail;
                user = users.create({
                    email: normalizedEmail,
                    name: name || null,
                    passwordHash: null,
                    role: isRoot ? "root" : "user",
                    plan: "trial",
                    planSource: "signup",
                    trialStartedAt: new Date(),
                    trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86_400_000),
                });
                user = await users.save(user);
            }

            await identities.insert({
                userId: user.id,
                provider,
                providerUid,
                email: normalizedEmail,
            });

            return user.id;
        });
    }

    private async hash(password: string): Promise<string> {
        return argon2.hash(password, { type: argon2.argon2id });
    }

    private async verify(stored: string, password: string): Promise<{ ok: boolean; rehash: boolean }> {
        if (stored.startsWith("$2")) {
            const ok = await bcrypt.compare(password, stored);
            return { ok, rehash: ok };
        }
        try {
            return { ok: await argon2.verify(stored, password), rehash: false };
        } catch {
            return { ok: false, rehash: false };
        }
    }

    private async signJwt(payload: any, expiresIn: string) {
        const secret = process.env.JWT_SECRET || "development_secret";
        return new Promise<string>((resolve, reject) => {
            const options: jwt.SignOptions = { expiresIn: expiresIn as any };
            jwt.sign(payload, secret, options, (err, token) => {
                if (err || !token) reject(err);
                else resolve(token);
            });
        });
    }

    async register(email: string, password: string, name: string | undefined, meta: SessionMeta) {
        const normalized = email.trim().toLowerCase();
        if (!normalized.includes("@")) throw new Error("A valid email is required.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (await this.users.findOne({ where: { email: normalized } })) {
            throw new Error("An account with that email already exists.");
        }

        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);

        const isFirst = (await this.users.count()) === 0;
        const isConfiguredRoot =
            !!process.env.QUICKDB_ROOT_EMAIL &&
            process.env.QUICKDB_ROOT_EMAIL.trim().toLowerCase() === normalized;

        const user = await this.users.save(
            this.users.create({
                email: normalized,
                name: name?.trim() || null,
                passwordHash: await this.hash(password),
                role: isFirst || isConfiguredRoot ? "root" : "user",
                plan: "trial",
                planSource: "trial",
                trialStartedAt: now,
                trialEndsAt,
            }),
        );

        return this.issue(user, meta);
    }

    async login(email: string, password: string, meta: SessionMeta) {
        const normalized = email.trim().toLowerCase();
        const user = await this.users.findOne({ where: { email: normalized } });
        if (!user) throw new Error("Incorrect email or password.");
        if (user.status !== "active") throw new Error("This account is suspended.");

        if (!user.passwordHash) {
            throw new Error("This account signs in with Google or GitHub. Use that button instead.");
        }

        const { ok, rehash } = await this.verify(user.passwordHash, password);
        if (!ok) throw new Error("Incorrect email or password.");

        if (rehash) {
            await this.users.update(user.id, { passwordHash: await this.hash(password) });
        }

        return this.issue(user, meta);
    }

    async refresh(refreshToken: string, meta: SessionMeta) {
        const hash = sha256(refreshToken);
        const session = await this.sessions.findOne({ where: { refreshTokenHash: hash } });

        if (!session) throw new Error("Invalid token");

        if (session.revokedAt) {
            await this.sessions.update(
                { userId: session.userId, revokedAt: IsNull() },
                { revokedAt: new Date(), revokedReason: "reuse_detected" },
            );
            throw new Error("Session revoked");
        }

        if (session.expiresAt < new Date()) {
            await this.sessions.update(session.id, { revokedAt: new Date(), revokedReason: "expired" });
            throw new Error("Session expired");
        }

        const user = await this.users.findOneOrFail({ where: { id: session.userId } });
        if (user.status !== "active") throw new Error("Account suspended");

        const rotated = newRefreshToken();
        const jti = randomBytes(16).toString("hex");
        const now = new Date();

        await this.sessions.update(session.id, {
            jti,
            refreshTokenHash: sha256(rotated),
            lastSeenAt: now,
            expiresAt: new Date(now.getTime() + REFRESH_TTL_DAYS * 86_400_000),
            ip: meta.ip ?? session.ip,
            country: meta.country ?? session.country,
        });

        return {
            token: await this.signJwt(
                { sub: user.id, email: user.email, role: user.role, plan: user.plan, jti, sid: session.id },
                ACCESS_TTL
            ),
            refreshToken: rotated,
            session: { id: session.id, jti },
            server_time: now.toISOString(),
            user: this.publicUser(user),
        };
    }

    async me(userId: string) {
        let user = await this.users.findOneOrFail({ where: { id: userId } });
        const now = new Date();

        if (user.plan === "trial" && user.trialEndsAt && user.trialEndsAt <= now) {
            await this.users.update(user.id, { plan: "free", planSource: "trial_expired" });
            user = await this.users.findOneOrFail({ where: { id: user.id } });
        }

        const isPro =
            user.plan === "pro"
                ? !user.planExpiresAt || user.planExpiresAt > now
                : user.plan === "trial";

        return {
            ...this.publicUser(user),
            entitlement: {
                tier: isPro ? "pro" : "free",
                reason: user.plan === "trial" ? "trial" : user.plan === "pro" ? "subscription" : "free",
                expires_at:
                    (user.plan === "trial" ? user.trialEndsAt : user.planExpiresAt)?.toISOString() ?? null,
            },
            server_time: now.toISOString(),
        };
    }

    private async issue(user: { id: string; email: string; role: string }, meta: SessionMeta) {
        const jti = randomBytes(16).toString("hex");
        const refreshToken = newRefreshToken();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + REFRESH_TTL_DAYS * 86_400_000);

        const session = await this.dataSource.transaction(async (tx) => {
            await tx.getRepository(Session).update(
                { userId: user.id, revokedAt: IsNull() },
                { revokedAt: now, revokedReason: "superseded" },
            );
            const repo = tx.getRepository(Session);
            return repo.save(
                repo.create({
                    userId: user.id,
                    jti,
                    refreshTokenHash: sha256(refreshToken),
                    expiresAt,
                    deviceId: meta.deviceId ?? null,
                    product: meta.product ?? null,
                    appVersion: meta.appVersion ?? null,
                    os: meta.os ?? null,
                    arch: meta.arch ?? null,
                    ip: meta.ip ?? null,
                    country: meta.country ?? null,
                }),
            );
        });

        if (meta.deviceId) {
            await this.devices
                .createQueryBuilder()
                .insert()
                .values({
                    userId: user.id,
                    deviceId: meta.deviceId,
                    product: meta.product ?? null,
                    os: meta.os ?? null,
                    arch: meta.arch ?? null,
                })
                .orUpdate(["product", "os", "arch", "last_seen_at"], ["user_id", "device_id"])
                .execute();
        }

        const full = await this.users.findOneOrFail({ where: { id: user.id } });

        return {
            token: await this.signJwt(
                { sub: user.id, email: user.email, role: full.role, plan: full.plan, jti, sid: session.id },
                ACCESS_TTL
            ),
            refreshToken,
            session: { id: session.id, jti },
            server_time: now.toISOString(),
            user: this.publicUser(full),
        };
    }

    private publicUser(u: any) {
        return {
            id: u.id,
            email: u.email,
            name: u.name ?? undefined,
            role: u.role,
            plan: u.plan,
            trial_ends_at: u.trialEndsAt?.toISOString() ?? null,
        };
    }
}
