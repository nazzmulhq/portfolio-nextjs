"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DocThemeToggle from "@src/components/DocThemeToggle";

function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUri = searchParams.get("callback_uri") || "";
    
    const githubUrl = `/api/quickdb/auth/oauth/github/start${callbackUri ? `?callback_uri=${encodeURIComponent(callbackUri)}` : ''}`;
    const googleUrl = `/api/quickdb/auth/oauth/google/start${callbackUri ? `?callback_uri=${encodeURIComponent(callbackUri)}` : ''}`;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/quickdb/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, callbackUri }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Invalid credentials");
            }

            const data = await res.json();

            // If the API returns an auth code for a deep link redirect
            if (data.code && callbackUri) {
                if (callbackUri.startsWith("/")) {
                    const relativeUrl = new URL(callbackUri, window.location.origin);
                    relativeUrl.searchParams.set("code", data.code);
                    window.location.href = relativeUrl.toString();
                } else {
                    const absoluteUrl = new URL(callbackUri);
                    absoluteUrl.searchParams.set("code", data.code);
                    window.location.href = absoluteUrl.toString();
                }
                return; // don't show the success state if we are redirecting
            }

            // Normal browser success
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="reveal-scale mb-8 text-center">
                    <Link href="/quickdb" className="inline-block">
                        <div className="rounded-2xl border border-line !bg-white/5 p-2 shadow-[0_0_40px_-10px_var(--glow)] backdrop-blur-xl transition-transform hover:scale-105">
                            <img src="/images/quickdb-icon.png" alt="QuickDB Logo" className="h-16 w-16 rounded-xl" />
                        </div>
                    </Link>
                    <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-white">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        Sign in to your QuickDB account to continue.
                    </p>
                </div>

                {/* Card */}
                <div className="reveal glass-card rounded-3xl border border-line p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="mb-4 flex justify-center text-accent">
                                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Signed In Successfully</h3>
                            <p className="text-muted mb-6">
                                You can now return to the QuickDB Desktop App or VS Code Extension.
                            </p>
                            <button
                                onClick={() => window.close()}
                                className="btn-accent sheen w-full justify-center"
                            >
                                Close Window
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* OAuth Buttons */}
                            <div className="flex flex-col gap-3">
                                <a
                                    href={githubUrl}
                                    className="flex items-center justify-center gap-3 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    Continue with GitHub
                                </a>

                                <a
                                    href={googleUrl}
                                    className="flex items-center justify-center gap-3 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        <path d="M1 1h22v22H1z" fill="none"/>
                                    </svg>
                                    Continue with Google
                                </a>
                            </div>

                            <div className="my-6 flex items-center">
                                <div className="flex-1 border-t border-line"></div>
                                <span className="mx-4 text-xs font-semibold uppercase text-muted">or continue with email</span>
                                <div className="flex-1 border-t border-line"></div>
                            </div>

                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                {error && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                                        {error}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-line bg-black/20 px-4 py-2.5 text-sm text-white placeholder-faint outline-none transition-all focus:border-accent focus:bg-black/40 focus:ring-1 focus:ring-accent/50"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-line bg-black/20 px-4 py-2.5 text-sm text-white placeholder-faint outline-none transition-all focus:border-accent focus:bg-black/40 focus:ring-1 focus:ring-accent/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-accent sheen mt-2 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-xs text-faint">
                                By signing in, you agree to our <a href="#" className="text-muted hover:text-white">Terms of Service</a> and <a href="#" className="text-muted hover:text-white">Privacy Policy</a>.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="relative min-h-screen overflow-hidden font-sans text-fg bg-[#0b0c10]">
            {/* Ambient Background Glow */}
            <div aria-hidden className="aurora">
                <div className="aurora-grid" />
            </div>
            <DocThemeToggle />

            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
