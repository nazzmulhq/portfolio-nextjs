import { FC } from "react";
import info from "./data";

export interface ISkills {}

const Skills: FC<ISkills> = () => {
    const { skills } = info;
    return (
        <section className="my-6" id="skills">
            <h2 className="text-2xl font-bold border-b border-t pl-4 border-white">
                Skills
            </h2>
            <div className="my-6 scroll-container">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                    {skills.map((skill, index) => (
                        <div
                            className="py-1 px-2 border rounded text-center bg-gray-700/50"
                            key={index}
                        >
                            {skill}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
