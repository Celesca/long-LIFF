import React from 'react';
import eventBanner from '../assets/event1.jpg';

type LineEntryMode = 'loading' | 'connect' | 'error' | 'missing-config';

interface LineEntryScreenProps {
  mode: LineEntryMode;
  message?: string;
  isInLineClient?: boolean;
  liffId?: string;
  onLogin?: () => void;
  onRetry?: () => void;
}

const LineLogo = () => (
  <div className="w-14 h-14 rounded-2xl bg-[#06C755] flex items-center justify-center shadow-lg shadow-[#06C755]/20">
    <span className="text-white text-xl font-black tracking-tight">LINE</span>
  </div>
);

const TripNaiWordmark = () => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">TripNai</p>
    <h1 className="text-lg font-bold">Open Travel Pass</h1>
  </div>
);

const LineEntryScreen: React.FC<LineEntryScreenProps> = ({
  mode,
  message,
  isInLineClient = false,
  liffId,
  onLogin,
  onRetry,
}) => {
  const openLineUrl = liffId ? `https://liff.line.me/${liffId}` : undefined;
  const title =
    mode === 'loading'
      ? 'กำลังเชื่อมต่อ LINE'
      : mode === 'connect'
        ? 'เชื่อมต่อบัญชี LINE'
        : mode === 'missing-config'
          ? 'ยังไม่ได้ตั้งค่า LIFF'
          : 'เชื่อมต่อไม่สำเร็จ';

  const copy =
    mode === 'loading'
      ? 'กำลังเตรียมประสบการณ์ท่องเที่ยวของคุณ'
      : mode === 'connect'
        ? isInLineClient
          ? 'แตะเพื่อยืนยันบัญชี LINE และเริ่มใช้งาน'
          : 'เปิดผ่านแอป LINE เพื่อรับประสบการณ์แบบ native และผูกบัญชีอัตโนมัติ'
        : mode === 'missing-config'
          ? 'กรุณาตั้งค่า VITE_LIFF_ID ก่อนใช้งานจริงบน LINE'
          : message || 'กรุณาลองใหม่อีกครั้ง';

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#F7F8F5] safe-area-top safe-area-bottom flex items-stretch">
      <div className="relative w-full max-w-[430px] mx-auto overflow-hidden bg-[#F7F8F5]">
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(145deg,#06C755_0%,#18D66A_42%,#F7F8F5_100%)]" />

        <div className="relative min-h-screen flex flex-col px-5 py-6 min-w-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <LineLogo />
              <TripNaiWordmark />
            </div>
          </div>

          <div className="mt-10 w-full rounded-[28px] bg-white p-5 shadow-xl shadow-[#0A2714]/10 min-w-0">
            <div className="h-[210px] w-full rounded-[24px] overflow-hidden bg-[#E9F8EE] relative">
              <img
                src={eventBanner}
                alt="Thailand travel"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06140A]/60 via-[#06C755]/10 to-white/10" />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#06A647] shadow-sm">
                LINE connected experience
              </div>
            </div>

            <div className="pt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#06A647]">Personalized for LINE</p>
              <h3 className="text-xl font-black text-[#142117]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#637067]">{copy}</p>

              {mode === 'loading' && (
                <div className="mt-6 space-y-3">
                  <div className="h-3 rounded-full bg-[#E6F6EA] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-[#06C755] animate-shimmer" />
                  </div>
                  <p className="text-xs font-medium text-[#8A958E]">กำลังตรวจสอบสถานะ LIFF และโปรไฟล์ LINE</p>
                </div>
              )}

              {mode === 'connect' && (
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={onLogin}
                    className="w-full h-[52px] rounded-2xl bg-[#06C755] text-white font-bold shadow-lg shadow-[#06C755]/20 active:scale-[0.98]"
                  >
                    เชื่อมต่อด้วย LINE
                  </button>
                  {!isInLineClient && openLineUrl && (
                    <a
                      href={openLineUrl}
                      className="flex h-12 items-center justify-center rounded-2xl border border-[#DDE7DF] text-sm font-bold text-[#142117]"
                    >
                      เปิดในแอป LINE
                    </a>
                  )}
                </div>
              )}

              {(mode === 'error' || mode === 'missing-config') && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-6 w-full h-12 rounded-2xl bg-[#142117] text-white font-bold active:scale-[0.98]"
                >
                  ลองอีกครั้ง
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 text-center text-[11px] leading-5 text-[#839086]">
            ใช้โปรไฟล์ LINE เพื่อบันทึกสถานที่ เหรียญ และทริปของคุณอย่างปลอดภัย
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineEntryScreen;
