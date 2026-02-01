import React from 'react';

interface AnimatedBackgroundProps {
    variant?: 'default' | 'travel' | 'minimal' | 'gradient' | 'thailand' | 'tinder';
}

// Optimized static background component - no animations for better performance
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    variant = 'default',
}) => {
    // Optimized Tinder-style background - static gradients only
    if (variant === 'tinder') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Static gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50" />
                
                {/* Static glassmorphism orbs */}
                <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-gradient-to-br from-rose-400/30 to-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] bg-gradient-to-br from-orange-300/25 to-amber-400/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-48 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-purple-400/20 to-fuchsia-400/15 rounded-full blur-3xl" />
            </div>
        );
    }

    // Thailand theme - static optimized version
    if (variant === 'thailand') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Static gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50/40 to-emerald-50/80" />
                
                {/* Static orbs */}
                <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-amber-300/30 to-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/4 -right-20 w-[350px] h-[350px] bg-gradient-to-br from-rose-300/25 to-pink-200/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] bg-gradient-to-br from-teal-300/20 to-emerald-200/15 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Clean gradient with subtle warmth */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-rose-50/30" />
                
                {/* Soft ambient orb */}
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-rose-100/40 to-transparent rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'gradient') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Rich gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100/80 via-rose-50 to-amber-50/60" />
                
                {/* Static gradient blobs */}
                <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-gradient-to-br from-violet-400/25 to-fuchsia-400/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/20 to-orange-300/15 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'travel') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Base gradient - tropical feel */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/90 via-white to-rose-50/70" />

                {/* Static gradient orbs */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-cyan-300/20 to-teal-300/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/15 to-orange-300/10 rounded-full blur-3xl" />
            </div>
        );
    }

    // Default variant - simple & clean
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            {/* Simple gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-violet-50" />

            {/* Static gradient blobs */}
            <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-gradient-to-br from-rose-300/25 to-pink-300/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] bg-gradient-to-br from-violet-300/20 to-purple-300/15 rounded-full blur-3xl" />
        </div>
    );
};

export default AnimatedBackground;
