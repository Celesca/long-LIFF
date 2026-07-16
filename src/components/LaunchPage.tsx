import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { useLiff } from '../hooks/useLiff';
import { CoinSystem, type ActiveJourney } from '../utils/coinSystem';
import eventBanner from '../assets/event1.jpg';

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
    url: 'https://images.squarespace-cdn.com/content/v1/5dcac1b37b75f56509c0a367/c96597eb-4afc-4346-b33c-1669a5281cd4/DSC00016.jpg',
    name: 'Ginger Farm',
    city: 'Chiang Mai',
    category: 'Farm'
  },
];

// SVG Icons - no emojis
const ExploreIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const SavedIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const RewardsIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 00-3-3c-1.05 0-1.95.56-2.62 1.38L12 3.93l-.38-.55C10.95 2.56 10.05 2 9 2a3 3 0 00-3 3c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);

const quickActions = [
  { icon: ExploreIcon, label: 'สำรวจ', path: '/tinder', color: 'bg-[#FF6B4A]', lightBg: 'bg-[#FFF4EC]' },
  { icon: SavedIcon, label: 'ที่บันทึก', path: '/gallery', color: 'bg-[#E85336]', lightBg: 'bg-[#FFE2D6]' },
  { icon: RewardsIcon, label: 'รางวัล', path: '/rewards', color: 'bg-[#FFC857]', lightBg: 'bg-[#FFF1C7]' },
  { icon: HistoryIcon, label: 'ประวัติ', path: '/history', color: 'bg-[#00A896]', lightBg: 'bg-[#E9FBF7]' },
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
    if (hour < 12) setGreeting('สวัสดีตอนเช้า');
    else if (hour < 18) setGreeting('สวัสดีตอนบ่าย');
    else setGreeting('สวัสดีตอนเย็น');
  }, []);

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
    <Layout showHeader showCoinCounter backgroundVariant="thailand">
      <div className="mx-auto max-w-lg px-4 py-4 lg:max-w-7xl lg:px-8 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center space-x-3.5 mb-3">
            {isLoggedIn && pictureUrl ? (
              <img
                src={pictureUrl}
                alt={displayName || 'User'}
                className="w-12 h-12 rounded-2xl border-2 border-[#DDEAF3] shadow-sm object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A] flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-[#8AA0B3] text-sm font-medium">{greeting}</p>
              <h2 className="text-lg font-bold text-[#17324D]">
                {isLoggedIn ? displayName || 'นักเดินทาง' : 'ยินดีต้อนรับ'}
              </h2>
            </div>
          </div>
          <p className="text-[#4F6F87] text-sm">ค้นพบประสบการณ์การท่องเที่ยวที่ไม่เหมือนใคร</p>
        </div>

        {/* Event Banner */}
        <Link to="/event" className="block mb-6 animate-fade-in group lg:mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-md group-active:scale-[0.98] transition-transform duration-200">
            <img
              src={eventBanner}
              alt="Event Banner"
              className="h-44 w-full object-cover sm:h-48 lg:h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#FF6B4A] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  New Event
                </span>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">วันนักประดิษฐ์ 2569</h3>
              <p className="text-white/75 text-sm flex items-center gap-1 mt-0.5">
                แตะเพื่อร่วมกิจกรรมถ่ายรูป
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </p>
            </div>
          </div>
        </Link>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-6 animate-slide-up lg:gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="group flex flex-col items-center p-3 card-surface card-surface-hover lg:p-5"
              >
                <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center text-white mb-2 group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent />
                </div>
                <span className="text-[11px] font-semibold text-[#4F6F87] text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Continue Your Travel Banner */}
        {activeJourney && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-[#0077B6] rounded-2xl p-5 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium">กำลังเดินทาง</p>
                      <h3 className="text-white font-bold text-base">{activeJourney.city === 'all' ? 'หลายเมือง' : activeJourney.city}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">ความคืบหน้า</p>
                    <p className="text-white font-bold text-xl">{journeyProgress.percentage}%</p>
                  </div>
                </div>

                <div className="w-full bg-white/15 rounded-full h-1.5 mb-3">
                  <div
                    className="bg-white rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${journeyProgress.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-white/70 text-sm mb-4">
                  <span>{journeyProgress.visited}/{journeyProgress.total} สถานที่เยี่ยมชมแล้ว</span>
                  <span>{activeJourney.duration}</span>
                </div>

                <button
                  onClick={() => navigate('/travel-companion')}
                  className="w-full bg-white text-[#0077B6] py-2.5 px-6 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  <span>เดินทางต่อ</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Carousel */}
        <div className="mb-6 animate-fade-in-delayed lg:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#17324D]">สถานที่แนะนำ</h3>
            <Link to="/tinder" className="text-sm text-[#FF6B4A] font-medium flex items-center hover:text-[#E85336] transition-colors">
              ดูทั้งหมด
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          <div className="relative h-52 rounded-2xl overflow-hidden shadow-md lg:h-80">
            {featuredPlaces.map((place, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <img src={place.url} alt={place.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-md text-[11px] text-white font-medium mb-1.5">
                    {place.category}
                  </span>
                  <h4 className="text-white font-bold text-lg leading-tight">{place.name}</h4>
                  <p className="text-white/70 text-sm">{place.city}</p>
                </div>
              </div>
            ))}

            {/* Carousel Indicators */}
            <div className="absolute bottom-4 right-4 flex space-x-1">
              {featuredPlaces.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'w-5 bg-white' : 'w-1 bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Start Exploring CTA */}
        <div className="bg-[#FF6B4A] rounded-2xl p-5 mb-6 shadow-md animate-slide-up relative overflow-hidden lg:p-7" style={{ animationDelay: '0.15s' }}>
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/8 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="text-white font-bold text-lg mb-1">พร้อมเที่ยวหรือยัง?</h3>
              <p className="text-white/75 text-sm mb-3">ค้นพบสถานที่ท่องเที่ยวที่เหมาะกับคุณ</p>
              <Link
                to="/tinder"
                className="inline-flex items-center px-4 py-2 bg-white text-[#FF6B4A] rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-shadow active:scale-95"
              >
                เริ่มสำรวจ
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base font-bold text-[#17324D] mb-3">วิธีใช้งาน</h3>
          <div className="space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {[
              {
                step: 1,
                title: 'สำรวจสถานที่',
                desc: 'ปัดขวาเพื่อบันทึกสถานที่ที่คุณชอบ',
                iconPath: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
                color: 'bg-[#FF6B4A]'
              },
              {
                step: 2,
                title: 'สร้างคอลเลคชัน',
                desc: 'รวบรวมสถานที่โปรดของคุณ',
                iconPath: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
                color: 'bg-[#E85336]'
              },
              {
                step: 3,
                title: 'สะสมเหรียญ',
                desc: 'รับเหรียญเมื่อเยี่ยมชมสถานที่',
                iconPath: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
                color: 'bg-[#FFC857]'
              },
              {
                step: 4,
                title: 'แลกรางวัล',
                desc: 'ใช้เหรียญแลกส่วนลดพิเศษ',
                iconPath: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
                color: 'bg-[#00A896]'
              },
            ].map((item) => (
              <div key={item.step} className="flex items-center p-3.5 card-surface">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mr-3 flex-shrink-0`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#17324D] text-sm">{item.title}</p>
                  <p className="text-xs text-[#8AA0B3]">{item.desc}</p>
                </div>
                <div className="w-7 h-7 bg-[#EDF6FB] rounded-full flex items-center justify-center text-xs font-bold text-[#8AA0B3] flex-shrink-0 ml-2">
                  {item.step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { value: '20+', label: 'สถานที่', iconPath: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', color: 'text-[#FF6B4A]', bgColor: 'bg-[#FFF4EC]' },
            { value: '8+', label: 'รางวัล', iconPath: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21', color: 'text-[#FFC857]', bgColor: 'bg-[#FFF1C7]/50' },
            { value: '2', label: 'เมือง', iconPath: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z', color: 'text-[#00A896]', bgColor: 'bg-[#E9FBF7]' },
          ].map((stat, index) => (
            <div key={index} className="card-surface p-3.5 text-center">
              <div className={`w-9 h-9 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <svg className={`w-4.5 h-4.5 ${stat.color}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.iconPath} />
                </svg>
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-[#8AA0B3] font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About Section Link */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <Link
            to="/about"
            className="flex items-center justify-between p-4 card-surface card-surface-hover group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0077B6] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#17324D] text-sm">เกี่ยวกับเรา</h3>
                <p className="text-xs text-[#8AA0B3]">ทำความรู้จักกับทีมและโปรเจค</p>
              </div>
            </div>
            <svg className="w-4.5 h-4.5 text-[#8AA0B3] group-hover:text-[#FF6B4A] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </Layout>
  );
};

export default LaunchPage;
