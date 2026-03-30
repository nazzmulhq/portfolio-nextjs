import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    return (
        <section className="mb-0 overflow-hidden" id="experience">
            <ScrollAnimate blur direction="right">
                <div className="flex justify-end">
                    <h2 className="text-sm font-semibold tracking-[0.2em] uppercase border-b border-l border-white/10 bg-black/40 py-3 px-8 text-neutral-400">
                        Experience
                    </h2>
                </div>
            </ScrollAnimate>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch py-8 px-6">
                {experience.map((exp, index) => (
                    <ScrollAnimate
                        className={`h-full ${experience.length % 2 === 1 && index === experience.length - 1 ? "sm:col-span-2" : ""}`}
                        delay={Math.min(index * 75, 300)}
                        direction={index % 2 === 0 ? "left" : "right"}
                        key={index}
                        scale
                    >
                        <div className="card-nextjs spotlight-glow p-6 h-full flex flex-col min-h-48 rounded-xl shadow-lg">
                            <h3 className="text-base sm:text-lg font-bold leading-tight text-white mb-1">{exp.title}</h3>
                            <h4 className="text-sm sm:text-base font-medium text-neutral-400">
                                {exp.company}
                            </h4>
                            <p className="text-xs font-mono tracking-wider text-neutral-500 mt-2 uppercase">{exp.date}</p>
                            <p className="text-sm sm:text-base flex-1 mt-4 text-neutral-300 leading-relaxed font-light">
                                {exp.description.join(". ")}
                            </p>
                        </div>
                    </ScrollAnimate>
                ))}
            </div>
        </section>
    );
};

export default Experience;
