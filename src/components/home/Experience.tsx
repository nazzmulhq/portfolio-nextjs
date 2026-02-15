import ScrollAnimate from "@src/components/ScrollAnimate";
import { FC } from "react";
import info from "./data";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    return (
        <section className="mt-6 mb-4" id="experience">
            <ScrollAnimate direction="right">
                <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                    Experience
                </h2>
            </ScrollAnimate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch mt-4 px-4">
                {experience.map((exp, index) => (
                    <ScrollAnimate
                        className={`h-full ${experience.length % 2 === 1 && index === experience.length - 1 ? "sm:col-span-2" : ""}`}
                        delay={index * 75}
                        direction="up"
                        key={index}
                    >
                        <div className="border p-2 h-full flex flex-col min-h-0">
                            <h3 className="text-xl font-bold">{exp.title}</h3>
                            <h4 className="text-lg font-semibold">
                                {exp.company}
                            </h4>
                            <p className="text-md font-medium">{exp.date}</p>
                            <p className="text-sm flex-1">
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
