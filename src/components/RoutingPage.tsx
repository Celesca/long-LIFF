import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TravelPlace } from '../types/TravelPlace';
import { CoinSystem } from '../utils/coinSystem';
import CoinCounter from './CoinCounter';
import PlaceDetailModal from './PlaceDetailModal';
import Layout from './Layout';
import { getUserId } from '../hooks/useLiff';
import { useIsDesktop } from '../hooks/useViewport';
import { poiApi } from '../services/poiApi';

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
  anchor?: { lat: number; lng: number; radius_km: number; label?: string } | null;
}

const RoutingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { personality, duration, anchor } = (location.state as RoutingPageProps) || {};
  const lineUserId = getUserId() || 'anonymous';
  const [optimizedRoute, setOptimizedRoute] = useState<TravelPlace[]>([]);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(true);
  const [routeError, setRouteError] = useState('');
  const [routeMeta, setRouteMeta] = useState<{ name: string; description: string; provider: string; isAi: boolean } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Emergency routing state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPlace, setEmergencyPlace] = useState<TravelPlace | null>(null);
  const [alternativePlaces, setAlternativePlaces] = useState<TravelPlace[]>([]);
  // Place swap state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapPlace, setSwapPlace] = useState<{ place: TravelPlace; index: number } | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<TravelPlace[]>([]);
  // Place detail modal state
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Real POI state from FastAPI places.json backend
  const [nearbyPois, setNearbyPois] = useState<TravelPlace[]>([]);
  const [isLoadingPois, setIsLoadingPois] = useState(false);
  const [poiError, setPoiError] = useState('');

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

  const loadNearbyPois = React.useCallback(async () => {
    const startPoint = optimizedRoute[0];
    if (!startPoint) return;

    setIsLoadingPois(true);
    setPoiError('');

    try {
      const response = await poiApi.getNearbyPlaces({
        lat: startPoint.lat,
        lng: startPoint.long,
        radiusKm: 25,
        limit: 12,
        excludeIds: optimizedRoute.map(place => place.id),
      });
      setNearbyPois(response.places);
    } catch (error) {
      console.error('Failed to load nearby POIs:', error);
      setPoiError('เปิด FastAPI backend ที่พอร์ต 8000 ก่อนโหลด POI จาก places.json');
    } finally {
      setIsLoadingPois(false);
    }
  }, [optimizedRoute]);

  const addPoiToRoute = (poi: TravelPlace) => {
    if (optimizedRoute.some(place => place.id === poi.id)) return;
    const newRoute = optimizeRouteOrder([...optimizedRoute, poi]);
    setOptimizedRoute(newRoute);
    setNearbyPois(current => current.filter(place => place.id !== poi.id));
  };

  const generateRoute = React.useCallback(async () => {
    setIsGeneratingRoute(true);
    setRouteError('');

    try {
      await poiApi.createOrGetUser({ line_user_id: lineUserId });
      const likedResponse = await poiApi.getLikedPlaces(lineUserId);
      const response = await poiApi.generateRoute(lineUserId, {
        personality: personality || 'default',
        duration: duration || 'custom',
        anchor: anchor || undefined,
        liked_place_ids: likedResponse.places.map(place => place.id),
      });

      setOptimizedRoute(response.places);
      setRouteMeta({
        name: response.trip_name,
        description: response.description,
        provider: response.provider,
        isAi: response.is_ai_generated,
      });
    } catch (error) {
      console.error('Failed to generate route:', error);
      setRouteError('ไม่สามารถสร้างเส้นทางได้ กรุณาเปิด FastAPI/Postgres backend แล้วลองอีกครั้ง');
    } finally {
      setIsGeneratingRoute(false);
    }
  }, [anchor, duration, lineUserId, personality]);

  // Trigger an emergency scenario (e.g., flood at next unvisited place) and suggest alternatives
  const triggerEmergencyPlan = async () => {
    if (!optimizedRoute || optimizedRoute.length === 0) return;

    // Find first place to replace
    const placeToReplace = optimizedRoute[0];
    setEmergencyPlace(placeToReplace);

    // Gather candidate alternatives from likedPlaces (excluding the emergency place & already in optimizedRoute)
    try {
      const likedResponse = await poiApi.getLikedPlaces(lineUserId);
      const liked = likedResponse.places;
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
    generateRoute();
  }, [generateRoute]);

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
  const openSwapModal = async (place: TravelPlace, index: number) => {
    setSwapPlace({ place, index });

    try {
      const likedResponse = await poiApi.getLikedPlaces(lineUserId);
      const liked = likedResponse.places;

      // Get current route place IDs
      const routeIds = new Set(optimizedRoute.map(p => p.id));

      let candidates = liked.filter(p =>
        p.id !== place.id &&
        !routeIds.has(p.id)
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

    const getCityCenter = (): [number, number] => {
      if (anchor) return [anchor.lat, anchor.lng];
      return [15.87, 100.9925];
    };

    const mapCenter: [number, number] = optimizedRoute.length > 0
      ? [optimizedRoute[0].lat, optimizedRoute[0].long]
      : getCityCenter();

    // Create path coordinates for the polyline
    const pathCoordinates = optimizedRoute.map(place => [place.lat, place.long] as [number, number]);

    const createNumberedIcon = (number: number): L.DivIcon => {
      return L.divIcon({
        html: `<div style="
          background-color: #FF6B4A;
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

    const createPoiIcon = (): L.DivIcon => {
      return L.divIcon({
        html: `<div style="
          background-color: #0077B6;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.24);
        "></div>`,
        className: 'nearby-poi-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8]
      });
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#17324D]">
            แผนที่เส้นทางแบบอินเตอร์แอกทีฟ - {anchor?.label || 'AI Route'}
          </h3>

          {/* Map Type Toggle */}
          <div className="flex bg-[#FFF4EC] rounded-lg p-1">
            <button
              onClick={() => setMapType('street')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${mapType === 'street'
                  ? 'bg-[#FF6B4A] text-white shadow-sm'
                  : 'text-[#FF6B4A] hover:bg-[#FFF4EC]'
                }`}
            >
              ถนน
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${mapType === 'satellite'
                  ? 'bg-[#FF6B4A] text-white shadow-sm'
                  : 'text-[#FF6B4A] hover:bg-[#FFF4EC]'
                }`}
            >
              ดาวเทียม
            </button>
          </div>
        </div>

        <div className="h-[500px] rounded-xl overflow-hidden border-2 border-[#DDEAF3]">
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
                    <div className="bg-[#FF6B4A] text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                      จุดที่ {index + 1}
                    </div>
                    <h4 className="font-bold text-[#17324D] mb-2 text-lg">
                      {place.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#FFC857]/10 p-2 rounded">
                        <div className="text-[#FFC857]">⭐ คะแนน</div>
                        <div className="font-bold">{place.rating}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-[#0077B6]">📍 ระยะทาง</div>
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
                  color: '#FF6B4A',
                  weight: 5,
                  opacity: 0.8,
                  dashArray: '15, 10',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}

            {/* Small nearby POIs loaded from places.json through FastAPI */}
            {nearbyPois.map((place) => (
              <Marker
                key={`poi-${place.id}`}
                position={[place.lat, place.long]}
                icon={createPoiIcon()}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[180px]">
                    <p className="text-xs font-bold text-[#0077B6] mb-1">POI ใกล้เคียง</p>
                    <h4 className="font-bold text-[#17324D] mb-1">{place.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{[place.district, place.province].filter(Boolean).join(', ')}</p>
                    {place.distance && <p className="text-xs text-[#FF6B4A] font-semibold">{place.distance} จากจุดเริ่มต้น</p>}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { setSelectedPlace(place); setShowDetailModal(true); }}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700"
                      >
                        รายละเอียด
                      </button>
                      <button
                        onClick={() => addPoiToRoute(place)}
                        className="text-xs px-2 py-1 rounded bg-[#0077B6] text-white"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Enhanced Map Controls and Legend */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Map Legend */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <h4 className="font-semibold text-[#17324D] mb-3">คู่มือแผนที่</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-[#FF6B4A] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <span>ลำดับเส้นทาง (คลิกเพื่อดูรายละเอียด)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-6 h-1 bg-[#FF6B4A]"></div>
                  <div className="w-2 h-1 bg-transparent"></div>
                  <div className="w-6 h-1 bg-[#FF6B4A]"></div>
                </div>
                <span>เส้นทางที่เหมาะสม</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[#FF6B4A]">🖱️</span>
                <span>ซูมและเลื่อนเพื่อสำรวจ</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[#FF6B4A]">🗺️</span>
                <span>สลับระหว่างมุมมองถนน/ดาวเทียม</span>
              </div>
            </div>
          </div>

          {/* Map Statistics */}
          <div className="p-4 bg-gradient-to-r from-[#0077B6]/5 to-[#0077B6]/10 rounded-xl">
            <h4 className="font-semibold text-[#0077B6] mb-3">สถิติเส้นทาง</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#0077B6]">พื้นที่:</span>
                <span className="font-bold">เชียงใหม่, ประเทศไทย</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0077B6]">จำนวนจุด:</span>
                <span className="font-bold">{optimizedRoute.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0077B6]">คะแนนเฉลี่ย:</span>
                <span className="font-bold">
                  {optimizedRoute.length > 0 &&
                    (optimizedRoute.reduce((sum, place) => sum + (place.rating || 0), 0) / optimizedRoute.length).toFixed(1)
                  } ⭐
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0077B6]">เวลาเดินทางโดยประมาณ:</span>
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
    generateRoute();
  };

  // Start active journey and navigate to travel companion
  const startActiveJourney = () => {
    if (optimizedRoute.length === 0) return;

    CoinSystem.startActiveJourney(
      personality || 'default',
      duration || 'custom',
      anchor?.label || 'AI Route',
      optimizedRoute
    );

    navigate('/travel-companion');
  };

  if (isGeneratingRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6FBFF] via-[#F6FBFF] to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="w-14 h-14 mx-auto border-4 border-[#DDEAF3] border-t-[#FF6B4A] rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-[#17324D] mb-3">กำลังสร้างเส้นทาง</h2>
          <p className="text-gray-600">กำลังวิเคราะห์ POI ที่บันทึกและสถานที่จริงใกล้เคียงจาก places.json</p>
        </div>
      </div>
    );
  }

  if (routeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6FBFF] via-[#F6FBFF] to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#17324D] mb-3">สร้างเส้นทางไม่สำเร็จ</h2>
          <p className="text-gray-600 mb-6">{routeError}</p>
          <button
            onClick={generateRoute}
            className="w-full bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white py-3 px-6 rounded-xl font-semibold"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (optimizedRoute.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6FBFF] via-[#F6FBFF] to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto bg-[#FFF4EC] rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#FF6B4A]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#17324D] mb-3">
            ไม่พบสถานที่สำหรับสร้างเส้นทาง
          </h2>
          <p className="text-gray-600 mb-6">
            ลองกลับไปสำรวจ กดถูกใจ POI เพิ่ม หรือเลือกจุดปักหมุดใหม่เพื่อดึงสถานที่ใกล้เคียง
          </p>
          <div className="space-y-3">
            <Link
              to="/tinder"
              className="block w-full bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#E85336] hover:to-[#C9432B] transition-all"
            >
              สำรวจสถานที่
            </Link>
            <Link
              to="/gallery"
              className="block w-full border border-purple-300 text-[#FF6B4A] py-3 px-6 rounded-xl font-semibold hover:bg-[#FFF4EC] transition-all"
            >
              กลับไปที่บันทึก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout hideNavbar={!isDesktop} backgroundVariant="none">
    <div className="min-h-screen bg-gradient-to-br from-[#F6FBFF] via-[#F6FBFF] to-white">
      {/* Header - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#DDEAF3] sticky top-0 z-10">
        <div className="p-4 sm:p-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-3 md:hidden">
            {/* Top row - Back button and title */}
            <div className="flex items-center justify-between">
              <Link
                to="/gallery"
                className="flex items-center space-x-2 text-[#FF6B4A] hover:text-[#E85336]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm">ที่บันทึก</span>
              </Link>

              <div className="text-center flex-1 mx-2">
                <h1 className="text-base font-bold text-[#17324D]">เส้นทางท่องเที่ยวของคุณ</h1>
                <p className="text-xs text-[#FF6B4A]/70">
                  {anchor?.label ? `📍 ${anchor.label} • ` : ''}{optimizedRoute.length} สถานที่
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                <span>ฉุกเฉิน</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <Link
              to="/gallery"
              className="flex items-center space-x-2 text-[#FF6B4A] hover:text-[#E85336]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">กลับไปที่บันทึก</span>
            </Link>

            <div className="text-center">
              <h1 className="text-xl font-bold text-[#17324D]">เส้นทางท่องเที่ยวของคุณ</h1>
              <p className="text-sm text-[#FF6B4A]/70">
                {anchor?.label ? `📍 ${anchor.label} • ` : ''}{optimizedRoute.length} สถานที่
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <CoinCounter showAnimation={true} />
              <button
                onClick={triggerEmergencyPlan}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                <span>แผนฉุกเฉิน</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Emergency Plan Modal */}
        {showEmergencyModal && emergencyPlace && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center emergency-modal">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmergencyModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-red-600 flex items-center space-x-2">
                  <span>แจ้งเตือนฉุกเฉิน</span>
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
                  สถานที่ <span className="font-semibold text-[#E85336]">{emergencyPlace.name}</span> กำลังได้รับผลกระทบจาก<span className="font-semibold">สภาพน้ำท่วม</span> เพื่อความปลอดภัยของคุณ เราแนะนำให้เลือกสถานที่ทดแทน
                </p>
                {alternativePlaces.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">สถานที่ทดแทนที่แนะนำ</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {alternativePlaces.map(alt => (
                        <div key={alt.id} className="border rounded-lg p-3 flex items-start justify-between hover:border-[#FFC857] transition cursor-pointer" onClick={() => handleSelectAlternative(alt)}>
                          <div className="text-sm">
                            <p className="font-semibold text-[#17324D]">{alt.name}</p>
                            {alt.description && <p className="text-gray-500 text-xs line-clamp-2">{alt.description}</p>}
                            <div className="text-xs text-gray-400 mt-1 flex space-x-3">
                              {alt.rating && <span>⭐ {alt.rating}</span>}
                              <span>{alt.lat.toFixed(2)}, {alt.long.toFixed(2)}</span>
                            </div>
                          </div>
                          <button className="ml-4 bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white text-xs px-3 py-1 rounded-md font-medium hover:from-[#E85336] hover:to-[#C9432B]">เลือก</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FFC857]/10 text-[#8A6A00] rounded-lg text-sm">ไม่มีสถานที่ทดแทนในขณะนี้</div>
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
              <div className="sticky top-0 bg-gradient-to-r from-[#0077B6] to-[#FF6B4A] p-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
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
                  <div className="w-8 h-8 bg-[#0077B6]/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#0077B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="p-3 border rounded-xl hover:border-[#0077B6] hover:bg-[#0077B6]/5 transition cursor-pointer flex items-center justify-between"
                          onClick={() => handleSwapPlace(alt)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {alt.image && (
                              <img src={alt.image} alt={alt.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#17324D] truncate">{alt.name}</p>
                              {alt.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{alt.description}</p>
                              )}
                              <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                                {alt.city && <span>📍 {alt.city}</span>}
                                {alt.rating && <span>⭐ {alt.rating}</span>}
                              </div>
                            </div>
                          </div>
                          <button className="ml-3 bg-gradient-to-r from-[#0077B6] to-[#FF6B4A] text-white text-xs px-3 py-2 rounded-lg font-medium hover:from-[#00649A] hover:to-[#E85336] flex-shrink-0">
                            เลือก
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FFC857]/10 text-[#8A6A00] rounded-lg text-sm text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#FFC857]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/></svg>
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
          {routeMeta && (
            <div className="mb-5 rounded-xl bg-[#0077B6]/5 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#0077B6]">
                    {routeMeta.isAi ? 'AI route' : 'Fallback route'} · {routeMeta.provider}
                  </p>
                  <h2 className="text-lg font-bold text-[#17324D]">{routeMeta.name}</h2>
                  <p className="text-sm text-gray-600">{routeMeta.description}</p>
                </div>
                {anchor && (
                  <div className="text-sm text-[#4F6F87] md:text-right">
                    <p>{anchor.label || 'Pinned location'}</p>
                    <p>{anchor.lat.toFixed(4)}, {anchor.lng.toFixed(4)} · {anchor.radius_km} km</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <h2 className="text-lg font-bold text-[#17324D] mb-4">การตั้งค่าทริป</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FFF4EC] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FF6B4A]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">บุคลิกภาพ</p>
                <p className="font-semibold text-[#17324D]">{personality || 'เริ่มต้น'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FFF4EC] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FF6B4A]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">ระยะเวลา</p>
                <p className="font-semibold text-[#17324D]">{duration || 'ไม่ระบุ'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
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
          <div className="mt-4 p-3 bg-gradient-to-r from-[#0077B6]/5 to-[#0077B6]/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#0077B6]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-sm text-[#0077B6]">
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
                  className="flex items-center space-x-1 bg-[#0077B6] text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-[#00649A] transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  <span>เลือกใหม่</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real POIs from places.json */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#0077B6]">places.json POI</p>
              <h2 className="text-lg font-bold text-[#17324D]">สถานที่จริงใกล้จุดเริ่มต้น</h2>
              <p className="text-sm text-gray-500">
                โหลด POI ที่ได้รับอนุมัติจาก FastAPI backend ภายในรัศมี 25 km จาก {optimizedRoute[0]?.name}
              </p>
            </div>
            <button
              onClick={loadNearbyPois}
              disabled={isLoadingPois}
              className="inline-flex items-center justify-center rounded-xl bg-[#0077B6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#00649A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingPois ? 'กำลังโหลด...' : 'โหลด POI ใกล้เคียง'}
            </button>
          </div>

          {poiError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {poiError}
            </div>
          )}

          {nearbyPois.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {nearbyPois.map((poi) => (
                <div key={poi.id} className="rounded-xl border border-[#DDEAF3] p-3">
                  <div className="flex gap-3">
                    {poi.image && (
                      <img src={poi.image} alt={poi.name} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-[#17324D]">{poi.name}</h3>
                      <p className="text-xs text-gray-500">{[poi.district, poi.province].filter(Boolean).join(', ')}</p>
                      {poi.distance && <p className="mt-1 text-xs font-semibold text-[#FF6B4A]">{poi.distance}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { setSelectedPlace(poi); setShowDetailModal(true); }}
                      className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      ดูรายละเอียด
                    </button>
                    <button
                      onClick={() => addPoiToRoute(poi)}
                      className="flex-1 rounded-lg bg-[#0077B6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#00649A]"
                    >
                      เพิ่มเข้าเส้นทาง
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Route List */}
          <div className="xl:col-span-1 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#17324D]">ลำดับเส้นทาง</h3>
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
                  className={`p-4 bg-[#FFF4EC] rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'border-[#FF6B4A] opacity-50' : 'border-[#DDEAF3]'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center space-y-1 pt-1">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <button
                          onClick={() => movePlace(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-[#FF6B4A] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => movePlace(index, 'down')}
                          disabled={index === optimizedRoute.length - 1}
                          className="text-gray-400 hover:text-[#FF6B4A] disabled:opacity-30 disabled:cursor-not-allowed"
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
                          <h4 className="font-bold text-[#17324D] truncate">{place.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 ml-2">
                          {/* Swap button */}
                          <button
                            onClick={() => openSwapModal(place, index)}
                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-[#0077B6]/5 rounded-full transition-colors"
                            title="สลับกับสถานที่ทดแทน"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                          {/* Info button */}
                          <button
                            onClick={() => { setSelectedPlace(place); setShowDetailModal(true); }}
                            className="p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

                      <div className="flex items-center space-x-3 mt-2 text-xs text-[#FF6B4A]">
                        {place.city && <span className="bg-[#FFF4EC] px-2 py-0.5 rounded">📍 {place.city}</span>}
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
            <div className="mt-6 p-4 bg-gradient-to-r from-[#FFF4EC] to-[#F6FBFF] rounded-xl">
              <h4 className="font-semibold text-[#17324D] mb-2">สรุปเส้นทาง</h4>
              <div className="text-sm text-[#E85336]">
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
            className="bg-gradient-to-r from-[#2FBF71] to-[#0077B6] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:from-[#3A7048] hover:to-[#00649A] transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>
            <span>เริ่มการเดินทางเลย</span>
          </button>

          <button
            onClick={() => {
              const url = optimizedRoute.map(place => `${place.lat},${place.long}`).join('/');
              window.open(`https://www.google.com/maps/dir/${url}`, '_blank');
            }}
            className="bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white py-3 px-8 rounded-xl font-semibold hover:from-[#E85336] hover:to-[#C9432B] transform hover:scale-105 transition-all duration-200"
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
            className="w-full bg-gradient-to-r from-[#2FBF71] to-[#0077B6] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>
            <span>เริ่มเดินทาง</span>
          </button>
        </div>

        {/* Bottom padding for floating button on mobile */}
        <div className="h-24 md:h-8" />
      </div>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
    </Layout>
  );
};

export default RoutingPage;
