"use client";

import React from "react";

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface NavItem {
    label: string;
    icon: string;
    live: boolean;
    step?: number;
}

export interface QuickDBBottomNavProps {
    navItems: readonly NavItem[];
    jumpToStep: (stepNum: number) => void;
    triggerToast: (msg: string) => void;
}

export const QuickDBBottomNav: React.FC<QuickDBBottomNavProps> = ({
    navItems,
    jumpToStep,
    triggerToast,
}) => {
    return (
        <div
            style={{
                position: "absolute",
                left: "50%",
                bottom: 84,
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 99,
                background: "rgba(14, 14, 20, 0.94)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.85)",
                zIndex: 40,
                pointerEvents: "auto",
                maxWidth: "94vw",
                overflowX: "auto",
                backdropFilter: "blur(14px)",
            }}
        >
            {navItems.map((nav) => {
                if (nav.live) {
                    return (
                        <button
                            key={nav.label}
                            onClick={() => jumpToStep(nav.step ?? 1)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4.5px 12px",
                                borderRadius: 99,
                                border: "1px solid rgba(0, 120, 212, 0.6)",
                                background: "linear-gradient(135deg, #0078d4, #005a9e)",
                                color: "#ffffff",
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 10px rgba(0, 120, 212, 0.45)",
                            }}
                        >
                            <span style={{ fontSize: 11 }}>{nav.icon}</span>
                            {nav.label}
                        </button>
                    );
                }

                return (
                    <button
                        key={nav.label}
                        onClick={() => triggerToast(`${nav.label} — Coming Soon! Data View (Steps 1–20) is active.`)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4.5px 11px",
                            borderRadius: 99,
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            background: "rgba(255, 255, 255, 0.04)",
                            color: "#999999",
                            fontSize: 11.5,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.18s ease",
                        }}
                    >
                        <span style={{ fontSize: 11, opacity: 0.6 }}>{nav.icon}</span>
                        {nav.label}
                        <span
                            style={{
                                fontSize: 8.5,
                                font: `600 8.5px ${MONO}`,
                                color: "rgba(255, 255, 255, 0.4)",
                                background: "rgba(255, 255, 255, 0.06)",
                                padding: "1px 4px",
                                borderRadius: 3,
                            }}
                        >
                            SOON
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default QuickDBBottomNav;
