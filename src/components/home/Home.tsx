import { info } from "@src/app/page";
import Image from "next/image";
import { FC } from "react";

export interface IHome {}

const Home: FC<IHome> = () => {
    const { me } = info;
    return (
        <section className="flex justify-center " id="home">
            <div className="">
                <div className="w-52 my-2 mx-auto rounded-lg overflow-hidden">
                    <Image alt="alt" src={me.image} />
                </div>

                <h1 className="sm:text-4xl text-2xl font-bold text-center ">
                    Hello, I&apos;m{" "}
                    <span className="text-blue-500">{me.name}</span>
                </h1>
                <p className="lg:text-xl text-lg text-center ">
                    I&apos;m a {me.title}
                </p>

                <p className="text-center text-gray-500">{me.email}</p>
                <p className="text-center text-gray-500">{me.phone}</p>
                <p className="text-center text-gray-500">{me.experience}</p>
                <div className="flex justify-center pt-2 space-x-4 align-center">
                    <a
                        aria-label="GitHub"
                        className="py-2 rounded-md dark:text-gray-800 hover:dark:text-violet-600"
                        href={me.github}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <svg
                            className="w-6 h-6 fill-current"
                            viewBox="0 0 496 512"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                        </svg>
                    </a>
                    <a
                        aria-label="LinkedIn"
                        className="py-2 rounded-md dark:text-gray-800 hover:dark:text-violet-600"
                        href={me.linkedin}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <svg
                            className="w-6 h-6 fill-current"
                            viewBox="0 0 448 512"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.1v383.9C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32V64.1c0-17.6-14.4-32.1-32-32.1zM135.4 416H69V215.5h66.5V416zm-33.2-240c-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5 39.5 17.7 39.5 39.5-17.7 39.5-39.5 39.5zm282.6 240h-66.4V299c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V215.5h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.6 44.3 79.6 101.9V416z"></path>
                        </svg>
                    </a>
                </div>
                <div className="flex space-x-4 mt-4 justify-center ">
                    <a
                        className="text-white border border-white px-4 py-2 w-3/4 md:w-2/3 block text-center"
                        href={me.resume}
                        target="_blank"
                    >
                        Resume
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Home;
