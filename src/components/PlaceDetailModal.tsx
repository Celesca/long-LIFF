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
                        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-[#FFC857]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-sm font-semibold shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
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
                                <span>{[place.district, place.province || place.city, place.country].filter(Boolean).join(', ')}</span>
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
                                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#FFF4EC] text-[#FF6B4A]"
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
                            {(place.address || place.category) && (
                                <div className="mb-3 space-y-1 text-sm text-gray-700">
                                    {place.address && <p>{place.address}</p>}
                                    {place.category && <p className="text-[#0077B6]">{place.category}</p>}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-gray-700">
                                    <svg className="w-5 h-5 mr-2 text-[#FFC857]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                    <span className="text-sm">
                                        {place.lat.toFixed(4)}°N, {place.long.toFixed(4)}°E
                                    </span>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${place.lat},${place.long}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-[#0077B6] text-sm font-medium hover:text-[#00649A] active:scale-95 transition-all"
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
                                <svg className="w-5 h-5 mr-2 text-[#00A896]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m4.5 0V3.375c0-.621-.504-1.125-1.125-1.125H5.25c-.621 0-1.125.504-1.125 1.125v14.25"/></svg>
                                <span className="text-sm">ระยะทาง: {place.distance}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="border-t border-gray-100 p-4 bg-white">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all"
                    >
                        เข้าใจแล้ว
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetailModal;
