"use client";

import { FC, useState } from "react";
import info from "./data";

import MagneticButton from "./MagneticButton";

export interface IHome {}

const STATS = [
    { value: "4+", label: "Years Experience" },
    { value: "5+", label: "Enterprise Apps" },
    { value: "10+", label: "OSS & Dev Tools" },
    { value: "300%", label: "Max Query Boost" },
];

const FLOATING_TAGS = [
    { name: "Next.js 16", style: "top-2 -left-6 sm:-left-10" },
    { name: "NestJS", style: "bottom-12 -left-8 sm:-left-12" },
    { name: "TypeScript", style: "top-10 -right-6 sm:-right-10" },
    { name: "Python", style: "bottom-6 -right-6 sm:-right-8" },
];

const Home: FC<IHome> = () => {
    const { me } = info;
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(me.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section
            className="relative flex min-h-svh flex-col items-center justify-center px-5 pt-20 pb-16 sm:px-8 sm:pt-24 sm:pb-20"
            id="home"
        >
            <div className="mx-auto w-full max-w-6xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
                    {/* Text side */}
                    <div className="min-w-0">
                        <div className="hero-line flex flex-wrap items-center gap-3" data-hero>
                            <p className="label flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                                </span>
                                Available for new work
                            </p>

                            <button
                                onClick={handleCopyEmail}
                                className="label flex items-center gap-1.5 rounded-full border border-line bg-surface/40 px-3 py-1.5 text-muted transition-all hover:border-[var(--accent)]/50 hover:text-fg"
                                type="button"
                                title="Copy Email"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    {copied ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    )}
                                </svg>
                                {copied ? "Copied!" : me.email}
                            </button>
                        </div>

                        <h1 className="display mt-6 text-[clamp(3.5rem,13vw,9.5rem)] text-fg">
                            <span className="line-mask">
                                <span className="block" data-hero>
                                    Nazmul
                                </span>
                            </span>
                            <span className="line-mask">
                                <span className="block text-gradient" data-hero>
                                    Haque
                                </span>
                            </span>
                        </h1>

                        <p
                            className="hero-line mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
                            data-hero
                        >
                            Senior Software Specialist crafting high-scale enterprise platforms — ERP, banking, and production systems — plus open-source developer tooling.
                        </p>

                        <div className="hero-line mt-8 flex flex-wrap items-center gap-3" data-hero>
                            <MagneticButton
                                className="btn-accent"
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = me.resume;
                                    link.download = "Nazmul_Haque_CV.pdf";
                                    link.click();
                                    link.remove();
                                }}
                            >
                                Download CV
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                                </svg>
                            </MagneticButton>
                            <MagneticButton
                                className="btn-ghost"
                                href={me.github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                GitHub
                            </MagneticButton>
                            <MagneticButton
                                className="btn-ghost"
                                href={me.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                            </MagneticButton>
                        </div>
                    </div>

                    {/* Portrait with glow & floating tech badges */}
                    <figure className="hero-line order-first flex flex-col items-center lg:order-none" data-hero>
                        <div className="hero-glow relative">
                            {/* Floating Tech Badges */}
                            {FLOATING_TAGS.map((tag, idx) => (
                                <span
                                    key={tag.name}
                                    className={`absolute z-10 hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface/80 px-3 py-1 text-xs font-mono text-fg shadow-lg backdrop-blur-xl animate-float ${tag.style}`}
                                    style={{ animationDelay: `${idx * 0.7}s` }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                                    {tag.name}
                                </span>
                            ))}

                            <div className="plate aspect-[3/4] w-60 sm:w-72 lg:w-88 xl:w-96 shadow-2xl">
                                <img
                                    alt="Nazmul Haque"
                                    className="object-top"
                                    height={640}
                                    src={me.image}
                                    width={480}
                                />
                            </div>
                        </div>

                        <figcaption className="label mt-4 flex w-full items-center justify-between px-1 sm:w-72 lg:w-88 xl:w-96">
                            <span className="text-accent font-semibold">{me.experience}</span>
                            <span>Since 2021</span>
                        </figcaption>
                    </figure>
                </div>

                {/* Stats bar */}
                <div className="hero-line mt-14 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4" data-hero>
                    {STATS.map((stat) => (
                        <div className="stat-block glass-card group/stat h-full" key={stat.label}>
                            <p className="stat-value text-gradient" data-counter={stat.value}>
                                {stat.value}
                            </p>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll down indicator */}
            <div className="mt-12 hidden sm:block" data-hero>
                <div className="scroll-indicator">
                    <span className="label text-[0.6rem]">Scroll Down</span>
                    <div className="scroll-indicator-line" />
                </div>
            </div>
        </section>
    );
};

export default Home;
