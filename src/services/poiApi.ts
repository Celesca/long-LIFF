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

function normalizePoi(place: RawPoi): TravelPlace {
  const image =
    place.image ||
    place.thumbnail_url ||
    firstImage(place.thumbnailUrl) ||
    place.detailThumbnail ||
    firstImage(place.images);

  return {
    ...place,
    long: place.long ?? place.longitude ?? place.lng ?? 0,
    image,
    thumbnail_url: place.thumbnail_url || image,
    images: place.images?.length ? place.images : image ? [image] : [],
  };
}

class PoiApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

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
}

export const poiApi = new PoiApi();
export default poiApi;
