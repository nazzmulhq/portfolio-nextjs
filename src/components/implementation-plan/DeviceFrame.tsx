"use client";

import React, { useState, useEffect } from "react";
import { DeviceMode, DEVICE_SPECS } from "./types";

interface DeviceFrameProps {
    mode: Exclude<DeviceMode, "responsive" | "split">;
    orientation: "portrait" | "landscape";
    zoom: number;
    children: React.ReactNode;
    currentTime?: string;
}

export default function DeviceFrame({
    mode,
    orientation,
    zoom,
    children,
    currentTime = "9:41",
}: DeviceFrameProps) {
    const spec = DEVICE_SPECS[mode];
    const isLandscape = orientation === "landscape" && spec.hasOrientation;

    const width = isLandscape ? spec.height : spec.width;
    const height = isLandscape ? spec.width : spec.height;

    // Calculate scaled container dimensions for proper centering layout
    const scaledWidth = width * zoom;
    const scaledHeight = height * zoom;

    return (
        <div className="flex flex-col items-center justify-center py-6 px-2 sm:px-4 transition-all duration-300">
            {/* Device Info Badge */}
            <div className="mb-4 flex items-center gap-3 rounded-full border border-line bg-[var(--surface-2)] px-4 py-1.5 text-xs text-muted shadow-sm backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="font-semibold text-fg">{spec.name}</span>
                <span className="text-faint">|</span>
                <span className="font-mono">
                    {width} × {height} px
                </span>
                <span className="text-faint">|</span>
                <span className="font-mono font-medium text-accent">
                    {Math.round(zoom * 100)}% scale
                </span>
            </div>

            {/* Scaled Frame Wrapper Container */}
            <div
                style={{
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                }}
                className="relative flex items-center justify-center"
            >
                <div
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        transform: `scale(${zoom})`,
                        transformOrigin: "center center",
                    }}
                    className="relative transition-transform duration-200"
                >
                    {/* 📱 MOBILE FRAME (iPhone 16 Pro) */}
                    {mode === "mobile" && (
                        <div className="relative h-full w-full rounded-[52px] bg-[#0c0d14] p-3.5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_0_3px_#2a2c38]">
                            {/* Outer buttons (Volume & Power) */}
                            <div className="absolute -left-[5px] top-28 h-12 w-1 rounded-l-sm bg-[#3a3d4d]" />
                            <div className="absolute -left-[5px] top-44 h-12 w-1 rounded-l-sm bg-[#3a3d4d]" />
                            <div className="absolute -right-[5px] top-36 h-16 w-1 rounded-r-sm bg-[#3a3d4d]" />

                            {/* Inner Screen Screen Container */}
                            <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-[var(--canvas)] text-[var(--fg)] flex flex-col border border-black/40">
                                {/* Mobile Status Bar */}
                                <div className="relative z-30 flex h-11 w-full shrink-0 items-center justify-between px-7 pt-2 text-xs font-semibold select-none bg-[var(--canvas)]/80 backdrop-blur-md border-b border-line/30">
                                    <span className="font-mono text-fg text-xs">{currentTime}</span>

                                    {/* Dynamic Island */}
                                    <div className="absolute left-1/2 top-2.5 -translate-x-1/2 flex items-center justify-center gap-2 h-6 w-24 rounded-full bg-black shadow-inner">
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#111] ring-1 ring-[#222]" />
                                        <div className="h-2 w-2 rounded-full bg-[#0a101f]/80" />
                                    </div>

                                    {/* Right status icons */}
                                    <div className="flex items-center gap-1.5 text-fg">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
                                        </svg>
                                        <span className="text-[10px] font-mono font-bold">5G</span>
                                        <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
                                            <div className="h-full w-4/5 bg-current rounded-2xs" />
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Scrollable Body */}
                                <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 scroll-smooth custom-scrollbar">
                                    {children}
                                </div>

                                {/* Home Swipe Bar */}
                                <div className="relative z-30 flex h-5 w-full shrink-0 items-center justify-center bg-[var(--canvas)]/80 backdrop-blur-md">
                                    <div className="h-1 w-32 rounded-full bg-fg/40" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 📱 TABLET FRAME (iPad Pro) */}
                    {mode === "tablet" && (
                        <div className="relative h-full w-full rounded-[36px] bg-[#12141c] p-4 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_0_2px_#272b3b]">
                            {/* Inner Screen */}
                            <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-[var(--canvas)] text-[var(--fg)] flex flex-col border border-black/40">
                                {/* Tablet Header Bar */}
                                <div className="relative z-30 flex h-10 w-full shrink-0 items-center justify-between px-6 text-xs font-semibold select-none bg-[var(--canvas)]/85 backdrop-blur-md border-b border-line/40">
                                    <span className="font-mono text-fg">{currentTime}</span>

                                    {/* Camera dot */}
                                    <div className="h-2 w-2 rounded-full bg-[#1b202e] ring-1 ring-white/10" />

                                    <div className="flex items-center gap-2 text-fg text-xs font-mono">
                                        <span>Wi-Fi</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Scrollable content */}
                                <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 scroll-smooth custom-scrollbar">
                                    {children}
                                </div>

                                {/* Bottom Home Bar */}
                                <div className="relative z-30 flex h-4 w-full shrink-0 items-center justify-center bg-[var(--canvas)]/80 backdrop-blur-md">
                                    <div className="h-1 w-36 rounded-full bg-fg/30" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 💻 LAPTOP FRAME (MacBook Pro 14") */}
                    {mode === "laptop" && (
                        <div className="relative h-full w-full flex flex-col items-center">
                            {/* Laptop Lid Screen */}
                            <div className="relative h-[calc(100%-24px)] w-full rounded-t-[20px] bg-[#151722] p-3 shadow-[0_35px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col">
                                {/* Screen Notch & Bezel */}
                                <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[var(--canvas)] text-[var(--fg)] flex flex-col border border-black/50">
                                    {/* macOS Menu Bar */}
                                    <div className="relative z-30 flex h-7 w-full shrink-0 items-center justify-between px-4 text-[11px] font-medium select-none bg-[var(--canvas-2)]/90 backdrop-blur-md border-b border-line">
                                        <div className="flex items-center gap-3 text-muted">
                                            <span className="text-fg font-bold cursor-pointer">🍎</span>
                                            <span className="font-semibold text-fg">Implementation Plan</span>
                                            <span className="hover:text-fg cursor-pointer hidden sm:inline">File</span>
                                            <span className="hover:text-fg cursor-pointer hidden sm:inline">Edit</span>
                                            <span className="hover:text-fg cursor-pointer hidden sm:inline">View</span>
                                            <span className="hover:text-fg cursor-pointer hidden sm:inline">Help</span>
                                        </div>

                                        {/* Center Notch */}
                                        <div className="absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center h-4 w-28 rounded-b-lg bg-black">
                                            <div className="h-1.5 w-1.5 rounded-full bg-[#1e2333]" />
                                        </div>

                                        <div className="flex items-center gap-2 text-muted text-[11px] font-mono">
                                            <span>🔋 100%</span>
                                            <span>{currentTime}</span>
                                        </div>
                                    </div>

                                    {/* Inner Scrollable Body */}
                                    <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 scroll-smooth custom-scrollbar">
                                        {children}
                                    </div>
                                </div>
                            </div>

                            {/* Laptop Base Body */}
                            <div className="relative h-6 w-[104%] -mt-1 rounded-b-[14px] bg-[linear-gradient(to_bottom,#282c3c,#181b26)] shadow-md flex items-start justify-center border-t border-white/10">
                                <div className="h-1.5 w-24 rounded-b-md bg-[#0f1118]" />
                            </div>
                        </div>
                    )}

                    {/* 🖥️ DESKTOP MONITOR FRAME */}
                    {mode === "desktop" && (
                        <div className="relative h-full w-full flex flex-col items-center">
                            {/* Monitor Bezel */}
                            <div className="relative h-[calc(100%-48px)] w-full rounded-[14px] bg-[#12141d] p-2.5 shadow-[0_40px_110px_-25px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col">
                                <div className="relative h-full w-full overflow-hidden rounded-[8px] bg-[var(--canvas)] text-[var(--fg)] flex flex-col border border-black/60">
                                    {/* Monitor Browser Window Header */}
                                    <div className="relative z-30 flex h-9 w-full shrink-0 items-center justify-between px-4 text-xs select-none bg-[var(--surface)]/90 backdrop-blur-md border-b border-line">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                                            <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                                            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                                        </div>

                                        {/* URL bar */}
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-[var(--surface-2)] border border-line px-6 py-1 text-xs text-muted font-mono w-1/2 max-w-md">
                                            <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span className="truncate">https://nazzmulhaque.vercel.app/implementation_plan</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-muted text-xs">
                                            <span>Desktop 1440p</span>
                                        </div>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="relative flex-1 overflow-y-auto overflow-x-hidden p-8 sm:p-12 scroll-smooth custom-scrollbar">
                                        {children}
                                    </div>
                                </div>
                            </div>

                            {/* Stand Neck */}
                            <div className="h-7 w-24 bg-[linear-gradient(to_bottom,#202434,#131622)] shadow-inner" />
                            {/* Stand Base */}
                            <div className="h-4 w-60 rounded-t-xl bg-[linear-gradient(to_bottom,#2b3046,#181b28)] shadow-lg border-t border-white/15" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
