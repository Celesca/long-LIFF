import React from 'react';

interface AnimatedBackgroundProps {
    variant?: 'default' | 'travel' | 'minimal' | 'gradient' | 'thailand' | 'tinder' | 'none';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    variant = 'default',
}) => {
    if (variant === 'none') return null;

    if (variant === 'tinder') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#FAF7F4]" />
                <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-[#C2703E]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] bg-[#D4A853]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-48 right-1/4 w-[350px] h-[350px] bg-[#6B8F71]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'thailand') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#FAF7F4]" />
                <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-[#D4A853]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/4 -right-20 w-[350px] h-[350px] bg-[#C2703E]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] bg-[#6B8F71]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#FAF7F4]" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#C2703E]/4 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'gradient') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FDF5EF] via-[#FAF7F4] to-[#F0F5F1]" />
                <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-[#2D6A6A]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#C2703E]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'travel') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EFF6F6] via-[#FAF7F4] to-[#FDF5EF]" />
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#2D6A6A]/6 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C2703E]/5 rounded-full blur-3xl" />
            </div>
        );
    }

    // Default
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute inset-0 bg-[#FAF7F4]" />
            <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-[#C2703E]/6 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] bg-[#6B8F71]/5 rounded-full blur-3xl" />
        </div>
    );
};

export default AnimatedBackground;
