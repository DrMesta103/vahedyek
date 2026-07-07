'use client';

import { useRef, useState } from 'react';
import { FileText, FileUp, FolderOpen, ImageIcon, LoaderCircle, X } from 'lucide-react';
import { toReadableFileSize } from '@/components/ocr/utils';

export type OcrUploadFileState = {
  fileName: string;
  fileType: string;
  fileSize: number;
  contentSnippet: string;
};

type OcrUploadZoneProps = {
  value: OcrUploadFileState | null;
  onChange: (file: OcrUploadFileState | null) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  compact?: boolean;
  variant?: 'default' | 'inline';
};

export function OcrUploadZone({
  value,
  onChange,
  onError,
  disabled,
  compact,
  variant = 'default',
}: OcrUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File | null) => {
    if (!file) return;

    if (file.size <= 0) {
      onChange(null);
      onError('فایل انتخابی معتبر نیست.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      onChange(null);
      onError('فایل بیش از حد بزرگ است. حداکثر ۲۰ مگابایت مجاز است.');
      return;
    }

    setLoading(true);
    try {
      const textLike = file.type.startsWith('text/') || /\.(txt|md|csv|json|xml|html|htm)$/i.test(file.name);
      const contentSnippet = textLike ? (await file.text()).slice(0, 1800) : '';

      onChange({
        fileName: file.name,
        fileType: file.type || file.name.split('.').pop() || 'application/octet-stream',
        fileSize: file.size,
        contentSnippet,
      });
      onError('');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || loading) return;
    const file = event.dataTransfer.files?.[0] ?? null;
    await processFile(file);
  };

  const openPicker = () => fileInputRef.current?.click();

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      className="sr-only"
      disabled={disabled || loading}
      onChange={async (event) => {
        const file = event.target.files?.[0] ?? null;
        await processFile(file);
        event.target.value = '';
      }}
    />
  );

  if (variant === 'inline') {
    return (
      <div
        className="ai-lab-ocr-create-upload-row"
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !loading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {fileInput}

        {value ? (
          <div className="ai-lab-ocr-create-file">
            <span className="ai-lab-ocr-create-file-icon" aria-hidden>
              {value.fileType.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </span>
            <div className="ai-lab-ocr-create-file-copy">
              <strong>{value.fileName}</strong>
              <span>{toReadableFileSize(value.fileSize)}</span>
            </div>
            <button
              type="button"
              className="ai-lab-ocr-create-file-remove"
              aria-label="حذف فایل"
              onClick={() => onChange(null)}
              disabled={disabled || loading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className={['ai-lab-ocr-create-upload-empty', dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}>
            {loading ? 'در حال خواندن فایل…' : 'فایلی انتخاب نشده'}
          </div>
        )}

        <button
          type="button"
          className="ai-lab-ocr-create-pick-file"
          onClick={openPicker}
          disabled={disabled || loading}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <FolderOpen className="h-4 w-4" aria-hidden />}
          انتخاب فایل
        </button>
      </div>
    );
  }

  return (
    <div className={['ocr-flow-upload', compact ? 'ocr-flow-upload--compact' : ''].filter(Boolean).join(' ')}>
      <div className="ocr-flow-upload-head">
        <span className="ocr-flow-field-label">آپلود فایل (اختیاری)</span>
        {value ? (
          <button
            type="button"
            className="ai-lab-ocr-create-file-remove"
            onClick={() => onChange(null)}
            disabled={disabled || loading}
          >
            <X className="h-3.5 w-3.5" />
            حذف
          </button>
        ) : null}
      </div>

      {fileInput}

      {value ? (
        <div className="ocr-flow-upload-preview">
          <div className="ocr-flow-upload-preview-icon">
            {value.fileType.startsWith('image/') ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div className="ocr-flow-upload-preview-copy">
            <strong>{value.fileName}</strong>
            <span>{toReadableFileSize(value.fileSize)}</span>
          </div>
        </div>
      ) : (
        <div
          className={['ocr-flow-upload-dropzone', dragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !loading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {loading ? (
            <LoaderCircle className="h-6 w-6 animate-spin text-[var(--taav-brand-strong)]" />
          ) : (
            <FileUp className="h-6 w-6 text-[var(--taav-brand-strong)]" />
          )}
          <div className="ocr-flow-upload-dropzone-copy">
            <strong>فایل را رها کنید یا انتخاب کنید</strong>
            <span>پی‌دی‌اف، تصویر یا متن · حداکثر ۲۰ مگابایت</span>
          </div>
          <button type="button" className="ai-lab-ocr-create-pick-file" onClick={openPicker} disabled={disabled || loading}>
            انتخاب فایل
          </button>
        </div>
      )}
    </div>
  );
}
