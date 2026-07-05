import React, { useState, useEffect } from 'react';
import { CoinSystem } from '../utils/coinSystem';
import Layout from './Layout';
import { rewards, type Reward } from '../data/seedData';

const categoryLabels: Record<string, string> = {
  all: 'ทั้งหมด',
  food: 'อาหาร',
  experience: 'ประสบการณ์',
  souvenir: 'ของที่ระลึก',
};

const categoryColors: Record<string, string> = {
  food: 'bg-[#C2703E]',
  experience: 'bg-[#6B8F71]',
  souvenir: 'bg-[#2D6A6A]',
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
      const profile = CoinSystem.getUserProfile();
      profile.totalCoins -= reward.coinCost;
      CoinSystem.saveUserProfile(profile);
      setUserCoins(profile.totalCoins);
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
      backgroundVariant="thailand"
      rightAction={
        <div className="flex items-center space-x-1.5 bg-[#D4A853] px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
          <span className="font-bold text-white text-sm">{userCoins.toLocaleString()}</span>
        </div>
      }
    >
      <div className="mx-auto max-w-lg px-4 py-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {/* How to Earn */}
        <div className="card-surface mb-4 p-4 lg:p-5">
          <h2 className="text-sm font-bold text-[#2D2926] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#D4A853]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
            </svg>
            วิธีสะสมเหรียญ
          </h2>
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            {[
              { icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z', coins: '+10', label: 'ถ่ายรูป' },
              { icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', coins: '+5', label: 'เยี่ยมชม' },
              { icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0', coins: '+100', label: 'ทริปสำเร็จ' },
              { icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z', coins: '+20', label: 'รีวิว' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-2 bg-[#F5E6C4]/30 rounded-xl">
                <div className="w-8 h-8 mx-auto mb-1 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#D4A853]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="font-semibold text-[#B08B3A] text-xs">{item.coins}</div>
                <div className="text-[10px] text-[#9C9490]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3.5 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === key
                  ? 'bg-[#D4A853] text-white shadow-sm'
                  : 'bg-white text-[#6B635B] border border-[#E8E2DB]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Rewards List */}
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {filteredRewards.map((reward) => (
            <div key={reward.id} className="card-surface overflow-hidden">
              <div className="relative h-32 lg:h-44">
                <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                <div className={`absolute top-2.5 left-2.5 ${categoryColors[reward.category] || 'bg-[#6B635B]'} text-white px-2 py-0.5 rounded-md text-[11px] font-medium`}>
                  {categoryLabels[reward.category] || reward.category}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-[#D4A853] text-white px-2 py-0.5 rounded-md text-sm font-bold flex items-center gap-1 shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                  {reward.coinCost}
                </div>
              </div>

              <div className="p-3.5">
                <h3 className="font-bold text-[#2D2926] text-sm mb-0.5">{reward.name}</h3>
                <p className="text-[#9C9490] text-sm mb-2.5 line-clamp-2">{reward.description}</p>

                <div className="flex items-center text-[11px] text-[#9C9490] mb-3">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  {reward.location}
                </div>

                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={userCoins < reward.coinCost}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    userCoins >= reward.coinCost
                      ? 'bg-[#D4A853] text-white shadow-sm'
                      : 'bg-[#F5F0EB] text-[#9C9490] cursor-not-allowed'
                  }`}
                >
                  {userCoins >= reward.coinCost ? 'แลกเลย' : `ต้องการอีก ${reward.coinCost - userCoins} เหรียญ`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redemption Modal */}
      {showModal && redeemedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto bg-[#4D8B5C] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#2D2926] mb-1">ยินดีด้วย!</h3>
            <p className="text-[#6B635B] text-sm mb-4">คุณได้แลก: {redeemedReward.name}</p>

            <div className="bg-[#F5E6C4]/40 rounded-xl p-4 mb-4">
              <p className="text-xs text-[#6B635B] mb-2">รหัสส่วนลดของคุณ:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-white px-4 py-2 rounded-lg font-mono font-bold text-base text-[#C2703E] border-2 border-dashed border-[#D4A853]">
                  {redeemedReward.discountCode}
                </code>
                <button
                  onClick={() => copyCode(redeemedReward.discountCode || '')}
                  className="p-2 bg-[#C2703E] text-white rounded-lg active:bg-[#A85C2F] transition-colors"
                  aria-label="Copy code"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#9C9490] mb-4">
              ใช้ได้ถึง: {redeemedReward.validUntil}<br />
              สถานที่: {redeemedReward.location}
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#2D6A6A] text-white py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              เยี่ยมมาก!
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CoinRewardsPage;
