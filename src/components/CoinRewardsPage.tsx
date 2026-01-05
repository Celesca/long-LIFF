import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CoinSystem } from '../utils/coinSystem';
import Layout from './Layout';
import { rewards, type Reward } from '../data/seedData';

const categoryIcons: Record<string, string> = {
  discount: '🏷️',
  experience: '🎯',
  food: '🍜',
  souvenir: '🎁'
};

const categoryColors: Record<string, string> = {
  discount: 'from-blue-400 to-blue-600',
  experience: 'from-green-400 to-green-600',
  food: 'from-orange-400 to-orange-600',
  souvenir: 'from-pink-400 to-pink-600'
};

const CoinRewardsPage: React.FC = () => {
  const [userCoins, setUserCoins] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const profile = CoinSystem.getUserProfile();
    setUserCoins(profile.totalCoins);
  }, []);

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const handleRedeem = (reward: Reward) => {
    if (userCoins >= reward.coinCost) {
      // Deduct coins
      const profile = CoinSystem.getUserProfile();
      profile.totalCoins -= reward.coinCost;
      CoinSystem.saveUserProfile(profile);
      setUserCoins(profile.totalCoins);
      
      // Show success modal
      setRedeemedReward(reward);
      setShowModal(true);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Layout 
      showHeader 
      headerTitle="รางวัล"
      rightAction={
        <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-lg">🪙</span>
          <span className="font-bold text-white">{userCoins.toLocaleString()}</span>
        </div>
      }
    >
      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* How to Earn Coins - Compact */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-amber-100">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> วิธีสะสมเหรียญ
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '📸', coins: '+10', label: 'ถ่ายรูป' },
              { icon: '✅', coins: '+5', label: 'เยี่ยมชม' },
              { icon: '🏆', coins: '+100', label: 'ทริปสำเร็จ' },
              { icon: '⭐', coins: '+20', label: 'รีวิว' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-2 bg-amber-50 rounded-xl">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-semibold text-amber-700 text-xs">{item.coins}</div>
                <div className="text-[10px] text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter - Horizontal Scroll */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'food', 'experience', 'souvenir'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100'
              }`}
            >
              {category === 'all' ? '🎉 ทั้งหมด' : category === 'food' ? `${categoryIcons[category]} อาหาร` : category === 'experience' ? `${categoryIcons[category]} ประสบการณ์` : `${categoryIcons[category]} ของที่ระลึก`}
            </button>
          ))}
        </div>

        {/* Rewards List */}
        <div className="space-y-4">
          {filteredRewards.map((reward) => (
            <div 
              key={reward.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-36">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 left-3 bg-gradient-to-r ${categoryColors[reward.category]} text-white px-2 py-0.5 rounded-full text-xs font-medium`}>
                  {categoryIcons[reward.category]} {reward.category}
                </div>
                
                {/* Coin Cost Badge */}
                <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-md">
                  <span>🪙</span>
                  <span>{reward.coinCost}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{reward.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{reward.description}</p>
                
                <div className="flex items-center text-xs text-gray-400 mb-3">
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {reward.location}
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={userCoins < reward.coinCost}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    userCoins >= reward.coinCost
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {userCoins >= reward.coinCost ? '🎁 แลกเลย' : `ต้องการอีก ${reward.coinCost - userCoins} เหรียญ`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redemption Success Modal */}
      {showModal && redeemedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center animate-scale-in">
            <div className="text-6xl mb-4 animate-bounce-slow">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ยินดีด้วย!</h3>
            <p className="text-gray-600 mb-4">คุณได้แลก: {redeemedReward.name}</p>
            
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">รหัสส่วนลดของคุณ:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-lg text-orange-600 border-2 border-dashed border-orange-300">
                  {redeemedReward.discountCode}
                </code>
                <button
                  onClick={() => copyCode(redeemedReward.discountCode || '')}
                  className="p-2 bg-orange-500 text-white rounded-lg active:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">
              ใช้ได้ถึง: {redeemedReward.validUntil}<br/>
              สถานที่: {redeemedReward.location}
            </p>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all"
            >
              เยี่ยมมาก! 🙌
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CoinRewardsPage;
