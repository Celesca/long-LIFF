import type { UserProfile, UserJourney } from '../types/TravelPlace';
import { getUserStorageKey } from '../hooks/useLiff';

export interface ActiveJourney {
  id: string;
  personality: string;
  duration: string;
  city: string;
  places: JourneyPlace[];
  startDate: string;
  isActive: boolean;
  currentPlaceIndex: number;
}

export interface JourneyPlace {
  id: string;
  name: string;
  description?: string;
  lat: number;
  long: number;
  rating?: number;
  image?: string;
  city?: string;
  visited: boolean;
  visitDate?: string;
  userPhotos: string[];
  coinsEarned: number;
}

export class CoinSystem {
  private static readonly PHOTO_UPLOAD_COINS = 10;
  private static readonly JOURNEY_COMPLETION_BONUS = 100;
  private static readonly ACTIVE_JOURNEY_KEY = 'activeJourney';

  static getUserProfile(): UserProfile {
    const storageKey = getUserStorageKey('userProfile');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalCoins: 0,
      journeys: [],
      currentJourney: undefined
    };
  }

  // Active Journey Management
  static getActiveJourney(): ActiveJourney | null {
    const storageKey = getUserStorageKey(this.ACTIVE_JOURNEY_KEY);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  static saveActiveJourney(journey: ActiveJourney): void {
    const storageKey = getUserStorageKey(this.ACTIVE_JOURNEY_KEY);
    localStorage.setItem(storageKey, JSON.stringify(journey));
  }

  static startActiveJourney(personality: string, duration: string, city: string, places: any[]): ActiveJourney {
    const journey: ActiveJourney = {
      id: Date.now().toString(),
      personality,
      duration,
      city,
      places: places.map(place => ({
        id: place.id,
        name: place.name,
        description: place.description,
        lat: place.lat,
        long: place.long,
        rating: place.rating,
        image: place.image,
        city: place.city,
        visited: false,
        userPhotos: [],
        coinsEarned: 0
      })),
      startDate: new Date().toISOString(),
      isActive: true,
      currentPlaceIndex: 0
    };

    this.saveActiveJourney(journey);
    return journey;
  }

  static updateActiveJourneyPlace(placeId: string, updates: Partial<JourneyPlace>): ActiveJourney | null {
    const journey = this.getActiveJourney();
    if (!journey) return null;

    const placeIndex = journey.places.findIndex(p => p.id === placeId);
    if (placeIndex === -1) return journey;

    journey.places[placeIndex] = { ...journey.places[placeIndex], ...updates };
    
    // Auto-advance current place index if current place is visited
    if (updates.visited && placeIndex === journey.currentPlaceIndex) {
      const nextUnvisited = journey.places.findIndex((p, i) => i > placeIndex && !p.visited);
      if (nextUnvisited !== -1) {
        journey.currentPlaceIndex = nextUnvisited;
      }
    }

    this.saveActiveJourney(journey);
    return journey;
  }

  static setCurrentPlaceIndex(index: number): void {
    const journey = this.getActiveJourney();
    if (!journey) return;
    journey.currentPlaceIndex = index;
    this.saveActiveJourney(journey);
  }

  static endActiveJourney(): void {
    const storageKey = getUserStorageKey(this.ACTIVE_JOURNEY_KEY);
    localStorage.removeItem(storageKey);
  }

  static isJourneyComplete(): boolean {
    const journey = this.getActiveJourney();
    if (!journey) return false;
    return journey.places.every(p => p.visited);
  }

  static getJourneyProgress(): { visited: number; total: number; percentage: number } {
    const journey = this.getActiveJourney();
    if (!journey) return { visited: 0, total: 0, percentage: 0 };
    
    const visited = journey.places.filter(p => p.visited).length;
    const total = journey.places.length;
    return {
      visited,
      total,
      percentage: total > 0 ? Math.round((visited / total) * 100) : 0
    };
  }

  static saveUserProfile(profile: UserProfile): void {
    const storageKey = getUserStorageKey('userProfile');
    localStorage.setItem(storageKey, JSON.stringify(profile));
  }

  static markPlaceAsVisited(placeId: string, userPhotos: string[] = []): number {
    const profile = this.getUserProfile();
    if (!profile.currentJourney) return 0;

    const place = profile.currentJourney.places.find(p => p.id === placeId);
    if (!place || place.visited) return 0;

    place.visited = true;
    place.visitDate = new Date().toISOString();
    place.userPhotos = userPhotos;
    
    // Only earn coins from photo uploads, not from visiting
    let coinsEarned = 0;
    if (userPhotos.length > 0) {
      coinsEarned = this.PHOTO_UPLOAD_COINS * userPhotos.length;
    }
    
    place.coinsEarned = coinsEarned;
    profile.totalCoins += coinsEarned;

    // Check if journey is completed
    const allVisited = profile.currentJourney.places.every(p => p.visited);
    if (allVisited && !profile.currentJourney.completed) {
      profile.currentJourney.completed = true;
      profile.totalCoins += this.JOURNEY_COMPLETION_BONUS;
      coinsEarned += this.JOURNEY_COMPLETION_BONUS;
    }

    this.saveUserProfile(profile);
    return coinsEarned;
  }

  static createNewJourney(personality: string, duration: string, places: any[]): UserJourney {
    const profile = this.getUserProfile();
    
    const journey: UserJourney = {
      id: Date.now().toString(),
      personality,
      duration,
      places: places.map(place => ({
        ...place,
        visited: false,
        userPhotos: [],
        coinsEarned: 0
      })),
      totalCoins: 0,
      startDate: new Date().toISOString(),
      completed: false
    };

    profile.currentJourney = journey;
    this.saveUserProfile(profile);
    return journey;
  }

  static getCurrentJourney(): UserJourney | undefined {
    const profile = this.getUserProfile();
    return profile.currentJourney;
  }

  static addPhotoToPlace(placeId: string, photoDataUrl: string): void {
    const profile = this.getUserProfile();
    if (!profile.currentJourney) return;

    const place = profile.currentJourney.places.find(p => p.id === placeId);
    if (place) {
      place.userPhotos.push(photoDataUrl);
      this.saveUserProfile(profile);
    }
  }
}
