import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { useLiff } from '../hooks/useLiff';
import CoinCounter from './CoinCounter';
import AnimatedBackground from './AnimatedBackground';
import { useIsDesktop } from '../hooks/useViewport';

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
  const location = useLocation();
  const isDesktop = useIsDesktop();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const navItems = [
    {
      path: '/',
      label: 'หน้าแรก',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
      ),
    },
    {
      path: '/tinder',
      label: 'สำรวจ',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
      ),
    },
    {
      path: '/gallery',
      label: 'ที่บันทึก',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      ),
    },
    {
      path: '/routing',
      label: 'วางแผนทริป',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      ),
    },
    {
      path: '/rewards',
      label: 'รางวัล',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
      ),
    },
    {
      path: '/history',
      label: 'ประวัติ',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    {
      path: '/about',
      label: 'เกี่ยวกับเรา',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen relative overflow-hidden lg:overflow-auto">
      {/* Animated Background */}
      {backgroundVariant !== 'none' && (
        <AnimatedBackground variant={backgroundVariant} />
      )}

      {isDesktop && !hideNavbar && (
        <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-72 border-r border-[#E8E2DB]/70 bg-white/88 px-4 py-5 shadow-[8px_0_28px_rgba(45,41,38,0.05)] backdrop-blur-xl lg:flex lg:flex-col">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C2703E] text-white shadow-sm">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#2D2926]">LONG</span>
                <span className="rounded bg-[#C2703E] px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white">TH</span>
              </div>
              <p className="text-xs font-medium text-[#9C9490]">Travel discovery workspace</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#FDF5EF] text-[#C2703E]'
                      : 'text-[#6B635B] hover:bg-[#F5F0EB] hover:text-[#2D2926]'
                  }`}
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isLoggedIn && (
            <div className="mt-5 rounded-2xl border border-[#E8E2DB] bg-[#FDF9F5] p-3">
              <div className="flex items-center gap-3">
                {pictureUrl ? (
                  <img src={pictureUrl} alt={displayName || 'User'} className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C2703E] text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#2D2926]">{displayName || 'นักเดินทาง'}</p>
                  <p className="text-xs font-medium text-[#9C9490]">LINE profile connected</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Header */}
      {showHeader && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 lg:left-72 ${
            transparentHeader
              ? 'bg-transparent'
              : 'bg-white/85 backdrop-blur-xl border-b border-[#E8E2DB]/50 shadow-[0_1px_8px_rgba(45,41,38,0.03)]'
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4 lg:h-16 lg:px-8">
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
                <h1 className="truncate text-base font-semibold text-[#2D2926] lg:text-left lg:text-lg">{headerTitle}</h1>
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
      <main className={`${showHeader ? 'pt-14 lg:pt-16' : ''} ${!hideNavbar ? 'pb-20 lg:pb-0' : ''} ${!hideNavbar ? 'lg:pl-72' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNavbar && !isDesktop && <BottomNavbar />}
    </div>
  );
};

export default Layout;
