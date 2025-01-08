import { FC } from "react";
import info from "./data";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    const { experience } = info;
    return (
        <section className="mt-6 mb-4" id="experience">
            <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                Experience
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4 px-4 ">
                {experience.map((exp, index) => (
                    <div className="border p-2 " key={index}>
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <h4 className="text-lg font-semibold">{exp.company}</h4>
                        <p className="text-md font-medium">{exp.date}</p>
                        <p className="text-sm">{exp.description.join(".")}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Experience;
