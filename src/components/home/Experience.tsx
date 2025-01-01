import { FC } from "react";

export interface IExperience {}

const Experience: FC<IExperience> = () => {
    return (
        <section className="mt-6 mb-4" id="experience">
            <h2 className="text-2xl font-bold border-b border-t pr-4 text-right border-white">
                Experience
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4 px-4">
                <div className="border p-2 ">
                    <h3 className="text-xl font-bold">Full Stack Developer</h3>
                    <p>Company Name</p>
                    <p>2019 - 2021</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
                <div className="border p-2  ">
                    <h3 className="text-xl font-bold">Full Stack Developer</h3>
                    <p>Company Name</p>
                    <p>2019 - 2021</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
                <div className="border p-2  ">
                    <h3 className="text-xl font-bold">Full Stack Developer</h3>
                    <p>Company Name</p>
                    <p>2019 - 2021</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
                <div className="border p-2  ">
                    <h3 className="text-xl font-bold">Full Stack Developer</h3>
                    <p>Company Name</p>
                    <p>2019 - 2021</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Experience;
