"use client";

import React from "react";
import { STEPS, STEP_DETAILS } from "./landingData";

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface QuickDBClockDialProps {
    s: number;
    jumpToStep: (stepNum: number) => void;
}

export const QuickDBClockDial: React.FC<QuickDBClockDialProps> = ({ s, jumpToStep }) => {
    if (s < 1) return null;

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
                aria-label="Step Clock Dial Timeline"
                style={{
                    position: "absolute",
                    right: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: 580,
                    width: 340,
                    zIndex: 46,
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    userSelect: "none",
                }}
            >
                {STEPS.map(([stepStr], stepIdx) => {
                    const stepNum = stepIdx + 1;
                    const isCurrent = s === stepNum;
                    const isMajor = stepNum === 1 || stepNum % 3 === 1 || stepNum === 20;

                    const norm = stepIdx / (STEPS.length - 1); // 0 to 1
                    // True Geometric Circle Radius Equation for 580px height
                    const radius = 340;
                    const maxDy = 270; // Half height span (540px total span)
                    const dyPixel = (norm - 0.5) * 2 * maxDy; // -270 to +270
                    const dxTop = radius - Math.sqrt(radius * radius - maxDy * maxDy);
                    const dxCurrent = radius - Math.sqrt(Math.max(0, radius * radius - dyPixel * dyPixel));
                    const arcX = -(dxTop - dxCurrent); // True circular arc offset
                    const rotAngle = (Math.atan2(-dyPixel, Math.sqrt(Math.max(1, radius * radius - dyPixel * dyPixel))) * 180) / Math.PI; // Exact circle tangent angle

                    const tickWidth = isCurrent ? 40 : isMajor ? 22 : 14;
                    const tickColor = isCurrent
                        ? "#4daafc"
                        : isMajor
                          ? "#ffffff"
                          : "rgba(255, 255, 255, 0.65)";

                    return (
                        <div key={stepNum} style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 2, pointerEvents: "none" }}>
                            {/* Main Step Item */}
                            <div
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    height: 20,
                                    pointerEvents: "none",
                                    transform: `translateX(${arcX.toFixed(1)}px) rotate(${rotAngle.toFixed(1)}deg)`,
                                    transformOrigin: "right center",
                                    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                            >
                                {/* Active Step Floating Title & Description (Pixel-Perfect Dark Glass Badge) */}
                                {isCurrent && (
                                    <div
                                        style={{
                                            marginRight: 18,
                                            textAlign: "right",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            pointerEvents: "none",
                                            transform: `rotate(${-rotAngle.toFixed(1)}deg)`,
                                            transformOrigin: "right center",
                                        }}
                                    >
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
                                    </div>
                                )}

                                {/* Major Step Number Label (Solid Luminous White) */}
                                {!isCurrent && isMajor && (
                                    <span
                                        style={{
                                            marginRight: 10,
                                            fontSize: 10,
                                            font: `600 10px ${MONO}`,
                                            color: "#ffffff",
                                            textShadow: "0 1px 8px #000000, 0 0 4px #000000, 0 0 2px #000000",
                                            whiteSpace: "nowrap",
                                            transform: `rotate(${-rotAngle.toFixed(1)}deg)`,
                                            transition: "all 0.2s ease",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {String(stepNum).padStart(2, "0")}
                                    </span>
                                )}

                                {/* Tick Line (Compact High-Visibility Scale Bar) */}
                                <div
                                    onClick={() => jumpToStep(stepNum)}
                                    title={`Step ${stepNum}: ${STEP_DETAILS[stepNum]?.title ?? ""}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        padding: "5px 0",
                                        cursor: "pointer",
                                        pointerEvents: "auto",
                                    }}
                                >
                                    <div
                                        className="qd-tick-bar"
                                        style={{
                                            width: tickWidth,
                                            height: isCurrent ? 3.5 : isMajor ? 2 : 1.4,
                                            borderRadius: 0,
                                            background: isCurrent ? "linear-gradient(90deg, #0078d4, #4daafc)" : tickColor,
                                            boxShadow: isCurrent ? "0 0 16px #0078d4, 0 0 6px #4daafc" : "0 0 4px rgba(255, 255, 255, 0.4), 0 1px 5px rgba(0, 0, 0, 0.95)",
                                            transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default QuickDBClockDial;
