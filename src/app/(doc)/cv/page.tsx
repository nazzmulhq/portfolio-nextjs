import CVBtn from "@src/components/cv";
import Link from "next/link";
import { FC } from "react";
import ScrollAnimate from "../../../components/ScrollAnimate";

export interface IPage {}

export const dynamic = "force-static";

const Page: FC<IPage> = () => {
    return (
        <div className="relative min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-sans overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            {/* Glowing Accent Blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

            {/* Back Button Container */}
            <div className="container mx-auto max-w-xl px-6 pt-10 sm:pt-16 relative z-10 flex justify-start">
                <ScrollAnimate direction="up" delay={50} blur>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl transition-all border border-slate-800 hover:border-slate-700 backdrop-blur-md text-sm group"
                    >
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Portfolio
                    </Link>
                </ScrollAnimate>
            </div>

            {/* Main Content Card Container */}
            <main className="container mx-auto max-w-xl px-6 py-12 relative z-10 flex-1 flex flex-col justify-center items-center">
                <ScrollAnimate direction="up" delay={150} scale blur className="w-full">
                    <div className="w-full rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-emerald-500/30 transition-all duration-500 text-center flex flex-col items-center group">
                        
                        {/* Glowing Document Icon */}
                        <div className="mb-8 p-5 rounded-3xl bg-slate-950/60 border border-slate-800 shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all duration-500">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-500">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Text Content */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-4 tracking-tight">
                            Curriculum Vitae
                        </h1>
                        
                        <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed mb-8 max-w-sm">
                            Download or print a clean, high-fidelity PDF of Nazmul Haque's professional software engineering experience, skills, and qualifications.
                        </p>

                        {/* Interactive CV Download Button */}
                        <div className="w-full flex justify-center">
                            <CVBtn>Download PDF CV</CVBtn>
                        </div>
                    </div>
                </ScrollAnimate>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-slate-900/60 bg-slate-950/20 py-8 text-center text-slate-500 text-xs relative z-10">
                <p>&copy; {new Date().getFullYear()} Nazmul Haque. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Page;
