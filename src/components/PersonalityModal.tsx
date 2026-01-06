import React from 'react';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personality: string, duration: string, city: string) => void;
}

const PersonalityModal: React.FC<PersonalityModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedPersonality, setSelectedPersonality] = React.useState<string>('');
  const [selectedDuration, setSelectedDuration] = React.useState<string>('');
  const [selectedCity, setSelectedCity] = React.useState<string>('');

  const cities = [
    {
      id: 'all',
      name: 'ทุกเมือง',
      description: 'ผสมผสานสถานที่จากทุกเมืองที่มี',
      icon: '🌏'
    },
    {
      id: 'Chiang Mai',
      name: 'เชียงใหม่',
      description: 'เสน่ห์เมืองเหนือ วัด ธรรมชาติ & วัฒนธรรม',
      icon: '🏔️'
    },
    {
      id: 'Bangkok',
      name: 'กรุงเทพ',
      description: 'เมืองหลวงคึกคัก วัด ตลาด & ไลฟ์ไสต์',
      icon: '🏙️'
    },
    {
      id: 'Phuket',
      name: 'ภูเก็ต',
      description: 'ชายหาดสวยงาม เกาะ & สวรรค์อาหารทะเล',
      icon: '🏝️'
    }
  ];

  const personalities = [
    {
      id: 'introvert mode',
      name: 'โหมดสงบ Introvert',
      description: 'สถานที่สงบ ไม่แออัด เช่น วัดและธรรมชาติ',
      icon: '🧘‍♀️'
    },
    {
      id: 'extrovert mode',
      name: 'โหมดสังสรรค์ Extrovert',
      description: 'ตลาดคึกคัก จุดสังสรรค์ และสถานที่มีชีวิตชีวา',
      icon: '🎉'
    },
    {
      id: 'adventure mode',
      name: 'โหมดผจญภัย',
      description: 'กิจกรรมตื่นเต้นและประสบการณ์กลางแจ้ง',
      icon: '🏔️'
    }
  ];

  const durations = [
    {
      id: '1 วัน ไม่ค้างคืน',
      name: '1 วัน ไม่ค้างคืน',
      description: 'เดย์ทริป - สูงสุด 3 สถานที่ (สุ่มเลือก)',
      icon: '☀️'
    },
    {
      id: '2 วัน 1 คืน',
      name: '2 วัน 1 คืน',
      description: 'ทริปสั้นๆ - สูงสุด 6 สถานที่ (เลือกอย่างเหมาะ)',
      icon: '🌙'
    },
    {
      id: 'custom',
      name: 'กำหนดเอง',
      description: 'แผนยืดหยุ่น - รวมทุกสถานที่ที่คุณบันทึก',
      icon: '📅'
    }
  ];

  const handleConfirm = () => {
    if (selectedPersonality && selectedDuration && selectedCity) {
      onConfirm(selectedPersonality, selectedDuration, selectedCity);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-800">วางแผนการเดินทาง</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-purple-600 mt-2">เลือกสไตล์การท่องเที่ยวและระยะเวลาเพื่อรับเส้นทางที่เหมาะกับคุณ</p>
        </div>

        <div className="p-6">
          {/* City/Province Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-purple-800 mb-4">🗺️ คุณอยากไปที่ไหน?</h3>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${selectedCity === city.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">{city.icon}</span>
                    <div>
                      <h4 className="font-semibold text-purple-800">{city.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{city.description}</p>
                    </div>
                    {selectedCity === city.id && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Personality Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-purple-800 mb-4">เลือกสไตล์การท่องเที่ยว</h3>
            <div className="grid grid-cols-1 gap-3">
              {personalities.map((personality) => (
                <button
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${selectedPersonality === personality.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{personality.icon}</span>
                    <div>
                      <h4 className="font-semibold text-purple-800">{personality.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
                    </div>
                    {selectedPersonality === personality.id && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
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
            <h3 className="text-lg font-bold text-purple-800 mb-4">ระยะเวลาทริป</h3>
            <div className="grid grid-cols-1 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:cursor-pointer hover:shadow-md ${selectedDuration === duration.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{duration.icon}</span>
                    <div>
                      <h4 className="font-semibold text-purple-800">{duration.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{duration.description}</p>
                    </div>
                    {selectedDuration === duration.id && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
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
              disabled={!selectedPersonality || !selectedDuration || !selectedCity}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${selectedPersonality && selectedDuration && selectedCity
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              สร้างเส้นทาง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityModal;
