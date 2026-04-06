import React, { useState, useEffect } from 'react';
import { appApi } from '../services/apiAdapter';

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
      const response = await appApi.getAvailableCities();
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

  const CityIcon: React.FC<{ city: string }> = ({ city }) => {
    switch (city) {
      case 'Chiang Mai':
        return <svg className="w-6 h-6 text-[#6B8F71]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"/></svg>;
      case 'Bangkok':
        return <svg className="w-6 h-6 text-[#C2703E]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21"/></svg>;
      case 'Phuket':
        return <svg className="w-6 h-6 text-[#2D6A6A]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>;
      default:
        return <svg className="w-6 h-6 text-[#D4A853]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[#E8E2DB]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#2D2926]">
              เลือกจุดหมายปลายทาง
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
          <p className="text-[#C2703E] mt-2">
            เลือกเมืองที่คุณต้องการสำรวจ คุณสามารถเลือกหลายเมือง
            หรือสำรวจทั่วประเทศไทย!
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto border-4 border-[#D4C5B5] border-t-[#C2703E] rounded-full animate-spin"></div>
              <p className="mt-4 text-[#C2703E]">กำลังโหลดเมือง...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCities}
                className="mt-4 text-[#C2703E] hover:text-[#A85C2F] underline"
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
                  className="text-sm text-[#C2703E] hover:text-[#A85C2F] font-medium"
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
                        ? 'border-[#C2703E] bg-[#FDF5EF]'
                        : 'border-gray-200 hover:border-[#D4A853]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CityIcon city={city.name} />
                        <div>
                          <h4 className="font-semibold text-[#2D2926]">
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
                            ? 'bg-[#FDF5EF]0'
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
              <div className="mb-6 p-4 bg-gradient-to-r from-[#FDF5EF] to-[#FAF0E6] rounded-xl">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-[#C2703E]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#2D2926]">
                      สำรวจทั่วประเทศไทย
                    </h4>
                    <p className="text-sm text-[#C2703E]">
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
                className="w-full bg-gradient-to-r from-[#C2703E] to-[#A85C2F] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#A85C2F] hover:to-[#8F4E28] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
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
