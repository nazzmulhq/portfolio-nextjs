import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section id="education">
            <ScrollAnimate direction="left">
                <h2 className="text-2xl font-bold border-b border-t pl-4 border-white">
                    Education
                </h2>
            </ScrollAnimate>
            <div className="w-full max-w-4xl mx-auto my-6 px-4">
                {education.map((edu, index) => (
                    <ScrollAnimate
                        delay={index * 100}
                        direction="right"
                        key={index}
                    >
                        <div className="relative p-6 mb-6 border">
                            <time className="sm:mr-4 text-sm font-medium text-gray-300">
                                {edu.date}
                            </time>
                            <div className="text-sm md:text-lg font-semibold text-white mb-2">
                                {edu.title}
                            </div>
                            <div className="font-medium text-gray-200 text-sm md:text-lg ">
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
