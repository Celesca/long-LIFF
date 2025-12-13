import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CoinCounter from './CoinCounter';
import { useLiff } from '../hooks/useLiff';

const chiangMaiImages = [
  { url: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg', name: 'Wat Umong' },
  { url: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg', name: 'Ang Kaew' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg', name: 'Hor Kham Luang' },
  { url: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg', name: 'One Nimman' },
  { url: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg', name: 'Ginger Farm' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/0e/cd/b2/caption.jpg?w=900&h=500&s=1', name: 'Mae Kha Canal' },
];

const LaunchPage: React.FC = () => {
  const { isLoggedIn, displayName, pictureUrl } = useLiff();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % chiangMaiImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-pink-200/40 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-indigo-200/40 rounded-full blur-3xl animate-float"></div>
        
        {/* Flying plane */}
        <div className="absolute top-20 animate-fly-across">
          <span className="text-4xl opacity-30">✈️</span>
        </div>
      </div>

      {/* Responsive Header for small screens (stacked above content) */}
      <div className="w-full z-10 mb-4 sm:hidden">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            {isLoggedIn && pictureUrl && (
              <img
                src={pictureUrl}
                alt={displayName || 'User'}
                className="w-10 h-10 rounded-full border-2 border-purple-300"
              />
            )}
            <span className="text-purple-800 font-medium">{isLoggedIn ? (displayName || 'User') : 'Welcome'}</span>
          </div>

          <div>
            <CoinCounter />
          </div>
        </div>
      </div>

      {/* User Profile - Top Left (desktop) */}
      {isLoggedIn && (
        <div className="hidden sm:flex fixed top-6 left-6 z-10 flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
          {pictureUrl && (
            <img
              src={pictureUrl}
              alt={displayName || 'User'}
              className="w-10 h-10 rounded-full border-2 border-purple-300"
            />
          )}
          <span className="text-purple-800 font-medium">{displayName || 'User'}</span>
        </div>
      )}

      {/* Coin Counter - Top Right (desktop) */}
      <div className="hidden sm:block fixed top-6 right-6 z-10 animate-fade-in">
        <CoinCounter />
      </div>

      <div className="text-center space-y-8 max-w-md relative z-10">
        {/* Logo/Icon with animation */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>

        {/* Title with gradient animation */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 animate-gradient-text">
            LONG
          </h1>
          <p className="text-purple-600 text-lg">
            Discover amazing places in Chiang Mai
          </p>
        </div>

        {/* Chiang Mai Image Gallery */}
        <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl animate-fade-in-delayed">
          {chiangMaiImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white font-medium">{img.name}</p>
              </div>
            </div>
          ))}
          
          {/* Image indicators */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {chiangMaiImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-700 leading-relaxed">
            Swipe through beautiful travel destinations in Chiang Mai, save your favorites, earn coins, and redeem exclusive discounts!
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-purple-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500">✕</span>
              </div>
              <span>Skip</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-heart-beat">
                <span className="text-green-500">♥</span>
              </div>
              <span>Love it</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 stagger-fade-in">
          <Link 
            to="/tinder"
            className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 ripple-effect"
          >
            🗺️ Start Exploring
          </Link>
          
          <Link 
            to="/gallery"
            className="block w-full bg-white text-purple-600 py-4 px-8 rounded-xl font-semibold text-lg border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-105 transition-all duration-200"
          >
            📸 View My Gallery
          </Link>

          <Link 
            to="/rewards"
            className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200"
          >
            🪙 Redeem Rewards
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-purple-100 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center card-hover-lift p-3 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">13+</div>
            <div className="text-sm text-purple-500">Places</div>
          </div>
          <div className="text-center card-hover-lift p-3 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">8+</div>
            <div className="text-sm text-purple-500">Rewards</div>
          </div>
          <div className="text-center card-hover-lift p-3 rounded-xl">
            <div className="text-2xl font-bold text-purple-700">∞</div>
            <div className="text-sm text-purple-500">Adventures</div>
          </div>
        </div>

        {/* Scrolling Gallery Preview */}
        <div className="overflow-hidden rounded-xl mt-4">
          <div className="flex animate-scroll-left">
            {[...chiangMaiImages, ...chiangMaiImages].map((img, index) => (
              <div key={index} className="flex-shrink-0 w-24 h-16 mx-1 rounded-lg overflow-hidden">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
