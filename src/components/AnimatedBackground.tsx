import React, { useMemo } from 'react';

interface AnimatedBackgroundProps {
    variant?: 'default' | 'travel' | 'minimal' | 'gradient';
    intensity?: 'low' | 'medium' | 'high';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    variant = 'default',
    intensity = 'medium'
}) => {
    // Generate random particles based on intensity
    const particleCount = useMemo(() => {
        switch (intensity) {
            case 'low': return 8;
            case 'medium': return 15;
            case 'high': return 25;
            default: return 15;
        }
    }, [intensity]);

    const particles = useMemo(() => {
        return Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            size: Math.random() * 6 + 4,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 15,
            opacity: Math.random() * 0.3 + 0.1,
        }));
    }, [particleCount]);

    // Travel-themed floating elements
    const travelIcons = ['✈️', '🏖️', '🗺️', '🌴', '⛰️', '🏰', '🌺', '🐚'];

    if (variant === 'minimal') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/30" />

                {/* Minimal floating dots */}
                {particles.slice(0, 6).map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-purple-400/20 animate-float-slow"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.left}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>
        );
    }

    if (variant === 'gradient') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Animated gradient blobs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/50 via-transparent to-transparent" />
            </div>
        );
    }

    if (variant === 'travel') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/60" />

                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-300/20 to-cyan-300/20 rounded-full blur-3xl animate-morph" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl animate-morph animation-delay-3000" />

                {/* Floating travel icons */}
                {travelIcons.slice(0, intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3).map((icon, index) => (
                    <div
                        key={index}
                        className="absolute text-2xl opacity-20 animate-travel-float"
                        style={{
                            left: `${10 + index * 12}%`,
                            top: `${20 + (index % 3) * 25}%`,
                            animationDelay: `${index * 2}s`,
                            animationDuration: `${20 + index * 3}s`,
                        }}
                    >
                        {icon}
                    </div>
                ))}

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, #6366f1 1px, transparent 1px),
              linear-gradient(to bottom, #6366f1 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Floating particles */}
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full animate-float-particle"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.left}%`,
                            bottom: '-20px',
                            background: `linear-gradient(135deg, rgba(147, 197, 253, ${p.opacity}) 0%, rgba(196, 181, 253, ${p.opacity}) 100%)`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>
        );
    }

    // Default variant
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50/50" />

            {/* Animated gradient blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-blob" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-blue-300/25 to-cyan-300/25 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-gradient-to-br from-violet-300/25 to-indigo-300/25 rounded-full blur-3xl animate-blob animation-delay-4000" />

            {/* Glowing orbs */}
            <div className="absolute top-20 left-10 w-3 h-3 bg-purple-400/60 rounded-full animate-glow-pulse" />
            <div className="absolute top-40 right-20 w-2 h-2 bg-pink-400/60 rounded-full animate-glow-pulse animation-delay-1000" />
            <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-cyan-400/50 rounded-full animate-glow-pulse animation-delay-2000" />

            {/* Floating particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-float-up"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.left}%`,
                        bottom: '-10px',
                        background: `linear-gradient(135deg, rgba(139, 92, 246, ${p.opacity}) 0%, rgba(236, 72, 153, ${p.opacity}) 100%)`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}

            {/* Sparkle effects */}
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-sparkle" />
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full animate-sparkle animation-delay-500" />
            <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-sparkle animation-delay-1000" />

            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
