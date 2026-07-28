"use client";

import { FC, useState } from "react";
import info from "./data";
import MagneticButton from "./MagneticButton";

export interface IHome {}

/** Console-style spec rows. Reads as an instrument readout rather than prose. */
const SPECS = [
    { key: "Role", value: "Sr. Software Specialist" },
    { key: "Base", value: "Dhaka, Bangladesh" },
    { key: "Focus", value: "Enterprise platforms" },
    { key: "Stack", value: "Next · Nest · Python" },
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
            className="relative flex min-h-svh flex-col justify-center px-5 pt-24 pb-16 sm:px-8 sm:pt-28 sm:pb-20"
            id="home"
        >
            <div className="mx-auto w-full max-w-6xl">
                {/* Top status strip — sets the console frame before any content. */}
                <div
                    className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-4"
                    data-hero
                >
                    <span className="label flex items-center gap-2 text-fg">
                        <span className="pulse-dot" />
                        Available for work
                    </span>
                    <span className="label hidden sm:inline">Est. 2021</span>
                    <span className="label ml-auto hidden md:inline">23.8103° N, 90.4125° E</span>
                </div>

                <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
                    {/* ── Text column ── */}
                    <div className="min-w-0">
                        <h1 className="display text-[clamp(3.25rem,12vw,9rem)] text-fg">
                            <span className="line-mask">
                                <span className="block" data-hero-line>
                                    Nazmul
                                </span>
                            </span>
                            <span className="line-mask">
                                <span className="block text-outline" data-hero-line>
                                    Haque
                                </span>
                            </span>
                        </h1>

                        {/* Scrambles into place on load — the one place the decode
                            effect runs without a scroll trigger. */}
                        <p
                            className="mt-7 max-w-xl font-mono text-sm leading-relaxed tracking-wide text-muted sm:text-base"
                            data-hero
                            data-decode-now
                        >
                            Building high-scale ERP, banking and production systems — plus open-source
                            developer tooling.
                        </p>

                        <dl className="mt-9 max-w-md" data-hero>
                            {SPECS.map((spec) => (
                                <div className="datum" key={spec.key}>
                                    <dt>{spec.key}</dt>
                                    <span aria-hidden className="lead" />
                                    <dd>{spec.value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-10 flex flex-wrap items-center gap-3" data-hero>
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
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </MagneticButton>

                            <MagneticButton
                                className="btn-ghost"
                                href={me.github}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                GitHub
                            </MagneticButton>

                            <MagneticButton
                                className="btn-ghost"
                                href={me.linkedin}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                LinkedIn
                            </MagneticButton>

                            <button
                                className="label flex items-center gap-2 px-1 py-2 text-muted transition-colors hover:text-accent"
                                onClick={handleCopyEmail}
                                title="Copy email address"
                                type="button"
                            >
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    {copied ? (
                                        <path
                                            d="M5 13l4 4L19 7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    ) : (
                                        <path
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}
                                </svg>
                                {copied ? "Copied" : "Copy email"}
                            </button>
                        </div>
                    </div>

                    {/* ── Portrait, framed as a console feed ── */}
                    <figure
                        className="order-first w-fit self-center lg:order-none lg:self-end"
                        data-hero
                    >
                        {/* .frame wraps the image only — the brackets are pinned to
                            its corners, so including the caption would push the
                            bottom pair below the photo. */}
                        <div className="frame frame-brackets" data-brackets>
                            <span />
                            <span />
                            <span />
                            <span />

                            <div className="portrait aspect-[3/4] w-56 sm:w-72 lg:w-80 xl:w-[22rem]">
                                <span aria-hidden className="scanbar" />
                                <img alt="Nazmul Haque" height={640} src={me.image} width={480} />
                            </div>
                        </div>

                        <figcaption className="mt-4 flex items-center justify-between">
                            <span className="label">ID · NH-2021</span>
                            <span className="label text-accent">{me.experience}</span>
                        </figcaption>
                    </figure>
                </div>
            </div>

            <div className="mt-14 hidden justify-center sm:flex" data-hero>
                <div className="scroll-cue">
                    <span className="label text-[0.6rem]">Scroll</span>
                    <span className="scroll-cue-line" />
                </div>
            </div>
        </section>
    );
};

export default Home;
