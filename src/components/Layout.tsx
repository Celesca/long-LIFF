import React from 'react';
import BottomNavbar from './BottomNavbar';
import { useLiff } from '../hooks/useLiff';
import CoinCounter from './CoinCounter';
import AnimatedBackground from './AnimatedBackground';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  showCoinCounter?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  hideNavbar?: boolean;
  transparentHeader?: boolean;
  backgroundVariant?: 'default' | 'travel' | 'minimal' | 'gradient' | 'none' | 'thailand' | 'tinder';
  backgroundIntensity?: 'low' | 'medium' | 'high';
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = false,
  headerTitle,
  showBackButton = false,
  showCoinCounter = false,
  onBack,
  rightAction,
  hideNavbar = false,
  transparentHeader = false,
  backgroundVariant = 'default',
  backgroundIntensity = 'medium',
}) => {
  const { displayName, pictureUrl, isLoggedIn } = useLiff();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Animated Background */}
      {backgroundVariant !== 'none' && (
        <AnimatedBackground variant={backgroundVariant} intensity={backgroundIntensity} />
      )}
      {/* Header */}
      {showHeader && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${transparentHeader
              ? 'bg-transparent'
              : 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_2px_20px_rgba(0,0,0,0.04)]'
            }`}
        >
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            {/* Left Section */}
            <div className="flex items-center min-w-[80px]">
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-1 text-gray-600 hover:text-rose-500 transition-colors -ml-2 p-2 rounded-full hover:bg-rose-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : isLoggedIn && pictureUrl ? (
                <div className="flex items-center space-x-2">
                  <img
                    src={pictureUrl}
                    alt={displayName || 'User'}
                    className="w-9 h-9 rounded-full border-2 border-rose-200 shadow-sm"
                  />
                </div>
              ) : null}
            </div>

            {/* Center Section - Title */}
            <div className="flex-1 text-center">
              {headerTitle ? (
                <h1 className="text-lg font-bold text-gray-800 truncate">{headerTitle}</h1>
              ) : (
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent tracking-tight">
                    LONG
                  </span>
                  <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                    TH
                  </span>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end min-w-[80px]">
              {rightAction ? (
                rightAction
              ) : showCoinCounter ? (
                <CoinCounter />
              ) : null}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`${showHeader ? 'pt-14' : ''} ${!hideNavbar ? 'pb-20' : ''}`}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavbar && <BottomNavbar />}
    </div>
  );
};

export default Layout;
