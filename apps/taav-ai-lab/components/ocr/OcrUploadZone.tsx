'use client';

import { useRef, useState } from 'react';
import { FileText, FileUp, ImageIcon, LoaderCircle, X } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
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
};

export function OcrUploadZone({ value, onChange, onError, disabled, compact }: OcrUploadZoneProps) {
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

  return (
    <div className={['ocr-flow-upload', compact ? 'ocr-flow-upload--compact' : ''].filter(Boolean).join(' ')}>
      <div className="ocr-flow-upload-head">
        <span className="ocr-flow-field-label">آپلود فایل (اختیاری)</span>
        {value ? (
          <TaavButton
            type="button"
            size="sm"
            variant="ghost"
            tone="neutral"
            iconStart={<X className="h-3.5 w-3.5" />}
            onClick={() => onChange(null)}
            disabled={disabled || loading}
          >
            حذف
          </TaavButton>
        ) : null}
      </div>

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
          <TaavButton
            type="button"
            size="sm"
            variant="secondary"
            tone="neutral"
            iconStart={<FileUp className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || loading}
          >
            انتخاب فایل
          </TaavButton>
        </div>
      )}
    </div>
  );
}
