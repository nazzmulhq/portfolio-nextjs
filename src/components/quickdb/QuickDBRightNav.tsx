"use client";

import React from "react";
import { STEP_DETAILS } from "./landingData";

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const DATA_VIEW_SUBSTEPS = [
    { label: "Install", step: 1 },
    { label: "Connect", step: 7 },
    { label: "Edit Grid", step: 10 },
    { label: "Fill Down", step: 12 },
    { label: "FK Rel", step: 13 },
    { label: "Paste Import", step: 16 },
    { label: "Save IDs", step: 19 },
] as const;

export const QUERY_CONSOLE_SUBSTEPS = [
    { label: "Open Console", step: 21 },
    { label: "New Query", step: 23 },
    { label: "Select DB", step: 30 },
    { label: "Write SQL", step: 31 },
    { label: "Run Query", step: 40 },
    { label: "Query History", step: 44 },
    { label: "Saved Query", step: 48 },
    { label: "SQL Snippets", step: 54 },
    { label: "Visualize", step: 60 },
] as const;

export interface QuickDBRightNavProps {
    s: number;
    jumpToStep: (stepNum: number) => void;
}

export const QuickDBRightNav: React.FC<QuickDBRightNavProps> = ({ s, jumpToStep }) => {
    if (s < 1) return null;

    const substeps = s >= 21 ? QUERY_CONSOLE_SUBSTEPS : DATA_VIEW_SUBSTEPS;

    // Determine the active substep index based on the current step 's'
    let activeIndex = 0;
    for (let i = 0; i < substeps.length; i++) {
        if (s >= substeps[i].step) {
            activeIndex = i;
        } else {
            break;
        }
    }

    return (
        <>
            {/* Soft vignette gradient strip for crystal-clear contrast against laptop content */}
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 380,
                    background: "linear-gradient(270deg, rgba(8, 10, 15, 0.95) 0%, rgba(8, 10, 15, 0.6) 50%, rgba(8, 10, 15, 0) 100%)",
                    pointerEvents: "none",
                    zIndex: 44,
                }}
            />
            <div
                aria-label="Step Right Nav Timeline"
                style={{
                    position: "absolute",
                    right: 32,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 46,
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: "flex-end",
                    userSelect: "none",
                }}
            >
                {substeps.map((substep, index) => {
                    const stepNum = substep.step;
                    const isActive = index === activeIndex;

                    return (
                        <div 
                            key={stepNum} 
                            className="group"
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 14, 
                                pointerEvents: "auto", 
                                cursor: "pointer",
                                height: 28, // Fixed height for smooth non-jumping layout
                                opacity: isActive ? 0 : 1, // Hide underlying text and line when active
                                transition: "opacity 0.3s ease",
                            }} 
                            onClick={() => jumpToStep(stepNum)}
                        >
                            <div
                                style={{
                                    font: `500 11px ${MONO}`,
                                    color: "rgba(255, 255, 255, 0.35)",
                                    textTransform: "uppercase",
                                    letterSpacing: ".08em",
                                    transition: "all 0.2s ease",
                                }}
                                className="group-hover:text-white group-hover:-translate-x-1"
                            >
                                {substep.label}
                            </div>
                            <div className="qd-nav-line" />
                        </div>
                    );
                })}

                {/* The smoothly sliding floating Active Card */}
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        // top = index * (height + gap) + (height / 2)
                        top: activeIndex * (28 + 12) + 14,
                        transform: "translateY(-50%)",
                        pointerEvents: "auto",
                        cursor: "pointer",
                        transition: "top 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // Ultra-smooth glide
                        
                        background: "rgba(10, 15, 24, 0.85)",
                        border: "1px solid rgba(77, 170, 252, 0.3)",
                        padding: "8px 12px",
                        borderRadius: 10,
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(20px)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 10,
                    }}
                    onClick={() => jumpToStep(substeps[activeIndex].step)}
                >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4daafc", boxShadow: "0 0 10px #4daafc", flexShrink: 0 }} />
                    <span
                        style={{
                            font: `600 11px ${MONO}`,
                            background: "rgba(0, 120, 212, 0.2)",
                            border: "1px solid rgba(77, 170, 252, 0.3)",
                            color: "#8fc9ff",
                            padding: "2px 6px",
                            borderRadius: 4,
                            lineHeight: 1.2,
                            flexShrink: 0,
                        }}
                    >
                        {String(substeps[activeIndex].step).padStart(2, "0")}
                    </span>
                    <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 600, letterSpacing: ".02em", textShadow: "0 0 12px rgba(0, 120, 212, 0.5)", whiteSpace: "nowrap" }}>
                        {STEP_DETAILS[substeps[activeIndex].step]?.title ?? ""}
                    </span>
                </div>

                <style>{`
                    .qd-nav-line {
                        height: 1.5px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 1px;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        width: 16px;
                    }
                    .group:hover .qd-nav-line {
                        background: rgba(255, 255, 255, 0.8);
                        width: 32px;
                    }
                `}</style>
            </div>
        </>
    );
};

export default QuickDBRightNav;
