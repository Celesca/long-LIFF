import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TinderCard from '../components/TinderCard';
import CityPreferenceModal from '../components/CityPreferenceModal';
import PlaceDetailModal from '../components/PlaceDetailModal';
import Layout from './Layout';
import { appApi } from '../services/apiAdapter';
import { getUserId } from '../hooks/useLiff';
import type { TravelPlace } from '../types/TravelPlace';

const TinderPage: React.FC = () => {
  const [places, setPlaces] = useState<TravelPlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const userId = getUserId();
  const navigate = useNavigate();

  const fetchPlaces = useCallback(async (cities: string[]) => {
    try {
      setLoading(true);
      setError(null);
      await appApi.createOrGetUser(userId || 'anonymous');
      const response = await appApi.getTinderPlaces(userId || 'anonymous', cities.length > 0 ? cities : undefined);
      setPlaces(response.places);
      setCurrentIndex(0);
      const likedResponse = await appApi.getLikedPlaces(userId || 'anonymous');
      setLikedPlaces(likedResponse.places);
    } catch (err) {
      console.error('Failed to fetch places:', err);
      setError('Could not load places. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const checkPreferencesAndLoad = async () => {
      try {
        const prefs = await appApi.getPreferences(userId || 'anonymous');
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

  const handleCitySelection = async (cities: string[]) => {
    setSelectedCities(cities);
    setShowCityModal(false);
    try {
      await appApi.updatePreferences(userId || 'anonymous', { selected_cities: cities });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
    fetchPlaces(cities);
  };

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const currentPlace = places[currentIndex];
    if (!currentPlace) return;
    try {
      await appApi.createSwipe(userId || 'anonymous', currentPlace.id, direction);
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
    if (direction === 'right') {
      setLikedPlaces(prev => [...prev, currentPlace]);
    }
    setCurrentIndex(prev => prev + 1);
  }, [places, currentIndex, userId]);

  const handleResetDestinations = async () => {
    try {
      setLoading(true);
      await appApi.resetAllProgress(userId || 'anonymous');
      await fetchPlaces(selectedCities);
    } catch (err) {
      console.error('Failed to reset destinations:', err);
      setError('Could not reset destinations. Please try again.');
      setLoading(false);
    }
  };

  const remainingPlaces = places.slice(currentIndex, currentIndex + 2);
  const isFinished = !loading && currentIndex >= places.length;

  // Loading state
  if (loading) {
    return (
      <Layout hideNavbar backgroundVariant="tinder">
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-3 border-[#E8E2DB] rounded-full" />
              <div className="absolute inset-0 border-3 border-transparent border-t-[#C2703E] rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-[#2D2926]">กำลังโหลด...</h2>
            <p className="text-[#9C9490] text-sm">กำลังค้นหาสถานที่ท่องเที่ยวสำหรับคุณ</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && places.length === 0) {
    return (
      <Layout showHeader showBackButton headerTitle="สำรวจ" backgroundVariant="tinder">
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-[#C75050]/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-[#C75050]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#2D2926]">มีบางอย่างผิดพลาด</h2>
            <p className="text-[#9C9490] text-sm">{error}</p>
            <button
              onClick={() => fetchPlaces(selectedCities)}
              className="mt-2 bg-[#C2703E] text-white py-2.5 px-6 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Finished state
  if (isFinished) {
    return (
      <Layout showHeader headerTitle="เสร็จสิ้น!" showCoinCounter backgroundVariant="tinder">
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-5 max-w-sm">
            <div className="w-20 h-20 mx-auto bg-[#C2703E] rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#2D2926]">คุณดูครบหมดแล้ว!</h2>
            <p className="text-[#6B635B] text-sm">
              {selectedCities.length > 0
                ? `สำรวจสถานที่ใน${selectedCities.join(' & ')}ครบแล้ว!`
                : 'สำรวจสถานที่ทั้งหมดครบแล้ว!'}
            </p>

            <div className="card-surface p-4">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-[#C2703E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span className="text-2xl font-bold text-[#C2703E]">{likedPlaces.length}</span>
              </div>
              <div className="text-sm text-[#9C9490] mt-1">สถานที่ที่บันทึก</div>
            </div>

            <div className="space-y-2.5 w-full">
              <button
                onClick={() => setShowCityModal(true)}
                className="flex items-center justify-center w-full bg-[#2D6A6A] text-white py-3 px-6 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                <svg className="w-4.5 h-4.5 mr-2" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                สำรวจเมืองอื่น
              </button>

              <button
                onClick={() => navigate('/gallery')}
                className="flex items-center justify-center w-full bg-[#C2703E] text-white py-3 px-6 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                <svg className="w-4.5 h-4.5 mr-2" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                ดูที่บันทึกของฉัน
              </button>

              <button
                onClick={handleResetDestinations}
                className="flex items-center justify-center w-full bg-white text-[#6B635B] py-3 px-6 rounded-xl font-semibold text-sm border border-[#E8E2DB] active:scale-95 transition-transform"
              >
                <svg className="w-4.5 h-4.5 mr-2" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.985 4.356v4.992" />
                </svg>
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
    <Layout hideNavbar backgroundVariant="tinder">
      <div className="min-h-screen flex flex-col pb-24">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-[#E8E2DB]/50 sticky top-0 z-30">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F0EB] active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 text-[#6B635B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* City Filter */}
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center space-x-1.5 bg-[#FDF5EF] hover:bg-[#F9E6D5] px-3.5 py-2 rounded-full transition-colors active:scale-95"
          >
            <svg className="w-3.5 h-3.5 text-[#C2703E]" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-[#C2703E] text-sm">
              {selectedCities.length === 0 ? 'ทุกเมือง' : selectedCities.length === 1 ? selectedCities[0] : `${selectedCities.length} เมือง`}
            </span>
            <svg className="w-3.5 h-3.5 text-[#C2703E]/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Gallery Link */}
          <Link
            to="/gallery"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F0EB] active:scale-95 transition-transform"
            aria-label="View saved places"
          >
            <svg className="w-5 h-5 text-[#C2703E]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            {likedPlaces.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#C2703E] text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">
                {likedPlaces.length > 9 ? '9+' : likedPlaces.length}
              </span>
            )}
          </Link>
        </div>

        {/* Progress */}
        <div className="px-4 py-2.5 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-1 bg-[#E8E2DB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C2703E] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((currentIndex + 1) / places.length) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#9C9490] whitespace-nowrap bg-[#F5F0EB] px-2 py-0.5 rounded-full">
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

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8E2DB]/50 safe-area-bottom">
          <div className="flex items-center justify-center space-x-5 py-4 px-6 max-w-lg mx-auto">
            {/* Skip */}
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 bg-white rounded-full shadow-md border border-[#E8E2DB] flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Skip"
            >
              <svg className="w-6 h-6 text-[#9C9490]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Info */}
            <button
              onClick={() => setShowDetailModal(true)}
              className="w-11 h-11 bg-[#2D6A6A] rounded-full shadow-md flex items-center justify-center active:scale-90 transition-transform"
              aria-label="More info"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>

            {/* Like */}
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 bg-[#C2703E] rounded-full shadow-md flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Like"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>

          <div className="text-center pb-2.5 -mt-1">
            <p className="text-[11px] text-[#9C9490]">ปัดซ้ายเพื่อข้าม · ปัดขวาเพื่อบันทึก</p>
          </div>
        </div>

        <CityPreferenceModal
          isOpen={showCityModal}
          onClose={() => setShowCityModal(false)}
          onConfirm={handleCitySelection}
          initialCities={selectedCities}
        />

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
