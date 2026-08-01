"use client";

import React from "react";
import { formatInstallCount, useQuickDBMarketplace } from "./useQuickDBMarketplace";

export interface QuickDBStatsBarProps {
    compact?: boolean;
}

export const QuickDBStatsBar: React.FC<QuickDBStatsBarProps> = ({ compact = false }) => {
    const stats = useQuickDBMarketplace();

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: compact ? 8 : 12,
                padding: compact ? "4px 12px" : "6px 16px",
                borderRadius: 99,
                background: "rgba(14, 16, 24, 0.88)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(14px)",
                margin: compact ? "8px auto" : "16px auto 12px",
                flexWrap: "wrap",
                justifyContent: "center",
                userSelect: "none",
            }}
        >
            {/* Version */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: compact ? 11.5 : 12.5, color: "#8fc9ff", fontWeight: 600 }}>
                <span style={{ fontSize: compact ? 11 : 12 }}>📦</span>
                <span>v{stats.version}</span>
            </div>

            <div style={{ width: 1, height: 12, background: "rgba(255, 255, 255, 0.16)" }} />

            {/* Installs */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: compact ? 11.5 : 12.5, color: "#4daafc", fontWeight: 600 }}>
                <span style={{ fontSize: compact ? 11 : 12 }}>⚡</span>
                <span>{formatInstallCount(stats.installs)} Installs</span>
            </div>

            <div style={{ width: 1, height: 12, background: "rgba(255, 255, 255, 0.16)" }} />

            {/* Downloads */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: compact ? 11.5 : 12.5, color: "#34d399", fontWeight: 600 }}>
                <span style={{ fontSize: compact ? 11 : 12 }}>⇩</span>
                <span>{formatInstallCount(stats.downloads)} Downloads</span>
            </div>

            <div style={{ width: 1, height: 12, background: "rgba(255, 255, 255, 0.16)" }} />

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: compact ? 11.5 : 12.5, color: "#fbbf24", fontWeight: 600 }}>
                <span style={{ fontSize: compact ? 11 : 12 }}>★</span>
                <span>{stats.rating}</span>
            </div>
        </div>
    );
};

export default QuickDBStatsBar;
