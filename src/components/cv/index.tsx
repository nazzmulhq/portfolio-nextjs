"use client";
import { FC, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import info from "../home/data";

export interface ICV {
    children?: React.ReactNode;
}

const CVBtn: FC<ICV> = ({ children }) => {
    const [isPrint, setIsPrint] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: "Nazmul_Haque_CV",
        onBeforePrint: () => {
            setIsPrint(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setIsPrint(false);
        },
    });

    const { me, skills, experience, education, works } = info;

    const totalExperience = calculateExperienceYears(experience);

    /**
     * Calculates total experience from earliest career start to current date.
     * Auto-updates every year (like copyright year) - no "Present" used.
     * e.g. start 2019, year 2029 → 10+ yr; year 2030 → 11+ yr
     */
    function calculateExperienceYears(exp: Array<{ date: string }>): string {
        const MONTHS: Record<string, number> = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
        };

        const parseStartDate = (part: string): Date | null => {
            const trimmed = part.trim();
            if (trimmed === "Present") {
                return null;
            }
            const [monthStr, yearStr] = trimmed.split(/\s+/);
            const month = MONTHS[monthStr as keyof typeof MONTHS] ?? 0;
            const year = parseInt(yearStr || "0", 10);
            if (Number.isNaN(year)) {
                return null;
            }
            return new Date(year, month, 1);
        };

        let earliestStart: Date | null = null;

        for (const { date } of exp) {
            const clean = date.replace(/\s*\([^)]*\)/g, "").trim();
            const [rangeStart] = clean.split(/\s*-\s*/);
            if (!rangeStart) {
                continue;
            }
            const start = parseStartDate(rangeStart);
            if (start && (!earliestStart || start < earliestStart)) {
                earliestStart = start;
            }
        }

        if (!earliestStart) {
            return "0 yr";
        }

        const now = new Date();
        const totalMonths =
            (now.getFullYear() - earliestStart.getFullYear()) * 12 +
            (now.getMonth() - earliestStart.getMonth());

        const years = Math.max(0, Math.floor(totalMonths / 12));
        return `${years}+ yr`;
    }

    return (
        <>
            <button
                className="text-white border border-white px-4 py-2 w-60 block text-center hover:bg-gray-700/50"
                disabled={isPrint}
                onClick={() => reactToPrintFn()}
            >
                {isPrint ? "Downloading..." : children}
            </button>
            <main className="hidden bg-grid text-white">
                <section
                    className="p-4 bg-black h-screen text-white"
                    ref={contentRef}
                >
                    <div className="flex">
                        {/* Left Side */}
                        <div className="w-1/3 border-r border-gray-700">
                            <div className="text-center mb-2">
                                <img
                                    alt={me.name}
                                    className="rounded-xl w-40 h-40 mx-auto border-2 border-white"
                                    src={me.image}
                                />
                                <h1 className="text-2xl font-bold mt-2">
                                    {me.name}
                                </h1>
                                <p className="text-gray-300">{me.title}</p>
                                <a
                                    className="text-sm flex items-center justify-center text-blue-400 hover:text-blue-300"
                                    href={me.mysite}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    {me.mysite}
                                </a>
                                <div className="stotalExperiencepace-y-1">
                                    <p className="text-sm flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                            />
                                        </svg>
                                        {me.email}
                                    </p>
                                    <p className="text-sm flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                            />
                                        </svg>
                                        {me.phone}
                                    </p>
                                </div>

                                <div className="mt-2">
                                    <span className="inline-block bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                                        {totalExperience}
                                    </span>
                                </div>

                                <div className="flex justify-center space-x-4 mt-2">
                                    <a
                                        aria-label="GitHub"
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                        href={me.github}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <svg
                                            className="w-5 h-5 fill-current text-white"
                                            viewBox="0 0 496 512"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                                        </svg>
                                    </a>
                                    <a
                                        aria-label="LinkedIn"
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                                        href={me.linkedin}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <svg
                                            className="w-5 h-5 fill-current text-white"
                                            viewBox="0 0 448 512"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.1v383.9C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32V64.1c0-17.6-14.4-32.1-32-32.1zM135.4 416H69V215.5h66.5V416zm-33.2-240c-21.8 0-39.5-17.7-39.5-39.5s17.7-39.5 39.5-39.5 39.5 17.7 39.5 39.5-17.7 39.5-39.5 39.5zm282.6 240h-66.4V299c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V215.5h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.6 44.3 79.6 101.9V416z"></path>
                                        </svg>
                                    </a>
                                </div>
                                <a
                                    download="Nazmul Haque CV.pdf"
                                    href={me.resume}
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#60A5FA",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    Download Resume
                                </a>
                            </div>

                            <div className="mb-4 ">
                                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    Skills
                                </h2>
                                <div className="grid grid-cols-2 gap-2 pr-4">
                                    {skills.map((skill, index) => (
                                        <div
                                            className="py-2 px-3 rounded bg-gray-800 text-center text-sm hover:bg-gray-700 transition-colors"
                                            key={index}
                                        >
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    Projects
                                </h2>
                                {works.map((work, index) => (
                                    <div className="mb-4 group" key={index}>
                                        <h3 className="font-bold group-hover:text-blue-400 transition-colors">
                                            {work.title}
                                        </h3>
                                        <p className="text-sm text-gray-300 mb-1">
                                            {work.technologies.join(", ")}
                                        </p>
                                        <a
                                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                                            href={work.link}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            View Project
                                            <svg
                                                className="w-4 h-4 ml-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                />
                                            </svg>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="w-2/3">
                            <div className="mb-2">
                                <h2 className="pl-6 text-xl font-bold mb-4 border-b border-gray-700 pb-2 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 "
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    Experience
                                </h2>
                                <div className="space-y-2 pl-6">
                                    {experience.map((exp, index) => (
                                        <div className="" key={index}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                                                        {exp.title}
                                                    </h3>
                                                    <p className="text-gray-300">
                                                        {exp.company}
                                                    </p>
                                                </div>
                                                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                                    {exp.date}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-400 mt-1">
                                                {exp.description.join(", ")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="pl-6 text-xl font-bold mb-3 border-b border-gray-700 pb-2 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    Education
                                </h2>
                                <div className="space-y-3 pl-6">
                                    {education.map((edu, index) => (
                                        <div
                                            className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                                            key={index}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold group-hover:text-blue-400 transition-colors">
                                                        {edu.degree}
                                                    </h3>
                                                    <p className="text-gray-300">
                                                        {edu.title}
                                                    </p>
                                                </div>
                                                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                                    {edu.date}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default CVBtn;
