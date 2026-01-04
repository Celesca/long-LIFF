/**
 * Mock API Service - Simulates backend API using localStorage
 * For frontend-only Vercel deployment
 */

import type { TravelPlace } from '../types/TravelPlace';
import { allPlaces, rewards, getPlacesByCity, getAvailableCities, type Reward } from '../data/seedData';
import { getUserStorageKey } from '../hooks/useLiff';

// Storage keys
const STORAGE_KEYS = {
  SWIPES: 'swipes',
  LIKED_PLACES: 'likedPlaces',
  PREFERENCES: 'preferences',
  USER_PROFILE: 'userProfile',
  REDEEMED_REWARDS: 'redeemedRewards',
};

// Types
export interface UserPreference {
  selected_cities: string[];
  travel_personality?: string;
  preferred_tags: string[];
}

export interface UserStats {
  total_swipes: number;
  liked_places: number;
  disliked_places: number;
  total_coins: number;
  journeys_completed: number;
  photos_uploaded: number;
}

export interface SwipeRecord {
  placeId: string;
  direction: 'left' | 'right';
  timestamp: string;
}

// Helper to simulate async delay for realistic feel
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API that works entirely with localStorage
 */
export const mockApi = {
  // ============ User Management ============
  
  async createOrGetUser(userId: string): Promise<{ id: string; total_coins: number }> {
    await delay();
    const storageKey = getUserStorageKey('userProfile');
    let profile = localStorage.getItem(storageKey);
    
    if (!profile) {
      const newProfile = { totalCoins: 0, journeys: [], currentJourney: undefined };
      localStorage.setItem(storageKey, JSON.stringify(newProfile));
      return { id: userId, total_coins: 0 };
    }
    
    const parsed = JSON.parse(profile);
    return { id: userId, total_coins: parsed.totalCoins || 0 };
  },

  async getUserStats(userId: string): Promise<UserStats> {
    await delay();
    const swipesKey = getUserStorageKey(STORAGE_KEYS.SWIPES);
    const likedKey = getUserStorageKey(STORAGE_KEYS.LIKED_PLACES);
    const profileKey = getUserStorageKey('userProfile');
    
    const swipes: SwipeRecord[] = JSON.parse(localStorage.getItem(swipesKey) || '[]');
    const liked: TravelPlace[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
    const profile = JSON.parse(localStorage.getItem(profileKey) || '{"totalCoins":0,"journeys":[]}');
    
    const completedJourneys = (profile.journeys || []).filter((j: any) => j.completed).length;
    const totalPhotos = (profile.journeys || []).reduce((sum: number, j: any) => {
      return sum + (j.places || []).reduce((pSum: number, p: any) => pSum + (p.userPhotos?.length || 0), 0);
    }, 0);
    
    return {
      total_swipes: swipes.length,
      liked_places: liked.length,
      disliked_places: swipes.filter(s => s.direction === 'left').length,
      total_coins: profile.totalCoins || 0,
      journeys_completed: completedJourneys,
      photos_uploaded: totalPhotos
    };
  },

  // ============ Places ============
  
  async getPlaces(options?: { cities?: string[] }): Promise<{ places: TravelPlace[]; total: number }> {
    await delay();
    let places = allPlaces;
    
    if (options?.cities && options.cities.length > 0 && !options.cities.includes('all')) {
      places = allPlaces.filter(p => options.cities!.includes(p.city || ''));
    }
    
    return { places, total: places.length };
  },

  async getTinderPlaces(userId: string, cities?: string[]): Promise<{ places: TravelPlace[]; total: number }> {
    await delay();
    
    // Get swiped places
    const swipesKey = getUserStorageKey(STORAGE_KEYS.SWIPES);
    const swipes: SwipeRecord[] = JSON.parse(localStorage.getItem(swipesKey) || '[]');
    const swipedIds = new Set(swipes.map(s => s.placeId));
    
    // Filter places
    let places = allPlaces;
    if (cities && cities.length > 0 && !cities.includes('all')) {
      places = places.filter(p => cities.includes(p.city || ''));
    }
    
    // Exclude already swiped places
    places = places.filter(p => !swipedIds.has(p.id));
    
    // Shuffle for variety
    places = [...places].sort(() => Math.random() - 0.5);
    
    return { places, total: places.length };
  },

  async getAvailableCities(): Promise<{ cities: { name: string; place_count: number }[] }> {
    await delay();
    const cityNames = getAvailableCities();
    const cities = cityNames.map(name => ({
      name,
      place_count: getPlacesByCity(name).length
    }));
    return { cities };
  },

  // ============ Swipes ============
  
  async createSwipe(userId: string, placeId: string, direction: 'left' | 'right'): Promise<SwipeRecord> {
    await delay();
    
    const swipesKey = getUserStorageKey(STORAGE_KEYS.SWIPES);
    const swipes: SwipeRecord[] = JSON.parse(localStorage.getItem(swipesKey) || '[]');
    
    const newSwipe: SwipeRecord = {
      placeId,
      direction,
      timestamp: new Date().toISOString()
    };
    
    swipes.push(newSwipe);
    localStorage.setItem(swipesKey, JSON.stringify(swipes));
    
    // If liked, add to liked places
    if (direction === 'right') {
      const likedKey = getUserStorageKey(STORAGE_KEYS.LIKED_PLACES);
      const liked: TravelPlace[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
      const place = allPlaces.find(p => p.id === placeId);
      
      if (place && !liked.find(p => p.id === placeId)) {
        liked.push(place);
        localStorage.setItem(likedKey, JSON.stringify(liked));
      }
    }
    
    return newSwipe;
  },

  async getLikedPlaces(userId: string): Promise<{ places: TravelPlace[]; total: number }> {
    await delay();
    const likedKey = getUserStorageKey(STORAGE_KEYS.LIKED_PLACES);
    const liked: TravelPlace[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
    return { places: liked, total: liked.length };
  },

  async removeLikedPlace(userId: string, placeId: string): Promise<void> {
    await delay();
    const likedKey = getUserStorageKey(STORAGE_KEYS.LIKED_PLACES);
    let liked: TravelPlace[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
    liked = liked.filter(p => p.id !== placeId);
    localStorage.setItem(likedKey, JSON.stringify(liked));
  },

  async clearLikedPlaces(userId: string): Promise<void> {
    await delay();
    const likedKey = getUserStorageKey(STORAGE_KEYS.LIKED_PLACES);
    localStorage.setItem(likedKey, JSON.stringify([]));
  },

  // ============ Preferences ============
  
  async getPreferences(userId: string): Promise<UserPreference> {
    await delay();
    const prefKey = getUserStorageKey(STORAGE_KEYS.PREFERENCES);
    const prefs = localStorage.getItem(prefKey);
    
    if (prefs) {
      return JSON.parse(prefs);
    }
    
    return {
      selected_cities: [],
      travel_personality: undefined,
      preferred_tags: []
    };
  },

  async updatePreferences(userId: string, prefs: Partial<UserPreference>): Promise<UserPreference> {
    await delay();
    const prefKey = getUserStorageKey(STORAGE_KEYS.PREFERENCES);
    const existing = await this.getPreferences(userId);
    const updated = { ...existing, ...prefs };
    localStorage.setItem(prefKey, JSON.stringify(updated));
    return updated;
  },

  // ============ Rewards ============
  
  async getRewards(): Promise<{ rewards: Reward[]; total: number }> {
    await delay();
    return { rewards, total: rewards.length };
  },

  async getRedeemedRewards(userId: string): Promise<{ rewards: (Reward & { redeemedAt: string })[] }> {
    await delay();
    const redeemedKey = getUserStorageKey(STORAGE_KEYS.REDEEMED_REWARDS);
    const redeemed = JSON.parse(localStorage.getItem(redeemedKey) || '[]');
    return { rewards: redeemed };
  },

  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    await delay();
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }
    
    // Check user coins
    const profileKey = getUserStorageKey('userProfile');
    const profile = JSON.parse(localStorage.getItem(profileKey) || '{"totalCoins":0}');
    
    if (profile.totalCoins < reward.coinCost) {
      return { success: false, message: 'Not enough coins' };
    }
    
    // Deduct coins
    profile.totalCoins -= reward.coinCost;
    localStorage.setItem(profileKey, JSON.stringify(profile));
    
    // Save redeemed reward
    const redeemedKey = getUserStorageKey(STORAGE_KEYS.REDEEMED_REWARDS);
    const redeemed = JSON.parse(localStorage.getItem(redeemedKey) || '[]');
    redeemed.push({
      ...reward,
      redeemedAt: new Date().toISOString()
    });
    localStorage.setItem(redeemedKey, JSON.stringify(redeemed));
    
    return { success: true, message: `Reward redeemed! Your code is: ${reward.discountCode}` };
  },

  // ============ Reset (for testing) ============
  
  async resetAllData(userId: string): Promise<void> {
    await delay();
    Object.values(STORAGE_KEYS).forEach(key => {
      const storageKey = getUserStorageKey(key);
      localStorage.removeItem(storageKey);
    });
  }
};

export default mockApi;
