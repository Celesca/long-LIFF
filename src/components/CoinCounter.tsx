import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CoinSystem } from '../utils/coinSystem';

interface CoinCounterProps {
  showAnimation?: boolean;
  onCoinEarned?: (amount: number) => void;
}

const CoinCounter: React.FC<CoinCounterProps> = ({ showAnimation = false, onCoinEarned }) => {
  const [coins, setCoins] = useState<number>(0);
  const [animatingCoins, setAnimatingCoins] = useState<number>(0);

  useEffect(() => {
    const updateCoins = () => {
      const profile = CoinSystem.getUserProfile();
      setCoins(profile.totalCoins);
    };

    updateCoins();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') updateCoins();
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCoinUpdate = (e: CustomEvent) => {
      updateCoins();
      if (showAnimation && e.detail.earned) {
        setAnimatingCoins(e.detail.earned);
        setTimeout(() => setAnimatingCoins(0), 2000);
        onCoinEarned?.(e.detail.earned);
      }
    };

    window.addEventListener('coinUpdate' as any, handleCoinUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coinUpdate' as any, handleCoinUpdate);
    };
  }, [showAnimation, onCoinEarned]);

  return (
    <Link
      to="/rewards"
      className="group flex items-center space-x-1.5 bg-[#FFC857] text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        {animatingCoins > 0 && (
          <div className="absolute -top-7 -right-2 bg-[#2FBF71] text-white text-[10px] px-1.5 py-0.5 rounded-md animate-bounce font-bold">
            +{animatingCoins}
          </div>
        )}
      </div>
      <span className="font-bold text-sm">{coins.toLocaleString()}</span>
    </Link>
  );
};

export default CoinCounter;
