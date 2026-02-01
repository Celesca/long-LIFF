import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

// Icons
const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const GithubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const EmailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const experiences = [
    {
        role: 'Machine Learning Engineer',
        company: 'SCB',
        period: '7 Jan 2025 - 30 April 2025',
        type: 'full-time',
        color: 'from-purple-500 to-violet-600',
    },
    {
        role: 'Machine Learning Engineer',
        company: 'Green Bloom',
        period: 'Part-time',
        type: 'part-time',
        color: 'from-emerald-500 to-green-600',
    },
    {
        role: 'AI Engineer',
        company: 'SCB Tech Hub',
        period: 'Part-time',
        type: 'part-time',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        role: 'Junior Developer',
        company: 'Deep Capital',
        period: 'Part-time',
        type: 'part-time',
        color: 'from-cyan-500 to-teal-600',
    },
    {
        role: 'AI Engineer Intern',
        company: 'SCG',
        period: 'Mar 2025 - October 2025 (8 months)',
        type: 'ex',
        color: 'from-red-500 to-rose-600',
    },
    {
        role: 'Market Researcher Intern',
        company: 'SEA Bridge',
        period: 'Internship',
        type: 'ex',
        color: 'from-amber-500 to-orange-600',
    },
];

const achievements = [
    {
        medal: '🥇',
        title: 'Gold Medal Super AI Engineer Season 5',
        org: 'AIAT',
        detail: 'Track 2 : AI Engineer | EXP House',
        color: 'from-yellow-400 to-amber-500',
    },
    {
        medal: '🥇',
        title: 'Winner GenAI Hackathon',
        org: 'YES Talent Camp 2025 by Mitr Phol Group',
        detail: '',
        color: 'from-yellow-400 to-amber-500',
    },
    {
        medal: '🥇',
        title: 'Winner BDI Hackathon',
        org: 'AI & Data Innovation for Smart Tourism',
        detail: 'at Chiang Mai',
        color: 'from-yellow-400 to-amber-500',
    },
    {
        medal: '🥈',
        title: 'Silver Medal Creative AI Camp Gen 7',
        org: 'CP ALL',
        detail: '',
        color: 'from-gray-300 to-slate-400',
    },
    {
        medal: '🥈',
        title: 'Beta Microsoft Learn Student Ambassador',
        org: 'Microsoft',
        detail: '',
        color: 'from-blue-400 to-sky-500',
    },
];

const AboutPage: React.FC = () => {
    const profileImageUrl = 'https://media.licdn.com/dms/image/v2/D5603AQHQPqN2UBUixw/profile-displayphoto-scale_400_400/B56ZomPFwYHAAg-/0/1761578083313?e=2147483647&v=beta&t=Mm633FIpVKTsrw0rTUdbkJ7G3-TZ8fEBBYNHDT1Ct4E';

    return (
        <Layout showHeader backgroundVariant="thailand" backgroundIntensity="low">
            <div className="min-h-screen">
                {/* Hero Section with Profile */}
                <div className="relative overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700" />

                    {/* Decorative Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

                    <div className="relative px-4 pt-8 pb-12 max-w-lg mx-auto">
                        {/* Back Button */}
                        <Link
                            to="/"
                            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">กลับหน้าหลัก</span>
                        </Link>

                        {/* Profile Card */}
                        <div className="text-center">
                            {/* Profile Image */}
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                    <img
                                        src={profileImageUrl}
                                        alt="Folk"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Status Badge */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    Available
                                </div>
                            </div>

                            {/* Name & Title */}
                            <h1 className="text-3xl font-bold text-white mb-2">Folk</h1>
                            <p className="text-purple-200 text-lg font-medium mb-4">
                                Machine Learning Engineer
                            </p>

                            {/* Education */}
                            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-white/90 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                                <span>Computer Engineering @ KMUTT</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-4 py-6 max-w-lg mx-auto space-y-6 -mt-4">
                    {/* About Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            เกี่ยวกับฉัน
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            สวัสดีครับ! ผมชื่อ Folk เป็นนักศึกษาวิศวกรรมคอมพิวเตอร์ จากมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)
                            มีความสนใจและเชี่ยวชาญด้าน Machine Learning และ Artificial Intelligence
                            พร้อมด้วยประสบการณ์ทำงานในบริษัทชั้นนำหลายแห่ง
                        </p>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            ประสบการณ์ทำงาน
                        </h2>
                        <div className="space-y-3">
                            {experiences.map((exp, index) => (
                                <div
                                    key={index}
                                    className={`relative p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 ${exp.type === 'ex' ? 'opacity-75' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                                                {exp.type === 'ex' && (
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Ex</span>
                                                )}
                                                {exp.type === 'part-time' && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Part-time</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-purple-600 font-medium">{exp.company}</p>
                                            <p className="text-xs text-gray-500 mt-1">{exp.period}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </span>
                            รางวัลและความสำเร็จ
                        </h2>
                        <div className="space-y-3">
                            {achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">{achievement.medal}</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
                                            <p className="text-xs text-purple-600 font-medium">{achievement.org}</p>
                                            {achievement.detail && (
                                                <p className="text-xs text-gray-500 mt-0.5">{achievement.detail}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-bold mb-4 flex items-center">
                            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            ช่องทางติดต่อ
                        </h2>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <LocationIcon />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs">ที่อยู่</p>
                                    <p className="font-medium">Bangkok, Thailand</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs">มหาวิทยาลัย</p>
                                    <p className="font-medium text-sm">King Mongkut's University of Technology Thonburi (KMUTT)</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-white/20">
                            <a
                                href="#"
                                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                                aria-label="LinkedIn"
                            >
                                <LinkedInIcon />
                            </a>
                            <a
                                href="#"
                                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                                aria-label="GitHub"
                            >
                                <GithubIcon />
                            </a>
                            <a
                                href="#"
                                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                                aria-label="Email"
                            >
                                <EmailIcon />
                            </a>
                        </div>
                    </div>

                    {/* About This Project */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                            เกี่ยวกับโปรเจค
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            แอปพลิเคชันนี้เป็นแพลตฟอร์มสำหรับค้นพบสถานที่ท่องเที่ยวในประเทศไทย
                            ที่ผสมผสานเทคโนโลยี AI และ Machine Learning เพื่อแนะนำสถานที่ที่เหมาะสมกับคุณ
                            พัฒนาด้วยความตั้งใจเพื่อส่งเสริมการท่องเที่ยวไทย
                        </p>
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Built with ❤️ by Folk</p>
                                    <p className="text-xs text-gray-500">Powered by React, TypeScript & LINE LIFF</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom spacing */}
                    <div className="h-8" />
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;
