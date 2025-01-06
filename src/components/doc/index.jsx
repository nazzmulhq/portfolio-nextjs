"use client";
import { useState } from "react";

import Link from "next/link";
import ReactCodeBlocks from "./ReactCodeBlocks";

export default function QuickCiCdDoc({ data }) {
    const getComponent = item => {
        switch (item.type) {
            case "basic":
                return (
                    <div
                        key={item.title}
                        className="w-full h-full glass-card rounded-xl p-4 space-y-4 relative"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-100 text-center rounded-xl w-8 h-8 text-green-500 rounded-tr-none rounded-bl-none">
                                {item?.step}
                            </span>
                        )}

                        <div>
                            {item.title && (
                                <p className="text-2xl text-white font-bold">
                                    {item.title}
                                </p>
                            )}

                            {item.content && (
                                <p className="text-white">{item.content}</p>
                            )}
                            {item.code && (
                                <ReactCodeBlocks
                                    code={item.code}
                                    language={item.language}
                                />
                            )}
                        </div>
                    </div>
                );
            case "list":
                return (
                    <div
                        key={item.title}
                        className="w-full h-full glass-card rounded-xl p-4 space-y-4 relative"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-200 text-center rounded-xl w-8 h-8 text-green-500 rounded-tr-none rounded-bl-none">
                                {item?.step}
                            </span>
                        )}
                        {item.title && (
                            <p className="text-2xl text-white font-bold">
                                {item.title}
                            </p>
                        )}
                        {item.content && (
                            <p className="text-white ml-4">{item.content}</p>
                        )}
                        {item.list && (
                            <ul className="list-disc list-inside pl-4">
                                {item.list.map((listItem, index) => (
                                    <li key={index} className="text-white">
                                        <span className="font-bold mr-1">
                                            {listItem.title}
                                        </span>
                                        <span>{listItem.content}</span>
                                        <span className="container">
                                            {listItem.code && (
                                                <ReactCodeBlocks
                                                    code={listItem.code}
                                                    language={listItem.language}
                                                />
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            case "tabs":
                const [activeTab, setActiveTab] = useState(item.tabs[0]);
                return (
                    <div
                        key={item.title}
                        className="w-full h-full glass-card rounded-xl p-4 space-y-4 relative"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-200 text-center rounded-xl w-8 h-8 text-green-500 rounded-tr-none rounded-bl-none">
                                {item?.step}
                            </span>
                        )}

                        <div>
                            <ul className="flex my-2 justify-center">
                                {item.tabs.map((tab, index) => (
                                    <li key={index} className="text-white">
                                        <button
                                            className={`
												text-white font-semibold border border-gray px-2 py-1 hover:bg-blue-500 hover:border-transparent hover:text-white ${
                                                    activeTab.title ===
                                                    tab.title
                                                        ? "bg-blue-500 text-white"
                                                        : ""
                                                }
												${index === 0 ? "rounded-l-md" : ""}
												${index === item.tabs.length - 1 ? "rounded-r-md" : ""}
												${index !== 0 && index !== item.tabs.length - 1 ? "" : "rounded-none"}

												`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-center w-full">
                                {
                                    <div className="md:w-[50%] space-y-2">
                                        {activeTab.title && (
                                            <p className="text-2xl text-white font-bold">
                                                {activeTab.title}
                                            </p>
                                        )}

                                        {activeTab.content && (
                                            <p className="text-white my-1">
                                                {activeTab.content}
                                            </p>
                                        )}

                                        {activeTab.code && (
                                            <ReactCodeBlocks
                                                code={activeTab.code}
                                                language={activeTab.language}
                                            />
                                        )}
                                        {activeTab.videoLink && (
                                            <video
                                                controls
                                                className="rounded-xl w-full"
                                                src={activeTab.videoLink}
                                            >
                                                <source
                                                    src={activeTab.videoLink}
                                                    type="video/mp4"
                                                />
                                                Your browser does not support
                                                the video tag.
                                            </video>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                );
            default:
                return "";
        }
    };
    return (
        <div
            className="min-h-screen p-4 space-y-4"
            style={{
                background:
                    "linear-gradient( 45deg,#2496ed,#61dafb,#68a063,#3776ab, #555555, #8993be)",
                backgroundSize: "400% 400%",
            }}
        >
            <h1 className="text-4xl text-center  glass-card text-white">
                Quick CI/CD
            </h1>

            <div className="my-4 text-right">
                <Link
                    target="_blank"
                    href="https://www.npmjs.com/package/quick-cicd"
                    className="text-white text-right px-4 py-2 bg-blue-400 rounded-md text-lg font-bold hover:bg-blue-500 hover:text-white"
                >
                    Go to npm package
                </Link>
            </div>
            <div className="w-full space-y-4">
                {data.map((item, i) => getComponent(item))}
            </div>
        </div>
    );
}
