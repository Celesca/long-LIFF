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
  const [imageLoaded, setImageLoaded] = useState(!place.image);
  const [imageFailed, setImageFailed] = useState(!place.image);

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
      style={{ x, y, rotate, scale, touchAction: 'none' }}
      className={`absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden select-none ${
        isTop ? 'z-20 ring-1 ring-[#E8E2DB]' : 'z-10 opacity-50 scale-[0.94]'
      }`}
    >
      <div className="relative h-full">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}

        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D6A6A] via-[#6B8F71] to-[#C2703E] p-8 text-center text-white">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/18 backdrop-blur-sm">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">{place.category || place.tags?.[0] || 'POI'}</p>
            </div>
          </div>
        ) : (
          <img
            src={place.image}
            alt={place.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            draggable={false}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageFailed(true);
              setImageLoaded(true);
            }}
          />
        )}

        {/* Like indicator */}
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(val / 60, 1)),
            scale: x.to((val: number) => 1 + Math.min(val / 200, 0.15)),
          }}
          className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-[#4D8B5C] rounded-full flex items-center justify-center shadow-xl border-4 border-white/90">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <span className="absolute -bottom-2 bg-[#4D8B5C] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">Like</span>
        </animated.div>

        {/* Skip indicator */}
        <animated.div
          style={{
            opacity: x.to((val: number) => Math.min(Math.abs(val) / 60, 1) * (val < 0 ? 1 : 0)),
            scale: x.to((val: number) => val < 0 ? 1 + Math.min(Math.abs(val) / 200, 0.15) : 1),
          }}
          className="absolute top-1/2 left-6 -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-[#8B7D74] rounded-full flex items-center justify-center shadow-xl border-4 border-white/90">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="absolute -bottom-2 bg-[#8B7D74] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">Nope</span>
        </animated.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-40% to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

        {/* Category badge */}
        {(place.category || place.tags?.[0]) && (
          <div className="absolute top-4 left-4">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-[#2D2926] shadow-sm">
              {place.category || place.tags[0]}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {/* Rating */}
          {place.rating && (
            <div className="flex items-center space-x-1 bg-[#D4A853]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg w-fit mb-2">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
              </svg>
              <span className="font-semibold text-sm">{place.rating}</span>
            </div>
          )}

          <h3 className="text-2xl font-bold mb-1 drop-shadow-md tracking-tight">{place.name}</h3>

          {(place.province || place.city || place.country) && (
            <div className="flex items-center text-white/80 text-sm mb-2.5">
              <svg className="w-3.5 h-3.5 mr-1 text-[#D4A853]" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{[place.district, place.province || place.city, place.country].filter(Boolean).join(', ')}</span>
            </div>
          )}

          <p className="text-sm text-white/75 mb-3 line-clamp-2 leading-relaxed">{place.description}</p>

          {/* Tags */}
          {place.tags && place.tags.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.slice(1, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/12 backdrop-blur-sm text-white/90 border border-white/15"
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
