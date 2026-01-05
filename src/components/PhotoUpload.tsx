import React, { useState, useRef } from 'react';

interface PhotoUploadProps {
  placeId: string;
  placeName: string;
  onPhotosUploaded: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  placeName, 
  onPhotosUploaded, 
  maxPhotos = 3 
}) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - uploadedPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(photoDataUrls => {
      const newPhotos = [...uploadedPhotos, ...photoDataUrls];
      setUploadedPhotos(newPhotos);
      onPhotosUploaded(newPhotos);
      setIsUploading(false);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    onPhotosUploaded(newPhotos);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-800">
            📸 อัปโหลดภาพเพื่อทำเครื่องหมายว่าเยี่ยมแล้ว
          </h3>
          <p className="text-sm text-purple-600">{placeName}</p>
        </div>
        <div className="text-sm text-gray-500">
          {uploadedPhotos.length}/{maxPhotos} ภาพ
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {uploadedPhotos.map((photo, index) => (
          <div key={index} className="relative group">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Upload Slot */}
        {uploadedPhotos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-24 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center text-purple-500 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            ) : (
              <>
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">เพิ่มรูป</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-sm text-gray-600 bg-purple-50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <div>
            <p className="font-medium text-purple-800 mb-1">ข้อกำหนดการอัปโหลดภาพ:</p>
            <ul className="text-xs space-y-1">
              <li>• อัปโหลดอย่างน้อย 1 ภาพเพื่อทำเครื่องหมายว่าเยี่ยมสถานที่นี้แล้ว</li>
              <li>• รับ +10 เหรียญต่อภาพที่อัปโหลด</li>
              <li>• สูงสุด {maxPhotos} ภาพต่อสถานที่</li>
              <li>• แบ่งปันความทรงจำการเดินทางของคุณ!</li>
            </ul>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUpload;
