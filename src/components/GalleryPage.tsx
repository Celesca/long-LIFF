import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { TravelPlace } from '../types/TravelPlace';
import PersonalityModal from './PersonalityModal';
import PlaceDetailModal from './PlaceDetailModal';
import Layout from './Layout';
import { getUserId } from '../hooks/useLiff';
import { poiApi } from '../services/poiApi';
import { mockApi } from '../services/mockApi';
import { USE_MOCK_DATA } from '../services/dataMode';

const GalleryPage: React.FC = () => {
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const userId = getUserId() || 'anonymous';

  useEffect(() => {
    const fetchLikedPlaces = async () => {
      try {
        const response = USE_MOCK_DATA
          ? await mockApi.getLikedPlaces(userId)
          : await (async () => {
              await poiApi.createOrGetUser({ line_user_id: userId });
              return poiApi.getLikedPlaces(userId);
            })();
        setLikedPlaces(response.places);
      } catch (err) {
        console.error('Failed to fetch liked places:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedPlaces();
  }, [userId]);

  const clearGallery = async () => {
    setLikedPlaces([]);
    try {
      if (USE_MOCK_DATA) {
        await mockApi.clearLikedPlaces(userId);
      } else {
        await poiApi.clearLikedPlaces(userId);
      }
    } catch (err) {
      console.error('Failed to clear liked places:', err);
    }
  };

  const removePlace = async (e: React.MouseEvent, placeId: string) => {
    e.stopPropagation();
    const updated = likedPlaces.filter(place => place.id !== placeId);
    setLikedPlaces(updated);
    try {
      if (USE_MOCK_DATA) {
        await mockApi.removeLikedPlace(userId, placeId);
      } else {
        await poiApi.removeLikedPlace(userId, placeId);
      }
    } catch (err) {
      console.error('Failed to remove liked place:', err);
    }
  };

  const handleTravelPlan = (personality: string, duration: string, anchor?: { lat: number; lng: number; radius_km: number; label?: string } | null) => {
    navigate('/routing', { state: { personality, duration, anchor } });
  };

  if (loading) {
    return (
      <Layout showHeader headerTitle="ที่บันทึก" showCoinCounter backgroundVariant="tinder">
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto border-3 border-[#DDEAF3] border-t-[#FF6B4A] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#4F6F87]">กำลังโหลด...</p>
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
            className="bg-[#FF6B4A] text-white px-3.5 py-1.5 rounded-lg font-medium text-sm active:scale-95 transition-transform"
          >
            วางแผนทริป
          </button>
        ) : null
      }
      backgroundVariant="tinder"
    >
      <div className="mx-auto max-w-lg px-4 py-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {likedPlaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-[#FFF4EC] rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#FF6B4A]/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#17324D] mb-2">ยังไม่มีสถานที่ที่บันทึก</h2>
            <p className="text-[#8AA0B3] text-sm mb-5 max-w-xs mx-auto">
              เริ่มสำรวจเพื่อสร้างคอลเลคชันการท่องเที่ยวในฝันของคุณ
            </p>
            <Link
              to="/tinder"
              className="inline-flex items-center bg-[#FF6B4A] text-white py-2.5 px-5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              <svg className="w-4.5 h-4.5 mr-2" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              เริ่มสำรวจ
            </Link>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDEAF3]">
              <p className="text-sm text-[#4F6F87]">
                <span className="font-bold text-[#FF6B4A]">{likedPlaces.length}</span> สถานที่ที่บันทึก
              </p>
              <button
                onClick={clearGallery}
                className="text-sm text-[#EF476F] font-medium active:scale-95 transition-transform"
              >
                ล้างทั้งหมด
              </button>
            </div>

            {/* Gallery list */}
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
              {likedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="card-surface overflow-hidden card-surface-hover cursor-pointer"
                  onClick={() => { setSelectedPlace(place); setShowDetailModal(true); }}
                >
                  <div className="relative">
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="h-36 w-full object-cover lg:h-44" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-[#0077B6] via-[#00A896] to-[#FF6B4A] text-white lg:h-44">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317.159.69.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                        </svg>
                      </div>
                    )}
                    <button
                      onClick={(e) => removePlace(e, place.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center active:bg-black/60 transition-colors"
                      aria-label="Remove place"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {place.rating && (
                      <div className="absolute bottom-2.5 left-2.5 flex items-center bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-sm">
                        <svg className="w-3.5 h-3.5 text-[#FFC857] mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                        </svg>
                        <span className="font-semibold text-[#17324D]">{place.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-base font-bold text-[#17324D] flex-1 mr-2">{place.name}</h3>
                      {place.country && (
                        <span className="bg-[#FFF4EC] text-[#FF6B4A] px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
                          {place.country}
                        </span>
                      )}
                    </div>
                    <p className="text-[#8AA0B3] text-sm line-clamp-2 mb-2.5">{place.description}</p>

                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {place.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-[#EDF6FB] text-[#4F6F87] px-2 py-0.5 rounded text-[11px] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps?q=${place.lat},${place.long}`, '_blank');
                      }}
                      className="flex items-center justify-center w-full bg-[#EDF6FB] text-[#4F6F87] py-2 px-4 rounded-lg active:bg-[#DDEAF3] transition-colors font-medium text-sm"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      ดูบนแผนที่
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan trip CTA */}
            <div className="mt-5 bg-[#0077B6] rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">พร้อมเดินทางหรือยัง?</h4>
                  <p className="text-white/65 text-sm">สร้างแผนการเดินทางของคุณ</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-[#0077B6] px-4 py-2 rounded-lg font-semibold text-sm active:scale-95 transition-transform"
                >
                  วางแผนทริป
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <PersonalityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleTravelPlan}
      />

      <PlaceDetailModal
        place={selectedPlace}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </Layout>
  );
};

export default GalleryPage;
