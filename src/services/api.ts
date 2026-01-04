/**
 * API Service for communicating with the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface Place {
  id: number;
  external_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  country: string;
  city: string;
  rating?: number;
  distance?: string;
  tags: string[];
  is_active: boolean;
}

export interface User {
  id: number;
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
  total_coins: number;
  created_at: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  selected_cities: string[];
  travel_personality?: string;
  preferred_tags: string[];
  updated_at: string;
}

export interface Swipe {
  id: number;
  user_id: number;
  place_id: number;
  direction: string;
  created_at: string;
}

export interface Journey {
  id: number;
  user_id: number;
  personality?: string;
  duration?: string;
  place_ids: number[];
  visited_place_ids: number[];
  total_coins_earned: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface Reward {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  coin_cost: number;
  category: string;
  discount_code?: string;
  valid_until?: string;
  location?: string;
  original_price?: string;
}

export interface City {
  name: string;
  place_count: number;
}

export interface UserStats {
  total_swipes: number;
  liked_places: number;
  disliked_places: number;
  total_coins: number;
  journeys_completed: number;
  photos_uploaded: number;
}

// API Client
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
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

  // ============ User Endpoints ============

  async createOrGetUser(lineUserId: string, displayName?: string, pictureUrl?: string): Promise<User> {
    return this.fetch<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        line_user_id: lineUserId,
        display_name: displayName,
        picture_url: pictureUrl,
      }),
    });
  }

  async getUser(lineUserId: string): Promise<User> {
    return this.fetch<User>(`/api/users/${lineUserId}`);
  }

  async getUserStats(lineUserId: string): Promise<UserStats> {
    return this.fetch<UserStats>(`/api/users/${lineUserId}/stats`);
  }

  // ============ Place Endpoints ============

  async getPlaces(options?: {
    city?: string;
    cities?: string[];
    tag?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ places: Place[]; total: number; page: number; per_page: number }> {
    const params = new URLSearchParams();
    if (options?.city) params.append('city', options.city);
    if (options?.cities?.length) params.append('cities', options.cities.join(','));
    if (options?.tag) params.append('tag', options.tag);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    const query = params.toString();
    return this.fetch(`/api/places${query ? `?${query}` : ''}`);
  }

  async getPlace(placeId: number): Promise<Place> {
    return this.fetch<Place>(`/api/places/${placeId}`);
  }

  async getAvailableCities(): Promise<{ cities: City[] }> {
    return this.fetch('/api/cities');
  }

  // ============ Tinder/Swipe Endpoints ============

  async getTinderPlaces(lineUserId: string, cities?: string[]): Promise<{ places: Place[]; total: number }> {
    const params = new URLSearchParams();
    if (cities?.length) params.append('cities', cities.join(','));
    const query = params.toString();
    return this.fetch(`/api/users/${lineUserId}/tinder-places${query ? `?${query}` : ''}`);
  }

  async createSwipe(lineUserId: string, placeId: number, direction: 'left' | 'right'): Promise<Swipe> {
    return this.fetch<Swipe>(`/api/users/${lineUserId}/swipes`, {
      method: 'POST',
      body: JSON.stringify({
        place_id: placeId,
        direction,
      }),
    });
  }

  async getLikedPlaces(lineUserId: string): Promise<{ places: Place[]; total: number }> {
    return this.fetch(`/api/users/${lineUserId}/liked-places`);
  }

  async removeLikedPlace(lineUserId: string, placeId: number): Promise<void> {
    await this.fetch(`/api/users/${lineUserId}/liked-places/${placeId}`, {
      method: 'DELETE',
    });
  }

  async clearLikedPlaces(lineUserId: string): Promise<void> {
    await this.fetch(`/api/users/${lineUserId}/liked-places`, {
      method: 'DELETE',
    });
  }

  // ============ Preference Endpoints ============

  async getPreferences(lineUserId: string): Promise<UserPreference> {
    return this.fetch<UserPreference>(`/api/users/${lineUserId}/preferences`);
  }

  async updatePreferences(
    lineUserId: string,
    preferences: {
      selected_cities?: string[];
      travel_personality?: string;
      preferred_tags?: string[];
    }
  ): Promise<UserPreference> {
    return this.fetch<UserPreference>(`/api/users/${lineUserId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // ============ Journey Endpoints ============

  async createJourney(
    lineUserId: string,
    personality: string,
    duration: string,
    placeIds: number[]
  ): Promise<Journey> {
    return this.fetch<Journey>(`/api/users/${lineUserId}/journeys`, {
      method: 'POST',
      body: JSON.stringify({
        personality,
        duration,
        place_ids: placeIds,
      }),
    });
  }

  async getCurrentJourney(lineUserId: string): Promise<Journey> {
    return this.fetch<Journey>(`/api/users/${lineUserId}/journeys/current`);
  }

  async markPlaceVisited(
    lineUserId: string,
    journeyId: number,
    placeId: number,
    photos: string[] = []
  ): Promise<{
    success: boolean;
    coins_earned: number;
    total_coins: number;
    journey_completed: boolean;
  }> {
    return this.fetch(`/api/users/${lineUserId}/journeys/${journeyId}/visit`, {
      method: 'POST',
      body: JSON.stringify({
        place_id: placeId,
        photos,
      }),
    });
  }

  // ============ Reward Endpoints ============

  async getRewards(): Promise<Reward[]> {
    return this.fetch<Reward[]>('/api/rewards');
  }

  async redeemReward(lineUserId: string, rewardId: number): Promise<{
    success: boolean;
    message: string;
    discount_code?: string;
    remaining_coins: number;
  }> {
    return this.fetch(`/api/users/${lineUserId}/rewards/redeem`, {
      method: 'POST',
      body: JSON.stringify({
        reward_id: rewardId,
      }),
    });
  }

  async getRedeemedRewards(lineUserId: string): Promise<Reward[]> {
    return this.fetch<Reward[]>(`/api/users/${lineUserId}/rewards/redeemed`);
  }

  // ============ Health Check ============

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/api/health');
  }
}

// Export singleton instance
export const api = new ApiService();

// Export class for custom instances
export default ApiService;
