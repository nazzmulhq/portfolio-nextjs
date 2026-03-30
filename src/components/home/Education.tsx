import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section className="mb-0 overflow-hidden" id="education">
            <ScrollAnimate blur direction="left">
                <h2 className="text-sm font-semibold tracking-[0.2em] uppercase border-b border-white/10 bg-black/40 py-3 pl-8 text-neutral-400">
                    Education
                </h2>
            </ScrollAnimate>
            <div className="w-full max-w-4xl mx-auto py-8 px-6 space-y-5">
                {education.map((edu, index) => (
                    <ScrollAnimate
                        delay={index * 100}
                        direction="up"
                        key={index}
                        scale
                    >
                        <div className="card-nextjs spotlight-glow relative p-6 sm:px-8 min-h-28 rounded-xl flex flex-col justify-center shadow-lg">
                            <time className="text-xs font-mono tracking-wider text-neutral-500 mb-2 uppercase block">
                                {edu.date}
                            </time>
                            <div className="text-base sm:text-lg font-bold text-white leading-snug">
                                {edu.title}
                            </div>
                            <div className="font-medium text-neutral-400 text-sm sm:text-base mt-1.5">
                                {edu.degree}
                            </div>
                        </div>
                    </ScrollAnimate>
                ))}
            </div>
        </section>
    );
};

export default Education;
