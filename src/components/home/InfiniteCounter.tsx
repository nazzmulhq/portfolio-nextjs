"use client";

import { useEffect, useState } from "react";

interface InfiniteCounterProps {
    direction: "up" | "down";
    speed?: number; // ms per tick
}

export default function InfiniteCounter({
    direction,
    speed = 100,
}: InfiniteCounterProps) {
    const [count, setCount] = useState(direction === "up" ? 0 : 99);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => {
                if (direction === "up") {
                    return prev >= 99 ? 0 : prev + 1;
                } 
                    return prev <= 0 ? 99 : prev - 1;
                
            });
        }, speed);

        return () => clearInterval(interval);
    }, [direction, speed]);

    // Ensure it always displays at least 2 digits (e.g., 00, 09, 10, 99)
    const formattedCount = count.toString().padStart(2, "0");

    return <span>{formattedCount}</span>;
}
