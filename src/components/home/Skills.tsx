import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface ISkills {}

const Skills: FC<ISkills> = () => {
    const { skills } = info;
    return (
        <section className="my-6" id="skills">
            <ScrollAnimate blur direction="left">
                <h2 className="text-2xl font-bold border-b border-t pl-4 border-white">
                    Skills
                </h2>
            </ScrollAnimate>
            <div className="my-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                    {skills.map((skill, index) => (
                        <ScrollAnimate
                            delay={Math.min(index * 40, 400)}
                            direction="up"
                            key={index}
                            scale
                        >
                            <div className="h-10 flex items-center justify-center px-2 border rounded text-center bg-gray-700/50 text-sm card-hover select-none">
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
