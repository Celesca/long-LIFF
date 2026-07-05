import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import eventBanner from "../assets/event1.jpg";

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  eventName: string;
}

const EventPage: React.FC = () => {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEffect, setFlashEffect] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('eventPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        console.log('Loaded photos from localStorage:', parsedPhotos.length);
        setPhotos(parsedPhotos);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('เบราว์เซอร์ไม่รองรับการใช้งานกล้อง กรุณาใช้ Chrome หรือ Safari');
        return;
      }
      
      // Request camera permission with simpler constraints first
      const constraints = {
        video: {
          facingMode: facingMode,
        },
        audio: false
      };
      
      console.log('Requesting camera with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', mediaStream.getTracks());
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error('Video play error:', e));
          };
        }
      }, 100);
      
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าเบราว์เซอร์');
      } else if (err.name === 'NotFoundError') {
        setError('ไม่พบกล้องในอุปกรณ์นี้');
      } else if (err.name === 'NotReadableError') {
        setError('กล้องถูกใช้งานโดยแอปอื่นอยู่');
      } else {
        setError(`ไม่สามารถเข้าถึงกล้องได้: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Switch camera
  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Stop current stream and restart with new facing mode
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Restart camera with new facing mode
    setTimeout(async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Switch camera error:', err);
      }
    }, 200);
  };

  // Capture photo and save to localStorage
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally if using front camera
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        
        // Get base64 string from canvas
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        // Create new photo object
        const newPhoto: CapturedPhoto = {
          id: Date.now().toString(),
          dataUrl: base64Image,
          timestamp: Date.now(),
          eventName: 'วันนักประดิษฐ์ไทย 2026'
        };
        
        // Get existing photos from localStorage
        const existingPhotosStr = localStorage.getItem('eventPhotos');
        const existingPhotos: CapturedPhoto[] = existingPhotosStr 
          ? JSON.parse(existingPhotosStr) 
          : [];
        
        // Add new photo to the beginning
        const updatedPhotos = [newPhoto, ...existingPhotos];
        
        // Save to localStorage immediately
        try {
          localStorage.setItem('eventPhotos', JSON.stringify(updatedPhotos));
          console.log('Photo saved to localStorage:', newPhoto.id);
        } catch (e) {
          console.error('Error saving to localStorage:', e);
          alert('ไม่สามารถบันทึกรูปภาพได้ พื้นที่จัดเก็บอาจเต็ม');
        }
        
        // Update state
        setPhotos(updatedPhotos);
        
        // Flash effect
        setFlashEffect(true);
        setTimeout(() => setFlashEffect(false), 150);
      }
    }
  };

  // Delete photo from localStorage
  const deletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(p => p.id !== id);
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('eventPhotos', JSON.stringify(updatedPhotos));
      console.log('Photo deleted from localStorage:', id);
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
    
    // Update state
    setPhotos(updatedPhotos);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout showHeader headerTitle="Event Photo" showBackButton backgroundVariant="tinder">
      <div className="mx-auto min-h-[calc(100vh-120px)] max-w-lg px-4 py-6 lg:max-w-6xl lg:px-8 lg:py-8">
        
        {/* Event Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl">
          <img 
            src={eventBanner}
            alt="Event Banner"
              className="h-48 w-full object-cover lg:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#C2703E] text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                LIVE EVENT
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>Thailand</span>
              </span>
            </div>
            <h2 className="text-white font-bold text-xl">วันนักประดิษฐ์ 2569</h2>
            <p className="text-white/80 text-sm">ถ่ายรูปร่วมกิจกรรมเพื่อรับรางวัลพิเศษ!</p>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowGallery(false)}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${
              !showGallery 
                ? 'bg-gradient-to-r from-[#C2703E] to-[#A85C2F] text-white shadow-lg' 
                : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            ถ่ายรูป
          </button>
          <button
            onClick={() => setShowGallery(true)}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all relative ${
              showGallery 
                ? 'bg-gradient-to-r from-[#C2703E] to-[#A85C2F] text-white shadow-lg' 
                : 'bg-white text-gray-600 shadow-sm'
            }`}
          >
            รูปของฉัน
            {photos.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4A853] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {photos.length}
              </span>
            )}
          </button>
        </div>

        {!showGallery ? (
          /* Camera Section */
          <div className="space-y-4 lg:mx-auto lg:max-w-2xl">
            {!isCapturing ? (
              /* Start Camera Button */
              <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#FDF5EF] to-[#FAF0E6] rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#C2703E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">พร้อมถ่ายรูปหรือยัง?</h3>
                <p className="text-gray-500 mb-6">กดปุ่มด้านล่างเพื่อเปิดกล้องและถ่ายรูปร่วมกิจกรรม</p>
                
                <button
                  onClick={startCamera}
                  className="w-full py-4 bg-gradient-to-r from-[#C2703E] to-[#A85C2F] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  เปิดกล้อง
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              /* Camera View */
              <div className="relative rounded-3xl overflow-hidden shadow-xl bg-black">
                {/* Flash Effect */}
                {flashEffect && (
                  <div className="absolute inset-0 bg-white z-30 animate-pulse" />
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full aspect-[3/4] object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    {/* Close Button */}
                    <button
                      onClick={stopCamera}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Capture Button */}
                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-[#C2703E] to-[#A85C2F] rounded-full border-4 border-white" />
                    </button>
                    
                    {/* Switch Camera Button */}
                    <button
                      onClick={switchCamera}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Photo Count Badge */}
                {photos.length > 0 && (
                  <div className="absolute top-4 right-4 bg-[#C2703E] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {photos.length} รูป
                  </div>
                )}
              </div>
            )}

            {/* Hidden Canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          /* Gallery Section */
          <div className="space-y-4">
            {photos.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีรูปภาพ</h3>
                <p className="text-gray-500 text-sm mb-4">เริ่มถ่ายรูปเพื่อสะสมความทรงจำในกิจกรรม</p>
                <button
                  onClick={() => setShowGallery(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C2703E] to-[#A85C2F] text-white font-semibold rounded-xl active:scale-95 transition-transform"
                >
                  ถ่ายรูปเลย
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className="relative group rounded-2xl overflow-hidden shadow-lg bg-white cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photo.dataUrl} 
                      alt="Event Photo"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(photo.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    {/* Timestamp */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatDate(photo.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {photos.length > 0 && (
              <div className="text-center text-gray-500 text-sm">
                รวม {photos.length} รูป • เก็บไว้ในเครื่องของคุณ
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-br from-[#FDF5EF] to-[#FAF0E6] rounded-2xl p-4 border border-[#E8D9C0]">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#D4A853] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>
            <div>
              <h4 className="font-semibold text-[#8B6914] mb-1">เคล็ดลับ</h4>
              <p className="text-[#A68425] text-sm">
                รูปภาพจะถูกเก็บไว้ในเครื่องของคุณ สามารถถ่ายได้ไม่จำกัด!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Photo Container */}
          <div 
            className="relative max-w-full max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto.dataUrl} 
              alt="Photo Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Photo Info */}
            <div className="absolute bottom-0 left-4 right-4 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
              <p className="text-white font-semibold">{selectedPhoto.eventName}</p>
              <p className="text-white/70 text-sm">{formatDate(selectedPhoto.timestamp)}</p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            {/* Download Button */}
            <a
              href={selectedPhoto.dataUrl}
              download={`event-photo-${selectedPhoto.id}.jpg`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              ดาวน์โหลด
            </a>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePhoto(selectedPhoto.id);
                setSelectedPhoto(null);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-500 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              ลบรูป
            </button>
          </div>

          {/* Navigation Arrows (if more than 1 photo) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
                  setSelectedPhoto(photos[prevIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
                  const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
                  setSelectedPhoto(photos[nextIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default EventPage;
