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
                top: sectionId === "home" ? 0 : offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="block md:hidden">
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-1 border border-white/10 rounded-full bg-black/60 backdrop-blur-xl p-1.5 shadow-2xl">
                    {["home", "skills", "experience", "education", "works"].map(
                        (item) => (
                            <button
                                key={item}
                                className={`px-3 py-2 text-xs font-medium rounded-full transition-all duration-300 capitalize ${
                                    isActive === item
                                        ? "bg-white text-black shadow-md"
                                        : "text-neutral-400 hover:text-white hover:bg-white/10"
                                }`}
                                onClick={() => scrollToSection(item)}
                            >
                                {item === "experience" ? "Exp" : item === "education" ? "Edu" : item}
                            </button>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

export const NavBar: FC<INavBar> = () => {
    const [isActive, setIsActive] = useState("Home");

    const handleClick = (sectionId: string) => {
        setIsActive(sectionId);
        const element = document.getElementById(sectionId.toLowerCase());
        const offset = 60; // Increased offset slightly for the beautiful new layout

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
        <div className="hidden md:flex justify-center items-center mb-8 fixed top-6 left-0 right-0 z-50 transition-all duration-500">
            <div className="border border-white/10 rounded-full bg-black/50 backdrop-blur-xl shadow-2xl p-1.5">
                <div className="flex items-center gap-1">
                    {["Home", "Skills", "Experience", "Education", "Works"].map(
                        (item) => (
                            <button
                                key={item}
                                className={`py-1.5 px-5 text-sm font-medium tracking-wide rounded-full transition-all duration-300 ${
                                    isActive === item
                                        ? "bg-white text-black shadow-lg shadow-white/10"
                                        : "text-neutral-400 hover:text-white hover:bg-white/10"
                                }`}
                                onClick={() => handleClick(item)}
                            >
                                {item}
                            </button>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};
