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
                <div className="absolute inset-0 bg-[#F6FBFF]" />
                <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-[#FF6B4A]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] bg-[#FFC857]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-48 right-1/4 w-[350px] h-[350px] bg-[#00A896]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'thailand') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#F6FBFF]" />
                <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-[#FFC857]/8 rounded-full blur-3xl" />
                <div className="absolute top-1/4 -right-20 w-[350px] h-[350px] bg-[#FF6B4A]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] bg-[#00A896]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-[#F6FBFF]" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#FF6B4A]/4 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'gradient') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4EC] via-[#F6FBFF] to-[#E9FBF7]" />
                <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-[#0077B6]/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[#FF6B4A]/6 rounded-full blur-3xl" />
            </div>
        );
    }

    if (variant === 'travel') {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EAF7FF] via-[#F6FBFF] to-[#FFF4EC]" />
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#0077B6]/6 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6B4A]/5 rounded-full blur-3xl" />
            </div>
        );
    }

    // Default
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute inset-0 bg-[#F6FBFF]" />
            <div className="absolute -top-20 -right-20 w-[350px] h-[350px] bg-[#FF6B4A]/6 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] bg-[#00A896]/5 rounded-full blur-3xl" />
        </div>
    );
};

export default AnimatedBackground;
