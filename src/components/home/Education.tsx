import { FC } from "react";
import info from "./data";
import SectionHeading from "./SectionHeading";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section className="relative px-4 sm:px-6" id="education">
            <SectionHeading label="Education" />
            <div className="mx-auto mt-8 w-full max-w-4xl space-y-5 py-6" data-stagger>
                {education.map((edu, index) => (
                    <div
                        key={edu.title}
                        style={{ ["--i" as string]: index }}
                        className="group glass-card rail flex flex-col justify-center overflow-hidden p-5 sm:px-8 sm:py-7"
                    >
                        <time className="chip w-max font-mono">{edu.date}</time>
                        <h3 className="font-display mt-3 text-lg font-bold leading-snug text-fg transition-colors duration-300 group-hover:text-accent sm:text-xl">
                            {edu.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-accent/90">{edu.degree}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Education;
