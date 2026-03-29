import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    return (
        <section className="mt-6 mb-4" id="experience">
            <ScrollAnimate blur direction="right">
                <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                    Experience
                </h2>
            </ScrollAnimate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch mt-4 px-4">
                {experience.map((exp, index) => (
                    <ScrollAnimate
                        className={`h-full ${experience.length % 2 === 1 && index === experience.length - 1 ? "sm:col-span-2" : ""}`}
                        delay={Math.min(index * 75, 300)}
                        direction={index % 2 === 0 ? "left" : "right"}
                        key={index}
                        scale
                    >
                        <div className="border p-3 h-full flex flex-col min-h-44 card-hover">
                            <h3 className="text-base sm:text-lg font-bold leading-tight">{exp.title}</h3>
                            <h4 className="text-sm sm:text-base font-semibold text-gray-300 mt-0.5">
                                {exp.company}
                            </h4>
                            <p className="text-xs sm:text-sm font-medium text-gray-400 mt-0.5">{exp.date}</p>
                            <p className="text-xs sm:text-sm flex-1 mt-2 text-gray-200 leading-relaxed">
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
