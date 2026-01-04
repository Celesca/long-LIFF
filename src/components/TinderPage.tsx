import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TinderCard from '../components/TinderCard';
import CityPreferenceModal from '../components/CityPreferenceModal';
import { api, type Place } from '../services/api';
import { getUserId } from '../hooks/useLiff';
import type { TravelPlace } from '../types/TravelPlace';

// Convert API Place to TravelPlace format for TinderCard compatibility
const mapPlaceToTravelPlace = (place: Place): TravelPlace => ({
  id: place.external_id,
  name: place.name,
  lat: place.latitude,
  long: place.longitude,
  image: place.image_url || '',
  description: place.description,
  country: place.country,
  rating: place.rating,
  distance: place.distance,
  tags: place.tags || [],
  backendId: place.id,
});

const TinderPage: React.FC = () => {
  const [places, setPlaces] = useState<(TravelPlace & { backendId?: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<TravelPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [useBackend, setUseBackend] = useState(true);

  const userId = getUserId();

  // Fetch places from backend
  const fetchPlaces = useCallback(async (cities: string[]) => {
    if (!userId) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Register/get user first
      await api.createOrGetUser(
        userId,
        localStorage.getItem('liff_displayName') || undefined,
        localStorage.getItem('liff_pictureUrl') || undefined
      );

      // Fetch tinder places (excludes already swiped)
      const response = await api.getTinderPlaces(userId, cities.length > 0 ? cities : undefined);
      const mappedPlaces = response.places.map(mapPlaceToTravelPlace);
      setPlaces(mappedPlaces);
      setCurrentIndex(0);

      // Fetch liked places
      const likedResponse = await api.getLikedPlaces(userId);
      const mappedLiked = likedResponse.places.map(mapPlaceToTravelPlace);
      setLikedPlaces(mappedLiked);

      setUseBackend(true);
    } catch (err) {
      console.error('Failed to fetch places from backend:', err);
      setError('Could not connect to server. Using offline mode.');
      setUseBackend(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fallback: Load from localStorage (offline mode)
  const loadFromLocalStorage = () => {
    const storageKey = userId ? `${userId}_likedPlaces` : 'likedPlaces';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setLikedPlaces(JSON.parse(saved));
    }
  };

  // Initial load - check if user has city preferences
  useEffect(() => {
    const checkPreferencesAndLoad = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const prefs = await api.getPreferences(userId);
        if (prefs.selected_cities && prefs.selected_cities.length > 0) {
          setSelectedCities(prefs.selected_cities);
          fetchPlaces(prefs.selected_cities);
        } else {
          setShowCityModal(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
        setShowCityModal(true);
        setLoading(false);
      }
    };

    checkPreferencesAndLoad();
  }, [userId, fetchPlaces]);

  // Handle city selection
  const handleCitySelection = async (cities: string[]) => {
    setSelectedCities(cities);
    setShowCityModal(false);

    if (userId) {
      try {
        await api.updatePreferences(userId, { selected_cities: cities });
      } catch (err) {
        console.error('Failed to save preferences:', err);
      }
    }

    fetchPlaces(cities);
  };

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const currentPlace = places[currentIndex];
    if (!currentPlace) return;

    // Record swipe in backend
    if (useBackend && userId && currentPlace.backendId) {
      try {
        await api.createSwipe(userId, currentPlace.backendId, direction);
      } catch (err) {
        console.error('Failed to record swipe:', err);
      }
    }

    if (direction === 'right') {
      setLikedPlaces(prev => {
        const updated = [...prev, currentPlace];
        const storageKey = userId ? `${userId}_likedPlaces` : 'likedPlaces';
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    }

    setCurrentIndex(prev => prev + 1);
  }, [places, currentIndex, useBackend, userId]);

  const handleButtonAction = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const remainingPlaces = places.slice(currentIndex, currentIndex + 2);
  const isFinished = currentIndex >= places.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-purple-800">Loading places...</h2>
          <p className="text-purple-600">Getting the best destinations for you</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && places.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-800">{error}</h2>
          <div className="space-y-3">
            <button
              onClick={() => fetchPlaces(selectedCities)}
              className="block w-full bg-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-600 transition-all"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="block w-full bg-white text-purple-600 py-3 px-6 rounded-xl font-semibold border-2 border-purple-200 hover:bg-purple-50 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Finished state
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          
          <h2 className="text-3xl font-bold text-purple-800">
            That's all for now!
          </h2>
          
          <p className="text-purple-600">
            You've explored all available destinations{selectedCities.length > 0 ? ` in ${selectedCities.join(', ')}` : ''}. Check out your gallery to see what you loved!
          </p>
          
          <div className="bg-white p-4 rounded-xl border border-purple-100">
            <div className="text-2xl font-bold text-purple-700">{likedPlaces.length}</div>
            <div className="text-sm text-purple-500">Places saved to gallery</div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowCityModal(true)}
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              🗺️ Explore Different Cities
            </button>
            
            <Link
              to="/gallery"
              className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              View My Gallery
            </Link>
            
            <Link
              to="/"
              className="block w-full bg-white text-purple-600 py-3 px-6 rounded-xl font-semibold border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <CityPreferenceModal
          isOpen={showCityModal}
          onClose={() => setShowCityModal(false)}
          onConfirm={handleCitySelection}
          initialCities={selectedCities}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Link 
          to="/"
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm sm:text-base">Back</span>
        </Link>
        
        {/* City Filter Button */}
        <button
          onClick={() => setShowCityModal(true)}
          className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-lg transition-colors"
        >
          <span className="text-sm">🗺️</span>
          <span className="font-medium text-purple-700 text-sm">
            {selectedCities.length === 0
              ? 'All Cities'
              : selectedCities.length === 1
              ? selectedCities[0]
              : `${selectedCities.length} Cities`}
          </span>
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <Link 
          to="/gallery"
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
        >
          <span className="font-medium text-sm sm:text-base">Gallery</span>
          <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {likedPlaces.length}
          </div>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-4 sm:px-6 mb-6 sm:mb-8">
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / places.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-purple-500">
          <span>{currentIndex + 1} of {places.length}</span>
          <span>{places.length - currentIndex - 1} remaining</span>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex justify-center items-start pt-8 sm:pt-12 min-h-[60vh] px-4 pb-32">
        <div className="relative flex justify-center items-center">
          {remainingPlaces.map((place, index) => (
            <TinderCard
              key={place.id}
              place={place}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4 sm:p-6">
        <div className="flex justify-center space-x-6 sm:space-x-8 max-w-sm mx-auto">
          <button
            onClick={() => handleButtonAction('left')}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg border-2 border-red-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={() => handleButtonAction('right')}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg border-2 border-green-200 flex items-center justify-center hover:border-green-300 hover:bg-green-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
        
        <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-purple-500">
          Swipe or tap to choose • ❤️ to save • ✕ to pass
        </div>
      </div>

      {/* City Preference Modal */}
      <CityPreferenceModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        onConfirm={handleCitySelection}
        initialCities={selectedCities}
      />
    </div>
  );
};

export default TinderPage;
