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
    currentStep?: number;
    jumpToStep: (stepNum: number) => void;
    triggerToast: (msg: string) => void;
}

export const QuickDBBottomNav: React.FC<QuickDBBottomNavProps> = ({
    navItems,
    currentStep = 1,
    jumpToStep,
}) => {
    const isNavActive = (itemStep?: number) => {
        if (itemStep === undefined) return false;
        if (itemStep <= 1) return currentStep < 21;
        if (itemStep === 21) return currentStep >= 21 && currentStep < 63;
        if (itemStep === 63) return currentStep >= 63;
        return false;
    };

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
                const active = isNavActive(nav.step);
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
                            border: active
                                ? "1px solid rgba(0, 120, 212, 0.6)"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                            background: active
                                ? "linear-gradient(135deg, #0078d4, #005a9e)"
                                : "rgba(255, 255, 255, 0.04)",
                            color: active ? "#ffffff" : "#999999",
                            fontSize: 11.5,
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: active
                                ? "0 2px 10px rgba(0, 120, 212, 0.45)"
                                : "none",
                            transition: "all 0.18s ease",
                        }}
                    >
                        <span style={{ fontSize: 11, opacity: active ? 1 : 0.7 }}>{nav.icon}</span>
                        {nav.label}
                    </button>
                );
            })}
        </div>
    );
};

export default QuickDBBottomNav;
