// tailwind.config.js
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                background: "var(--color-background)",
                text: "var(--color-text)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            screens: {
                xs: "480px", // Extra small devices
                sm: "640px", // Small devices
                md: "768px", // Medium devices
                lg: "1024px", // Large devices
                xl: "1280px", // Extra large devices
                "2xl": "1400px", // 2x Extra large devices
                "3xl": "1600px", // 3x Extra large devices
                "4xl": "1920px", // 4x Extra large devices
                "5xl": "2200px", // 5x Extra large devices
                "6xl": "2400px", // 6x Extra large devices
            },
        },
    },
    plugins: [],
};
