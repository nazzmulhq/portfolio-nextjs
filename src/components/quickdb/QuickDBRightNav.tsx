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

export interface QuickDBRightNavProps {
    s: number;
    jumpToStep: (stepNum: number) => void;
}

export const QuickDBRightNav: React.FC<QuickDBRightNavProps> = ({ s, jumpToStep }) => {
    if (s < 1) return null;

    // Determine the active substep index based on the current step 's'
    let activeIndex = 0;
    for (let i = 0; i < DATA_VIEW_SUBSTEPS.length; i++) {
        if (s >= DATA_VIEW_SUBSTEPS[i].step) {
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
                {DATA_VIEW_SUBSTEPS.map((substep, index) => {
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
                                minHeight: isActive ? 68 : 28,
                                transition: "min-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                            }} 
                            onClick={() => jumpToStep(stepNum)}
                        >
                            {/* Content to the left of the line */}
                            <div style={{ display: "flex", justifyContent: "flex-end", transition: "all 0.3s ease" }}>
                                {isActive ? (
                                    // Active state: Show the full card
                                    <div
                                        style={{
                                            background: "rgba(10, 15, 24, 0.85)",
                                            border: "1px solid rgba(77, 170, 252, 0.3)",
                                            padding: "10px 14px",
                                            borderRadius: 10,
                                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                                            backdropFilter: "blur(20px)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            gap: 6,
                                            maxWidth: 290,
                                            animation: "qd-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                textAlign: "right",
                                            }}
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
                                                {String(stepNum).padStart(2, "0")}
                                            </span>
                                            <span style={{ color: "#ffffff", letterSpacing: ".02em", textShadow: "0 0 12px rgba(0, 120, 212, 0.5)" }}>
                                                {STEP_DETAILS[stepNum]?.title ?? ""}
                                            </span>
                                        </div>
                                        {STEP_DETAILS[stepNum]?.description && (
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "rgba(230, 245, 255, 0.75)",
                                                    lineHeight: 1.5,
                                                    textAlign: "right",
                                                }}
                                            >
                                                {STEP_DETAILS[stepNum].description}
                                            </div>
                                        )}
                                        <style>{`
                                            @keyframes qd-slide-in {
                                                0% { opacity: 0; transform: translateX(10px) scale(0.96); }
                                                100% { opacity: 1; transform: translateX(0) scale(1); }
                                            }
                                        `}</style>
                                    </div>
                                ) : (
                                    // Inactive state: Initial show title
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
                                )}
                            </div>

                            {/* The Line - Only for inactive steps */}
                            {!isActive && (
                                <>
                                    <div className="qd-nav-line" />
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
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default QuickDBRightNav;
