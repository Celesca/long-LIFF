import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { TravelPlace } from '../types/TravelPlace';
import PersonalityModal from './PersonalityModal';
import PlaceDetailModal from './PlaceDetailModal';
import Layout from './Layout';
import { getUserStorageKey, getUserId } from '../hooks/useLiff';
import { mockApi } from '../services/mockApi';

const GalleryPage: React.FC = () => {
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const userId = getUserId();

  useEffect(() => {
    const fetchLikedPlaces = async () => {
      try {
        const response = await mockApi.getLikedPlaces(userId || 'anonymous');
        setLikedPlaces(response.places);
      } catch (err) {
        console.error('Failed to fetch liked places:', err);
        // Fallback to localStorage
        const storageKey = getUserStorageKey('likedPlaces');
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setLikedPlaces(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPlaces();
  }, [userId]);

  const clearGallery = async () => {
    setLikedPlaces([]);

    try {
      // Clear both liked places AND swipes so user can explore again
      await mockApi.resetAllProgress(userId || 'anonymous');
    } catch (err) {
      console.error('Failed to clear liked places:', err);
    }
  };

  const removePlace = async (placeId: string) => {
    const updated = likedPlaces.filter(place => place.id !== placeId);
    setLikedPlaces(updated);

    try {
      await mockApi.removeLikedPlace(userId || 'anonymous', placeId);
    } catch (err) {
      console.error('Failed to remove liked place:', err);
    }
  };

  const handleTravelPlan = (personality: string, duration: string, city: string) => {
    navigate('/routing', {
      state: { personality, duration, city }
    });
  };

  if (loading) {
    return (
      <Layout showHeader headerTitle="ที่บันทึก" showCoinCounter backgroundVariant="minimal">
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <h2 className="text-lg font-semibold text-gray-700">กำลังโหลดที่บันทึกของคุณ...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      showHeader
      headerTitle="ที่บันทึก"
      showCoinCounter
      rightAction={
        likedPlaces.length > 0 ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full font-medium text-sm shadow-sm active:scale-95 transition-transform"
          >
            วางแผนทริป
          </button>
        ) : null
      }
      backgroundVariant="minimal"
    >
      <div className="px-4 py-4 max-w-lg mx-auto">
        {likedPlaces.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              ยังไม่มีสถานที่ที่บันทึก
            </h2>

            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
              เริ่มสำรวจเพื่อสร้างคอลเลคชันการท่องเที่ยวในฝันของคุณ!
            </p>

            <Link
              to="/tinder"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
            >
              <span className="mr-2">🗺️</span>
              เริ่มสำรวจ
            </Link>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-purple-600">{likedPlaces.length}</span> สถานที่ที่บันทึก
              </p>
              <button
                onClick={clearGallery}
                className="text-sm text-red-500 font-medium active:scale-95 transition-transform"
              >
                ล้างทั้งหมด
              </button>
            </div>

            {/* Gallery grid */}
            <div className="space-y-4">
              {likedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 active:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedPlace(place); setShowDetailModal(true); }}
                >
                  <div className="relative">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-40 object-cover"
                    />

                    {/* Remove button */}
                    <button
                      onClick={() => removePlace(place.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center active:bg-black/70 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Rating badge */}
                    {place.rating && (
                      <div className="absolute bottom-3 left-3 flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm">
                        <span className="mr-1">⭐</span>
                        <span className="font-semibold">{place.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800 flex-1 mr-2">
                        {place.name}
                      </h3>
                      {place.country && (
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                          {place.country}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {place.description}
                    </p>

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {place.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => {
                        window.open(`https://www.google.com/maps?q=${place.lat},${place.long}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl active:bg-gray-200 transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ดูบนแผนที่
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan trip CTA at bottom */}
            <div className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">พร้อมเดินทางหรือยัง?</h4>
                  <p className="text-white/80 text-sm">สร้างแผนการเดินทางของคุณ</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold text-sm shadow-md active:scale-95 transition-transform"
                >
                  วางแผนทริป
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Personality Modal */}
      <PersonalityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleTravelPlan}
      />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </Layout>
  );
};

export default GalleryPage;
