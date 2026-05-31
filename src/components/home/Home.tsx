"use client";

import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IHome {}

const Home: FC<IHome> = () => {
    const { me } = info;

    return (
        <section className="flex justify-center py-8 px-4" id="home">
            <div className="w-full max-w-sm">
                <ScrollAnimate blur direction="none" scale>
                    <div className="w-40 h-40 sm:w-48 sm:h-48 my-2 mx-auto rounded-3xl overflow-hidden relative shadow-2xl shadow-white/5 border border-white/10 group bg-slate-950/80">
                        {/* Blurred background image to fill the container */}
                        <img
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110 pointer-events-none z-0"
                            src={`${me.image}`}
                        />
                        {/* Full sharp foreground image */}
                        <img
                            alt="Nazmul"
                            className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                            src={`${me.image}`}
                            width={192}
                            height={192}
                        />
                    </div>
                </ScrollAnimate>

                <ScrollAnimate delay={100} direction="up" scale>
                    <h1 className="sm:text-4xl text-2xl font-bold text-center text-white mt-6 leading-tight">
                        Hello, I&apos;m{" "}
                        <span className="text-nextjs-gradient">
                            {me.name}
                        </span>
                    </h1>
                </ScrollAnimate>

                <ScrollAnimate delay={180} direction="up">
                    <p className="lg:text-lg text-base text-center text-neutral-400 mt-1.5 font-light tracking-wide">
                        {me.title}
                    </p>
                </ScrollAnimate>

                <ScrollAnimate delay={240} direction="none">
                    <div className="text-center mt-4 space-y-1">
                        <p className="text-sm text-neutral-500 tracking-wide">{me.email}</p>
                        <p className="text-sm text-neutral-500">{me.phone}</p>
                        <span className="inline-block mt-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
                            {me.experience}
                        </span>
                    </div>
                </ScrollAnimate>

                <ScrollAnimate delay={300} direction="up">
                    <div className="flex justify-center pt-5 space-x-6">
                        <a
                            aria-label="GitHub"
                            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                            href={me.github}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg>
                        </a>
                        <a
                            aria-label="LinkedIn"
                            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                            href={me.linkedin}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>
                        </a>
                    </div>
                </ScrollAnimate>

                <ScrollAnimate delay={380} direction="up" scale>
                    <div className="flex mt-8 justify-center">
                        <button
                            className="group relative w-3/4 sm:w-2/3 flex justify-center items-center gap-3 px-8 py-3.5 bg-transparent hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:scale-95 select-none"
                            onClick={() => {
                                const link = document.createElement("a");
                                link.href = me.resume;
                                link.download = "Nazmul_Haque_CV.pdf";
                                link.click();
                                link.remove();
                            }}
                        >
                            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none z-0"></div>
                            <span className="relative z-10 tracking-wider">Resume</span>
                            <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-y-1 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>
                </ScrollAnimate>
            </div>
        </section>
    );
};

export default Home;
