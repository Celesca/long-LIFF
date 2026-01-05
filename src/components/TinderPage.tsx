import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TinderCard from '../components/TinderCard';
import CityPreferenceModal from '../components/CityPreferenceModal';
import PlaceDetailModal from '../components/PlaceDetailModal';
import Layout from './Layout';
import { mockApi } from '../services/mockApi';
import { getUserId, getUserStorageKey } from '../hooks/useLiff';
import type { TravelPlace } from '../types/TravelPlace';

const TinderPage: React.FC = () => {
  const [places, setPlaces] = useState<TravelPlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const userId = getUserId();
  const navigate = useNavigate();

  // Fetch places using mock API
  const fetchPlaces = useCallback(async (cities: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Initialize user
      await mockApi.createOrGetUser(userId || 'anonymous');

      // Fetch tinder places (excludes already swiped)
      const response = await mockApi.getTinderPlaces(userId || 'anonymous', cities.length > 0 ? cities : undefined);
      setPlaces(response.places);
      setCurrentIndex(0);

      // Fetch liked places
      const likedResponse = await mockApi.getLikedPlaces(userId || 'anonymous');
      setLikedPlaces(likedResponse.places);

    } catch (err) {
      console.error('Failed to fetch places:', err);
      setError('Could not load places. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load - check if user has city preferences
  useEffect(() => {
    const checkPreferencesAndLoad = async () => {
      try {
        const prefs = await mockApi.getPreferences(userId || 'anonymous');
        if (prefs.selected_cities && prefs.selected_cities.length > 0) {
          setSelectedCities(prefs.selected_cities);
          fetchPlaces(prefs.selected_cities);
        } else {
          setShowCityModal(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
        setShowCityModal(true);
        setLoading(false);
      }
    };

    checkPreferencesAndLoad();
  }, [userId, fetchPlaces]);

  // Handle city selection
  const handleCitySelection = async (cities: string[]) => {
    setSelectedCities(cities);
    setShowCityModal(false);

    try {
      await mockApi.updatePreferences(userId || 'anonymous', { selected_cities: cities });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }

    fetchPlaces(cities);
  };

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const currentPlace = places[currentIndex];
    if (!currentPlace) return;

    // Record swipe using mock API
    try {
      await mockApi.createSwipe(userId || 'anonymous', currentPlace.id, direction);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }

    if (direction === 'right') {
      setLikedPlaces(prev => {
        const updated = [...prev, currentPlace];
        return updated;
      });
    }

    setCurrentIndex(prev => prev + 1);
  }, [places, currentIndex, userId]);

  const handleButtonAction = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const remainingPlaces = places.slice(currentIndex, currentIndex + 2);
  const isFinished = currentIndex >= places.length;

  // Loading state
  if (loading) {
    return (
      <Layout hideNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">กำลังโหลด...</h2>
            <p className="text-gray-500">กำลังค้นหาสถานที่ท่องเที่ยวสุดพิเศษสำหรับคุณ</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state with retry
  if (error && places.length === 0) {
    return (
      <Layout showHeader showBackButton headerTitle="สำรวจ">
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">มีบางอย่างผิดพลาด</h2>
            <p className="text-gray-500">{error}</p>
            <div className="space-y-3 pt-4">
              <button
                onClick={() => fetchPlaces(selectedCities)}
                className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle reset destinations
  const handleResetDestinations = async () => {
    try {
      setLoading(true);
      await mockApi.resetAllProgress(userId || 'anonymous');
      // Refetch places to start fresh
      await fetchPlaces(selectedCities);
    } catch (err) {
      console.error('Failed to reset destinations:', err);
      setError('Could not reset destinations. Please try again.');
      setLoading(false);
    }
  };

  // Finished state
  if (isFinished) {
    return (
      <Layout showHeader headerTitle="เสร็จสิ้น!" showCoinCounter>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg animate-bounce-slow">
              <span className="text-4xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              คุณดูครบหมดแล้ว!
            </h2>

            <p className="text-gray-600">
              {selectedCities.length > 0
                ? `สำรวจสถานที่ใน${selectedCities.join(' & ')}ครบแล้ว!`
                : 'สำรวจสถานที่ทั้งหมดครบแล้ว!'}
            </p>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">❤️</span>
                <span className="text-3xl font-bold text-purple-600">{likedPlaces.length}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">สถานที่ที่บันทึก</div>
            </div>

            <div className="space-y-3 w-full">
              <button
                onClick={() => setShowCityModal(true)}
                className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
              >
                <span className="mr-2">🌍</span>
                สำรวจเมืองอื่น
              </button>

              <button
                onClick={() => navigate('/gallery')}
                className="flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
              >
                <span className="mr-2">📸</span>
                ดูที่บันทึกของฉัน
              </button>

              <button
                onClick={handleResetDestinations}
                className="flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
              >
                <span className="mr-2">🔄</span>
                รีเซ็ต & ปัดใหม่
              </button>
            </div>
          </div>
        </div>

        <CityPreferenceModal
          isOpen={showCityModal}
          onClose={() => setShowCityModal(false)}
          onConfirm={handleCitySelection}
          initialCities={selectedCities}
        />
      </Layout>
    );
  }

  return (
    <Layout hideNavbar>
      <div className="min-h-screen flex flex-col pb-24">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-30">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* City Filter Chip */}
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full transition-colors active:scale-95"
          >
            <span className="text-sm">📍</span>
            <span className="font-medium text-purple-700 text-sm">
              {selectedCities.length === 0
                ? 'ทุกเมือง'
                : selectedCities.length === 1
                  ? selectedCities[0]
                  : `${selectedCities.length} เมือง`}
            </span>
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Gallery Link with Badge */}
          <Link
            to="/gallery"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likedPlaces.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {likedPlaces.length > 9 ? '9+' : likedPlaces.length}
              </span>
            )}
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 py-3 bg-white/50">
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentIndex + 1) / places.length) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              {currentIndex + 1}/{places.length}
            </span>
          </div>
        </div>

        {/* Cards Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 min-h-0">
          <div className="relative w-full max-w-xs sm:max-w-sm h-[60vh] max-h-[450px]">
            {remainingPlaces.map((place, index) => (
              <TinderCard
                key={place.id}
                place={place}
                onSwipe={handleSwipe}
                isTop={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
          <div className="flex items-center justify-center space-x-4 py-4 px-6 max-w-lg mx-auto">
            {/* Skip Button */}
            <button
              onClick={() => handleButtonAction('left')}
              className={`relative w-14 h-14 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center active:scale-90 transition-all duration-200 ${swipeAnimation === 'left' ? 'scale-110 border-red-400 bg-red-50' : ''
                }`}
            >
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* More Info Button */}
            <button
              onClick={() => setShowDetailModal(true)}
              className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Like Button */}
            <button
              onClick={() => handleButtonAction('right')}
              className={`relative w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200 ${swipeAnimation === 'right' ? 'scale-110 shadow-xl shadow-pink-200' : ''
                }`}
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* Helper text */}
          <div className="text-center pb-3 -mt-2">
            <p className="text-xs text-gray-400">ปัดซ้าย ❌ | ℹ️ ข้อมูล | ปัดขวา ❤️</p>
          </div>
        </div>

        {/* City Preference Modal */}
        <CityPreferenceModal
          isOpen={showCityModal}
          onClose={() => setShowCityModal(false)}
          onConfirm={handleCitySelection}
          initialCities={selectedCities}
        />

        {/* Place Detail Modal */}
        <PlaceDetailModal
          place={remainingPlaces[0] || null}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      </div>
    </Layout>
  );
};

export default TinderPage;
