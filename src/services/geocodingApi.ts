export interface GeocodingResult {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  importance?: number;
}

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
};

function normalizeResult(result: NominatimResult): GeocodingResult {
  return {
    id: String(result.place_id),
    displayName: result.display_name,
    lat: Number(Number(result.lat).toFixed(6)),
    lng: Number(Number(result.lon).toFixed(6)),
    type: result.type,
    importance: result.importance,
  };
}

class GeocodingApi {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  async searchLocations(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) return [];

    const params = new URLSearchParams({
      q: trimmedQuery,
      format: 'jsonv2',
      limit: '6',
      addressdetails: '1',
      'accept-language': 'th,en',
    });

    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, { signal });
    if (!response.ok) {
      throw new Error(`Geocoding failed with HTTP ${response.status}`);
    }

    const results = await response.json() as NominatimResult[];
    return results
      .map(normalizeResult)
      .filter((result) => Number.isFinite(result.lat) && Number.isFinite(result.lng));
  }
}

export const geocodingApi = new GeocodingApi();
