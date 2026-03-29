import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section id="education">
            <ScrollAnimate blur direction="left">
                <h2 className="text-2xl font-bold border-b border-t pl-4 border-white">
                    Education
                </h2>
            </ScrollAnimate>
            <div className="w-full max-w-4xl mx-auto my-6 px-4 space-y-4">
                {education.map((edu, index) => (
                    <ScrollAnimate
                        delay={index * 100}
                        direction="none"
                        key={index}
                        scale
                    >
                        <div className="relative p-4 sm:p-6 border min-h-24 flex flex-col justify-center card-hover">
                            <time className="text-xs sm:text-sm font-medium text-gray-400 mb-1">
                                {edu.date}
                            </time>
                            <div className="text-sm sm:text-lg font-semibold text-white">
                                {edu.title}
                            </div>
                            <div className="font-medium text-gray-300 text-sm sm:text-base mt-0.5">
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
