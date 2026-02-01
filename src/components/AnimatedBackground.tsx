import React, { useMemo } from 'react';

interface AnimatedBackgroundProps {
    variant?: 'default' | 'travel' | 'minimal' | 'gradient' | 'thailand' | 'tinder';
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

    // Thailand-themed floating elements
    const thailandIcons = ['🌴', '🏝️', '🐘', '🌺', '🛕', '🍜', '🌸', '🧘'];

    // Modern Tinder-style background
    if (variant === 'tinder') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Animated vibrant gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 animate-gradient-shift" />
                
                {/* Large animated mesh gradient */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-400/25 via-transparent to-purple-400/20 animate-aurora" />
                </div>
                
                {/* Prominent glassmorphism orbs */}
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-rose-400/45 to-pink-500/35 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-orange-300/40 to-amber-400/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-48 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-purple-400/35 to-fuchsia-400/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-pink-300/30 to-rose-300/25 rounded-full blur-3xl animate-morph" />
                
                {/* Animated gradient waves */}
                <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-rose-200/40 via-transparent to-transparent animate-breathe" />
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-pink-200/30 via-transparent to-transparent animate-breathe animation-delay-1000" />
                
                {/* Glowing orbs */}
                <div className="absolute top-24 right-16 w-4 h-4 bg-rose-500 rounded-full animate-glow-pulse shadow-xl shadow-rose-500/60" />
                <div className="absolute top-1/3 left-12 w-3 h-3 bg-pink-500 rounded-full animate-glow-pulse animation-delay-1000 shadow-xl shadow-pink-500/60" />
                <div className="absolute bottom-1/3 right-24 w-5 h-5 bg-orange-400 rounded-full animate-glow-pulse animation-delay-2000 shadow-xl shadow-orange-400/60" />
                <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-glow-pulse animation-delay-3000 shadow-xl shadow-purple-400/60" />
                
                {/* Animated line accents */}
                <div className="absolute inset-0 opacity-[0.05]">
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-wave" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-wave animation-delay-1000" />
                    <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-wave animation-delay-2000" />
                </div>
                
                {/* Floating hearts and sparkles - more visible */}
                {particles.map((p, i) => (
                    <div
                        key={p.id}
                        className="absolute animate-float-particle drop-shadow-lg"
                        style={{
                            left: `${p.left}%`,
                            bottom: '-20px',
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            fontSize: `${12 + Math.random() * 10}px`,
                            opacity: 0.2 + Math.random() * 0.2,
                        }}
                    >
                        {i % 4 === 0 ? '💕' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '💫' : '🌟'}
                    </div>
                ))}
                
                {/* Extra sparkle effects */}
                <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-white rounded-full animate-sparkle shadow-lg shadow-white/50" />
                <div className="absolute top-[35%] right-[25%] w-1.5 h-1.5 bg-rose-300 rounded-full animate-sparkle animation-delay-500" />
                <div className="absolute top-[55%] left-[30%] w-2 h-2 bg-pink-300 rounded-full animate-sparkle animation-delay-1000" />
                <div className="absolute top-[75%] right-[35%] w-1.5 h-1.5 bg-orange-300 rounded-full animate-sparkle animation-delay-2000" />
                
                {/* Noise texture for depth */}
                <div className="absolute inset-0 bg-noise opacity-[0.02]" />
            </div>
        );
    }

    // Thailand travel theme - tropical & vibrant
    if (variant === 'thailand') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Animated gradient base with color shift */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-rose-50/40 to-emerald-50/80 animate-gradient-shift" />
                
                {/* Large animated orbs - more prominent */}
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-amber-300/40 to-orange-200/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/35 to-pink-200/25 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-teal-300/30 to-emerald-200/25 rounded-full blur-3xl animate-blob animation-delay-4000" />
                
                {/* Moving gradient waves */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-amber-100/50 via-transparent to-transparent animate-breathe" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-100/40 via-transparent to-transparent animate-breathe animation-delay-2000" />
                
                {/* Floating orbs with glow */}
                <div className="absolute top-20 right-20 w-4 h-4 bg-amber-400 rounded-full animate-glow-pulse shadow-lg shadow-amber-400/50" />
                <div className="absolute top-1/2 left-16 w-3 h-3 bg-rose-400 rounded-full animate-glow-pulse animation-delay-1000 shadow-lg shadow-rose-400/50" />
                <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-teal-400 rounded-full animate-glow-pulse animation-delay-2000 shadow-lg shadow-teal-400/50" />
                
                {/* Floating Thailand icons - more visible */}
                {thailandIcons.map((icon, index) => (
                    <div
                        key={index}
                        className="absolute animate-travel-float drop-shadow-lg"
                        style={{
                            left: `${5 + index * 12}%`,
                            top: `${10 + (index % 4) * 22}%`,
                            animationDelay: `${index * 1.2}s`,
                            animationDuration: `${12 + index * 2}s`,
                            fontSize: '1.8rem',
                            opacity: 0.25,
                        }}
                    >
                        {icon}
                    </div>
                ))}
                
                {/* Animated geometric pattern overlay */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%23d97706' stroke-width='0.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px',
                    }}
                />
                
                {/* More floating particles */}
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full animate-float-particle"
                        style={{
                            width: p.size + 2,
                            height: p.size + 2,
                            left: `${p.left}%`,
                            bottom: '-20px',
                            background: `linear-gradient(135deg, rgba(251, 191, 36, ${p.opacity + 0.1}) 0%, rgba(245, 158, 11, ${p.opacity + 0.1}) 100%)`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            boxShadow: `0 0 ${p.size}px rgba(251, 191, 36, 0.3)`,
                        }}
                    />
                ))}
                
                {/* Sparkle effects - more prominent */}
                <div className="absolute top-[15%] left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-sparkle shadow-lg shadow-amber-400/50" />
                <div className="absolute top-[40%] right-1/4 w-1.5 h-1.5 bg-rose-400 rounded-full animate-sparkle animation-delay-500 shadow-lg shadow-rose-400/50" />
                <div className="absolute top-[65%] left-1/3 w-1.5 h-1.5 bg-teal-400 rounded-full animate-sparkle animation-delay-1000 shadow-lg shadow-teal-400/50" />
                <div className="absolute top-[85%] right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-sparkle animation-delay-2000 shadow-lg shadow-pink-400/50" />
                
                {/* Subtle noise */}
                <div className="absolute inset-0 bg-noise opacity-[0.02]" />
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Clean gradient with subtle warmth */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-rose-50/30" />
                
                {/* Soft ambient orb */}
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-rose-100/40 to-transparent rounded-full blur-3xl animate-breathe" />
                
                {/* Minimal floating dots */}
                {particles.slice(0, 6).map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-gradient-to-br from-rose-300/20 to-pink-300/20 animate-float-slow"
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
                {/* Rich gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100/80 via-rose-50 to-amber-50/60" />
                
                {/* Animated gradient blobs */}
                <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-gradient-to-br from-violet-400/35 to-fuchsia-400/25 rounded-full blur-3xl animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/30 to-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-amber-300/25 to-yellow-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/40 via-transparent to-transparent" />
                
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>
        );
    }

    if (variant === 'travel') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Base gradient - tropical feel */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/90 via-white to-rose-50/70" />

                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-300/25 to-teal-300/20 rounded-full blur-3xl animate-morph" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/20 to-orange-300/15 rounded-full blur-3xl animate-morph animation-delay-3000" />
                <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-violet-300/20 to-purple-300/15 rounded-full blur-3xl animate-blob animation-delay-2000" />

                {/* Floating Thailand icons */}
                {thailandIcons.slice(0, intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 3).map((icon, index) => (
                    <div
                        key={index}
                        className="absolute animate-travel-float"
                        style={{
                            left: `${10 + index * 12}%`,
                            top: `${20 + (index % 3) * 25}%`,
                            animationDelay: `${index * 2}s`,
                            animationDuration: `${20 + index * 3}s`,
                            fontSize: '1.5rem',
                            opacity: 0.15,
                        }}
                    >
                        {icon}
                    </div>
                ))}

                {/* Wave pattern at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#waveGrad)" d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" className="animate-wave" />
                    </svg>
                </div>

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
                            background: `linear-gradient(135deg, rgba(34, 211, 238, ${p.opacity}) 0%, rgba(45, 212, 191, ${p.opacity}) 100%)`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
                
                {/* Subtle noise */}
                <div className="absolute inset-0 bg-noise opacity-[0.01]" />
            </div>
        );
    }

    // Default variant - modern & vibrant
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-violet-50" />

            {/* Animated gradient blobs */}
            <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-gradient-to-br from-rose-300/35 to-pink-300/25 rounded-full blur-3xl animate-blob" />
            <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] bg-gradient-to-br from-violet-300/30 to-purple-300/25 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] bg-gradient-to-br from-amber-300/25 to-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

            {/* Glowing orbs */}
            <div className="absolute top-20 left-10 w-3 h-3 bg-rose-400/60 rounded-full animate-glow-pulse" />
            <div className="absolute top-40 right-20 w-2 h-2 bg-violet-400/60 rounded-full animate-glow-pulse animation-delay-1000" />
            <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-amber-400/50 rounded-full animate-glow-pulse animation-delay-2000" />

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
                        background: `linear-gradient(135deg, rgba(244, 63, 94, ${p.opacity}) 0%, rgba(168, 85, 247, ${p.opacity}) 100%)`,
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
            <div className="absolute inset-0 bg-noise opacity-[0.015]" />
        </div>
    );
};

export default AnimatedBackground;
