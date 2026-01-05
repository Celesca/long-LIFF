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
    <Layout showHeader showCoinCounter>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ประวัติทริป</h1>
            <p className="text-gray-500 text-sm">การเดินทางที่ผ่านมาของคุณ</p>
          </div>
          {journeyHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-red-500 text-sm font-medium hover:text-red-600"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Empty State */}
        {journeyHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-5xl">🗺️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีทริป</h2>
            <p className="text-gray-500 mb-6">เริ่มการเดินทางครั้งแรกแล้วจะแสดงที่นี่!</p>
            <Link
              to="/tinder"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              สำรวจสถานที่
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Journey List */
          <div className="space-y-4">
            {journeyHistory.map((journey, index) => {
              const stats = getJourneyStats(journey);
              return (
                <div
                  key={journey.id}
                  onClick={() => setSelectedJourney(journey)}
                  className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {journey.city === 'Bangkok' ? '🏙️' : journey.city === 'Chiang Mai' ? '🌄' : journey.city === 'Phuket' ? '🏖️' : '🗺️'}
                        </span>
                        <h3 className="font-bold text-gray-800">
                          {journey.city === 'all' ? 'ทริปหลายเมือง' : journey.city}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">{journey.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {formatDate(journey.startDate)}
                      </p>
                      {stats.visited === journey.places.length && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          สำเร็จแล้ว ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-purple-600">
                      <span>📍</span>
                      <span>{stats.visited}/{journey.places.length} สถานที่</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-600">
                      <span>🪙</span>
                      <span>{stats.totalCoins} เหรียญ</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <span>📸</span>
                      <span>{stats.totalPhotos} รูป</span>
                    </div>
                  </div>

                  {/* Place Preview */}
                  <div className="mt-3 flex -space-x-2">
                    {journey.places.slice(0, 4).map((place, idx) => (
                      <div
                        key={place.id}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                      >
                        {place.image ? (
                          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    ))}
                    {journey.places.length > 4 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
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
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    {selectedJourney.city === 'all' ? 'ทริปหลายเมือง' : selectedJourney.city}
                  </h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedJourney.startDate)}</p>
                </div>
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {/* Trip Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedJourney.places.filter(p => p.visited).length}
                    </p>
                    <p className="text-xs text-gray-500">สถานที่เยี่ยมชม</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {selectedJourney.places.reduce((sum, p) => sum + (p.coinsEarned || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">เหรียญที่ได้</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedJourney.places.reduce((sum, p) => sum + (p.userPhotos?.length || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">รูปถ่าย</p>
                  </div>
                </div>

                {/* Places List */}
                <h3 className="font-semibold text-gray-700 mb-3">สถานที่ที่เยี่ยมชม</h3>
                <div className="space-y-3">
                  {selectedJourney.places.map((place, index) => (
                    <div 
                      key={place.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl ${
                        place.visited ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        place.visited ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {place.visited ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{place.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {place.visited && place.visitDate && (
                            <span>{new Date(place.visitDate).toLocaleDateString()}</span>
                          )}
                          {place.coinsEarned > 0 && (
                            <span className="text-amber-600">+{place.coinsEarned} 🪙</span>
                          )}
                        </div>
                      </div>
                      {place.userPhotos && place.userPhotos.length > 0 && (
                        <div className="flex -space-x-1">
                          {place.userPhotos.slice(0, 3).map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-white"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white px-5 py-4 border-t">
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacing for navbar */}
        <div className="h-20" />
      </div>
    </Layout>
  );
};

export default HistoryPage;
