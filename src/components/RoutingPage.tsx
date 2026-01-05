import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TravelPlace } from '../types/TravelPlace';
import { CoinSystem } from '../utils/coinSystem';
import CoinCounter from './CoinCounter';
import { getUserStorageKey } from '../hooks/useLiff';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RoutingPageProps {
  personality?: string;
  duration?: string;
  city?: string;
}

const RoutingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { personality, duration, city } = (location.state as RoutingPageProps) || {};
  const [optimizedRoute, setOptimizedRoute] = useState<TravelPlace[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Emergency routing state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPlace, setEmergencyPlace] = useState<TravelPlace | null>(null);
  const [alternativePlaces, setAlternativePlaces] = useState<TravelPlace[]>([]);
  // Place swap state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapPlace, setSwapPlace] = useState<{ place: TravelPlace; index: number } | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<TravelPlace[]>([]);

  // Helper functions (declared early to avoid dependency ordering issues)
  function shuffleArray(array: TravelPlace[]): TravelPlace[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const calculateDistance = React.useCallback((place1: TravelPlace, place2: TravelPlace): number => {
    const R = 6371;
    const dLat = (place2.lat - place1.lat) * Math.PI / 180;
    const dLon = (place2.long - place1.long) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(place1.lat * Math.PI / 180) * Math.cos(place2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const optimizeRouteOrder = React.useCallback((places: TravelPlace[]): TravelPlace[] => {
    if (places.length <= 1) return places;
    const unvisited = [...places];
    const ordered: TravelPlace[] = [];
    let currentPlace = unvisited.shift()!;
    ordered.push(currentPlace);
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = calculateDistance(currentPlace, unvisited[0]);
      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(currentPlace, unvisited[i]);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = i;
        }
      }
      currentPlace = unvisited.splice(nearestIndex, 1)[0];
      ordered.push(currentPlace);
    }
    return ordered;
  }, [calculateDistance]);

  const optimizeRoute = React.useCallback((places: TravelPlace[], personality?: string, duration?: string): TravelPlace[] => {
    if (places.length === 0) return [];
    let filteredPlaces = [...places];
    if (personality === 'introvert mode') {
      const introvertKeywords = ['temple', 'nature', 'park', 'sanctuary'];
      filteredPlaces.sort((a, b) => {
        const aScore = introvertKeywords.some(keyword =>
          a.name.toLowerCase().includes(keyword) || (a.description?.toLowerCase().includes(keyword) ?? false)
        ) ? 1 : 0;
        const bScore = introvertKeywords.some(keyword =>
          b.name.toLowerCase().includes(keyword) || (b.description?.toLowerCase().includes(keyword) ?? false)
        ) ? 1 : 0;
        return bScore - aScore;
      });
    } else {
      filteredPlaces.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    let maxPlaces = filteredPlaces.length;
    if (duration === '1 วัน ไม่ค้างคืน') {
      maxPlaces = 3;
    } else if (duration === '2 วัน 1 คืน') {
      maxPlaces = 6;
    }
    if (filteredPlaces.length > maxPlaces) {
      const topCandidates = filteredPlaces.slice(0, Math.min(maxPlaces * 2, filteredPlaces.length));
      filteredPlaces = shuffleArray(topCandidates).slice(0, maxPlaces);
    }
    if (filteredPlaces.length > 1) {
      filteredPlaces = optimizeRouteOrder(filteredPlaces);
    }
    return filteredPlaces;
  }, [optimizeRouteOrder]);

  // Trigger an emergency scenario (e.g., flood at next unvisited place) and suggest alternatives
  const triggerEmergencyPlan = () => {
    if (!optimizedRoute || optimizedRoute.length === 0) return;

    // Find first place to replace
    const placeToReplace = optimizedRoute[0];
    setEmergencyPlace(placeToReplace);

    // Gather candidate alternatives from likedPlaces (excluding the emergency place & already in optimizedRoute)
    try {
      const storageKey = getUserStorageKey('likedPlaces');
      const saved = localStorage.getItem(storageKey);
      const liked: TravelPlace[] = saved ? JSON.parse(saved) : [];
      const routeIds = new Set(optimizedRoute.map(p => p.id));
      let candidates = liked.filter(p => p.id !== placeToReplace.id && !routeIds.has(p.id));
      // Fallback: allow other places in route (not the emergency place) if no external candidates
      if (candidates.length === 0) {
        candidates = optimizedRoute.filter(p => p.id !== placeToReplace.id);
      }
      // Shuffle and take up to 5
      const shuffled = [...candidates];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setAlternativePlaces(shuffled.slice(0, 5));
  } catch {
      setAlternativePlaces([]);
    }

    setShowEmergencyModal(true);
  };

  // Replace the emergency place in current route with selected alternative
  const handleSelectAlternative = (alt: TravelPlace) => {
    if (!emergencyPlace) return;
    const index = optimizedRoute.findIndex(p => p.id === emergencyPlace.id);
    if (index === -1) return;
    const newRoute = [...optimizedRoute];
    newRoute[index] = alt;
    setOptimizedRoute(newRoute);
    // Maintain visited set (alt will be unvisited)
    setShowEmergencyModal(false);
    setEmergencyPlace(null);
    setAlternativePlaces([]);
    // Update journey persistence
    const current = CoinSystem.getCurrentJourney();
    if (current) {
      CoinSystem.createNewJourney(current.personality, current.duration, newRoute);
    }
  };

  useEffect(() => {
    const storageKey = getUserStorageKey('likedPlaces');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      let places: TravelPlace[] = JSON.parse(saved);
      
      // Filter places by selected city (unless 'all' is selected)
      if (city && city !== 'all') {
        places = places.filter(p => p.city === city);
      }
      
      // Simple routing algorithm based on personality and duration
      const route = optimizeRoute(places, personality, duration);
      setOptimizedRoute(route);
    }
  }, [personality, duration, city, optimizeRoute]);

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newRoute = [...optimizedRoute];
    const draggedItem = newRoute[draggedIndex];
    newRoute.splice(draggedIndex, 1);
    newRoute.splice(index, 0, draggedItem);
    setOptimizedRoute(newRoute);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move place up/down in the route
  const movePlace = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === optimizedRoute.length - 1) return;
    
    const newRoute = [...optimizedRoute];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newRoute[index], newRoute[newIndex]] = [newRoute[newIndex], newRoute[index]];
    setOptimizedRoute(newRoute);
  };

  // Remove place from route
  const removeFromRoute = (index: number) => {
    if (optimizedRoute.length <= 1) return;
    const newRoute = optimizedRoute.filter((_, i) => i !== index);
    setOptimizedRoute(newRoute);
  };

  // Open swap modal for a place
  const openSwapModal = (place: TravelPlace, index: number) => {
    setSwapPlace({ place, index });
    
    // Get liked places from localStorage
    try {
      const storageKey = getUserStorageKey('likedPlaces');
      const saved = localStorage.getItem(storageKey);
      const liked: TravelPlace[] = saved ? JSON.parse(saved) : [];
      
      // Get current route place IDs
      const routeIds = new Set(optimizedRoute.map(p => p.id));
      
      // Filter places from the same city that are not already in the route
      const placeCity = place.city || city || 'all';
      let candidates = liked.filter(p => 
        p.id !== place.id && 
        !routeIds.has(p.id) && 
        (placeCity === 'all' || p.city === placeCity)
      );
      
      // Sort by rating
      candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      // Take up to 6 alternatives
      setSwapAlternatives(candidates.slice(0, 6));
    } catch {
      setSwapAlternatives([]);
    }
    
    setShowSwapModal(true);
  };

  // Handle place swap
  const handleSwapPlace = (newPlace: TravelPlace) => {
    if (!swapPlace) return;
    
    const newRoute = [...optimizedRoute];
    newRoute[swapPlace.index] = newPlace;
    setOptimizedRoute(newRoute);
    
    setShowSwapModal(false);
    setSwapPlace(null);
    setSwapAlternatives([]);
  };

  // optimizeRoute & helpers now declared earlier

  const MapVisualization = () => {
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    
    // City center coordinates
    const getCityCenter = (): [number, number] => {
      switch (city) {
        case 'Bangkok':
          return [13.7563, 100.5018];
        case 'Phuket':
          return [7.8804, 98.3923];
        case 'Chiang Mai':
        default:
          return [18.7883, 98.9930];
      }
    };
    
    // Center the map based on selected city or first place in route
    const mapCenter: [number, number] = optimizedRoute.length > 0 
      ? [optimizedRoute[0].lat, optimizedRoute[0].long]
      : getCityCenter();
    
    // Create path coordinates for the polyline
    const pathCoordinates = optimizedRoute.map(place => [place.lat, place.long] as [number, number]);

    const createNumberedIcon = (number: number): L.DivIcon => {
      return L.divIcon({
        html: `<div style="
          background-color: #8B5CF6;
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${number}</div>`,
        className: 'numbered-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-800">
            แผนที่เส้นทางแบบอินเตอร์แอกทีฟ - {city && city !== 'all' ? city : 'ประเทศไทย'}
          </h3>
          
          {/* Map Type Toggle */}
          <div className="flex bg-purple-100 rounded-lg p-1">
            <button
              onClick={() => setMapType('street')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                mapType === 'street' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-purple-600 hover:bg-purple-200'
              }`}
            >
              ถนน
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                mapType === 'satellite' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-purple-600 hover:bg-purple-200'
              }`}
            >
              ดาวเทียม
            </button>
          </div>
        </div>
        
        <div className="h-[500px] rounded-xl overflow-hidden border-2 border-purple-100">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="rounded-xl"
          >
            {/* Conditional tile layers based on map type */}
            {mapType === 'street' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            
            {/* Add markers for each place in the route */}
            {optimizedRoute.map((place, index) => (
              <Marker
                key={place.id}
                position={[place.lat, place.long]}
                icon={createNumberedIcon(index + 1)}
              >
                <Popup className="custom-popup">
                  <div className="text-center min-w-[200px]">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                      จุดที่ {index + 1}
                    </div>
                    <h4 className="font-bold text-purple-800 mb-2 text-lg">
                      {place.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-yellow-600">⭐ คะแนน</div>
                        <div className="font-bold">{place.rating}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-blue-600">📍 ระยะทาง</div>
                        <div className="font-bold">{place.distance}</div>
                      </div>
                    </div>
                    {index < optimizedRoute.length - 1 && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        ถัดไป: {calculateDistance(place, optimizedRoute[index + 1]).toFixed(2)} km
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Draw the route path */}
            {pathCoordinates.length > 1 && (
              <Polyline
                positions={pathCoordinates}
                pathOptions={{
                  color: '#8B5CF6',
                  weight: 5,
                  opacity: 0.8,
                  dashArray: '15, 10',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Enhanced Map Controls and Legend */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Map Legend */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-3">คู่มือแผนที่</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span>ลำดับเส้นทาง (คลิกเพื่อดูรายละเอียด)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-6 h-1 bg-purple-600"></div>
                  <div className="w-2 h-1 bg-transparent"></div>
                  <div className="w-6 h-1 bg-purple-600"></div>
                </div>
                <span>เส้นทางที่เหมาะสม</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">🖱️</span>
                <span>ซูมและเลื่อนเพื่อสำรวจ</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">🗺️</span>
                <span>สลับระหว่างมุมมองถนน/ดาวเทียม</span>
              </div>
            </div>
          </div>
          
          {/* Map Statistics */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl">
            <h4 className="font-semibold text-indigo-800 mb-3">สถิติเส้นทาง</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-600">พื้นที่:</span>
                <span className="font-bold">เชียงใหม่, ประเทศไทย</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">จำนวนจุด:</span>
                <span className="font-bold">{optimizedRoute.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">คะแนนเฉลี่ย:</span>
                <span className="font-bold">
                  {optimizedRoute.length > 0 && 
                    (optimizedRoute.reduce((sum, place) => sum + (place.rating || 0), 0) / optimizedRoute.length).toFixed(1)
                  } ⭐
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">เวลาเดินทางโดยประมาณ:</span>
                <span className="font-bold">
                  {duration === '1 วัน ไม่ค้างคืน' ? '8-10 ชั่วโมง' : '2 วัน'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const regenerateRoute = () => {
    const storageKey = getUserStorageKey('likedPlaces');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      let places: TravelPlace[] = JSON.parse(saved);
      
      // Filter by city if selected
      if (city && city !== 'all') {
        places = places.filter(p => p.city === city);
      }
      
      const newRoute = optimizeRoute(places, personality, duration);
      setOptimizedRoute(newRoute);
    }
  };

  // Start active journey and navigate to travel companion
  const startActiveJourney = () => {
    if (optimizedRoute.length === 0) return;
    
    CoinSystem.startActiveJourney(
      personality || 'default',
      duration || 'custom',
      city || 'all',
      optimizedRoute
    );
    
    navigate('/travel-companion');
  };

  // Show message if no places found for selected city
  if (optimizedRoute.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🗺️</span>
          </div>
          <h2 className="text-2xl font-bold text-purple-800 mb-3">
            ไม่พบสถานที่ใน {city && city !== 'all' ? city : 'ที่คุณเลือก'}
          </h2>
          <p className="text-gray-600 mb-6">
            คุณยังไม่ได้บันทึกสถานที่ในเมืองนี้ กลับไปสำรวจและปัดขวาบันทึกสถานที่ที่คุณชอบ!
          </p>
          <div className="space-y-3">
            <Link
              to="/tinder"
              className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              สำรวจสถานที่
            </Link>
            <Link
              to="/gallery"
              className="block w-full border border-purple-300 text-purple-600 py-3 px-6 rounded-xl font-semibold hover:bg-purple-50 transition-all"
            >
              กลับไปที่บันทึก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      {/* Header - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="p-4 sm:p-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-3 md:hidden">
            {/* Top row - Back button and title */}
            <div className="flex items-center justify-between">
              <Link 
                to="/gallery"
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm">ที่บันทึก</span>
              </Link>
              
              <div className="text-center flex-1 mx-2">
                <h1 className="text-base font-bold text-purple-800">เส้นทางท่องเที่ยวของคุณ</h1>
                <p className="text-xs text-purple-500">
                  {city && city !== 'all' ? `📍 ${city} • ` : ''}{optimizedRoute.length} สถานที่
                </p>
              </div>
            </div>
            
            {/* Bottom row - Coin counter and Emergency button */}
            <div className="flex items-center justify-between gap-2">
              <CoinCounter showAnimation={true} />
              <button
                onClick={triggerEmergencyPlan}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium text-xs shadow-sm transition"
              >
                <span>🚨</span>
                <span>ฉุกเฉิน</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <Link 
              to="/gallery"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">กลับไปที่บันทึก</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-purple-800">เส้นทางท่องเที่ยวของคุณ</h1>
              <p className="text-sm text-purple-500">
                {city && city !== 'all' ? `📍 ${city} • ` : ''}{optimizedRoute.length} สถานที่
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <CoinCounter showAnimation={true} />
              <button
                onClick={triggerEmergencyPlan}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition"
              >
                <span>🚨</span>
                <span>แผนฉุกเฉิน</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Emergency Plan Modal */}
        {showEmergencyModal && emergencyPlace && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center emergency-modal">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmergencyModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-red-600 flex items-center space-x-2">
                  <span>⚠️ แจ้งเตือนฉุกเฉิน</span>
                </h2>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="ปิดหน้าต่างฉุกเฉิน"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  สถานที่ <span className="font-semibold text-purple-700">{emergencyPlace.name}</span> กำลังได้รับผลกระทบจาก<span className="font-semibold">สภาพน้ำท่วม</span> เพื่อความปลอดภัยของคุณ เราแนะนำให้เลือกสถานที่ทดแทน
                </p>
                {alternativePlaces.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">สถานที่ทดแทนที่แนะนำ</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {alternativePlaces.map(alt => (
                        <div key={alt.id} className="border rounded-lg p-3 flex items-start justify-between hover:border-purple-400 transition cursor-pointer" onClick={() => handleSelectAlternative(alt)}>
                          <div className="text-sm">
                            <p className="font-semibold text-purple-800">{alt.name}</p>
                            {alt.description && <p className="text-gray-500 text-xs line-clamp-2">{alt.description}</p>}
                            <div className="text-xs text-gray-400 mt-1 flex space-x-3">
                              {alt.rating && <span>⭐ {alt.rating}</span>}
                              <span>{alt.lat.toFixed(2)}, {alt.long.toFixed(2)}</span>
                            </div>
                          </div>
                          <button className="ml-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1 rounded-md font-medium hover:from-purple-600 hover:to-purple-700">เลือก</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">ไม่มีสถานที่ทดแทนในขณะนี้</div>
                )}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Place Swap Modal */}
        {showSwapModal && swapPlace && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSwapModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <span>🔄</span>
                    <span>สลับสถานที่</span>
                  </h2>
                  <button
                    onClick={() => setShowSwapModal(false)}
                    className="text-white/80 hover:text-white transition"
                    aria-label="ปิดหน้าต่างสลับ"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  แทนที่ <span className="font-semibold">{swapPlace.place.name}</span>
                </p>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {/* Current place */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">สถานที่ปัจจุบัน</p>
                  <div className="flex items-center space-x-3">
                    {swapPlace.place.image && (
                      <img src={swapPlace.place.image} alt={swapPlace.place.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{swapPlace.place.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {swapPlace.place.city && <span>📍 {swapPlace.place.city}</span>}
                        {swapPlace.place.rating && <span>⭐ {swapPlace.place.rating}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center my-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Alternative places */}
                {swapAlternatives.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      เลือกสถานที่ทดแทนใน {swapPlace.place.city || 'เมืองของคุณ'}:
                    </p>
                    <div className="space-y-2">
                      {swapAlternatives.map(alt => (
                        <div 
                          key={alt.id} 
                          className="p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between"
                          onClick={() => handleSwapPlace(alt)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {alt.image && (
                              <img src={alt.image} alt={alt.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-purple-800 truncate">{alt.name}</p>
                              {alt.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{alt.description}</p>
                              )}
                              <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                                {alt.city && <span>📍 {alt.city}</span>}
                                {alt.rating && <span>⭐ {alt.rating}</span>}
                              </div>
                            </div>
                          </div>
                          <button className="ml-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 flex-shrink-0">
                            เลือก
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm text-center">
                    <span className="text-2xl block mb-2">😔</span>
                    ไม่มีสถานที่ทดแทนใน {swapPlace.place.city || 'เมืองนี้'}
                    <br />
                    <span className="text-xs">ลองปัดเพิ่มเติมสถานที่ในหน้าสำรวจ!</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t p-4">
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="w-full py-3 text-sm font-medium rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Travel Settings Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-purple-800 mb-4">การตั้งค่าทริป</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">บุคลิกภาพ</p>
                <p className="font-semibold text-purple-800">{personality || 'เริ่มต้น'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">ระยะเวลา</p>
                <p className="font-semibold text-purple-800">{duration || 'ไม่ระบุ'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">สถานที่ที่เลือก</p>
                <p className="font-semibold text-green-800">
                  {optimizedRoute.length} {duration === '1 วัน ไม่ค้างคืน' ? '/ สูงสุด 3' : duration === '2 วัน 1 คืน' ? '/ สูงสุด 6' : 'สถานที่'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Selection Info */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-sm text-blue-800">
                  {duration === '1 วัน ไม่ค้างคืน' 
                    ? `สุ่มเลือก 3 สถานที่จากคอลเลคชันของคุณสำหรับทริปวันเดียวที่สมบูรณ์แบบ`
                    : duration === '2 วัน 1 คืน'
                    ? `เลือกสถานที่สูงสุด 6 แห่งอย่างเหมาะสมสำหรับการผจญภัย 2 วันของคุณ`
                    : `รวมสถานที่โปรดทั้งหมดของคุณในแผนการเดินทางนี้`
                  }
                </span>
              </div>
              
              {/* Regenerate Button - only show for limited duration trips */}
              {(duration === '1 วัน ไม่ค้างคืน' || duration === '2 วัน 1 คืน') && (
                <button
                  onClick={regenerateRoute}
                  className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  <span>เลือกใหม่</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Route List */}
          <div className="xl:col-span-1 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-800">ลำดับเส้นทาง</h3>
              <p className="text-xs text-gray-500">ลากเพื่อจัดเรียงใหม่</p>
            </div>
            <div className="space-y-3">
              {optimizedRoute.map((place, index) => (
                <div 
                  key={place.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 bg-purple-50 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                    draggedIndex === index ? 'border-purple-500 opacity-50' : 'border-purple-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center space-y-1 pt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <button 
                          onClick={() => movePlace(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => movePlace(index, 'down')}
                          disabled={index === optimizedRoute.length - 1}
                          className="text-gray-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-purple-800 truncate">{place.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 ml-2">
                          {/* Swap button */}
                          <button
                            onClick={() => openSwapModal(place, index)}
                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            title="สลับกับสถานที่ทดแทน"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                          {/* Remove button */}
                          <button
                            onClick={() => removeFromRoute(index)}
                            disabled={optimizedRoute.length <= 1}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30"
                            title="ลบออกจากเส้นทาง"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-2 text-xs text-purple-600">
                        {place.city && <span className="bg-purple-100 px-2 py-0.5 rounded">📍 {place.city}</span>}
                        {place.rating && <span>⭐ {place.rating}</span>}
                      </div>
                      
                      {index < optimizedRoute.length - 1 && (
                        <div className="mt-2 text-xs text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {calculateDistance(place, optimizedRoute[index + 1]).toFixed(1)} km ถึงจุดต่อไป
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Distance Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-2">สรุปเส้นทาง</h4>
              <div className="text-sm text-purple-700">
                <div className="flex justify-between mb-1">
                  <span>จำนวนสถานที่:</span>
                  <span className="font-bold">{optimizedRoute.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>ระยะทางรวม:</span>
                  <span className="font-bold">
                    {optimizedRoute.length > 1 
                      ? optimizedRoute.slice(0, -1).reduce((total, place, index) => 
                          total + calculateDistance(place, optimizedRoute[index + 1]), 0
                        ).toFixed(2)
                      : '0'
                    } km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="xl:col-span-2">
            <MapVisualization />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
          {/* Start Journey Button - Primary CTA */}
          <button 
            onClick={startActiveJourney}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>เริ่มการเดินทางเลย</span>
          </button>
          
          <button 
            onClick={() => {
              const url = optimizedRoute.map(place => `${place.lat},${place.long}`).join('/');
              window.open(`https://www.google.com/maps/dir/${url}`, '_blank');
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            เปิดใน Google Maps
          </button>
          
          <Link 
            to="/gallery"
            className="bg-gray-200 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 text-center"
          >
            แก้ไขการเลือก
          </Link>
        </div>

        {/* Mobile: Start Journey Floating Button */}
        <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
          <button 
            onClick={startActiveJourney}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center space-x-2"
          >
            <span className="text-2xl">🚀</span>
            <span>เริ่มเดินทาง</span>
          </button>
        </div>
        
        {/* Bottom padding for floating button on mobile */}
        <div className="h-24 md:h-8" />
      </div>
    </div>
  );
};

export default RoutingPage;
