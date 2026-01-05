import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

interface City {
  name: string;
  place_count: number;
}

interface CityPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCities: string[]) => void;
  initialCities?: string[];
}

const CityPreferenceModal: React.FC<CityPreferenceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialCities = [],
}) => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedCities(initialCities);
  }, [initialCities]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApi.getAvailableCities();
      setAvailableCities(response.cities);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setError('Failed to load cities. Please try again.');
      // Fallback to hardcoded cities
      setAvailableCities([
        { name: 'Bangkok', place_count: 12 },
        { name: 'Chiang Mai', place_count: 12 },
        { name: 'Phuket', place_count: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities((prev) => {
      if (prev.includes(cityName)) {
        return prev.filter((c) => c !== cityName);
      } else {
        return [...prev, cityName];
      }
    });
  };

  const selectAll = () => {
    setSelectedCities(availableCities.map((c) => c.name));
  };

  const clearAll = () => {
    setSelectedCities([]);
  };

  const handleConfirm = () => {
    // If nothing selected, select all
    const citiesToUse = selectedCities.length === 0 
      ? availableCities.map((c) => c.name) 
      : selectedCities;
    onConfirm(citiesToUse);
    onClose();
  };

  if (!isOpen) return null;

  const cityEmojis: Record<string, string> = {
    'Chiang Mai': '🏔️',
    'Bangkok': '🏙️',
    'Phuket': '🏖️',
    'Pattaya': '🌴',
    'Krabi': '🪸',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-800">
              🗺️ เลือกจุดหมายปลายทาง
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-purple-600 mt-2">
            เลือกเมืองที่คุณต้องการสำรวจ คุณสามารถเลือกหลายเมือง
            หรือสำรวจทั่วประเทศไทย!
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-purple-600">กำลังโหลดเมือง...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCities}
                className="mt-4 text-purple-600 hover:text-purple-700 underline"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="flex justify-between mb-4">
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-600 font-medium"
                >
                  ล้างทั้งหมด
                </button>
              </div>

              {/* City Grid */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {availableCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => toggleCity(city.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      selectedCities.includes(city.name)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {cityEmojis[city.name] || '📍'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-purple-800">
                            {city.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {city.place_count} สถานที่ให้สำรวจ
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          selectedCities.includes(city.name)
                            ? 'bg-purple-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        {selectedCities.includes(city.name) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* All Cities Option */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇹🇭</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-800">
                      สำรวจทั่วประเทศไทย
                    </h4>
                    <p className="text-sm text-purple-600">
                      {selectedCities.length === 0 ||
                      selectedCities.length === availableCities.length
                        ? 'เลือกทุกเมืองแล้ว - หลากหลายสุด!'
                        : `${selectedCities.length} จาก ${availableCities.length} เมืองที่เลือก`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                {selectedCities.length === 0
                  ? 'สำรวจทุกเมือง'
                  : `สำรวจ ${selectedCities.length} ${
                      selectedCities.length === 1 ? 'เมือง' : 'เมือง'
                    }`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityPreferenceModal;
