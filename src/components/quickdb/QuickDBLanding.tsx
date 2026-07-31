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

                {/* Vercel-style Animated Streaming Grid & Circuit Line Pulse Background */}
                <div className="qd-streaming-bg" aria-hidden="true">
                    {/* SVG Dashed Grid */}
                    <svg className="qd-streaming-grid" height="100%" width="100%" viewBox="0 0 392 258" preserveAspectRatio="none">
                        <g opacity="0.09" stroke="#ffffff" strokeDasharray="2 2">
                            <line x2="392" y1="15.5" y2="15.5" />
                            <line x2="392" y1="31.5" y2="31.5" />
                            <line x2="392" y1="47.5" y2="47.5" />
                            <line x2="392" y1="63.5" y2="63.5" />
                            <line x2="392" y1="79.5" y2="79.5" />
                            <line x2="392" y1="95.5" y2="95.5" />
                            <line x2="392" y1="111.5" y2="111.5" />
                            <line x2="392" y1="127.5" y2="127.5" />
                            <line x2="392" y1="143.5" y2="143.5" />
                            <line x2="392" y1="159.5" y2="159.5" />
                            <line x2="392" y1="175.5" y2="175.5" />
                            <line x2="392" y1="191.5" y2="191.5" />
                            <line x2="392" y1="207.5" y2="207.5" />
                            <line x2="392" y1="223.5" y2="223.5" />
                            <line x2="392" y1="239.5" y2="239.5" />
                            <line x2="392" y1="255.5" y2="255.5" />
                            <line x1="12" x2="12" y1="0" y2="256" />
                            <line x1="28" x2="28" y1="0" y2="256" />
                            <line x1="44" x2="44" y1="0" y2="256" />
                            <line x1="60" x2="60" y1="0" y2="256" />
                            <line x1="76" x2="76" y1="0" y2="256" />
                            <line x1="92" x2="92" y1="0" y2="256" />
                            <line x1="108" x2="108" y1="0" y2="256" />
                            <line x1="124" x2="124" y1="0" y2="256" />
                            <line x1="140" x2="140" y1="0" y2="256" />
                            <line x1="156" x2="156" y1="0" y2="256" />
                            <line x1="172" x2="172" y1="0" y2="256" />
                            <line x1="188" x2="188" y1="0" y2="256" />
                            <line x1="204" x2="204" y1="0" y2="256" />
                            <line x1="220" x2="220" y1="0" y2="256" />
                            <line x1="236" x2="236" y1="0" y2="256" />
                            <line x1="252" x2="252" y1="0" y2="256" />
                            <line x1="268" x2="268" y1="0" y2="256" />
                            <line x1="284" x2="284" y1="0" y2="256" />
                            <line x1="300" x2="300" y1="0" y2="256" />
                            <line x1="316" x2="316" y1="0" y2="256" />
                            <line x1="332" x2="332" y1="0" y2="256" />
                            <line x1="348" x2="348" y1="0" y2="256" />
                            <line x1="364" x2="364" y1="0" y2="256" />
                            <line x1="380" x2="380" y1="0" y2="256" />
                        </g>
                    </svg>

                    {/* Animated Streaming Pulse Circuit Lines */}
                    <svg className="qd-streaming-pulse qd-pulse-bl" fill="none" viewBox="0 0 237 35">
                        <path
                            stroke="url(#qd_p_bl)"
                            strokeLinecap="round"
                            strokeWidth="1.75"
                            className="qd-pulse-path qd-p-1"
                            d="M0.5 33.5L59 33.5C59.55 33.5 60 33.06 60 32.51V2.5C60 1.95 60.45 1.5 61 1.5H91C91.55 1.5 92 1.95 92 2.5V10C92 14.14 95.36 17.5 99.5 17.5H236"
                        />
                        <defs>
                            <linearGradient id="qd_p_bl" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop stopColor="#3291FF" stopOpacity="0" />
                                <stop stopColor="#ffffff" stopOpacity="0.95" />
                                <stop offset="1" stopColor="#61DAFB" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg className="qd-streaming-pulse qd-pulse-br" fill="none" viewBox="0 0 221 67">
                        <path
                            stroke="url(#qd_p_br)"
                            strokeLinecap="round"
                            strokeWidth="1.75"
                            className="qd-pulse-path qd-p-2"
                            d="M220.5 1.5H178C177.45 1.5 177 1.95 177 2.5V32.5C177 33.05 176.55 33.5 176 33.5H130C129.45 33.5 129 33.95 129 34.5V58C129 62.14 125.64 65.5 121.5 65.5H1"
                        />
                        <defs>
                            <linearGradient id="qd_p_br" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop stopColor="#3291FF" stopOpacity="0" />
                                <stop stopColor="#ffffff" stopOpacity="0.95" />
                                <stop offset="1" stopColor="#3291FF" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg className="qd-streaming-pulse qd-pulse-tl" fill="none" viewBox="0 0 237 51">
                        <path
                            stroke="url(#qd_p_tl)"
                            strokeLinecap="round"
                            strokeWidth="1.75"
                            className="qd-pulse-path qd-p-3"
                            d="M0.5 1.5H43C43.55 1.5 44 1.95 44 2.5V48.5C44 49.05 44.45 49.5 45 49.5H91C91.55 49.5 92 49.05 92 48.5V41C92 36.86 95.36 33.5 99.5 33.5H236"
                        />
                        <defs>
                            <linearGradient id="qd_p_tl" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop stopColor="#61DAFB" stopOpacity="0" />
                                <stop stopColor="#ffffff" stopOpacity="0.95" />
                                <stop offset="1" stopColor="#3291FF" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg className="qd-streaming-pulse qd-pulse-tr" fill="none" viewBox="0 0 130 209">
                        <path
                            stroke="url(#qd_p_tr)"
                            strokeLinecap="round"
                            strokeWidth="1.75"
                            className="qd-pulse-path qd-p-4"
                            d="M129 0.5V95C129 95.55 128.55 96 128 96H66C65.45 96 65 96.45 65 97V200C65 204.14 61.64 207.5 57.5 207.5H1"
                        />
                        <defs>
                            <linearGradient id="qd_p_tr" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop stopColor="#3291FF" stopOpacity="0" />
                                <stop stopColor="#ffffff" stopOpacity="0.95" />
                                <stop offset="1" stopColor="#61DAFB" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

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
