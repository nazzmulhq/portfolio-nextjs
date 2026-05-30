"use client";

import { FC, ReactNode, useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "auto" | "down" | "left" | "none" | "right" | "up";
    scale?: boolean;
    blur?: boolean;
}

const TRANSLATE_MAP = {
    down: "translateY(-40px)",
    left: "translateX(40px)",
    none: "none",
    right: "translateX(-40px)",
    up: "translateY(40px)",
} as const;

const ScrollAnimate: FC<ScrollAnimateProps> = ({
    children,
    className = "",
    delay = 0,
    direction = "auto",
    scale = false,
    blur = false,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [animateDirection, setAnimateDirection] = useState<"down" | "left" | "none" | "right" | "up">("up");
    const scrollYRef = useRef(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        const el = ref.current;
        if (!el) {
            return;
        }

        const handleScroll = () => {
            const current = window.scrollY;
            scrollYRef.current = current;
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                const current = window.scrollY;
                const prev = scrollYRef.current;
                const isScrollingDown = current > prev;

                if (entry.isIntersecting) {
                    if (direction === "auto") {
                        setAnimateDirection(isScrollingDown ? "up" : "down");
                    } else {
                        setAnimateDirection(direction);
                    }
                    setVisible(true);
                } else {
                    // Smart exit: when leaving, move in the direction of scroll
                    if (direction === "none") {
                        setAnimateDirection("none");
                    } else if (direction === "left" || direction === "right") {
                        setAnimateDirection(direction); // keep horizontal exits the same
                    } else {
                        // Vertical exit
                        setAnimateDirection(isScrollingDown ? "down" : "up");
                    }
                    setVisible(false);
                }
                scrollYRef.current = current;
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.05,
            },
        );

        scrollYRef.current = window.scrollY;
        window.addEventListener("scroll", handleScroll, { passive: true });
        observer.observe(el);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, [direction]);

    // Use animateDirection for the hidden state so smart exit works
    const effectiveDirection = animateDirection;

    const getTransform = () => {
        if (visible) {
            return scale ? "translate(0) scale(1)" : "translate(0)";
        }
        const base = TRANSLATE_MAP[effectiveDirection];
        if (scale) {
            return base === "none" ? "scale(0.85)" : `${base} scale(0.85)`;
        }
        return base;
    };

    return (
        <div
            className={className.trim() || undefined}
            ref={ref}
            style={{
                filter: blur ? (visible ? "blur(0px)" : "blur(6px)") : undefined,
                opacity: visible ? 1 : 0,
                transform: getTransform(),
                transition: `opacity 0.6s ease-out, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)${blur ? ", filter 0.6s ease-out" : ""}`,
                transitionDelay: `${delay}ms`,
                willChange: visible ? "auto" : "transform, opacity",
            }}
        >
            {children}
        </div>
    );
};

export default ScrollAnimate;
