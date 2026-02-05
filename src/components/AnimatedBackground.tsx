"use client";

export default function AnimatedBackground() {
    // Generate particle positions for floating effect
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        animationDelay: Math.random() * 20,
        animationDuration: Math.random() * 10 + 20,
    }));

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Animated gradient background */}
            <div className="animated-gradient absolute inset-0" />

            {/* Floating particles */}
            <div className="particles-container absolute inset-0">
                {particles.map(particle => (
                    <div
                        className="particle"
                        key={particle.id}
                        style={{
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            left: `${particle.left}%`,
                            animationDelay: `${particle.animationDelay}s`,
                            animationDuration: `${particle.animationDuration}s`,
                        }}
                    />
                ))}
            </div>

            {/* Grid overlay */}
            <div className="bg-grid absolute inset-0 opacity-30" />
        </div>
    );
}
