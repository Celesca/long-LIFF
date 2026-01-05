import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoinSystem, type ActiveJourney, type JourneyPlace } from '../utils/coinSystem';
import CoinCounter from './CoinCounter';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map center component for dynamic panning
const MapCenterController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 0.8 });
  }, [center, map]);
  return null;
};

const TravelCompanion: React.FC = () => {
  const navigate = useNavigate();
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

  const createMarkerIcon = (index: number, visited: boolean, isCurrent: boolean): L.DivIcon => {
    const bgColor = visited ? '#10B981' : isCurrent ? '#8B5CF6' : '#94A3B8';
    const size = isCurrent ? 40 : 32;
    
    return L.divIcon({
      html: `<div style="
        background-color: ${bgColor};
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${isCurrent ? '16px' : '12px'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isCurrent ? 'animation: pulse 2s infinite;' : ''}
      ">${visited ? '✓' : index + 1}</div>`,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const progress = getProgress();
  const currentPlace = journey.places[currentIndex];
  const mapCenter: [number, number] = currentPlace 
    ? [currentPlace.lat, currentPlace.long] 
    : [13.7563, 100.5018];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center flex-1 mx-3">
              <h1 className="font-bold text-gray-800 text-sm">
                {journey.city === 'all' ? 'ทริปหลายเมือง' : journey.city}
              </h1>
              <p className="text-xs text-gray-500">{journey.duration}</p>
            </div>
            
            <CoinCounter showAnimation={true} />
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{progress.visited} จาก {progress.total} สถานที่</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'places' 
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
                : 'text-gray-500'
            }`}
          >
            📍 สถานที่
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'map' 
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' 
                : 'text-gray-500'
            }`}
          >
            🗺️ แผนที่
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'places' ? (
          <div className="h-full flex flex-col overflow-y-auto">
            {/* Current Place Card */}
            {currentPlace && (
              <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {currentPlace.visited ? '✓ เยี่ยมแล้ว' : `จุดที่ ${currentIndex + 1}`}
                    </div>

                    {/* Place Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-white font-bold text-xl mb-1">{currentPlace.name}</h2>
                      <div className="flex items-center space-x-3 text-white/90 text-sm">
                        {currentPlace.rating && <span>⭐ {currentPlace.rating}</span>}
                        {currentPlace.city && <span>📍 {currentPlace.city}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Place Details */}
                  <div className="p-4">
                    {currentPlace.description && (
                      <p className="text-gray-600 text-sm mb-4">{currentPlace.description}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!currentPlace.visited ? (
                        <button
                          onClick={() => openPhotoUpload(currentPlace)}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-98 transition-transform flex items-center justify-center space-x-2"
                        >
                          <span className="text-2xl">📸</span>
                          <span>เช็คอินด้วยภาพถ่าย</span>
                        </button>
                      ) : (
                        <div className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-xl font-bold text-center flex items-center justify-center space-x-2">
                          <span>✅</span>
                          <span>คุณได้รับ {currentPlace.coinsEarned} เหรียญ!</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentPlace.lat},${currentPlace.long}`, '_blank');
                        }}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
                      >
                        <span>🧭</span>
                        <span>นำทางด้วย Google Maps</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Horizontal Place Carousel */}
            <div className="flex-1 bg-gray-50 pt-2 pb-4">
              <p className="px-4 text-sm font-semibold text-gray-700 mb-2">จุดหมายปลายทางทั้งหมด</p>
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {journey.places.map((place, index) => (
                  <div
                    key={place.id}
                    onClick={() => handlePlaceSelect(index)}
                    className={`flex-shrink-0 w-[280px] snap-center bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all ${
                      index === currentIndex ? 'ring-2 ring-purple-500 scale-[1.02]' : ''
                    }`}
                  >
                    <div className="relative h-28">
                      <img 
                        src={place.image || 'https://via.placeholder.com/300x150'} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        place.visited ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}>
                        {place.visited ? '✓' : index + 1}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{place.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{place.city}</span>
                        {place.visited && (
                          <span className="text-xs text-emerald-600 font-medium">+{place.coinsEarned} 🪙</span>
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
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterController center={mapCenter} />
              
              {journey.places.map((place, index) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.long]}
                  icon={createMarkerIcon(index, place.visited, index === currentIndex)}
                  eventHandlers={{
                    click: () => handlePlaceSelect(index)
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-bold text-purple-800">{place.name}</p>
                      <p className="text-xs text-gray-500">จุดที่ {index + 1}</p>
                      {place.visited && (
                        <p className="text-xs text-emerald-600 mt-1">✓ เยี่ยมแล้ว</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Route Polyline */}
              <Polyline
                positions={journey.places.map(p => [p.lat, p.long] as [number, number])}
                pathOptions={{
                  color: '#8B5CF6',
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '10, 8'
                }}
              />
            </MapContainer>

            {/* Floating Current Place Card */}
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-4">
                <img 
                  src={currentPlace?.image || 'https://via.placeholder.com/80'} 
                  alt={currentPlace?.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{currentPlace?.name}</p>
                  <p className="text-sm text-gray-500">จุดที่ {currentIndex + 1} จาก {journey.places.length}</p>
                </div>
                {!currentPlace?.visited ? (
                  <button
                    onClick={() => currentPlace && openPhotoUpload(currentPlace)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0"
                  >
                    📸 เช็คอิน
                  </button>
                ) : (
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0">
                    ✓ เสร็จแล้ว
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => handlePlaceSelect(currentIndex - 1)}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 active:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">ก่อนหน้า</span>
        </button>

        <button
          onClick={handleEndJourney}
          className="text-red-500 font-medium text-sm px-3 py-2"
        >
          จบทริป
        </button>

        <button
          disabled={currentIndex === journey.places.length - 1}
          onClick={() => handlePlaceSelect(currentIndex + 1)}
          className="flex items-center space-x-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-purple-100 text-purple-700 active:bg-purple-200"
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
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">เช็คอินที่ {selectedPlace.name}</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <p className="text-gray-600 mb-4">
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
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {uploadedPhotos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                  >
                    {isUploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span className="text-2xl">📷</span>
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
              <div className="bg-amber-50 rounded-xl p-3 mb-4 flex items-center space-x-3">
                <span className="text-2xl">🪙</span>
                <div>
                  <p className="font-semibold text-amber-800">รับ {uploadedPhotos.length * 10} เหรียญ!</p>
                  <p className="text-xs text-amber-600">10 เหรียญต่อภาพที่อัปโหลด</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirmVisit}
                  disabled={uploadedPhotos.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ยืนยันการเยี่ยมชม & รับเหรียญ
                </button>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
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
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-bounce-in">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 p-6 text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                ยินดีด้วย!
              </h2>
              <p className="text-white/90 mt-1">คุณทำทริปเสร็จสมบูรณ์แล้ว!</p>
            </div>

            {/* Trip Summary */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">ทริปของคุณไป</p>
                <h3 className="text-xl font-bold text-purple-600">{journey?.city}</h3>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-1">📍</div>
                  <div className="text-2xl font-bold text-purple-600">{tripSummary.placesVisited}</div>
                  <div className="text-xs text-gray-500">สถานที่ที่เยี่ยม</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-1">📸</div>
                  <div className="text-2xl font-bold text-blue-600">{tripSummary.totalPhotos}</div>
                  <div className="text-xs text-gray-500">ภาพถ่าย</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-1">🪙</div>
                  <div className="text-2xl font-bold text-amber-600">{tripSummary.totalCoins}</div>
                  <div className="text-xs text-gray-500">เหรียญที่ได้รับ</div>
                </div>
              </div>

              {/* Bonus Section */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 flex items-center space-x-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-semibold text-emerald-700">โบนัสทริปสำเร็จ!</p>
                  <p className="text-sm text-emerald-600">+100 โบนัสเหรียญเพิ่มเติมแล้ว</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleFinishTrip}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
              >
                🏠 กลับหน้าแรก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelCompanion;
