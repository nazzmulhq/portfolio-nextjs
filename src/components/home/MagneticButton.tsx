"use client";

import React, { useRef, useState } from "react";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit" | "reset";
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
    children,
    className = "",
    onClick,
    href,
    target,
    rel,
    type = "button",
}) => {
    const btnRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = (e.clientX - centerX) * 0.35;
        const distanceY = (e.clientY - centerY) * 0.35;

        setPosition({ x: distanceX, y: distanceY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const content = (
        <div
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                transition: position.x === 0 ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
            }}
            className="inline-block"
        >
            {href ? (
                <a href={href} target={target} rel={rel} className={className}>
                    {children}
                </a>
            ) : (
                <button type={type} onClick={onClick} className={className}>
                    {children}
                </button>
            )}
        </div>
    );

    return content;
};

export default MagneticButton;
