import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import type { TravelPlace } from '../types/TravelPlace';

interface TinderCardProps {
  place: TravelPlace;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const TinderCard: React.FC<TinderCardProps> = ({ place, onSwipe, isTop }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  }));

  const bind = useDrag(
    (state: any) => {
      const { movement: [mx, my], direction: [xDir], down, velocity } = state;
      const trigger = Math.abs(mx) > 80 || (velocity > 0.5 && Math.abs(mx) > 50);
      const dir = xDir < 0 ? 'left' : 'right';
      
      if (!down && trigger) {
        onSwipe(dir);
        api.start({
          x: (200 + window.innerWidth) * (mx > 0 ? 1 : -1),
          y: my,
          rotate: mx / 10,
          scale: 1,
          config: { tension: 200, friction: 25 }
        });
      } else {
        api.start({
          x: down ? mx : 0,
          y: down ? my : 0,
          rotate: down ? mx / 12 : 0,
          scale: down ? 1.02 : 1,
          config: { tension: 500, friction: 30 }
        });
      }
    },
    { enabled: isTop, filterTaps: true, threshold: 10 }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        rotate,
        scale,
        touchAction: 'none',
      }}
      className={`absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden select-none ${
        isTop ? 'z-20 ring-1 ring-black/5' : 'z-10 opacity-60 scale-[0.92]'
      }`}
    >
      <div className="relative h-full">
        {/* Loading skeleton with shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
        )}
        
        <img
          src={place.image}
          alt={place.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Like indicator with animation */}
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(val / 60, 1)),
            scale: x.to((val: number) => 1 + Math.min(val / 200, 0.2)),
          }}
          className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-white/90">
            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="absolute -bottom-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">LIKE</span>
        </animated.div>
        
        {/* Skip indicator with animation */}
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(Math.abs(val) / 60, 1) * (val < 0 ? 1 : 0)),
            scale: x.to((val: number) => val < 0 ? 1 + Math.min(Math.abs(val) / 200, 0.2) : 1),
          }}
          className="absolute top-1/2 left-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-700 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-white/90">
            <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="absolute -bottom-2 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">NOPE</span>
        </animated.div>

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 via-40% to-transparent" />
        
        {/* Top gradient for better readability */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Category badge at top */}
        {place.tags && place.tags[0] && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800 shadow-lg">
              {place.tags[0]}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Rating & Distance Row */}
          <div className="flex items-center justify-between mb-2">
            {place.rating && (
              <div className="flex items-center space-x-1.5 bg-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white text-sm">⭐</span>
                <span className="font-bold text-sm">{place.rating}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-1.5 drop-shadow-lg tracking-tight">{place.name}</h3>
          
          {place.country && (
            <div className="flex items-center text-white/90 text-sm mb-3">
              <svg className="w-4 h-4 mr-1.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="font-medium">{place.country}</span>
            </div>
          )}
          
          <p className="text-sm text-white/85 mb-4 line-clamp-2 leading-relaxed">{place.description}</p>
          
          {/* Tags as pills */}
          {place.tags && place.tags.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {place.tags.slice(1, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white/95 border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </animated.div>
  );
};

export default TinderCard;
