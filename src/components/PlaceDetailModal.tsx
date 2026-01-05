import React from 'react';
import type { TravelPlace } from '../types/TravelPlace';

interface PlaceDetailModalProps {
    place: TravelPlace | null;
    isOpen: boolean;
    onClose: () => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, isOpen, onClose }) => {
    if (!isOpen || !place) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Slide up from bottom */}
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up safe-area-bottom">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Hero Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Rating badge */}
                    {place.rating && (
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-sm font-semibold shadow-lg">
                            <span>⭐</span>
                            <span>{place.rating}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[calc(85vh-14rem)]">
                    {/* Title and Location */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{place.name}</h2>
                        {(place.city || place.country) && (
                            <div className="flex items-center text-gray-500 text-sm">
                                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span>{[place.city, place.country].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">หมวดหมู่</h3>
                            <div className="flex flex-wrap gap-2">
                                {place.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {place.description && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">รายละเอียด</h3>
                            <p className="text-gray-700 leading-relaxed">{place.description}</p>
                        </div>
                    )}

                    {/* Location Info */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">ที่ตั้ง</h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-700">
                                    <span className="text-lg mr-2">📍</span>
                                    <span className="text-sm">
                                        {place.lat.toFixed(4)}°N, {place.long.toFixed(4)}°E
                                    </span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${place.lat},${place.long}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 active:scale-95 transition-all"
                                >
                                    <span>ดูแผนที่</span>
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Distance if available */}
                    {place.distance && (
                        <div className="mb-4">
                            <div className="flex items-center text-gray-600">
                                <span className="text-lg mr-2">🚗</span>
                                <span className="text-sm">ระยะทาง: {place.distance}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="border-t border-gray-100 p-4 bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                    >
                        เข้าใจแล้ว
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetailModal;
