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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      {backgroundVariant !== 'none' && (
        <AnimatedBackground variant={backgroundVariant} />
      )}

      {/* Header */}
      {showHeader && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
            transparentHeader
              ? 'bg-transparent'
              : 'bg-white/85 backdrop-blur-xl border-b border-[#E8E2DB]/50 shadow-[0_1px_8px_rgba(45,41,38,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            {/* Left Section */}
            <div className="flex items-center min-w-[72px]">
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center w-10 h-10 -ml-1 rounded-full text-[#6B635B] hover:text-[#C2703E] hover:bg-[#FDF5EF] transition-colors"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              ) : isLoggedIn && pictureUrl ? (
                <img
                  src={pictureUrl}
                  alt={displayName || 'User'}
                  className="w-9 h-9 rounded-full border-2 border-[#E8E2DB] shadow-sm object-cover"
                />
              ) : null}
            </div>

            {/* Center Section - Brand or Title */}
            <div className="flex-1 text-center">
              {headerTitle ? (
                <h1 className="text-base font-semibold text-[#2D2926] truncate">{headerTitle}</h1>
              ) : (
                <div className="flex items-center justify-center space-x-1.5">
                  <svg className="w-5 h-5 text-[#C2703E]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-lg font-bold text-[#2D2926] tracking-tight">
                    LONG
                  </span>
                  <span className="text-[10px] bg-[#C2703E] text-white px-1.5 py-0.5 rounded font-semibold tracking-wider">
                    TH
                  </span>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end min-w-[72px]">
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
      <main className={`${showHeader ? 'pt-14' : ''} ${!hideNavbar ? 'pb-20' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavbar && <BottomNavbar />}
    </div>
  );
};

export default Layout;
