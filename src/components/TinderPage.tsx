import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TinderCard from '../components/TinderCard';
import { placeService, userService } from '../utils/api'; // Import API service
import { useLiff } from '../hooks/useLiff';

// Define type locally or import from types/TravelPlace
// Adapting API Place to frontend Place
interface Place {
  id: string; // MongoDB _id
  name: string;
  description: string;
  image_url: string;
  province?: string;
  category?: string;
  // compatibility with TinderCard which expects specific fields?
  // TinderCard expects { id, name, description, image_url, province, tags }
}

const TinderPage: React.FC = () => {
  const { userId } = useLiff();
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch places from backend
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await placeService.getPlaces();
        // Transform _id to id if needed
        const mappedPlaces = data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          tags: [p.province, p.category].filter(Boolean)
        }));

        // If no places, suggest seeding
        if (mappedPlaces.length === 0) {
          await placeService.seedPlaces();
          const seededData = await placeService.getPlaces();
          setPlaces(seededData.map((p: any) => ({ ...p, id: p._id, tags: [p.province, p.category] })));
        } else {
          setPlaces(mappedPlaces);
        }
      } catch (error) {
        console.error("Failed to fetch places:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentPlace = places[currentIndex];

    if (direction === 'right' && currentPlace) {
      const newLiked = [...likedPlaces, currentPlace];
      setLikedPlaces(newLiked);

      // Save to backend immediately (or can batch)
      if (userId) {
        // We append the new like to the user's liked list
        // Since our update_user endpoint replaces list, we really should fetch first or append on backend.
        // For this demo, let's just send the whole list or create a specific endpoint. 
        // Using the generic update for now (optimistic) with the accumulate list
        userService.createOrUpdateUser({
          liff_user_id: userId,
          liked_places: newLiked.map(p => p.id)
        }).catch(e => console.error(e));
      }
      // Also save to localStorage as backup/for GalleryPage
      localStorage.setItem('likedPlaces', JSON.stringify(newLiked));
    }

    setCurrentIndex(prev => prev + 1);
  }, [places, currentIndex, likedPlaces, userId]);

  const handleButtonAction = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const remainingPlaces = places.slice(currentIndex, currentIndex + 2);
  const isFinished = !isLoading && currentIndex >= places.length;

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-purple-600">Loading places...</div>;
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6">
        {/* ... (Existing finished UI) ... */}
        <div className="text-center space-y-6 max-w-md">
          {/* ... Copy existing UI or simplify ... */}
          <h2 className="text-3xl font-bold text-purple-800">That's all for now!</h2>
          <p className="text-purple-600">You've explored all available destinations.</p>
          <Link to="/gallery" className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold">
            View My Gallery
          </Link>
          <Link to="/routing" className="block w-full bg-white text-purple-600 py-3 px-6 rounded-xl border border-purple-200">
            Plan My Trip
          </Link>
        </div>
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

        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-purple-800">LONG</div>
        </div>

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
      </div>

      {/* Cards container */}
      <div className="flex justify-center items-start pt-8 sm:pt-12 min-h-[60vh] px-4 pb-32">
        <div className="relative flex justify-center items-center">
          {remainingPlaces.map((place, index) => (
            <TinderCard
              key={place.id}
              place={place as any} // Cast to any to match expected props if generic
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
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-purple-500">
          Swipe or tap to choose • ❤️ to save • ✕ to pass
        </div>
      </div>
    </div>
  );
};

export default TinderPage;
