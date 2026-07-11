import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoinSystem, type ActiveJourney, type JourneyPlace } from '../utils/coinSystem';
import CoinCounter from './CoinCounter';
import Layout from './Layout';
import { useIsDesktop } from '../hooks/useViewport';
import MapLibreView, { type MapPoint } from './MapLibreView';

const TravelCompanion: React.FC = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [journey, setJourney] = useState<ActiveJourney | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'places' | 'map'>('places');
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<JourneyPlace | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [tripSummary, setTripSummary] = useState<{ totalCoins: number; totalPhotos: number; placesVisited: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeJourney = CoinSystem.getActiveJourney();
    if (!activeJourney) {
      navigate('/');
      return;
    }
    setJourney(activeJourney);
    setCurrentIndex(activeJourney.currentPlaceIndex);
  }, [navigate]);

  // Scroll carousel to current index
  useEffect(() => {
    if (carouselRef.current && journey) {
      const cardWidth = 280 + 16; // card width + gap
      carouselRef.current.scrollTo({
        left: currentIndex * cardWidth - 40,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, journey]);

  const handlePlaceSelect = (index: number) => {
    setCurrentIndex(index);
    CoinSystem.setCurrentPlaceIndex(index);
  };

  const openPhotoUpload = (place: JourneyPlace) => {
    setSelectedPlace(place);
    setUploadedPhotos([]);
    setShowPhotoModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    const promises = Array.from(files).slice(0, 3 - uploadedPhotos.length).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(photos => {
      setUploadedPhotos(prev => [...prev, ...photos]);
      setIsUploading(false);
    });
  };

  const handleConfirmVisit = () => {
    if (!selectedPlace || !journey || uploadedPhotos.length === 0) return;

    // Calculate coins earned from photos
    const photoCoins = uploadedPhotos.length * 10; // 10 coins per photo
    
    // Update the active journey with visit info
    const updatedJourney = CoinSystem.updateActiveJourneyPlace(selectedPlace.id, {
      visited: true,
      visitDate: new Date().toISOString(),
      userPhotos: uploadedPhotos,
      coinsEarned: photoCoins
    });

    // Add coins to user profile
    CoinSystem.addCoinsToProfile(photoCoins);

    // Trigger coin animation
    window.dispatchEvent(new CustomEvent('coinUpdate', { detail: { earned: photoCoins } }));

    // Refresh journey state
    setJourney(updatedJourney);
    
    setShowPhotoModal(false);
    setSelectedPlace(null);
    setUploadedPhotos([]);

    // Check if all places are now visited
    if (updatedJourney && updatedJourney.places.every(p => p.visited)) {
      // Calculate trip summary
      const totalCoins = updatedJourney.places.reduce((sum, p) => sum + (p.coinsEarned || 0), 0);
      const totalPhotos = updatedJourney.places.reduce((sum, p) => sum + (p.userPhotos?.length || 0), 0);
      const completionBonus = 100; // Journey completion bonus
      
      // Add completion bonus
      CoinSystem.addCoinsToProfile(completionBonus);
      window.dispatchEvent(new CustomEvent('coinUpdate', { detail: { earned: completionBonus } }));
      
      setTripSummary({
        totalCoins: totalCoins + completionBonus,
        totalPhotos,
        placesVisited: updatedJourney.places.length
      });
      setShowCompletionModal(true);
    }
  };

  const handleFinishTrip = () => {
    // Save journey to history and end it
    CoinSystem.endActiveJourney();
    setShowCompletionModal(false);
    navigate('/');
  };

  const handleEndJourney = () => {
    if (confirm('คุณแน่ใจหรือว่าต้องการจบการเดินทางนี้? ความคืบหน้าของคุณจะถูกบันทึก')) {
      CoinSystem.endActiveJourney();
      navigate('/');
    }
  };

  const getProgress = () => {
    if (!journey) return { visited: 0, total: 0, percentage: 0 };
    const visited = journey.places.filter(p => p.visited).length;
    return {
      visited,
      total: journey.places.length,
      percentage: Math.round((visited / journey.places.length) * 100)
    };
  };

  if (!journey) {
    return (
      <div className="min-h-screen bg-[#F6FBFF] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF6B4A] border-t-transparent rounded-full" />
      </div>
    );
  }

  const progress = getProgress();
  const currentPlace = journey.places[currentIndex];
  const mapCenter: [number, number] = currentPlace 
    ? [currentPlace.lat, currentPlace.long] 
    : [13.7563, 100.5018];
  const mapPoints: MapPoint[] = journey.places.map((place, index) => ({
    id: place.id,
    lat: place.lat,
    lng: place.long,
    label: place.name,
    subtitle: place.visited ? 'เยี่ยมแล้ว' : `จุดที่ ${index + 1}`,
    markerText: place.visited ? '✓' : `${index + 1}`,
    variant: place.visited ? 'success' : index === currentIndex ? 'primary' : 'muted',
    size: index === currentIndex ? 'lg' : 'md',
    onClick: () => handlePlaceSelect(index),
  }));

  return (
    <Layout hideNavbar={!isDesktop} backgroundVariant="none">
    <div className="min-h-screen bg-[#F6FBFF] flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white/85 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-[#DDEAF3]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EDF6FB] active:bg-[#DDEAF3]"
            >
              <svg className="w-5 h-5 text-[#17324D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center flex-1 mx-3">
              <h1 className="font-bold text-[#17324D] text-sm">
                {journey.city === 'all' ? 'ทริปหลายเมือง' : journey.city}
              </h1>
              <p className="text-xs text-[#8AA0B3]">{journey.duration}</p>
            </div>

            <CoinCounter showAnimation={true} />
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#4F6F87] mb-1">
              <span>{progress.visited} จาก {progress.total} สถานที่</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-[#DDEAF3] rounded-full h-2">
              <div
                className="bg-[#2FBF71] rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-t border-[#DDEAF3]">
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'places'
                ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] bg-[#FFF4EC]'
                : 'text-[#8AA0B3]'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>สถานที่</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'map'
                ? 'text-[#FF6B4A] border-b-2 border-[#FF6B4A] bg-[#FFF4EC]'
                : 'text-[#8AA0B3]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            <span>แผนที่</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'places' ? (
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Current Place Card */}
            {currentPlace && (
              <div className="p-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#DDEAF3]">
                  {/* Place Image */}
                  <div className="relative h-48">
                    <img
                      src={currentPlace.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={currentPlace.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                      currentPlace.visited
                        ? 'bg-[#2FBF71] text-white'
                        : 'bg-[#FF6B4A] text-white'
                    }`}>
                      {currentPlace.visited ? '✓ เยี่ยมแล้ว' : `จุดที่ ${currentIndex + 1}`}
                    </div>

                    {/* Place Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-white font-bold text-xl mb-1">{currentPlace.name}</h2>
                      <div className="flex items-center space-x-3 text-white/90 text-sm">
                        {currentPlace.rating && (
                          <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            <span>{currentPlace.rating}</span>
                          </span>
                        )}
                        {currentPlace.city && (
                          <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            <span>{currentPlace.city}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Place Details */}
                  <div className="p-4">
                    {currentPlace.description && (
                      <p className="text-[#4F6F87] text-sm mb-4">{currentPlace.description}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!currentPlace.visited ? (
                        <button
                          onClick={() => openPhotoUpload(currentPlace)}
                          className="w-full bg-[#FF6B4A] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center space-x-2"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span>เช็คอินด้วยภาพถ่าย</span>
                        </button>
                      ) : (
                        <div className="w-full bg-[#2FBF71]/10 text-[#2FBF71] py-4 rounded-xl font-bold text-center flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>คุณได้รับ {currentPlace.coinsEarned} เหรียญ!</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentPlace.lat},${currentPlace.long}`, '_blank');
                        }}
                        className="w-full bg-[#0077B6] text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
                        <span>นำทางด้วย Google Maps</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal Place Carousel */}
            <div className="flex-1 bg-[#EDF6FB] pt-2 pb-4">
              <p className="px-4 text-sm font-semibold text-[#17324D] mb-2">จุดหมายปลายทางทั้งหมด</p>
              <div
                ref={carouselRef}
                className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {journey.places.map((place, index) => (
                  <div
                    key={place.id}
                    onClick={() => handlePlaceSelect(index)}
                    className={`flex-shrink-0 w-[280px] snap-center bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all border border-[#DDEAF3] ${
                      index === currentIndex ? 'ring-2 ring-[#FF6B4A] scale-[1.02]' : ''
                    }`}
                  >
                    <div className="relative h-28">
                      <img
                        src={place.image || 'https://via.placeholder.com/300x150'}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        place.visited ? 'bg-[#2FBF71]' : 'bg-[#FF6B4A]'
                      }`}>
                        {place.visited ? '✓' : index + 1}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-[#17324D] text-sm truncate">{place.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[#8AA0B3]">{place.city}</span>
                        {place.visited && (
                          <span className="text-xs text-[#2FBF71] font-medium flex items-center space-x-0.5">
                            <span>+{place.coinsEarned}</span>
                            <svg className="w-3 h-3 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"/></svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Map View */
          <div className="h-full w-full absolute inset-0">
            <MapLibreView
              center={mapCenter}
              zoom={14}
              points={mapPoints}
              route={journey.places.map(p => [p.lat, p.long] as [number, number])}
              className="absolute inset-0"
            />

            {/* Floating Current Place Card */}
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-4 border border-[#DDEAF3]">
                <img
                  src={currentPlace?.image || 'https://via.placeholder.com/80'}
                  alt={currentPlace?.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#17324D] truncate">{currentPlace?.name}</p>
                  <p className="text-sm text-[#8AA0B3]">จุดที่ {currentIndex + 1} จาก {journey.places.length}</p>
                </div>
                {!currentPlace?.visited ? (
                  <button
                    onClick={() => currentPlace && openPhotoUpload(currentPlace)}
                    className="bg-[#FF6B4A] text-white px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span>เช็คอิน</span>
                  </button>
                ) : (
                  <div className="bg-[#2FBF71]/10 text-[#2FBF71] px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0">
                    ✓ เสร็จแล้ว
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-[#DDEAF3] px-4 py-3 flex items-center justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => handlePlaceSelect(currentIndex - 1)}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#EDF6FB] active:bg-[#DDEAF3]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-[#17324D]">ก่อนหน้า</span>
        </button>

        <button
          onClick={handleEndJourney}
          className="text-[#EF476F] font-medium text-sm px-3 py-2"
        >
          จบทริป
        </button>

        <button
          disabled={currentIndex === journey.places.length - 1}
          onClick={() => handlePlaceSelect(currentIndex + 1)}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#FFF4EC] text-[#FF6B4A] active:bg-[#FFE2D6]"
        >
          <span className="font-medium">ถัดไป</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && selectedPlace && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white p-4 border-b border-[#DDEAF3] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#17324D]">เช็คอินที่ {selectedPlace.name}</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-[#EDF6FB] flex items-center justify-center text-[#4F6F87]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-4">
              <p className="text-[#4F6F87] mb-4">
                ถ่ายหรืออัปโหลดภาพเพื่อยืนยันว่าคุณมาเยี่ยมสถานที่นี้แล้วและรับเหรียญ!
              </p>

              {/* Photo Preview Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#EF476F] text-white rounded-full text-xs flex items-center justify-center"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}

                {uploadedPhotos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square border-2 border-dashed border-[#BFD4E3] rounded-xl flex flex-col items-center justify-center text-[#8AA0B3] hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors"
                  >
                    {isUploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span className="text-xs mt-1">เพิ่มรูป</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Coin Reward Info */}
              <div className="bg-[#FFC857]/10 rounded-xl p-3 mb-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FFC857]/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-[#8A6A00]">รับ {uploadedPhotos.length * 10} เหรียญ!</p>
                  <p className="text-xs text-[#A37900]">10 เหรียญต่อภาพที่อัปโหลด</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirmVisit}
                  disabled={uploadedPhotos.length === 0}
                  className="w-full bg-[#2FBF71] text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยืนยันการเยี่ยมชม & รับเหรียญ
                </button>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="w-full bg-[#EDF6FB] text-[#4F6F87] py-3 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>

      {/* Completion Modal */}
      {showCompletionModal && tripSummary && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  width: '10px',
                  height: '10px',
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  backgroundColor: ['#FFC857', '#FF6B4A', '#2FBF71', '#0077B6', '#00A896', '#8EDFE3'][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-bounce-in">
            {/* Header */}
            <div className="bg-[#FFC857] p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">ยินดีด้วย!</h2>
              <p className="text-white/90 mt-1">คุณทำทริปเสร็จสมบูรณ์แล้ว!</p>
            </div>

            {/* Trip Summary */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-[#8AA0B3] text-sm">ทริปของคุณไป</p>
                <h3 className="text-xl font-bold text-[#FF6B4A]">{journey?.city}</h3>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FFF4EC] rounded-xl p-4 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#FF6B4A]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <div className="text-2xl font-bold text-[#FF6B4A]">{tripSummary.placesVisited}</div>
                  <div className="text-xs text-[#8AA0B3]">สถานที่</div>
                </div>
                <div className="bg-[#0077B6]/5 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-[#0077B6]/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0077B6]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div className="text-2xl font-bold text-[#0077B6]">{tripSummary.totalPhotos}</div>
                  <div className="text-xs text-[#8AA0B3]">ภาพถ่าย</div>
                </div>
                <div className="bg-[#FFC857]/10 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-[#FFC857]/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"/></svg>
                  </div>
                  <div className="text-2xl font-bold text-[#FFC857]">{tripSummary.totalCoins}</div>
                  <div className="text-xs text-[#8AA0B3]">เหรียญ</div>
                </div>
              </div>

              {/* Bonus Section */}
              <div className="bg-[#2FBF71]/10 rounded-xl p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#2FBF71]/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#2FBF71]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.002 6.002 0 01-4.27 1.772 6.002 6.002 0 01-4.27-1.772"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2FBF71]">โบนัสทริปสำเร็จ!</p>
                  <p className="text-sm text-[#2FBF71]/80">+100 โบนัสเหรียญเพิ่มเติมแล้ว</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleFinishTrip}
                className="w-full bg-[#FF6B4A] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#E85336] transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                <span>กลับหน้าแรก</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default TravelCompanion;
