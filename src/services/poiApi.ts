import type { TravelPlace } from '../types/TravelPlace';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PoiResponse {
  places: TravelPlace[];
  total: number;
  source_total: number;
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

  async getNearbyPlaces(options: {
    lat: number;
    lng: number;
    radiusKm?: number;
    limit?: number;
    excludeIds?: string[];
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

    return this.fetch<PoiResponse>(`/api/pois/nearby?${params.toString()}`);
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

    return this.fetch<PoiResponse>(`/api/pois?${params.toString()}`);
  }
}

export const poiApi = new PoiApi();
export default poiApi;
