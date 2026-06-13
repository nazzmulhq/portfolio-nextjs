"use client";
import Link from "next/link";
import React, { useState } from "react";
import ReactCodeBlocks from "./ReactCodeBlocks";

function Card({ children, step }) {
    return (
        <div className="group glass-card rail relative reveal-scale p-6 sm:p-8">
            {step && (
                <div className="absolute -left-3.5 -top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent-strong),var(--accent-2))] text-sm font-bold text-[var(--accent-contrast)] shadow-[0_0_18px_-2px_var(--glow)]">
                    {step}
                </div>
            )}
            <div className="relative z-10 space-y-4">{children}</div>
        </div>
    );
}

function Heading({ children }) {
    return (
        <h3 className="font-display flex items-center gap-3 text-xl font-extrabold text-fg sm:text-2xl">
            <span className="h-6 w-1.5 rounded-full bg-[var(--accent)]" />
            {children}
        </h3>
    );
}

export default function QuickCiCdDoc({ data, title }) {
    const getComponent = (item, idx) => {
        switch (item.type) {
            case "basic":
                return (
                    <Card key={item.title || idx} step={item.step}>
                        {item.title && <Heading>{item.title}</Heading>}
                        {item.content && (
                            <p className="text-sm font-light leading-relaxed text-muted sm:text-base">
                                {item.content}
                            </p>
                        )}
                        {item.code && <ReactCodeBlocks code={item.code} language={item.language} />}
                    </Card>
                );
            case "list":
                return (
                    <Card key={item.title || idx} step={item.step}>
                        {item.title && <Heading>{item.title}</Heading>}
                        {item.content && (
                            <p className="text-sm font-light leading-relaxed text-muted sm:text-base">
                                {item.content}
                            </p>
                        )}
                        {item.list && (
                            <div className="mt-2 space-y-3">
                                {item.list.map((listItem, index) => (
                                    <div
                                        key={`${item.title}-${index}`}
                                        className="rounded-xl border border-line bg-[color-mix(in_srgb,var(--surface-2)_60%,transparent)] p-4 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent-soft)] text-xs font-bold text-accent">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 space-y-2">
                                                {listItem.title && (
                                                    <h4 className="text-sm font-bold text-fg sm:text-base">
                                                        {listItem.title}
                                                    </h4>
                                                )}
                                                {listItem.content && (
                                                    <p className="text-xs font-light leading-relaxed text-muted sm:text-sm">
                                                        {listItem.content}
                                                    </p>
                                                )}
                                                {listItem.code && (
                                                    <ReactCodeBlocks
                                                        code={listItem.code}
                                                        language={listItem.language}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                );
            case "tabs":
                return <TabsCard key={item.title || idx} item={item} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full font-sans text-fg">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-line px-4 pb-12 pt-20 sm:pb-16 sm:pt-28">
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-0 h-[180px] w-full max-w-2xl -translate-x-1/2 rounded-full blur-[80px]"
                    style={{ background: "var(--glow)" }}
                />
                <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
                    <div className="reveal-scale mb-6 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-4 shadow-[0_0_40px_-10px_var(--glow)] backdrop-blur-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-accent">
                            <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="font-display reveal mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        <span className="text-gradient">{title}</span>
                    </h1>

                    <p className="reveal mb-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                        A lightweight, zero-dependency CLI that automatically containerizes Node.js,
                        Next.js, and PHP Laravel projects with production-grade Docker environments and
                        CI/CD templates.
                    </p>

                    <div className="reveal mx-auto flex w-full max-w-xs flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center">
                        <Link href="/" className="btn-ghost sheen">
                            <svg className="relative z-10 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="relative z-10">Back to Portfolio</span>
                        </Link>
                        <Link href="https://www.npmjs.com/package/quick-cicd" target="_blank" className="btn-accent sheen">
                            <svg className="relative z-10 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className="relative z-10">Go to NPM Package</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-12 sm:py-16">
                {data.map((item, i) => (
                    <React.Fragment key={i}>{getComponent(item, i)}</React.Fragment>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-line bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] py-12 text-center text-faint">
                <p className="text-sm font-light">Quick Dockerize Tool — Built by Nazmul Haque</p>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                    <Link href="/" className="transition-colors hover:text-accent">Portfolio Home</Link>
                    <span>&bull;</span>
                    <Link href="https://www.npmjs.com/package/quick-cicd" target="_blank" className="transition-colors hover:text-accent">NPM Registry</Link>
                </div>
            </div>
        </div>
    );
}

function TabsCard({ item }) {
    const [activeTab, setActiveTab] = useState(item.tabs[0]);
    return (
        <Card step={item.step}>
            <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
                <Heading>Setup Guides</Heading>
                <div className="flex flex-wrap gap-1.5 self-center rounded-xl border border-line bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)] p-1.5 sm:self-start">
                    {item.tabs.map((tab, index) => (
                        <button
                            key={index}
                            aria-selected={activeTab.title === tab.title}
                            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 sm:text-sm ${
                                activeTab.title === tab.title
                                    ? "bg-[linear-gradient(120deg,var(--accent-strong),var(--accent-2))] text-[var(--accent-contrast)] shadow-[0_0_15px_-3px_var(--glow)]"
                                    : "text-muted hover:bg-[var(--surface)] hover:text-fg"
                            }`}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                {activeTab.title && (
                    <h4 className="font-display text-lg font-extrabold text-fg sm:text-xl">
                        {activeTab.title} Config
                    </h4>
                )}
                {activeTab.content && (
                    <p className="text-sm font-light leading-relaxed text-muted sm:text-base">
                        {activeTab.content}
                    </p>
                )}
                {activeTab.code && <ReactCodeBlocks code={activeTab.code} language={activeTab.language} />}
                {activeTab.videoLink && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-line shadow-[0_0_40px_-12px_var(--glow)]">
                        <video
                            controls
                            className="h-auto w-full object-cover"
                            src={activeTab.videoLink}
                            controlsList="nodownload"
                        >
                            <source src={activeTab.videoLink} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </div>
        </Card>
    );
}
