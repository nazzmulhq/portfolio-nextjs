"use client";

import React, { useEffect, useState } from "react";

interface BatteryManager extends EventTarget {
    charging: boolean;
    level: number;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface NavigatorWithBattery extends Navigator {
    getBattery?: () => Promise<BatteryManager>;
}

function formatMacDateTime(date: Date): string {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${dayName} ${dayNum} ${monthName} ${hours}:${minStr} ${ampm}`;
}

function getWeatherEmoji(wmoCode: number): string {
    if (wmoCode === 0) return "☀️";
    if (wmoCode >= 1 && wmoCode <= 3) return "⛅";
    if (wmoCode >= 45 && wmoCode <= 48) return "🌫️";
    if (wmoCode >= 51 && wmoCode <= 57) return "🌦️";
    if (wmoCode >= 61 && wmoCode <= 67) return "🌧️";
    if (wmoCode >= 71 && wmoCode <= 77) return "❄️";
    if (wmoCode >= 80 && wmoCode <= 82) return "🌧️";
    if (wmoCode >= 85 && wmoCode <= 86) return "🌨️";
    if (wmoCode >= 95 && wmoCode <= 99) return "🌩️";
    return "🌤️";
}

export const QuickDBTopMenuBar: React.FC = () => {
    const [dateTimeStr, setDateTimeStr] = useState<string>("");
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [isCharging, setIsCharging] = useState<boolean>(false);
    const [weatherStr, setWeatherStr] = useState<string>("🌧️ 29°C");

    // Realtime Clock update based on user's laptop system time
    useEffect(() => {
        setDateTimeStr(formatMacDateTime(new Date()));
        const timer = setInterval(() => {
            setDateTimeStr(formatMacDateTime(new Date()));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Realtime Battery status API listener
    useEffect(() => {
        if (typeof navigator !== "undefined" && "getBattery" in navigator) {
            const nav = navigator as NavigatorWithBattery;
            nav.getBattery?.()
                .then((battery) => {
                    const updateBattery = () => {
                        setBatteryLevel(Math.round(battery.level * 100));
                        setIsCharging(battery.charging);
                    };
                    updateBattery();
                    battery.addEventListener("levelchange", updateBattery);
                    battery.addEventListener("chargingchange", updateBattery);
                })
                .catch(() => {
                    setBatteryLevel(100);
                });
        } else {
            setBatteryLevel(100);
        }
    }, []);

    // Dynamic Live Weather Fetch based on user's real location (Geolocation / IP -> Open-Meteo)
    useEffect(() => {
        let isMounted = true;

        async function fetchLiveWeather(lat: number, lon: number) {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await res.json();
                if (data?.current_weather && isMounted) {
                    const temp = Math.round(data.current_weather.temperature);
                    const emoji = getWeatherEmoji(data.current_weather.weathercode);
                    setWeatherStr(`${emoji} ${temp}°C`);
                }
            } catch {
                // Silently fallback if offline
            }
        }

        async function fetchIPLocationAndWeather() {
            try {
                const ipRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
                const ipData = await ipRes.json();
                if (ipData?.latitude && ipData?.longitude) {
                    fetchLiveWeather(parseFloat(ipData.latitude), parseFloat(ipData.longitude));
                }
            } catch {
                try {
                    const wRes = await fetch("https://wttr.in/?format=%c+%t");
                    const text = await wRes.text();
                    const clean = text.trim().replace(/\+/g, "");
                    if (isMounted && clean && (clean.includes("°") || clean.length > 2)) {
                        setWeatherStr(clean);
                    }
                } catch {
                    // Ignore
                }
            }
        }

        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    fetchLiveWeather(pos.coords.latitude, pos.coords.longitude);
                },
                () => {
                    fetchIPLocationAndWeather();
                },
                { timeout: 3500 }
            );
        } else {
            fetchIPLocationAndWeather();
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const displayBatteryPercent = batteryLevel !== null ? `${batteryLevel}%` : "100%";
    const batteryWidthPercent = batteryLevel !== null ? Math.max(8, batteryLevel) : 100;

    return (
        <div
            style={{
                height: 28,
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "0 14px",
                background: "#0b0b0f",
                fontSize: 13,
                color: "rgba(255,255,255,.92)",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
                userSelect: "none",
            }}
        >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,.9)" }} />
            <span style={{ fontWeight: 600 }}>Editor</span>
            {["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Window", "Help"].map((m) => (
                <span key={m}>{m}</span>
            ))}
            <div
                style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    color: "rgba(255,255,255,.88)",
                    fontSize: 12.5,
                }}
            >
                {/* Weather condition & local temperature */}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {weatherStr}
                </span>

                {/* Battery percentage */}
                <span>{displayBatteryPercent}</span>

                {/* Battery icon with charging bolt indicator */}
                <div
                    title={isCharging ? "Battery Charging" : "Battery"}
                    style={{
                        width: 24,
                        height: 12,
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,.55)",
                        padding: 1.5,
                        boxSizing: "border-box",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            width: `${batteryWidthPercent}%`,
                            height: "100%",
                            borderRadius: 1,
                            background: isCharging ? "#4cd964" : "rgba(255,255,255,.92)",
                            transition: "width 0.3s ease",
                        }}
                    />
                    {isCharging && (
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>
                            ⚡
                        </span>
                    )}
                </div>

                {/* Wi-Fi Icon */}
                <svg width="15" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                    <path d="M5 12.55a11 11 0 0 1 14 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
                </svg>

                {/* Search Icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Control Center Icon */}
                <svg width="14" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                    <path d="M4 6h16" />
                    <circle cx="8" cy="6" r="2" fill="#0b0b0f" />
                    <path d="M4 18h16" />
                    <circle cx="16" cy="18" r="2" fill="#0b0b0f" />
                </svg>

                {/* Realtime Date & Time from laptop clock */}
                <span style={{ fontWeight: 500 }}>{dateTimeStr || "Sat 1 Aug 6:46 PM"}</span>
            </div>
        </div>
    );
};

export default QuickDBTopMenuBar;
