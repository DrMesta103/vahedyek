'use client';

import { useEffect, useMemo, useState } from 'react';
import { Paperclip, Plus, Trash2, Upload, X } from 'lucide-react';
import { PanelFormModal, PanelFormModalActions } from './PanelFormModal';
import { formatFaNumber } from '../lib/format-fa';
import type { AttachmentDraft } from '../lib/employee-requests';

const DEFAULT_CATEGORIES = [
  'مدارک شناسایی و هویتی',
  'مدارک بیمه‌ای و تأمین اجتماعی',
  'مدارک مالی و تضامین',
  'مدارک آموزشی و تحصیلی',
  'مدارک شغلی و سوابق کاری',
  'مدارک اداری و حقوقی',
  'سایر',
];

const DEFAULT_TITLES = ['تصویر مدرک', 'گواهی', 'فرم تکمیل‌شده', 'نامه اداری', 'سند مالی', 'سایر'];

const CATEGORY_TITLES: Record<string, string[]> = {
  'مدارک شناسایی و هویتی': ['تصویر کارت ملی', 'تصویر شناسنامه', 'مدرک هویتی', 'سایر'],
  'مدارک بیمه‌ای و تأمین اجتماعی': ['سوابق بیمه', 'نامه تأمین اجتماعی', 'گواهی بیمه', 'سایر'],
  'مدارک مالی و تضامین': ['ضمانت‌نامه', 'چک / سفته', 'رسید مالی', 'سایر'],
  'مدارک آموزشی و تحصیلی': ['مدرک تحصیلی', 'گواهی آموزشی', 'رزومه آموزشی', 'سایر'],
  'مدارک شغلی و سوابق کاری': ['سوابق کاری', 'گواهی اشتغال', 'نامه اداری', 'سایر'],
  'مدارک اداری و حقوقی': ['قرارداد', 'نامه اداری', 'فرم تکمیل‌شده', 'سایر'],
  سایر: DEFAULT_TITLES,
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatFileSize(size?: number | null) {
  if (!size) return 'حجم نامشخص';
  if (size < 1024) return `${formatFaNumber(size)} بایت`;
  if (size < 1024 * 1024) return `${formatFaNumber(Math.round(size / 1024))} کیلوبایت`;
  return `${formatFaNumber(Math.round(size / (1024 * 1024)))} مگابایت`;
}

export function AttachmentManager({
  value,
  onChange,
  ownerType = 'draft',
  ownerId = 'draft',
  readonly = false,
}: {
  value: AttachmentDraft[];
  onChange: (next: AttachmentDraft[]) => void;
  ownerType?: string;
  ownerId?: string;
  readonly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [title, setTitle] = useState(CATEGORY_TITLES[DEFAULT_CATEGORIES[0]][0]);
  const [customTitle, setCustomTitle] = useState('');
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [addingTitle, setAddingTitle] = useState(false);
  const [issuedAt, setIssuedAt] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);
  const titleOptions = useMemo(() => [...(CATEGORY_TITLES[category] ?? DEFAULT_TITLES), ...customTitles], [category, customTitles]);
  const totalSize = useMemo(() => value.reduce((sum, item) => sum + (item.fileSize ?? 0), 0), [value]);

  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);
  }, [open]);

  useEffect(() => {
    const options = CATEGORY_TITLES[category] ?? DEFAULT_TITLES;
    if (!titleOptions.includes(title)) setTitle(options[0] ?? DEFAULT_TITLES[0]);
  }, [category, title, titleOptions]);

  const addCustomCategory = () => {
    const next = customCategory.trim();
    if (!next) return;
    setCustomCategories((items) => (items.includes(next) || DEFAULT_CATEGORIES.includes(next) ? items : [...items, next]));
    setCategory(next);
    setCustomCategory('');
    setAddingCategory(false);
  };

  const removeCustomCategory = (item: string) => {
    setCustomCategories((items) => items.filter((value) => value !== item));
    if (category === item) setCategory(DEFAULT_CATEGORIES[0]);
  };

  const addCustomTitle = () => {
    const next = customTitle.trim();
    if (!next) return;
    setCustomTitles((items) => (items.includes(next) || DEFAULT_TITLES.includes(next) ? items : [...items, next]));
    setTitle(next);
    setCustomTitle('');
    setAddingTitle(false);
  };

  const removeCustomTitle = (item: string) => {
    setCustomTitles((items) => items.filter((value) => value !== item));
    if (title === item) setTitle((CATEGORY_TITLES[category] ?? DEFAULT_TITLES)[0] ?? DEFAULT_TITLES[0]);
  };

  const addFiles = async () => {
    if (!files.length) return setError('حداقل یک فایل انتخاب کنید.');
    if (!category.trim()) return setError('دسته‌بندی فایل را انتخاب کنید.');
    if (!title.trim()) return setError('عنوان فایل را انتخاب کنید.');

    setSaving(true);
    try {
      const nextFiles = await Promise.all(
        files.map(async (file) => ({
          id: crypto.randomUUID(),
          ownerType,
          ownerId,
          categoryId: category,
          categoryName: category,
          titleId: title,
          title,
          fileUrl: await readFileAsDataUrl(file),
          fileName: file.name,
          fileType: file.type || null,
          fileSize: file.size,
          issuedAt: issuedAt || null,
          description: description.trim() || null,
          uploadedAt: new Date().toISOString(),
        })),
      );
      onChange([...value, ...nextFiles]);
      setFiles([]);
      setIssuedAt('');
      setDescription('');
      setOpen(false);
    } catch {
      setError('خواندن فایل با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="attachment-manager">
      <div className="attachment-manager-head">
        <div>
          <strong>پیوست‌ها</strong>
          <span>{formatFaNumber(value.length, { useGrouping: false })} فایل، {formatFileSize(totalSize)}</span>
        </div>
        {!readonly ? (
          <button type="button" className="business-payroll-outline-button" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            افزودن فایل
          </button>
        ) : null}
      </div>

      {value.length ? (
        <div className="attachment-manager-list">
          {value.map((attachment) => (
            <article key={attachment.id} className="attachment-manager-item">
              <Paperclip className="h-4 w-4" aria-hidden />
              <div>
                <strong>{attachment.title}</strong>
                <span>{attachment.fileName} · {attachment.categoryName} · {formatFileSize(attachment.fileSize)}</span>
              </div>
              {!readonly ? (
                <button type="button" aria-label="حذف فایل" onClick={() => onChange(value.filter((item) => item.id !== attachment.id))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="attachment-manager-empty">فایلی اضافه نشده است.</p>
      )}

      <PanelFormModal
        open={open}
        title="افزودن فایل"
        lead="فایل‌ها قبل از ثبت نهایی درخواست در همین فرم نگه‌داری می‌شوند."
        error={error}
        onClose={() => setOpen(false)}
        footer={<PanelFormModalActions submitLabel="افزودن" saving={saving} onSubmit={addFiles} onCancel={() => setOpen(false)} />}
      >
        <div className="attachment-manager-dialog">
          <section className="attachment-picker-section">
            <div className="employee-request-section-title">دسته‌بندی</div>
            <div className="attachment-chip-grid">
              {categoryOptions.map((item) => (
                <button key={item} type="button" className={category === item ? 'is-selected' : ''} onClick={() => setCategory(item)}>
                  <span>{item}</span>
                  {customCategories.includes(item) ? (
                    <X className="h-3 w-3" onClick={(event) => { event.stopPropagation(); removeCustomCategory(item); }} />
                  ) : null}
                </button>
              ))}
              <button type="button" className="is-add" onClick={() => setAddingCategory(true)}>
                <Plus className="h-3 w-3" />
                افزودن دسته‌بندی
              </button>
            </div>
            {addingCategory ? (
              <div className="attachment-custom-row">
                <input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="نام دسته‌بندی جدید" />
                <button type="button" onClick={addCustomCategory}>افزودن</button>
              </div>
            ) : null}
          </section>

          <section className="attachment-picker-section">
            <div className="employee-request-section-title">عنوان / نوع سند</div>
            <div className="attachment-chip-grid">
              {titleOptions.map((item) => (
                <button key={item} type="button" className={title === item ? 'is-selected' : ''} onClick={() => setTitle(item)}>
                  <span>{item}</span>
                  {customTitles.includes(item) ? (
                    <X className="h-3 w-3" onClick={(event) => { event.stopPropagation(); removeCustomTitle(item); }} />
                  ) : null}
                </button>
              ))}
              <button type="button" className="is-add" onClick={() => setAddingTitle(true)}>
                <Plus className="h-3 w-3" />
                افزودن عنوان
              </button>
            </div>
            {addingTitle ? (
              <div className="attachment-custom-row">
                <input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="عنوان سند جدید" />
                <button type="button" onClick={addCustomTitle}>افزودن</button>
              </div>
            ) : null}
          </section>

          <div className="employee-request-form-grid attachment-manager-fields">
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">تاریخ فایل</span>
              <input value={issuedAt} onChange={(event) => setIssuedAt(event.target.value)} placeholder="۱۴۰۵/۰۱/۰۱" />
            </label>
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">توضیحات</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
            </label>
            <label className="attachment-manager-dropzone">
              <Upload className="h-5 w-5" aria-hidden />
              <span>{files.length ? `${formatFaNumber(files.length, { useGrouping: false })} فایل انتخاب شده` : 'انتخاب فایل یا تصویر'}</span>
              <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
            </label>
            {files.length ? (
              <div className="attachment-selected-files">
                {files.map((file) => (
                  <span key={`${file.name}-${file.size}`}>
                    <Paperclip className="h-3 w-3" />
                    {file.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </PanelFormModal>
    </section>
  );
}
