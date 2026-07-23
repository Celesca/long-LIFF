import React from 'react';
import LocationPreferenceModal, { type DiscoveryLocation } from './LocationPreferenceModal';
import { USE_MOCK_DATA } from '../services/dataMode';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personality: string, duration: string, anchor?: { lat: number; lng: number; radius_km: number; label?: string } | null) => void;
}

const PersonalityModal: React.FC<PersonalityModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedPersonality, setSelectedPersonality] = React.useState<string>('');
  const [selectedDuration, setSelectedDuration] = React.useState<string>('');
  const [selectedAnchor, setSelectedAnchor] = React.useState<DiscoveryLocation | null>(null);
  const [showLocationModal, setShowLocationModal] = React.useState(false);

  const personalities = [
    {
      id: 'introvert mode',
      name: 'โหมดสงบ Introvert',
      description: 'สถานที่สงบ ไม่แออัด เช่น วัดและธรรมชาติ',
      icon: 'calm'
    },
    {
      id: 'extrovert mode',
      name: 'โหมดสังสรรค์ Extrovert',
      description: 'ตลาดคึกคัก จุดสังสรรค์ และสถานที่มีชีวิตชีวา',
      icon: 'social'
    },
    {
      id: 'adventure mode',
      name: 'โหมดผจญภัย',
      description: 'กิจกรรมตื่นเต้นและประสบการณ์กลางแจ้ง',
      icon: 'adventure'
    }
  ];

  const durations = [
    {
      id: '1 วัน ไม่ค้างคืน',
      name: '1 วัน ไม่ค้างคืน',
      description: 'เดย์ทริป - สูงสุด 3 สถานที่ (สุ่มเลือก)',
      icon: 'day'
    },
    {
      id: '2 วัน 1 คืน',
      name: '2 วัน 1 คืน',
      description: 'ทริปสั้นๆ - สูงสุด 6 สถานที่ (เลือกอย่างเหมาะ)',
      icon: 'night'
    },
    {
      id: 'custom',
      name: 'กำหนดเอง',
      description: 'แผนยืดหยุ่น - รวมทุกสถานที่ที่คุณบันทึก',
      icon: 'calendar'
    }
  ];

  const handleConfirm = () => {
    if (selectedPersonality && selectedDuration) {
      onConfirm(
        selectedPersonality,
        selectedDuration,
        selectedAnchor
          ? {
              lat: selectedAnchor.lat,
              lng: selectedAnchor.lng,
              radius_km: selectedAnchor.radiusKm,
              label: selectedAnchor.label,
            }
          : null
      );
      onClose();
    }
  };

  const renderIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      globe: <svg className="w-7 h-7 text-[#FF6B4A]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>,
      temple: <svg className="w-7 h-7 text-[#00A896]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"/></svg>,
      building: <svg className="w-7 h-7 text-[#FF6B4A]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21"/></svg>,
      sun: <svg className="w-7 h-7 text-[#0077B6]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>,
      calm: <svg className="w-7 h-7 text-[#00A896]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>,
      social: <svg className="w-7 h-7 text-[#FFC857]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>,
      adventure: <svg className="w-7 h-7 text-[#FF6B4A]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"/></svg>,
      day: <svg className="w-7 h-7 text-[#FFC857]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>,
      night: <svg className="w-7 h-7 text-[#0077B6]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>,
      calendar: <svg className="w-7 h-7 text-[#00A896]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>,
    };
    return iconMap[icon] || iconMap.globe;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#DDEAF3]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#17324D]">วางแผนการเดินทาง</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[#FF6B4A] mt-2">
            {USE_MOCK_DATA
              ? 'เลือกสไตล์และระยะเวลา แล้วระบบจะจัดเส้นทางจากสถานที่ตัวอย่างที่คุณบันทึก'
              : 'เลือกสไตล์และระยะเวลา แล้วให้ AI วิเคราะห์ POI ที่บันทึกกับสถานที่จริงใกล้เคียง'}
          </p>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#17324D] mb-4">จุดเริ่มวิเคราะห์เส้นทาง</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setSelectedAnchor(null)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${
                  !selectedAnchor ? 'border-[#FF6B4A] bg-[#FFF4EC]' : 'border-gray-200 hover:border-[#FFC857]'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {renderIcon('globe')}
                  <div>
                    <h4 className="font-semibold text-[#17324D]">
                      {USE_MOCK_DATA ? 'จัดเส้นทางจากสถานที่ที่บันทึก' : 'ให้ AI วิเคราะห์จาก POI ที่บันทึก'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {USE_MOCK_DATA
                        ? 'ระบบจะเลือกสถานที่ตามสไตล์ท่องเที่ยวและเรียงจุดที่อยู่ใกล้กันโดยไม่ใช้ backend'
                        : 'เหมาะเมื่อคุณกดถูกใจหลายจุดแล้ว ให้ระบบหา centroid และเสริม POI ใกล้เคียงจาก places.json'}
                    </p>
                  </div>
                </div>
              </button>

              {!USE_MOCK_DATA && (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${
                    selectedAnchor ? 'border-[#FF6B4A] bg-[#FFF4EC]' : 'border-gray-200 hover:border-[#FFC857]'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {renderIcon('adventure')}
                    <div>
                      <h4 className="font-semibold text-[#17324D]">เลือกคลัสเตอร์ POI หรือปักหมุดเอง</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedAnchor
                          ? `${selectedAnchor.label || 'Pinned location'} · ${selectedAnchor.lat.toFixed(4)}, ${selectedAnchor.lng.toFixed(4)} · ${selectedAnchor.radiusKm} km`
                          : 'ใช้พื้นที่แนะนำจากข้อมูลจริง หรือกรอก latitude/longitude ที่อยากไป'}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Personality Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#17324D] mb-4">เลือกสไตล์การท่องเที่ยว</h3>
            <div className="grid grid-cols-1 gap-3">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${selectedPersonality === personality.id
                      ? 'border-[#FF6B4A] bg-[#FFF4EC]'
                      : 'border-gray-200 hover:border-[#FFC857]'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    {renderIcon(personality.icon)}
                    <div>
                      <h4 className="font-semibold text-[#17324D]">{personality.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
                    </div>
                    {selectedPersonality === personality.id && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-[#FF6B4A] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#17324D] mb-4">ระยะเวลาทริป</h3>
            <div className="grid grid-cols-1 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${selectedDuration === duration.id
                      ? 'border-[#FF6B4A] bg-[#FFF4EC]'
                      : 'border-gray-200 hover:border-[#FFC857]'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    {renderIcon(duration.icon)}
                    <div>
                      <h4 className="font-semibold text-[#17324D]">{duration.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{duration.description}</p>
                    </div>
                    {selectedDuration === duration.id && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-[#FF6B4A] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPersonality || !selectedDuration}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${selectedPersonality && selectedDuration
                  ? 'bg-gradient-to-r from-[#FF6B4A] to-[#E85336] text-white hover:from-[#E85336] hover:to-[#C9432B] transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              สร้างเส้นทาง
            </button>
          </div>
        </div>
      </div>

      {!USE_MOCK_DATA && (
        <LocationPreferenceModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onConfirm={(location) => {
            setSelectedAnchor(location);
            setShowLocationModal(false);
          }}
          initialLocation={selectedAnchor}
        />
      )}
    </div>
  );
};

export default PersonalityModal;
