import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { poiApi, type PoiCluster } from '../services/poiApi';
import { geocodingApi, type GeocodingResult } from '../services/geocodingApi';

export interface DiscoveryLocation {
  lat: number;
  lng: number;
  label?: string;
  radiusKm: number;
}

interface LocationPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: DiscoveryLocation) => void;
  initialLocation?: DiscoveryLocation | null;
}

const DEFAULT_LOCATION: DiscoveryLocation = {
  lat: 15.87,
  lng: 100.9925,
  label: 'Thailand center',
  radiusKm: 50,
};

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PinController: React.FC<{ onPick: (lat: number, lng: number) => void }> = ({ onPick }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const RecenterMap: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);

  return null;
};

const LocationPreferenceModal: React.FC<LocationPreferenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}) => {
  const [location, setLocation] = useState<DiscoveryLocation>(initialLocation || DEFAULT_LOCATION);
  const [geoError, setGeoError] = useState('');
  const [clusters, setClusters] = useState<PoiCluster[]>([]);
  const [clustersLoading, setClustersLoading] = useState(false);
  const [clustersError, setClustersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocation(initialLocation || DEFAULT_LOCATION);
      setGeoError('');
      setClustersError('');
      setSearchQuery(initialLocation?.label || '');
      setSearchResults([]);
      setSearchError('');
    }
  }, [isOpen, initialLocation]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 3 || trimmedQuery === location.label?.trim()) {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const results = await geocodingApi.searchLocations(trimmedQuery, controller.signal);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('ไม่พบสถานที่นี้ ลองค้นหาด้วยชื่อเมืองหรือแลนด์มาร์กใกล้เคียง');
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
        console.error('Failed to geocode location:', error);
        setSearchError('ค้นหาพิกัดไม่สำเร็จ กรุณาลองใหม่หรือปักหมุดบนแผนที่');
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [isOpen, location.label, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadClusters = async () => {
      try {
        setClustersLoading(true);
        const response = await poiApi.getClusters({ limit: 8, minPlaces: 20 });
        if (isMounted) {
          setClusters(response.clusters);
        }
      } catch (error) {
        console.error('Failed to load POI clusters:', error);
        if (isMounted) {
          setClustersError('เปิด FastAPI backend เพื่อดูพื้นที่แนะนำจาก places.json');
        }
      } finally {
        if (isMounted) {
          setClustersLoading(false);
        }
      }
    };

    loadClusters();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const markerPosition = useMemo<[number, number]>(() => [location.lat, location.lng], [location.lat, location.lng]);

  const updateCoordinates = (lat: number, lng: number) => {
    setLocation((current) => ({
      ...current,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      label: 'Pinned location',
    }));
  };

  const selectSearchResult = (result: GeocodingResult) => {
    setLocation((current) => ({
      ...current,
      lat: result.lat,
      lng: result.lng,
      label: result.displayName,
    }));
    setSearchQuery(result.displayName);
    setSearchResults([]);
    setSearchError('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCoordinates(position.coords.latitude, position.coords.longitude);
        setGeoError('');
      },
      () => setGeoError('ไม่สามารถอ่านตำแหน่งปัจจุบันได้ กรุณาปักหมุดบนแผนที่แทน'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onConfirm(location);
    onClose();
  };

  const selectCluster = (cluster: PoiCluster) => {
    setLocation({
      lat: cluster.lat,
      lng: cluster.lng,
      label: cluster.label,
      radiusKm: cluster.radius_km,
    });
    setSearchQuery(cluster.label);
    setSearchResults([]);
    setSearchError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-[#DDEAF3] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#17324D]">ปักหมุดจุดที่อยากไป</h2>
              <p className="mt-1 text-sm text-[#4F6F87]">เลือกตำแหน่งบนแผนที่ แล้วเราจะหา POI จริงที่อยู่ใกล้จุดนั้นให้คุณปัด</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="ปิด"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5">
            <label className="block text-sm font-bold text-[#17324D]" htmlFor="location-search">
              ค้นหาสถานที่
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#DDEAF3] bg-white px-3 py-2 focus-within:border-[#FF6B4A]">
              <svg className="h-5 w-5 flex-shrink-0 text-[#FF6B4A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.606 10.606Z" />
              </svg>
              <input
                id="location-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="เช่น Siam Paragon, Chiang Mai, ภูเก็ต"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#17324D] outline-none placeholder:text-[#B8AEA7]"
              />
              {searchLoading && <span className="text-xs font-medium text-[#FF6B4A]">ค้นหา...</span>}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-[#DDEAF3] bg-white shadow-sm">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => selectSearchResult(result)}
                    className="block w-full border-b border-[#EDF6FB] px-4 py-3 text-left last:border-b-0 hover:bg-[#FFF4EC]"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-[#17324D]">{result.displayName}</p>
                    <p className="mt-1 text-xs text-[#8A958E]">{result.lat.toFixed(6)}, {result.lng.toFixed(6)}</p>
                  </button>
                ))}
              </div>
            )}

            {searchError && (
              <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{searchError}</div>
            )}

            <p className="mt-2 text-xs text-[#8A958E]">
              เลือกผลการค้นหาเพื่อย้ายหมุดและกรอก latitude/longitude อัตโนมัติ
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#17324D]">พื้นที่แนะนำจากข้อมูลจริง</h3>
                <p className="text-xs text-[#8A958E]">จัดกลุ่ม POI จาก places.json แล้วแนะนำจุดที่มีสถานที่หนาแน่น</p>
              </div>
              {clustersLoading && <span className="text-xs text-[#FF6B4A]">กำลังโหลด</span>}
            </div>

            {clustersError && (
              <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{clustersError}</div>
            )}

            {clusters.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {clusters.map((cluster) => (
                  <button
                    key={cluster.id}
                    onClick={() => selectCluster(cluster)}
                    className={`w-52 flex-shrink-0 overflow-hidden rounded-2xl border text-left transition ${
                      Math.abs(location.lat - cluster.lat) < 0.0001 && Math.abs(location.lng - cluster.lng) < 0.0001
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A]/20'
                        : 'border-[#DDEAF3] hover:border-[#FFC857]'
                    }`}
                  >
                    <div className="relative h-24 overflow-hidden bg-gradient-to-br from-[#0077B6] via-[#00A896] to-[#FF6B4A]">
                      <div className="absolute inset-0 flex items-center justify-center text-white/80">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317.159.69.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                        </svg>
                      </div>
                      {cluster.thumbnail_url ? (
                        <img
                          src={cluster.thumbnail_url}
                          alt={cluster.label}
                          className="relative h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0077B6] to-[#FF6B4A] text-white">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-[#17324D]">{cluster.label}</p>
                      <p className="text-xs text-[#4F6F87]">{cluster.place_count} POI • {cluster.image_count} รูป</p>
                      {cluster.category && <p className="mt-1 truncate text-xs text-[#FF6B4A]">{cluster.category}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-72 overflow-hidden rounded-2xl border border-[#DDEAF3]">
            <MapContainer center={markerPosition} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap position={markerPosition} />
              <PinController onPick={updateCoordinates} />
              <Marker position={markerPosition} />
            </MapContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-[#4F6F87]">
              Latitude
              <input
                type="number"
                step="0.000001"
                value={location.lat}
                onChange={(event) => setLocation((current) => ({ ...current, lat: Number(event.target.value) }))}
                className="mt-1 w-full rounded-xl border border-[#DDEAF3] px-3 py-2 text-[#17324D] outline-none focus:border-[#FF6B4A]"
              />
            </label>
            <label className="text-sm font-medium text-[#4F6F87]">
              Longitude
              <input
                type="number"
                step="0.000001"
                value={location.lng}
                onChange={(event) => setLocation((current) => ({ ...current, lng: Number(event.target.value) }))}
                className="mt-1 w-full rounded-xl border border-[#DDEAF3] px-3 py-2 text-[#17324D] outline-none focus:border-[#FF6B4A]"
              />
            </label>
          </div>

          <label className="mt-3 block text-sm font-medium text-[#4F6F87]">
            ระยะค้นหา: {location.radiusKm} km
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={location.radiusKm}
              onChange={(event) => setLocation((current) => ({ ...current, radiusKm: Number(event.target.value) }))}
              className="mt-2 w-full accent-[#FF6B4A]"
            />
          </label>

          {geoError && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{geoError}</div>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={useCurrentLocation}
              className="flex-1 rounded-xl border border-[#0077B6] px-4 py-3 text-sm font-semibold text-[#0077B6] hover:bg-[#0077B6]/5"
            >
              ใช้ตำแหน่งปัจจุบัน
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#E85336] px-4 py-3 text-sm font-semibold text-white shadow-md"
            >
              ค้นหา POI ใกล้หมุดนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPreferenceModal;
