import type { TravelPlace } from '../types/TravelPlace';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PoiResponse {
  places: TravelPlace[];
  total: number;
  source_total: number;
}

export interface PoiCluster {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radius_km: number;
  place_count: number;
  image_count: number;
  province?: string;
  district?: string;
  category?: string;
  thumbnail_url?: string;
  sample_names: string[];
}

export interface PoiClusterResponse {
  clusters: PoiCluster[];
  total: number;
}

export interface UserPayload {
  line_user_id: string;
  display_name?: string | null;
  picture_url?: string | null;
}

export interface DiscoverySessionPayload {
  lat: number;
  lng: number;
  radius_km: number;
  label?: string;
  source?: string;
}

export interface RouteAnchor {
  lat: number;
  lng: number;
  radius_km: number;
  label?: string;
}

export interface RouteGeneratePayload {
  personality: string;
  duration: string;
  anchor?: RouteAnchor | null;
  liked_place_ids?: string[];
}

export interface RouteGenerateResponse {
  id: string;
  trip_name: string;
  description: string;
  provider: string;
  is_ai_generated: boolean;
  places: TravelPlace[];
  candidate_count: number;
  anchor?: RouteAnchor | null;
  reasoning?: string | null;
}

type RawPoi = TravelPlace & {
  longitude?: number;
  lng?: number;
  thumbnailUrl?: string | string[];
  thumbnail_url?: string;
  detailThumbnail?: string;
};

function firstImage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const found = value.find((item) => typeof item === 'string' && item);
    return found || '';
  }
  return '';
}

function resolveImageUrl(value: string): string {
  if (!value || !value.startsWith('/')) return value;
  return `${API_BASE_URL.replace(/\/$/, '')}${value}`;
}

function normalizePoi(place: RawPoi): TravelPlace {
  const image = resolveImageUrl(
    place.image ||
    place.thumbnail_url ||
    firstImage(place.thumbnailUrl) ||
    place.detailThumbnail ||
    firstImage(place.images),
  );

  const images = (place.images?.length ? place.images : image ? [image] : []).map(resolveImageUrl);

  return {
    ...place,
    long: place.long ?? place.longitude ?? place.lng ?? 0,
    image,
    thumbnail_url: resolveImageUrl(place.thumbnail_url || image),
    images,
  };
}

class PoiApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async fetchPoiResponse(endpoint: string): Promise<PoiResponse> {
    const response = await this.fetch<PoiResponse>(endpoint);

    return {
      ...response,
      places: response.places.map((place) => normalizePoi(place as RawPoi)),
    };
  }

  async getNearbyPlaces(options: {
    lat: number;
    lng: number;
    radiusKm?: number;
    limit?: number;
    excludeIds?: string[];
    imagesOnly?: boolean;
  }): Promise<PoiResponse> {
    const params = new URLSearchParams({
      lat: String(options.lat),
      lng: String(options.lng),
      radius_km: String(options.radiusKm ?? 25),
      limit: String(options.limit ?? 12),
    });

    if (options.excludeIds?.length) {
      params.set('exclude_ids', options.excludeIds.join(','));
    }
    if (options.imagesOnly) {
      params.set('images_only', 'true');
    }

    return this.fetchPoiResponse(`/api/pois/nearby?${params.toString()}`);
  }

  async searchPlaces(options: {
    query?: string;
    province?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PoiResponse> {
    const params = new URLSearchParams({
      limit: String(options.limit ?? 50),
      offset: String(options.offset ?? 0),
    });

    if (options.query) params.set('q', options.query);
    if (options.province) params.set('province', options.province);
    if (options.category) params.set('category', options.category);

    return this.fetchPoiResponse(`/api/pois?${params.toString()}`);
  }

  async getClusters(options: {
    limit?: number;
    minPlaces?: number;
    gridSize?: number;
  } = {}): Promise<PoiClusterResponse> {
    const params = new URLSearchParams({
      limit: String(options.limit ?? 12),
      min_places: String(options.minPlaces ?? 20),
      grid_size: String(options.gridSize ?? 0.25),
    });

    return this.fetch<PoiClusterResponse>(`/api/poi-clusters?${params.toString()}`);
  }

  async createOrGetUser(payload: UserPayload) {
    return this.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getLikedPlaces(lineUserId: string): Promise<PoiResponse> {
    return this.fetchPoiResponse(`/api/users/${encodeURIComponent(lineUserId)}/liked-places`);
  }

  async recordSwipe(lineUserId: string, place: TravelPlace, direction: 'left' | 'right') {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/swipes`, {
      method: 'POST',
      body: JSON.stringify({ place, direction, source: 'swipe' }),
    });
  }

  async getSwipes(lineUserId: string): Promise<{ swipes: { place_id: string; direction: 'left' | 'right'; created_at: string }[]; total: number }> {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/swipes`);
  }

  async clearSwipes(lineUserId: string) {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/swipes`, {
      method: 'DELETE',
    });
  }

  async removeLikedPlace(lineUserId: string, placeId: string) {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/liked-places/${encodeURIComponent(placeId)}`, {
      method: 'DELETE',
    });
  }

  async clearLikedPlaces(lineUserId: string) {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/liked-places`, {
      method: 'DELETE',
    });
  }

  async createDiscoverySession(lineUserId: string, payload: DiscoverySessionPayload) {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/discovery-sessions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getLatestDiscoverySession(lineUserId: string): Promise<(DiscoverySessionPayload & { id: string }) | null> {
    return this.fetch(`/api/users/${encodeURIComponent(lineUserId)}/discovery-sessions/latest`);
  }

  async generateRoute(lineUserId: string, payload: RouteGeneratePayload): Promise<RouteGenerateResponse> {
    const response = await this.fetch<RouteGenerateResponse>(`/api/users/${encodeURIComponent(lineUserId)}/routes/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      ...response,
      places: response.places.map((place) => normalizePoi(place as RawPoi)),
    };
  }
}

export const poiApi = new PoiApi();
export default poiApi;
