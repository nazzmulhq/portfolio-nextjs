"use client";
import { FC, useState } from "react";

export interface INavBar {}

export const NavBarMobile: FC<INavBar> = () => {
    const [isActive, setIsActive] = useState("home");

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
            <div className="fixed bottom-3 right-4 z-10 bg-black/70 rounded">
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
