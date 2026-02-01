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
    
    // Listen for storage changes to update coins in real time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        updateCoins();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
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
      className="group flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <span className="text-base group-hover:animate-bounce">🪙</span>
        
        {animatingCoins > 0 && (
          <div className="absolute -top-8 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full animate-bounce font-bold">
            +{animatingCoins}
          </div>
        )}
      </div>
      
      <span className="font-bold text-sm drop-shadow-sm">
        {coins.toLocaleString()}
      </span>
    </Link>
  );
};

export default CoinCounter;
