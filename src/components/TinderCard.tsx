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
      className={`absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden select-none ${
        isTop ? 'z-20' : 'z-10 opacity-50 scale-95'
      }`}
    >
      <div className="relative h-full">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <img
          src={place.image}
          alt={place.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Swipe indicators */}
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(val / 60, 1)),
          }}
          className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </animated.div>
        
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(Math.abs(val) / 60, 1) * (val < 0 ? 1 : 0)),
          }}
          className="absolute top-1/2 left-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-gray-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </animated.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{place.name}</h3>
          
          {place.country && (
            <div className="flex items-center text-white/80 text-sm mb-2">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {place.country}
            </div>
          )}
          
          <p className="text-sm text-white/90 mb-3 line-clamp-2">{place.description}</p>
          
          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Rating */}
          {place.rating && (
            <div className="flex items-center mt-3 space-x-1">
              <span className="text-amber-400">⭐</span>
              <span className="font-semibold">{place.rating}</span>
              <span className="text-white/60 text-sm">คะแนน</span>
            </div>
          )}
        </div>
      </div>
    </animated.div>
  );
};

export default TinderCard;
