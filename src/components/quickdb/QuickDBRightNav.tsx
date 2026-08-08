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
                    width: 340,
                    background: "linear-gradient(270deg, rgba(8, 10, 15, 0.82) 0%, rgba(8, 10, 15, 0.4) 60%, rgba(8, 10, 15, 0) 100%)",
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
                    gap: 16,
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
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 16, 
                                pointerEvents: "auto", 
                                cursor: "pointer",
                                minHeight: isActive ? 60 : 20,
                            }} 
                            onClick={() => jumpToStep(stepNum)}
                        >
                            {/* Content to the left of the line */}
                            <div style={{ display: "flex", justifyContent: "flex-end", transition: "all 0.3s ease" }}>
                                {isActive ? (
                                    // Active state: Show the full card
                                    <div
                                        style={{
                                            background: "rgba(8, 12, 20, 0.94)",
                                            border: "1px solid rgba(0, 120, 212, 0.5)",
                                            padding: "8px 13px",
                                            borderRadius: 8,
                                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.92), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                                            backdropFilter: "blur(16px)",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            gap: 5,
                                            maxWidth: 275,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                textAlign: "right",
                                            }}
                                        >
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4daafc", boxShadow: "0 0 8px #4daafc", flexShrink: 0 }} />
                                            <span
                                                style={{
                                                    font: `600 10.5px ${MONO}`,
                                                    background: "rgba(0, 120, 212, 0.3)",
                                                    border: "1px solid rgba(77, 170, 252, 0.4)",
                                                    color: "#8fc9ff",
                                                    padding: "1px 5px",
                                                    borderRadius: 4,
                                                    lineHeight: 1.2,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {String(stepNum).padStart(2, "0")}
                                            </span>
                                            <span style={{ color: "#ffffff", letterSpacing: ".02em", textShadow: "0 0 10px rgba(0, 120, 212, 0.6)" }}>
                                                {STEP_DETAILS[stepNum]?.title ?? ""}
                                            </span>
                                        </div>
                                        {STEP_DETAILS[stepNum]?.description && (
                                            <div
                                                style={{
                                                    fontSize: 11.5,
                                                    color: "rgba(226, 241, 255, 0.85)",
                                                    lineHeight: 1.45,
                                                    textAlign: "right",
                                                }}
                                            >
                                                {STEP_DETAILS[stepNum].description}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Inactive state: Initial show title
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "rgba(255, 255, 255, 0.5)",
                                            fontWeight: 500,
                                            letterSpacing: ".02em",
                                            transition: "color 0.2s ease",
                                        }}
                                    >
                                        {substep.label}
                                    </div>
                                )}
                            </div>

                            {/* The Line */}
                            <div
                                style={{
                                    width: isActive ? 40 : 20,
                                    height: 2,
                                    background: isActive ? "linear-gradient(90deg, #0078d4, #4daafc)" : "rgba(255, 255, 255, 0.4)",
                                    boxShadow: isActive ? "0 0 16px #0078d4, 0 0 6px #4daafc" : "none",
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default QuickDBRightNav;
