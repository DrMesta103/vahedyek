'use client';

import { useState, useRef } from 'react';

type Props = {
  currentUrl?: string;
  onUpload: (url: string) => void;
};

export function ImageUpload({ currentUrl, onUpload }: Props) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      setTimeout(() => {
        onUpload(reader.result as string);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload">
      <div className="image-upload-preview" onClick={handleClick}>
        {preview ? (
          <img src={preview} alt="پیش‌نمایش تصویر" />
        ) : (
          <div className="image-upload-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>افزودن تصویر</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button type="button" onClick={handleClick} className="image-upload-btn" disabled={isUploading}>
        {isUploading ? 'در حال بارگذاری...' : preview ? 'تغییر تصویر' : 'انتخاب تصویر'}
      </button>
    </div>
  );
}
