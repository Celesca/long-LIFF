import axios from 'axios';

const API_Base = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_Base,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface UserPreferences {
    personality: string;
    trip_duration: string;
    location_filter?: string; // "Bangkok", "Chiang Mai", "All"
}

export const userService = {
    createOrUpdateUser: async (userData: any) => {
        const response = await api.post('/user', userData);
        return response.data;
    },
    getUser: async (liffId: string) => {
        const response = await api.get(`/user/${liffId}`);
        return response.data;
    },
};

export const placeService = {
    getPlaces: async (province?: string, category?: string) => {
        const params = new URLSearchParams();
        if (province && province !== 'All') params.append('province', province);
        if (category) params.append('category', category);

        const response = await api.get(`/places?${params.toString()}`);
        return response.data;
    },

    seedPlaces: async () => {
        const response = await api.post('/places/seed');
        return response.data;
    }
};

export const tripService = {
    generateTrip: async (preferences: UserPreferences, likedPlaceIds: string[]) => {
        const response = await api.post('/trip/generate', {
            user_preferences: preferences,
            liked_place_ids: likedPlaceIds,
        });
        return response.data;
    },
};
