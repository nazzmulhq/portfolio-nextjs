"use client";

import { FC, useState } from "react";
import { STEPS } from "./landingData";
import QuickDBStory from "./QuickDBStory";

export interface IQuickDBLanding {}

const INSTALL_CMD = "code --install-extension quickdb.quickdb";

/**
 * The scroll story is a 1920x1080 artefact: it renders VS Code at design scale
 * and shrinks the whole laptop to fit the viewport. On a phone that puts 13px
 * chrome at roughly 2.5px — a 14-screen scroll through text nobody can read.
 * Below the breakpoint the same 19 beats are told as a readable list instead.
 *
 * Both are rendered and swapped with CSS rather than a media-query hook, so the
 * markup is identical on the server and after hydration.
 */
const CompactStory: FC = () => (
    <div className="md:hidden">
        <div className="qd-compact-hero">
            <span className="qd-pill">
                <span className="qd-pill-dot" />
                QuickDB 1.2.6 — Available for VS Code &amp; Cursor
            </span>
            <h1 className="qd-h1">
                Your whole database,
                <br />
                inside your editor.
            </h1>
            <p className="qd-lede">
                Browse and query 80+ engines without leaving the window you already have open.
            </p>
        </div>

        <ol className="qd-steps">
            {STEPS.map(([n, label]) => (
                <li className="qd-step" key={n}>
                    <span className="qd-step-n">{n}</span>
                    <span className="qd-step-t">{label}</span>
                </li>
            ))}
        </ol>
    </div>
);

const QuickDBLanding: FC<IQuickDBLanding> = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(INSTALL_CMD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="qd-root">
            <div className="hidden md:block">
                <QuickDBStory />
            </div>

            <CompactStory />

            <section className="qd-cta" id="install">
                {/* Top Border Laser Beam */}
                <div className="qd-top-border-beam" />

                {/* Golden/Silver Eclipse Arc Corona Background */}
                <div className="qd-eclipse-container">
                    <div className="qd-eclipse-glow-flare" />
                    <div className="qd-eclipse-dark-dome" />
                </div>

                {/* Floating Particle Glow Nodes */}
                <div className="qd-particle qd-p1" />
                <div className="qd-particle qd-p2" />
                <div className="qd-particle qd-p3" />
                {/* QuickDB Brand Logo */}
                <div className="qd-logo-container">
                    <img
                        alt="QuickDB"
                        src="/images/quickdb-logo.png"
                        style={{
                            width: "clamp(100px, 12vw, 140px)",
                            height: "clamp(100px, 12vw, 140px)",
                            objectFit: "cover",
                            borderRadius: 16,
                            padding: 16,
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
                            margin: "0 auto 1.2rem",
                            position: "relative",
                            zIndex: 2,
                            display: "block",
                        }}
                    />
                </div>

                <h2 className="qd-cta-h">Install, connect, browse.</h2>
                <p className="qd-cta-p">
                    Schema, rows and query history live next to the code that depends on them.
                </p>
                
                {/* Image-Based Action Buttons Grid */}
                <div className="qd-img-btn-section">
                    <div className="qd-img-btn-row">
                        <a
                            className="qd-img-btn qd-img-btn-mint"
                            href="vscode:extension/quickdb.quickdb"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>INSTALL IN VS CODE</span>
                        </a>
                        <a
                            className="qd-img-btn qd-img-btn-dark"
                            href="https://marketplace.visualstudio.com/items?itemName=quickdb.quickdb"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><path d="M18 8l4 4-4 4"/></svg>
                            <span>MARKETPLACE</span>
                        </a>
                        <a
                            className="qd-img-btn qd-img-btn-dark"
                            href="https://open-vsx.org/extension/quickdb/quickdb"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            <span>OPEN VSX</span>
                        </a>
                    </div>
                    <div className="qd-img-btn-row">
                        <a className="qd-img-btn qd-img-btn-dark" href="/">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                            <span>PORTFOLIO</span>
                        </a>
                    </div>
                </div>

                {/* Engine Support Tags Row */}
                <div className="qd-engine-tags">
                    {["SQLite", "PostgreSQL", "MySQL", "Redis", "MongoDB", "80+ Engines"].map((engine) => (
                        <span key={engine} className="qd-engine-tag">
                            {engine}
                        </span>
                    ))}
                </div>

                {/* macOS Terminal Command Card */}
                <div className={`qd-cmd-card ${copied ? "is-copied" : ""}`} onClick={handleCopy} title="Click to copy command">
                    <div className="qd-cmd-header">
                        <div className="qd-cmd-dots">
                            <span className="qd-cmd-dot qd-cmd-dot-red" />
                            <span className="qd-cmd-dot qd-cmd-dot-yellow" />
                            <span className="qd-cmd-dot qd-cmd-dot-green" />
                        </div>
                        <span className="qd-cmd-title">zsh — quickdb install</span>
                        <button className="qd-cmd-copy-btn" type="button" aria-label="Copy install command">
                            {copied ? (
                                <span className="qd-cmd-copied">Copied! ✓</span>
                            ) : (
                                <span className="qd-cmd-copy-text">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    Copy
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="qd-cmd-body">
                        <span className="qd-cmd-prompt">$</span>
                        <code className="qd-cmd-text">
                            <span className="qd-hl-cmd">code</span> --install-extension <span className="qd-hl-pkg">quickdb.quickdb</span>
                        </code>
                        <span className="qd-cmd-cursor" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default QuickDBLanding;
