"use client";
import { useRef } from "react";

const CustomRangeSlider = ({
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    disabled = false,
}) => {
    const sliderRef = useRef(null);

    const calculateValue = clientX => {
        if (!sliderRef.current) return value;

        const rect = sliderRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left; // Mouse position relative to slider
        const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1); // Clamp between 0 and 1
        const newValue =
            Math.round((min + percentage * (max - min)) / step) * step; // Snap to step
        return newValue;
    };

    const handleMouseMove = e => {
        if (disabled) return;
        const newValue = calculateValue(e.clientX);
        onChange(newValue); // Call the onChange handler with the new value
    };

    const handleMouseDown = e => {
        if (disabled) return;

        const newValue = calculateValue(e.clientX);
        onChange(newValue);

        // Attach event listeners for dragging
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
        // Remove event listeners after drag
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    return (
        <div style={{ width: "120px", paddingRight: 20 }}>
            {/* Slider Container */}
            <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                style={{
                    position: "relative",
                    height: "3px",
                    background: disabled ? "#999" : "#ccc",
                    borderRadius: "5px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                {/* Filled Track */}
                <div
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: `${((value - min) / (max - min)) * 100}%`,
                        background: disabled ? "#666" : "blue",
                        borderRadius: "5px",
                    }}
                />
                {/* Slider Thumb */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: `${((value - min) / (max - min)) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        width: "12px",
                        height: "12px",
                        background: disabled ? "#666" : "blue",
                        borderRadius: "50%",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                />
            </div>
        </div>
    );
};

export default CustomRangeSlider;
