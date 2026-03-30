import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface ISkills {}

const Skills: FC<ISkills> = () => {
    const { skills } = info;
    return (
        <section className="mb-0 overflow-hidden" id="skills">
            <ScrollAnimate blur direction="left">
                <h2 className="text-sm font-semibold tracking-[0.2em] uppercase border-b border-white/10 bg-black/40 py-3 pl-8 text-neutral-400">
                    Skills
                </h2>
            </ScrollAnimate>
            <div className="py-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-6">
                    {skills.map((skill, index) => (
                        <ScrollAnimate
                            delay={Math.min(index * 30, 300)}
                            direction="up"
                            key={index}
                            scale
                        >
                            <div className="card-nextjs h-11 flex items-center justify-center px-4 rounded-lg text-center text-sm font-medium text-neutral-300 select-none hover:text-white transition-colors duration-300">
                                {skill}
                            </div>
                        </ScrollAnimate>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
