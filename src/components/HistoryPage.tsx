import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { CoinSystem, type ActiveJourney } from '../utils/coinSystem';

const HistoryPage: React.FC = () => {
  const [journeyHistory, setJourneyHistory] = useState<ActiveJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<ActiveJourney | null>(null);

  useEffect(() => {
    const history = CoinSystem.getJourneyHistory();
    setJourneyHistory(history);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJourneyStats = (journey: ActiveJourney) => {
    const visited = journey.places.filter(p => p.visited).length;
    const totalCoins = journey.places.reduce((sum, p) => sum + (p.coinsEarned || 0), 0);
    const totalPhotos = journey.places.reduce((sum, p) => sum + (p.userPhotos?.length || 0), 0);
    return { visited, totalCoins, totalPhotos };
  };

  const clearHistory = () => {
    if (confirm('คุณแน่ใจหรือว่าต้องการล้างประวัติทริปทั้งหมด?')) {
      CoinSystem.clearJourneyHistory();
      setJourneyHistory([]);
    }
  };

  return (
    <Layout showHeader showCoinCounter backgroundVariant="thailand">
      <div className="mx-auto max-w-2xl px-4 py-5 lg:max-w-6xl lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-[#2D2926]">ประวัติทริป</h1>
            <p className="text-[#9C9490] text-sm">การเดินทางที่ผ่านมาของคุณ</p>
          </div>
          {journeyHistory.length > 0 && (
            <button onClick={clearHistory} className="text-sm text-[#C75050] font-medium">
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Empty State */}
        {journeyHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-[#FDF5EF] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#C2703E]/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#2D2926] mb-2">ยังไม่มีทริป</h2>
            <p className="text-[#9C9490] text-sm mb-5">เริ่มการเดินทางครั้งแรกแล้วจะแสดงที่นี่</p>
            <Link
              to="/tinder"
              className="inline-flex items-center px-5 py-2.5 bg-[#C2703E] text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              สำรวจสถานที่
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {journeyHistory.map((journey) => {
              const stats = getJourneyStats(journey);
              return (
                <div
                  key={journey.id}
                  onClick={() => setSelectedJourney(journey)}
                  className="card-surface p-4 cursor-pointer card-surface-hover"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4.5 h-4.5 text-[#C2703E]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <h3 className="font-bold text-[#2D2926] text-sm">
                          {journey.city === 'all' ? 'ทริปหลายเมือง' : journey.city}
                        </h3>
                      </div>
                      <p className="text-xs text-[#9C9490] mt-0.5 ml-6.5">{journey.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#9C9490]">{formatDate(journey.startDate)}</p>
                      {stats.visited === journey.places.length && (
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-[#4D8B5C]/10 text-[#4D8B5C] text-[11px] font-medium rounded-md">
                          <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                          สำเร็จ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-[#C2703E]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-xs">{stats.visited}/{journey.places.length}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#D4A853]">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                      </svg>
                      <span className="text-xs">{stats.totalCoins}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#4A7C9B]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      </svg>
                      <span className="text-xs">{stats.totalPhotos}</span>
                    </div>
                  </div>

                  {/* Place Previews */}
                  <div className="mt-3 flex -space-x-1.5">
                    {journey.places.slice(0, 4).map((place) => (
                      <div key={place.id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-[#F5F0EB]">
                        {place.image ? (
                          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#9C9490]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {journey.places.length > 4 && (
                      <div className="w-9 h-9 rounded-full border-2 border-white bg-[#FDF5EF] flex items-center justify-center text-[11px] font-bold text-[#C2703E]">
                        +{journey.places.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Journey Detail Modal */}
        {selectedJourney && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-[#E8E2DB] flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-[#2D2926]">
                    {selectedJourney.city === 'all' ? 'ทริปหลายเมือง' : selectedJourney.city}
                  </h2>
                  <p className="text-xs text-[#9C9490]">{formatDate(selectedJourney.startDate)}</p>
                </div>
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center text-[#6B635B]"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-[#FDF5EF] rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#C2703E]">
                      {selectedJourney.places.filter(p => p.visited).length}
                    </p>
                    <p className="text-[11px] text-[#9C9490]">สถานที่เยี่ยมชม</p>
                  </div>
                  <div className="bg-[#F5E6C4]/30 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#D4A853]">
                      {selectedJourney.places.reduce((sum, p) => sum + (p.coinsEarned || 0), 0)}
                    </p>
                    <p className="text-[11px] text-[#9C9490]">เหรียญที่ได้</p>
                  </div>
                  <div className="bg-[#EFF6F6] rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-[#4A7C9B]">
                      {selectedJourney.places.reduce((sum, p) => sum + (p.userPhotos?.length || 0), 0)}
                    </p>
                    <p className="text-[11px] text-[#9C9490]">รูปถ่าย</p>
                  </div>
                </div>

                <h3 className="font-semibold text-[#2D2926] text-sm mb-3">สถานที่ที่เยี่ยมชม</h3>
                <div className="space-y-2">
                  {selectedJourney.places.map((place, index) => (
                    <div
                      key={place.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl ${
                        place.visited ? 'bg-[#4D8B5C]/5' : 'bg-[#F5F0EB]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        place.visited ? 'bg-[#4D8B5C] text-white' : 'bg-[#E8E2DB] text-[#6B635B]'
                      }`}>
                        {place.visited ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                          </svg>
                        ) : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2D2926] text-sm truncate">{place.name}</p>
                        <div className="flex items-center space-x-2 text-[11px] text-[#9C9490]">
                          {place.visited && place.visitDate && (
                            <span>{new Date(place.visitDate).toLocaleDateString('th-TH')}</span>
                          )}
                          {place.coinsEarned > 0 && (
                            <span className="text-[#D4A853]">+{place.coinsEarned}</span>
                          )}
                        </div>
                      </div>
                      {place.userPhotos && place.userPhotos.length > 0 && (
                        <div className="flex -space-x-1">
                          {place.userPhotos.slice(0, 3).map((photo, idx) => (
                            <img key={idx} src={photo} alt="" className="w-7 h-7 rounded-lg object-cover border border-white" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-[#E8E2DB]">
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="w-full bg-[#2D6A6A] text-white py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-20" />
      </div>
    </Layout>
  );
};

export default HistoryPage;
