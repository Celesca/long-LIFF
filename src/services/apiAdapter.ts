/**
 * API Adapter - Bridges between the Go backend API and the frontend's TravelPlace types.
 * When USE_REAL_API is true, calls the Go backend; otherwise falls back to mockApi (localStorage).
 */

import { api, type Place } from './api';
import { mockApi } from './mockApi';
import type { TravelPlace } from '../types/TravelPlace';

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

/** Convert backend Place to frontend TravelPlace */
function toTravelPlace(p: Place): TravelPlace {
  return {
    id: p.external_id || String(p.id),
    name: p.name,
    lat: p.latitude,
    long: p.longitude,
    image: p.image_url || '',
    description: p.description,
    country: p.country,
    city: p.city,
    rating: p.rating,
    distance: p.distance,
    tags: p.tags || [],
    backendId: p.id,
  };
}

/**
 * Unified API service that delegates to real or mock backend.
 * Keeps the same interface that components expect from mockApi.
 */
export const appApi = {
  // ============ User ============

  async createOrGetUser(userId: string): Promise<{ id: string; total_coins: number }> {
    if (!USE_REAL_API) return mockApi.createOrGetUser(userId);
    const user = await api.createOrGetUser(userId);
    return { id: user.line_user_id, total_coins: user.total_coins };
  },

  // ============ Cities ============

  async getAvailableCities(): Promise<{ cities: { name: string; place_count: number }[] }> {
    if (!USE_REAL_API) return mockApi.getAvailableCities();
    return api.getAvailableCities();
  },

  // ============ Tinder / Swipe ============

  async getTinderPlaces(userId: string, cities?: string[]): Promise<{ places: TravelPlace[]; total: number }> {
    if (!USE_REAL_API) return mockApi.getTinderPlaces(userId, cities);
    const resp = await api.getTinderPlaces(userId, cities);
    return { places: resp.places.map(toTravelPlace), total: resp.total };
  },

  async createSwipe(userId: string, placeId: string, direction: 'left' | 'right', backendId?: number): Promise<void> {
    if (!USE_REAL_API) {
      await mockApi.createSwipe(userId, placeId, direction);
      return;
    }
    const numId = backendId || parseInt(placeId, 10);
    await api.createSwipe(userId, numId, direction);
  },

  // ============ Liked Places ============

  async getLikedPlaces(userId: string): Promise<{ places: TravelPlace[]; total: number }> {
    if (!USE_REAL_API) return mockApi.getLikedPlaces(userId);
    const resp = await api.getLikedPlaces(userId);
    return { places: resp.places.map(toTravelPlace), total: resp.total };
  },

  async removeLikedPlace(userId: string, placeId: string, backendId?: number): Promise<void> {
    if (!USE_REAL_API) {
      await mockApi.removeLikedPlace(userId, placeId);
      return;
    }
    const numId = backendId || parseInt(placeId, 10);
    await api.removeLikedPlace(userId, numId);
  },

  async clearLikedPlaces(userId: string): Promise<void> {
    if (!USE_REAL_API) {
      await mockApi.clearLikedPlaces(userId);
      return;
    }
    await api.clearLikedPlaces(userId);
  },

  async resetAllProgress(userId: string): Promise<void> {
    if (!USE_REAL_API) {
      await mockApi.resetAllProgress(userId);
      return;
    }
    // On real backend, clearing liked places effectively resets swipe progress
    await api.clearLikedPlaces(userId);
  },

  // ============ Preferences ============

  async getPreferences(userId: string) {
    if (!USE_REAL_API) return mockApi.getPreferences(userId);
    return api.getPreferences(userId);
  },

  async updatePreferences(userId: string, prefs: { selected_cities?: string[]; travel_personality?: string; preferred_tags?: string[] }) {
    if (!USE_REAL_API) return mockApi.updatePreferences(userId, prefs);
    return api.updatePreferences(userId, prefs);
  },

  // ============ Rewards ============

  async getRewards() {
    if (!USE_REAL_API) return mockApi.getRewards();
    return api.getRewards();
  },

  async redeemReward(userId: string, rewardId: number | string) {
    if (!USE_REAL_API) return mockApi.redeemReward(userId, String(rewardId));
    return api.redeemReward(userId, typeof rewardId === 'string' ? parseInt(rewardId, 10) : rewardId);
  },

  async getRedeemedRewards(userId: string) {
    if (!USE_REAL_API) return mockApi.getRedeemedRewards(userId);
    return api.getRedeemedRewards(userId);
  },

  // ============ Stats ============

  async getUserStats(userId: string) {
    if (!USE_REAL_API) return mockApi.getUserStats(userId);
    return api.getUserStats(userId);
  },

  // ============ Health ============

  async healthCheck() {
    if (!USE_REAL_API) return { status: 'ok (mock)', timestamp: new Date().toISOString() };
    return api.healthCheck();
  },
};

export default appApi;
