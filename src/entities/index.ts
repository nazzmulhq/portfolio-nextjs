/**
 * TypeORM entities.
 *
 * These MIRROR migrations/001_init.sql; they do not generate it.
 * `synchronize` is off everywhere — the .sql files are the source of truth, and
 * letting an ORM alter a production schema from a decorator diff is how columns
 * quietly disappear.
 *
 * Column names are given explicitly in snake_case. That is not decoration: the
 * previous generated schema paired snake_case tables with camelCase columns, so
 * every hand-written statement needed exact double-quoting and a missing pair
 * failed only at runtime. One convention, stated at each column, removes it.
 */

import {
	Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
	PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from "typeorm";

export enum Role {
	User = "user",
	Admin = "admin",
	Root = "root",
}

export enum Plan {
	Free = "free",
	Trial = "trial",
	Pro = "pro",
}

export enum Status {
	Active = "active",
	Inactive = "inactive",
}

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ unique: true }) email!: string;
	@Column({ type: "text", nullable: true }) name!: string | null;
	/** Null for accounts that only ever signed in with Google/GitHub. */
	@Column({ name: "password_hash", type: "text", nullable: true }) passwordHash!: string | null;
	@Column({ type: "enum", enum: Role, default: Role.User }) role!: Role;

	@Index() @Column({ type: "enum", enum: Plan, default: Plan.Pro }) plan!: Plan;
	@Column({ name: "plan_source", type: "text", nullable: true }) planSource!: string | null;
	@Column({ name: "trial_started_at", type: "timestamptz", nullable: true }) trialStartedAt!: Date | null;
	@Column({ name: "trial_ends_at", type: "timestamptz", nullable: true }) trialEndsAt!: Date | null;
	@Column({ name: "plan_expires_at", type: "timestamptz", nullable: true }) planExpiresAt!: Date | null;

	@Column({ type: "enum", enum: Status, default: Status.Active }) status!: Status;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity("sessions")
@Index(["userId", "revokedAt"])
export class Session {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "user_id", type: "uuid" }) userId!: string;
	@ManyToOne(() => User, { onDelete: "CASCADE" }) @JoinColumn({ name: "user_id" }) user!: User;

	@Column({ unique: true }) jti!: string;
	@Column({ name: "refresh_token_hash", unique: true }) refreshTokenHash!: string;

	@Column({ name: "device_id", type: "text", nullable: true }) deviceId!: string | null;
	@Column({ type: "text", nullable: true }) product!: string | null;
	@Column({ name: "app_version", type: "text", nullable: true }) appVersion!: string | null;
	@Column({ type: "text", nullable: true }) os!: string | null;
	@Column({ type: "text", nullable: true }) arch!: string | null;
	@Column({ type: "text", nullable: true }) ip!: string | null;
	@Column({ type: "text", nullable: true }) country!: string | null;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
	@Column({ name: "last_seen_at", type: "timestamptz", default: () => "now()" }) lastSeenAt!: Date;
	@Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
	@Column({ name: "revoked_at", type: "timestamptz", nullable: true }) revokedAt!: Date | null;
	@Column({ name: "revoked_reason", type: "text", nullable: true }) revokedReason!: string | null;
}

@Entity("devices")
@Unique(["userId", "deviceId"])
export class Device {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "user_id", type: "uuid" }) userId!: string;
	@Column({ name: "device_id" }) deviceId!: string;
	@Column({ type: "text", nullable: true }) product!: string | null;
	@Column({ type: "text", nullable: true }) os!: string | null;
	@Column({ type: "text", nullable: true }) arch!: string | null;
	@Column({ name: "first_seen_at", type: "timestamptz", default: () => "now()" }) firstSeenAt!: Date;
	@Column({ name: "last_seen_at", type: "timestamptz", default: () => "now()" }) lastSeenAt!: Date;
}

@Entity("activity_events")
@Index(["userId", "serverTs"])
@Index(["action", "serverTs"])
@Index(["quarantined", "serverTs"])
export class ActivityEvent {
	/** Client-generated UUIDv7 — also the idempotency key. Not server-generated. */
	@PrimaryColumn({ type: "text" }) id!: string;

	@Column({ name: "user_id", type: "uuid", nullable: true }) userId!: string | null;
	@Column({ type: "bigint", nullable: true }) seq!: string | null;
	@Column({ name: "device_id", type: "text", nullable: true }) deviceId!: string | null;
	@Column({ name: "session_id", type: "text", nullable: true }) sessionId!: string | null;
	@Column({ type: "text" }) product!: string;
	@Column({ name: "app_version", type: "text", nullable: true }) appVersion!: string | null;

	@Column({ type: "text" }) section!: string;
	@Column({ type: "text" }) action!: string;
	@Column({ type: "int", default: 0 }) severity!: number;

	@Column({ name: "feature_id", type: "text", nullable: true }) featureId!: string | null;
	@Column({ type: "text", nullable: true }) surface!: string | null;

	@Column({ name: "target_kind", type: "text", nullable: true }) targetKind!: string | null;
	@Column({ name: "target_conn_id", type: "text", nullable: true }) targetConnId!: string | null;
	@Column({ name: "target_engine", type: "text", nullable: true }) targetEngine!: string | null;
	@Column({ name: "target_db", type: "text", nullable: true }) targetDb!: string | null;
	@Column({ name: "target_table", type: "text", nullable: true }) targetTable!: string | null;

	@Column({ type: "text", default: "ok" }) status!: string;
	@Column({ name: "error_code", type: "text", nullable: true }) errorCode!: string | null;
	@Column({ name: "duration_ms", type: "int", nullable: true }) durationMs!: number | null;
	@Column({ name: "row_count", type: "int", nullable: true }) rowCount!: number | null;
	@Column({ name: "sql_fingerprint", type: "text", nullable: true }) sqlFingerprint!: string | null;
	@Column({ name: "sql_shape", type: "text", nullable: true }) sqlShape!: string | null;
	@Column({ type: "jsonb", nullable: true }) extra!: Record<string, unknown> | null;

	@Column({ name: "client_ts", type: "timestamptz" }) clientTs!: Date;
	@Column({ name: "server_ts", type: "timestamptz", default: () => "now()" }) serverTs!: Date;
	@Column({ type: "boolean", default: false }) quarantined!: boolean;

	@Column({ type: "text", nullable: true }) ip!: string | null;
	@Column({ type: "text", nullable: true }) country!: string | null;
	@Column({ type: "text", nullable: true }) region!: string | null;
	@Column({ type: "text", nullable: true }) city!: string | null;
}

@Entity("mirrored_items")
@Unique(["userId", "kind", "clientId"])
export class MirroredItem {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "user_id", type: "uuid" }) userId!: string;
	@Column({ name: "client_id" }) clientId!: string;
	@Column({ type: "text" }) kind!: string;
	@Column({ type: "int", default: 1 }) rev!: number;
	@Column({ type: "jsonb", default: () => "'{}'::jsonb" }) payload!: Record<string, unknown>;
	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
	@Column({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}

@Entity("usage_events")
@Unique(["userId", "feature"])
export class UsageEvent {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "user_id", type: "uuid" }) userId!: string;
	@Column({ type: "text" }) feature!: string;
	@Column({ type: "int", default: 1 }) count!: number;
	@Column({ name: "last_used", type: "timestamptz", default: () => "now()" }) lastUsed!: Date;
}

@Entity("telemetry_events")
export class TelemetryEvent {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "install_id" }) installId!: string;
	@Column({ type: "text", nullable: true }) version!: string | null;
	@Column({ type: "text", nullable: true }) platform!: string | null;
	@Column({ type: "text", nullable: true }) feature!: string | null;
	@Column({ type: "timestamptz", default: () => "now()" }) ts!: Date;
}



// ── Team / collaboration ────────────────────────────────────────────────────
// Mirrors migrations/002_workspaces.sql. The wire field names these produce are
// snake_case because the shipped v1.2.8 client declares them that way.

@Entity("workspaces")
export class Workspace {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ type: "text" }) name!: string;
	@Column({ name: "owner_id", type: "uuid" }) ownerId!: string;
	@Column({ name: "join_code", unique: true }) joinCode!: string;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("workspace_members")
export class WorkspaceMember {
	@PrimaryColumn({ name: "workspace_id", type: "uuid" }) workspaceId!: string;
	@PrimaryColumn({ name: "user_id", type: "uuid" }) userId!: string;
	@Column({ type: "text", default: "member" }) role!: string;
	@CreateDateColumn({ name: "joined_at", type: "timestamptz" }) joinedAt!: Date;
}

@Entity("shared_queries")
export class SharedQuery {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "workspace_id", type: "uuid" }) workspaceId!: string;
	@Column({ name: "author_id", type: "uuid" }) authorId!: string;
	@Column({ type: "text" }) name!: string;
	@Column({ type: "text" }) sql!: string;
	@Column({ type: "text", nullable: true }) description!: string | null;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}

@Entity("query_comments")
export class QueryComment {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "query_id", type: "uuid" }) queryId!: string;
	@Column({ name: "author_id", type: "uuid" }) authorId!: string;
	@Column({ type: "text" }) body!: string;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("scheduled_jobs")
export class ScheduledJob {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "workspace_id", type: "uuid" }) workspaceId!: string;
	@Column({ type: "text" }) name!: string;
	@Column({ type: "text" }) sql!: string;
	@Column({ type: "text" }) cron!: string;
	@Column({ name: "connection_label", type: "text", nullable: true }) connectionLabel!: string | null;
	/** INTEGER, matching the shipped client's `enabled: number`. */
	@Column({ type: "int", default: 1 }) enabled!: number;
	@Column({ name: "last_run_at", type: "timestamptz", nullable: true }) lastRunAt!: Date | null;
	@Column({ name: "last_status", type: "text", nullable: true }) lastStatus!: string | null;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("job_runs")
export class JobRun {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "job_id", type: "uuid" }) jobId!: string;
	@Column({ type: "text" }) status!: string;
	@Column({ type: "text", nullable: true }) detail!: string | null;
	@CreateDateColumn({ name: "ran_at", type: "timestamptz" }) ranAt!: Date;
}

@Entity("metric_snapshots")
export class MetricSnapshot {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "workspace_id", type: "uuid" }) workspaceId!: string;
	@Column({ name: "connection_label", type: "text" }) connectionLabel!: string;
	@Column({ type: "int", nullable: true }) connections!: number | null;
	@Column({ name: "active_queries", type: "int", nullable: true }) activeQueries!: number | null;
	@Column({ name: "uptime_sec", type: "int", nullable: true }) uptimeSec!: number | null;
	@CreateDateColumn({ name: "captured_at", type: "timestamptz" }) capturedAt!: Date;
}

@Entity("audit_entries")
export class AuditEntry {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "workspace_id", type: "uuid" }) workspaceId!: string;
	@Column({ name: "user_id", type: "uuid", nullable: true }) userId!: string | null;
	@Column({ type: "text" }) action!: string;
	@Column({ type: "text", nullable: true }) target!: string | null;
	@Column({ name: "connection_label", type: "text", nullable: true }) connectionLabel!: string | null;
	@Column({ type: "text", nullable: true }) detail!: string | null;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

export const TEAM_ENTITIES = [
	Workspace, WorkspaceMember, SharedQuery, QueryComment,
	ScheduledJob, JobRun, MetricSnapshot, AuditEntry,
];



// ── Browser-based sign-in ───────────────────────────────────────────────────
// Mirrors migrations/003_device_auth.sql.

@Entity("device_auth")
export class DeviceAuth {
	@PrimaryGeneratedColumn("uuid") id!: string;
	/** SHA-256 of the client's secret. Never the secret itself. */
	@Column({ name: "device_code_hash", unique: true }) deviceCodeHash!: string;
	/** Short, human-typable. Only usable while pending, and rate limited. */
	@Column({ name: "user_code", unique: true }) userCode!: string;

	@Column({ type: "text", nullable: true }) product!: string | null;
	@Column({ name: "app_version", type: "text", nullable: true }) appVersion!: string | null;
	@Column({ name: "device_id", type: "text", nullable: true }) deviceId!: string | null;
	@Column({ type: "text", nullable: true }) os!: string | null;
	@Column({ name: "client_ip", type: "text", nullable: true }) clientIp!: string | null;

	@Column({ name: "user_id", type: "uuid", nullable: true }) userId!: string | null;
	@Column({ name: "approved_at", type: "timestamptz", nullable: true }) approvedAt!: Date | null;
	@Column({ name: "consumed_at", type: "timestamptz", nullable: true }) consumedAt!: Date | null;
	@Column({ name: "denied_at", type: "timestamptz", nullable: true }) deniedAt!: Date | null;

	@Column({ name: "last_polled_at", type: "timestamptz", nullable: true }) lastPolledAt!: Date | null;
	@Column({ name: "poll_count", type: "int", default: 0 }) pollCount!: number;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
	@Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
}

@Entity("user_identities")
@Unique(["provider", "providerUid"])
export class UserIdentity {
	@PrimaryGeneratedColumn("uuid") id!: string;
	@Column({ name: "user_id", type: "uuid" }) userId!: string;
	@Column({ type: "text" }) provider!: "google" | "github";
	/**
	 * The provider's stable subject id — NOT the email. Emails change hands, and
	 * matching on them lets whoever acquires an old address take the account.
	 */
	@Column({ name: "provider_uid", type: "text" }) providerUid!: string;
	@Column({ type: "text", nullable: true }) email!: string | null;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

@Entity("oauth_states")
export class OAuthState {
	@PrimaryColumn({ type: "text" }) state!: string;
	@Column({ type: "text" }) provider!: string;
	@Column({ name: "device_id", type: "uuid", nullable: true }) deviceId!: string | null;
	@Column({ name: "callback_uri", type: "text", nullable: true }) callbackUri!: string | null;
	@CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
	@Column({ name: "expires_at", type: "timestamptz" }) expiresAt!: Date;
}

export const AUTH_ENTITIES = [DeviceAuth, UserIdentity, OAuthState];

export const ENTITIES = [
	User, Session, Device, ActivityEvent, MirroredItem, UsageEvent, TelemetryEvent,
	...TEAM_ENTITIES,
	...AUTH_ENTITIES,
];
