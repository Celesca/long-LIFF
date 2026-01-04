import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { useLiff } from '../hooks/useLiff';
import { CoinSystem, type ActiveJourney } from '../utils/coinSystem';

const featuredPlaces = [
  { 
    url: 'https://cms.dmpcdn.com/travel/2020/11/03/9d45da30-1dbc-11eb-9275-d9e61fe8653e_original.jpg', 
    name: 'Wat Umong', 
    city: 'Chiang Mai',
    category: 'Temple'
  },
  { 
    url: 'https://media.readthecloud.co/wp-content/uploads/2021/12/29133520/angkaew-11-750x500.jpg', 
    name: 'Ang Kaew', 
    city: 'Chiang Mai',
    category: 'Nature'
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ho_Kum_Luang_%28I%29.jpg', 
    name: 'Hor Kham Luang', 
    city: 'Chiang Mai',
    category: 'Palace'
  },
  { 
    url: 'https://res.cloudinary.com/pillarshotels/image/upload/f_auto/web/cms/resources/attractions/on-03-1500x1000-w1800h1360.jpeg', 
    name: 'One Nimman', 
    city: 'Chiang Mai',
    category: 'Shopping'
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/5dcac1b7f7b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg',
    name: 'Ginger Farm',
    city: 'Chiang Mai',
    category: 'Farm'
  },
];

const quickActions = [
  { icon: '🗺️', label: 'Explore', path: '/tinder', color: 'from-purple-500 to-indigo-600' },
  { icon: '❤️', label: 'Saved', path: '/gallery', color: 'from-pink-500 to-rose-600' },
  { icon: '🪙', label: 'Rewards', path: '/rewards', color: 'from-amber-400 to-orange-500' },
  { icon: '📜', label: 'History', path: '/history', color: 'from-teal-400 to-cyan-600' },
];

const LaunchPage: React.FC = () => {
  const { isLoggedIn, displayName, pictureUrl } = useLiff();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [activeJourney, setActiveJourney] = useState<ActiveJourney | null>(null);
  const [journeyProgress, setJourneyProgress] = useState({ visited: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Check for active journey
  useEffect(() => {
    const journey = CoinSystem.getActiveJourney();
    setActiveJourney(journey);
    if (journey) {
      setJourneyProgress(CoinSystem.getJourneyProgress());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % featuredPlaces.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout showHeader showCoinCounter>
      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center space-x-3 mb-3">
            {isLoggedIn && pictureUrl && (
              <img
                src={pictureUrl}
                alt={displayName || 'User'}
                className="w-12 h-12 rounded-full border-2 border-purple-200 shadow-md"
              />
            )}
            <div>
              <p className="text-gray-500 text-sm">{greeting}</p>
              <h2 className="text-xl font-bold text-gray-800">
                {isLoggedIn ? displayName || 'Traveler' : 'Welcome'}! 👋
              </h2>
            </div>
          </div>
          <p className="text-gray-600">มิติใหม่แห่งการท่องเที่ยวในไทย!</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 animate-slide-up">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-xl shadow-md mb-2`}>
                {action.icon}
              </div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Continue Your Travel Banner - Shows when there's an active journey */}
        {activeJourney && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">🚶‍♂️</span>
                    </div>
                    <div>
                      <p className="text-emerald-100 text-xs font-medium">ONGOING TRIP</p>
                      <h3 className="text-white font-bold text-lg">{activeJourney.city === 'all' ? 'Multi-City' : activeJourney.city}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Progress</p>
                    <p className="text-white font-bold text-xl">{journeyProgress.percentage}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${journeyProgress.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-white/90 text-sm mb-4">
                  <span>📍 {journeyProgress.visited}/{journeyProgress.total} places visited</span>
                  <span>⏱️ {activeJourney.duration}</span>
                </div>

                <button
                  onClick={() => navigate('/travel-companion')}
                  className="w-full bg-white text-emerald-600 py-3 px-6 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 flex items-center justify-center space-x-2"
                >
                  <span>Continue Your Journey</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Carousel */}
        <div className="mb-6 animate-fade-in-delayed">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Featured Places</h3>
            <Link to="/tinder" className="text-sm text-purple-600 font-medium">See all →</Link>
          </div>
          
          <div className="relative h-52 rounded-2xl overflow-hidden shadow-lg">
            {featuredPlaces.map((place, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentImageIndex 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-105'
                }`}
              >
                <img
                  src={place.url}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white mb-2">
                    {place.category}
                  </span>
                  <h4 className="text-white font-bold text-lg">{place.name}</h4>
                  <p className="text-white/80 text-sm">{place.city}</p>
                </div>
              </div>
            ))}
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 right-4 flex space-x-1.5">
              {featuredPlaces.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Start Exploring CTA */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 mb-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="text-white font-bold text-lg mb-1">Ready to explore?</h3>
              <p className="text-white/80 text-sm mb-3">Swipe through amazing destinations</p>
              <Link
                to="/tinder"
                className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                Start Swiping
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="text-5xl animate-bounce-slow">🗺️</div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">How it works</h3>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Swipe right', desc: 'to save places you love', icon: '👉', color: 'bg-green-100 text-green-600' },
              { step: 2, title: 'Build your list', desc: 'of favorite destinations', icon: '📋', color: 'bg-purple-100 text-purple-600' },
              { step: 3, title: 'Earn coins', desc: 'as you discover places', icon: '🪙', color: 'bg-amber-100 text-amber-600' },
              { step: 4, title: 'Redeem rewards', desc: 'for exclusive discounts', icon: '🎁', color: 'bg-pink-100 text-pink-600' },
            ].map((item) => (
              <div key={item.step} className="flex items-center p-3 bg-white rounded-xl shadow-sm">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-lg mr-3`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '20+', label: 'Places', icon: '📍' },
            { value: '8+', label: 'Rewards', icon: '🎁' },
            { value: '2', label: 'Cities', icon: '🏙️' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-purple-600">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom spacing for navbar */}
        <div className="h-4" />
      </div>
    </Layout>
  );
};

export default LaunchPage;
