import { info } from "@src/app/page";
import { FC } from "react";

export interface IEducation {}

const Education: FC<IEducation> = () => {
    const { education } = info;
    return (
        <section className="" id="education">
            <h2 className="text-2xl font-bold border-b border-t pl-4 border-white">
                Education
            </h2>
            <div className="w-full max-w-3xl mx-auto my-6">
                <div className="-my-6">
                    <div className="relative pl-8 sm:pl-32 py-6 group">
                        {education.map((edu, index) => (
                            <div
                                className="relative pl-8 sm:pl-32 py-6 group"
                                key={index}
                            >
                                <div className="font-caveat font-medium text-2xl text-white mb-1 sm:mb-0">
                                    {edu.title}
                                </div>

                                <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-black after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
                                    <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-black bg-white rounded-full">
                                        {edu.date}
                                    </time>
                                    <div className="text-xl font-bold text-gray-100">
                                        {edu.degree}
                                    </div>
                                </div>

                                {/* <div className="text-slate-200">
                                    Pretium lectus quam id leo. Urna et pharetra
                                    pharetra massa massa. Adipiscing enim eu
                                    neque aliquam vestibulum morbi blandit
                                    cursus risus.
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Education;
