import React from 'react';
import BottomNavbar from './BottomNavbar';
import { useLiff } from '../hooks/useLiff';
import CoinCounter from './CoinCounter';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      {showHeader && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            transparentHeader
              ? 'bg-transparent'
              : 'bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            {/* Left Section */}
            <div className="flex items-center min-w-[80px]">
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors -ml-2 p-2"
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
                    className="w-8 h-8 rounded-full border-2 border-purple-200"
                  />
                </div>
              ) : null}
            </div>

            {/* Center Section - Title */}
            <div className="flex-1 text-center">
              {headerTitle ? (
                <h1 className="text-lg font-bold text-gray-800 truncate">{headerTitle}</h1>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    LONG
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
