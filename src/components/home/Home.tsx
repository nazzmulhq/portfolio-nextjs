"use client";

import { FC } from "react";
import info from "./data";

export interface IHome {}

const Home: FC<IHome> = () => {
    const { me } = info;

    return (
        <section className="relative px-4 py-14 sm:py-20 lg:py-24" id="home">
            {/* local glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full opacity-60 blur-[90px] lg:left-1/3"
                style={{ background: "var(--glow)" }}
            />

            <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center lg:max-w-4xl lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-12 lg:text-left">
                {/* Visual — static, no per-image motion */}
                <div className="reveal-scale relative shrink-0">
                    <div className="relative isolate h-40 w-40 overflow-hidden rounded-[2rem] border border-line bg-[var(--surface)] shadow-[0_20px_50px_-20px_var(--shadow)] sm:h-48 sm:w-48 lg:h-64 lg:w-64">
                        <img
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover opacity-40 blur-md"
                            src={me.image}
                        />
                        <img
                            alt="Nazmul Haque"
                            className="relative z-10 h-full w-full object-contain"
                            height={256}
                            src={me.image}
                            width={256}
                        />
                    </div>
                    {/* Corner stat badge */}
                    <div className="glass absolute -bottom-4 -right-4 z-10 flex flex-col items-center rounded-2xl px-4 py-2.5 text-center shadow-[0_12px_30px_-12px_var(--shadow)] lg:-right-6">
                        <span className="font-display text-xl font-extrabold text-accent">{me.experience}</span>
                        <span className="text-[10px] uppercase tracking-wider text-faint">Experience</span>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-10 flex flex-1 flex-col items-center lg:mt-0 lg:items-start">
                    <p className="reveal font-mono text-xs uppercase tracking-[0.35em] text-accent">
                        Hello, I&apos;m
                    </p>

                    <h1 className="reveal font-display mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        <span className="text-gradient">{me.name}</span>
                    </h1>

                    <p className="reveal mt-3 text-base font-light tracking-wide text-muted sm:text-xl">
                        {me.title}
                    </p>

                    <p className="reveal mt-4 max-w-md text-sm font-light leading-relaxed text-faint lg:text-base">
                        Building performant, enterprise-grade web platforms with Next.js, NestJS &amp;
                        TypeScript — backed by Python, FastAPI &amp; Django.
                    </p>

                    <div className="reveal mt-5 flex flex-col items-center gap-1.5 text-sm text-faint lg:items-start">
                        <span>{me.email}</span>
                        <span>{me.phone}</span>
                    </div>

                    <div className="reveal mt-6 flex justify-center gap-3 lg:justify-start">
                        <a
                            aria-label="GitHub"
                            className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted transition-all duration-300 hover:-translate-y-1 hover:text-fg"
                            href={me.github}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" /></svg>
                        </a>
                        <a
                            aria-label="LinkedIn"
                            className="glass flex h-11 w-11 items-center justify-center rounded-full text-muted transition-all duration-300 hover:-translate-y-1 hover:text-fg"
                            href={me.linkedin}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" /></svg>
                        </a>
                    </div>

                    <div className="reveal mt-8 flex w-full justify-center gap-3 sm:w-auto lg:justify-start">
                        <button
                            className="btn-accent sheen w-3/4 sm:w-auto"
                            onClick={() => {
                                const link = document.createElement("a");
                                link.href = me.resume;
                                link.download = "Nazmul_Haque_CV.pdf";
                                link.click();
                                link.remove();
                            }}
                            type="button"
                        >
                            <span className="relative z-10 tracking-wider">Download Resume</span>
                            <svg className="relative z-10 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
