"use client";
import { FC, useState } from "react";

export interface INavBar {}

export const NavBarMobile: FC<INavBar> = () => {
    const [isNavVisible, setIsNavVisible] = useState(false);
    const [isActive, setIsActive] = useState("home");

    const toggleNav = () => {
        setIsNavVisible(!isNavVisible);
    };

    const scrollToSection = (sectionId: string) => {
        setIsActive(sectionId);
        const element = document.getElementById(sectionId.toLowerCase());
        const offset = 42;

        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: sectionId === "Home" ? 0 : offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="block md:hidden">
            {isNavVisible ? (
                <div
                    className="fixed bottom-4 right-6 z-10 w-6 text-2xl font-normal"
                    onClick={toggleNav}
                    role="button"
                >
                    x
                </div>
            ) : (
                <div
                    className="fixed bottom-5 right-8 z-10 w-6"
                    onClick={toggleNav}
                    role="button"
                >
                    <div className="bg-white h-[1px] mb-1" />
                    <div className="bg-white h-[1px] mb-1" />
                    <div className="bg-white h-[1px] mb-1" />
                    <div className="bg-white h-[1px] mb-1" />
                </div>
            )}

            {isNavVisible && (
                <div className="fixed bottom-14 right-2 z-10 bg-black rounded">
                    <div className="border border-white rounded">
                        <button
                            className={`block px-1 text-xs w-full py-1 ${isActive === "home" ? "bg-white text-black" : ""}`}
                            onClick={() => scrollToSection("home")}
                        >
                            Home
                        </button>
                        <button
                            className={`block px-1 text-xs w-full py-1 ${isActive === "skills" ? "bg-white text-black" : ""}`}
                            onClick={() => scrollToSection("skills")}
                        >
                            Skills
                        </button>
                        <button
                            className={`block px-1 text-xs w-full py-1 ${isActive === "experience" ? "bg-white text-black" : ""}`}
                            onClick={() => scrollToSection("experience")}
                        >
                            Experience
                        </button>
                        <button
                            className={`block px-1 text-xs w-full py-1 ${isActive === "education" ? "bg-white text-black" : ""}`}
                            onClick={() => scrollToSection("education")}
                        >
                            Education
                        </button>
                        <button
                            className={`block px-1 text-xs w-full py-1 ${isActive === "works" ? "bg-white text-black" : ""}`}
                            onClick={() => scrollToSection("works")}
                        >
                            Works
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export interface INavBar {}

export const NavBar: FC<INavBar> = () => {
    const [isActive, setIsActive] = useState("Home");

    const handleClick = (sectionId: string) => {
        setIsActive(sectionId);
        const element = document.getElementById(sectionId.toLowerCase());
        const offset = 42;

        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: sectionId === "Home" ? 0 : offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="flex md:visible invisible justify-between items-center mb-8 fixed top-2 left-0 right-0 z-10 ">
            <div className="mx-auto border  rounded border-white bg-black">
                <div className="flex">
                    <button
                        className={`${isActive === "Home" ? "bg-white text-black" : ""} py-1 px-4 cursor-pointer`}
                        onClick={() => handleClick("Home")}
                    >
                        Home
                    </button>
                    <button
                        className={`${isActive === "Skills" ? "bg-white text-black" : ""} py-1 px-4 cursor-pointer`}
                        onClick={() => handleClick("Skills")}
                    >
                        Skills
                    </button>
                    <button
                        className={`${isActive === "Experience" ? "bg-white text-black" : ""} py-1 px-4 cursor-pointer`}
                        onClick={() => handleClick("Experience")}
                    >
                        Experience
                    </button>
                    <button
                        className={`${isActive === "Education" ? "bg-white text-black" : ""} py-1 px-4 cursor-pointer`}
                        onClick={() => handleClick("Education")}
                    >
                        Education
                    </button>
                    <button
                        className={`${isActive === "Works" ? "bg-white text-black" : ""} py-1 px-4 cursor-pointer`}
                        onClick={() => handleClick("Works")}
                    >
                        Works
                    </button>
                </div>
            </div>
        </div>
    );
};
