"use client";
import React, { useState } from "react";

import Link from "next/link";
import ReactCodeBlocks from "./ReactCodeBlocks";

export default function QuickCiCdDoc({ data, title }) {
    const getComponent = item => {
        switch (item.type) {
            case "basic":
                return (
                    <div
                        key={item.title}
                        className="w-full h-full p-4 space-y-4 relative  border border-white"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-100 text-center  w-8 h-8 text-green-500 ">
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
                        className="w-full h-full p-4 space-y-4 relative border border-white"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-200 text-center  w-8 h-8 text-green-500 ">
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
                                    <li
                                        key={`${item.title}-${index}`}
                                        className="text-white"
                                    >
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
                        className="w-full h-full border border-white p-4 space-y-4 relative"
                    >
                        {item?.step && (
                            <span className="text-xl absolute left-0 top-0 bg-green-200 text-center  w-8 h-8 text-green-500 ">
                                {item?.step}
                            </span>
                        )}

                        <div className="">
                            <ul className="flex w-full my-2 justify-center">
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
                                            data-copied={
                                                activeTab.title === tab.title
                                                    ? "true"
                                                    : "false"
                                            }
                                        >
                                            {tab.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="w-full">
                                {
                                    <div className=" space-y-2">
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
                                                controlsList="nodownload"
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
                return null;
        }
    };
    return (
        <div>
            <h1 className="text-4xl text-center text-white border border-white py-2">
                {title}
            </h1>

            <div className="flex justify-end  space-x-4 p-4">
                <Link
                    target="_blank"
                    href="https://www.npmjs.com/package/quick-cicd"
                    className="text-white text-right px-4 py-2 hover:bg-gray-700/50  text-lg font-bold hover:text-white border border-white"
                >
                    Home
                </Link>
                <Link
                    target="_blank"
                    href="https://www.npmjs.com/package/quick-cicd"
                    className="text-white text-right px-4 py-2 text-lg font-bold hover:bg-gray-700/50  hover:text-white border border-white"
                >
                    Go to npm package
                </Link>
            </div>
            <div className="w-full space-y-4" key={"doc"}>
                {data.map((item, i) => (
                    <React.Fragment key={i}>
                        {getComponent(item)}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
