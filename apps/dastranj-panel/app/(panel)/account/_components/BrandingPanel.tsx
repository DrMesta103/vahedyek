'use client';

import { Building2, Camera, FileText, ImagePlus, Printer, Stamp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type BrandingSettings, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore } from '../profileStorage';
import { BUSINESS_PROFILE_BRANDING, BUSINESS_PROFILE_ROOT, getSelectTenantPath } from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
import { PanelFormModal } from '../../../components/PanelFormModal';
import { ProfileBackLink, ProfileCard, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File | null): Promise<string> {
  if (!file) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

function getBusinessName(store: ProfileStore, meta: ProfileMeta) {
  return store.ownership.companyName.trim() || store.ownership.brandName.trim() || meta.businessName.trim() || 'ثبت نشده';
}

function getBusinessIdentifier(store: ProfileStore) {
  return store.ownership.ownershipKind === 'legal' ? store.ownership.nationalId.trim() : '';
}

function getContactLabel(meta: ProfileMeta) {
  return meta.owner.mobile?.trim() || meta.owner.email?.trim() || '';
}

function getBusinessProfileTitle(store: ProfileStore) {
  return store.ownership.ownershipKind === 'legal' ? 'شناسه ملی' : 'کد ملی';
}

type AssetKind = 'logo' | 'stamp';

type AssetConfig = {
  kind: AssetKind;
  title: string;
  description: string;
  value: string;
  fileName: string;
  placeholder: ReactNode;
  onSelect: (file: File | null) => Promise<void>;
  onDelete: () => void;
};

function isValidImageFile(file: File) {
  return ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
}

function BrandingAssetCard({ config }: { config: AssetConfig }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasValue = Boolean(config.value);

  return (
    <article className="branding-asset-card">
      <div className="branding-asset-head">
        <div>
          <h3>{config.title}</h3>
          <p>{config.description}</p>
        </div>
        <span className={`status-chip ${hasValue ? 'status-chip-completed' : 'status-chip-pending'}`}>
          {hasValue ? 'فایل بارگذاری شده' : 'آماده بارگذاری'}
        </span>
      </div>

      <div className="branding-asset-preview">
        {hasValue ? <img src={config.value} alt={config.title} className="branding-asset-image" /> : <div className="branding-asset-placeholder">{config.placeholder}</div>}
      </div>

      <div className="branding-asset-meta">
        <div className="branding-asset-file">
          <span>نام فایل</span>
          <strong>{config.fileName || 'ثبت نشده'}</strong>
        </div>
        <p className="branding-asset-hint">
          {config.kind === 'logo'
            ? 'لوگوی رسمی کسب‌وکار در قراردادها، گزارش‌ها و خروجی‌های سازمانی نمایش داده می‌شود. حداکثر حجم فایل 5 MB است.'
            : 'مهر دیجیتال برای نمایش در قراردادها و فرم‌های رسمی استفاده می‌شود. فایل PNG شفاف نتیجه بهتری می‌دهد. حداکثر حجم فایل 5 MB است.'}
        </p>
      </div>

      <div className="branding-asset-actions">
        <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>
          <Camera className="h-4 w-4" />
          {hasValue ? 'تغییر فایل' : 'انتخاب فایل'}
        </button>
        <button type="button" className="secondary-button" onClick={config.onDelete} disabled={!hasValue}>
          <Trash2 className="h-4 w-4" />
          حذف فایل
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={(event) => void config.onSelect(event.target.files?.[0] ?? null)}
      />
    </article>
  );
}

function DocumentPreviewModal({
  open,
  onClose,
  store,
  meta,
}: {
  open: boolean;
  onClose: () => void;
  store: ProfileStore;
  meta: ProfileMeta;
}) {
  const businessName = getBusinessName(store, meta);
  const contact = getContactLabel(meta);
  const identifierLabel = getBusinessProfileTitle(store);
  const identifierValue = getBusinessIdentifier(store);
  const isLegal = store.ownership.ownershipKind === 'legal';
  const previewWarning =
    !businessName.trim() || !contact.trim() || (isLegal ? !identifierValue.trim() : false)
      ? 'اطلاعات پایه پروفایل کسب‌وکار کامل نیست؛ سربرگ و پاورقی ممکن است ناقص نمایش داده شوند.'
      : '';

  return (
    <PanelFormModal
      open={open}
      title="پیش‌نمایش سند نمونه"
      lead="این پیش‌نمایش فقط برای بررسی بصری سربرگ، پاورقی، لوگو، مهر و بیانیه حقوقی است."
      onClose={onClose}
      footer={
        <button type="button" className="primary-button" onClick={onClose}>
          بستن
        </button>
      }
    >
      <div className="branding-document-modal">
        {previewWarning ? <div className="branding-warning-banner">{previewWarning}</div> : null}

        <div className="branding-document-paper">
          <header className="branding-document-header">
            <div className="branding-document-header-top">
              <div className="branding-document-logo-block">
                {store.branding.logoImage ? (
                  <img src={store.branding.logoImage} alt="لوگوی رسمی" className="branding-document-logo" />
                ) : (
                  <div className="branding-document-logo-fallback">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <strong>{businessName}</strong>
                  <span>{isLegal ? 'شخص حقوقی' : 'شخص حقیقی'}</span>
                </div>
              </div>

              <div className="branding-document-metadata">
                {identifierValue ? (
                  <div>
                    <span>{identifierLabel}</span>
                    <strong dir="ltr">{identifierValue}</strong>
                  </div>
                ) : null}
                {store.ownership.economicCode.trim() ? (
                  <div>
                    <span>کد اقتصادی</span>
                    <strong dir="ltr">{store.ownership.economicCode.trim()}</strong>
                  </div>
                ) : null}
                {contact ? (
                  <div>
                    <span>تماس</span>
                    <strong dir="ltr">{contact}</strong>
                  </div>
                ) : null}
              </div>
            </div>

            {store.branding.headerImage ? (
              <div className="branding-document-banner">
                <img src={store.branding.headerImage} alt="سربرگ" />
              </div>
            ) : (
              <div className="branding-document-banner is-empty">
                <span>سربرگ در پروفایل ثبت نشده است</span>
              </div>
            )}
          </header>

          <main className="branding-document-body">
            <p>این یک سند نمونه برای نمایش سربرگ، پاورقی، لوگو، مهر و بیانیه حقوقی کسب‌وکار است.</p>
            <p className="branding-document-paragraph">
              از این پیش‌نمایش می‌توانید برای بررسی چیدمان و آماده بودن اطلاعات رسمی قبل از استفاده در قراردادها، گزارش‌ها و خروجی‌های سازمانی استفاده کنید.
            </p>
            {store.branding.legalStatement.trim() ? (
              <blockquote className="branding-document-statement">{store.branding.legalStatement.trim()}</blockquote>
            ) : null}

            <div className="branding-document-signature">
              <div className="branding-document-stamp-card">
                <span>مهر دیجیتال</span>
                {store.branding.sealImage ? (
                  <img src={store.branding.sealImage} alt="مهر دیجیتال" className="branding-document-stamp" />
                ) : (
                  <div className="branding-document-stamp-empty">
                    <Stamp className="h-6 w-6" />
                    <span>مهر ثبت نشده است</span>
                  </div>
                )}
              </div>
              <div className="branding-document-footer-info">
                <span>اطلاعات پاورقی</span>
                <div>
                  <small>عنوان رسمی</small>
                  <strong>{businessName}</strong>
                </div>
                {identifierValue ? (
                  <div>
                    <small>{identifierLabel}</small>
                    <strong dir="ltr">{identifierValue}</strong>
                  </div>
                ) : null}
                {contact ? (
                  <div>
                    <small>تماس</small>
                    <strong dir="ltr">{contact}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </main>

          {store.branding.footerImage ? (
            <footer className="branding-document-footer">
              <img src={store.branding.footerImage} alt="پاورقی" />
            </footer>
          ) : (
            <footer className="branding-document-footer is-empty">
              <span>پاورقی در پروفایل ثبت نشده است</span>
            </footer>
          )}
        </div>
      </div>
    </PanelFormModal>
  );
}

export default function BrandingPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'error' | 'success' | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (!mounted) return;
        setStore(payload.store);
        setMeta(payload.meta);
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace(getSelectTenantPath(BUSINESS_PROFILE_BRANDING));
          return;
        }
        setStore(loadProfileStore());
        setMeta(DEFAULT_PROFILE_META);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const updateBranding = (patch: Partial<BrandingSettings>) => {
    setStore((current) => ({
      ...current,
      branding: {
        ...current.branding,
        ...patch,
      },
    }));
  };

  const uploadAsset = async (kind: AssetKind, file: File | null) => {
    if (!file) return;

    if (!isValidImageFile(file)) {
      setNoticeTone('error');
      setNotice('فرمت فایل مجاز نیست. لطفاً فایل PNG یا JPG بارگذاری کنید.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setNoticeTone('error');
      setNotice('حجم فایل بیش از حد مجاز است.');
      return;
    }

    setSaving(true);
    setNotice('');
    setNoticeTone(null);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateBranding(
        kind === 'logo'
          ? { logoImage: dataUrl, logoFileName: file.name }
          : { sealImage: dataUrl, sealFileName: file.name },
      );
      setNoticeTone('success');
      setNotice('فایل با موفقیت بارگذاری شد.');
    } catch {
      setNoticeTone('error');
      setNotice('فایل بارگذاری نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const removeAsset = (kind: AssetKind) => {
    updateBranding(kind === 'logo' ? { logoImage: '', logoFileName: '' } : { sealImage: '', sealFileName: '' });
    setNoticeTone('success');
    setNotice('فایل حذف شد.');
  };

  const save = async () => {
    setSaving(true);
    setNotice('');
    setNoticeTone(null);
    try {
      const saved = await persistProfileStore(store);
      setStore(saved);
      setNoticeTone('success');
      setNotice('اطلاعات لوگو، مهر و اسناد با موفقیت ذخیره شد.');
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_BRANDING));
        return;
      }
      setNoticeTone('error');
      setNotice('اطلاعات ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const businessName = getBusinessName(store, meta);
  const contact = getContactLabel(meta);
  const missingBaseInfo = !businessName.trim() || !contact.trim() || (store.ownership.ownershipKind === 'legal' && !store.ownership.nationalId.trim());

  const assetConfigs: AssetConfig[] = [
    {
      kind: 'logo',
      title: 'لوگوی رسمی',
      description: 'لوگوی رسمی کسب‌وکار در قراردادها، گزارش‌ها و خروجی‌های سازمانی نمایش داده می‌شود.',
      value: store.branding.logoImage,
      fileName: store.branding.logoFileName,
      placeholder: <ImagePlus className="h-8 w-8" />,
      onSelect: (file) => uploadAsset('logo', file),
      onDelete: () => removeAsset('logo'),
    },
    {
      kind: 'stamp',
      title: 'مهر دیجیتال',
      description: 'مهر دیجیتال برای نمایش در قراردادها و فرم‌های رسمی استفاده می‌شود.',
      value: store.branding.sealImage,
      fileName: store.branding.sealFileName,
      placeholder: <Stamp className="h-8 w-8" />,
      onSelect: (file) => uploadAsset('stamp', file),
      onDelete: () => removeAsset('stamp'),
    },
  ];

  if (loading) {
    return <LoadingCard label="در حال بارگذاری برندینگ..." />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'خانه', href: BUSINESS_PROFILE_ROOT },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'پروفایل کسب‌وکار', href: BUSINESS_PROFILE_ROOT },
          { label: 'لوگو، مهر و سربرگ' },
        ]}
      />

      {notice ? (
        <div
          className={`profile-summary-card ${
            noticeTone === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-100'
          }`}
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}

      <ProfilePageShell className="branding-reference-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProfileBackLink href={BUSINESS_PROFILE_ROOT}>بازگشت به پروفایل کسب‌وکار</ProfileBackLink>
          <span className="status-chip status-chip-completed">{meta.brandCode || 'DS'}</span>
        </div>

        <ProfileCard className="branding-reference-card">
          <ProfileHeading
            title="لوگو، مهر و سربرگ"
            description="هویت بصری خروجی‌های رسمی کسب‌وکار را برای قراردادها، گزارش‌ها و اسناد سازمانی تکمیل کنید."
          />

          <section className="branding-section">
            <div className="branding-section-head">
              <div>
                <h2>لوگوی رسمی و مهر دیجیتال</h2>
                <p>فایل‌های اصلی برندینگ را برای استفاده در اسناد رسمی بارگذاری کنید.</p>
              </div>
              <div className="branding-section-note">این اطلاعات برای خروجی‌های رسمی استفاده می‌شود.</div>
            </div>

            <div className="branding-asset-grid">
              {assetConfigs.map((config) => (
                <BrandingAssetCard key={config.kind} config={config} />
              ))}
            </div>
          </section>

          <section className="branding-section">
            <div className="branding-section-head">
              <div>
                <h2>سربرگ و پاورقی</h2>
                <p>سربرگ و پاورقی بر اساس اطلاعات پروفایل کسب‌وکار ساخته می‌شود و در خروجی‌های رسمی نمایش داده خواهد شد.</p>
              </div>
              <button type="button" className="primary-button branding-preview-button" onClick={() => setPreviewOpen(true)}>
                <Printer className="h-4 w-4" />
                پیش‌نمایش سند نمونه
              </button>
            </div>

            {missingBaseInfo ? (
              <div className="branding-warning-banner">
                اطلاعات پایه پروفایل کسب‌وکار کامل نیست؛ سربرگ و پاورقی ممکن است ناقص نمایش داده شوند.
              </div>
            ) : null}

            <div className="branding-paper-card">
              <div className="branding-paper-preview">
                <div className="branding-paper-slot top">
                  {store.branding.headerImage ? (
                    <img src={store.branding.headerImage} alt="سربرگ" className="branding-paper-image" />
                  ) : (
                    <FileText className="h-8 w-8" />
                  )}
                  <UploadInlineButton
                    onChange={(file) => {
                      void uploadHeaderFooterAsset('header', file);
                    }}
                  />
                </div>
                <div className="branding-paper-lines">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="branding-paper-slot bottom">
                  {store.branding.footerImage ? (
                    <img src={store.branding.footerImage} alt="پاورقی" className="branding-paper-image" />
                  ) : (
                    <FileText className="h-8 w-8" />
                  )}
                  <UploadInlineButton
                    onChange={(file) => {
                      void uploadHeaderFooterAsset('footer', file);
                    }}
                  />
                </div>
              </div>
              <p>سربرگ و پاورقی رسمی شامل نام شرکت، شناسه‌ها، اطلاعات تماس و جزئیات سند خواهد بود.</p>
            </div>
          </section>

          <section className="branding-section">
            <div className="branding-section-head">
              <div>
                <h2>بیانیه حقوقی اسناد</h2>
                <p>در صورت نیاز، متن حقوقی یا توضیح رسمی کسب‌وکار را وارد کنید.</p>
              </div>
            </div>

            <label className="profile-field grid gap-2 branding-statement-field">
              <span className="profile-field-label text-[13px] font-bold text-[color:var(--text-strong)]">بیانیه حقوقی اسناد</span>
              <textarea
                className="profile-textarea app-control"
                value={store.branding.legalStatement}
                placeholder="مثلاً: استفاده، انتشار یا تغییر این سند بدون مجوز کسب‌وکار صادرکننده مجاز نیست."
                onChange={(event) => updateBranding({ legalStatement: event.target.value.slice(0, 800) })}
              />
              <small className="profile-field-hint text-[11px] leading-6 text-[color:var(--text-muted)]">
                این متن اختیاری است و می‌تواند در انتهای قراردادها، گزارش‌ها یا خروجی‌های رسمی نمایش داده شود.
              </small>
            </label>
          </section>
        </ProfileCard>

        <ProfileSubmitBar label={saving ? 'در حال ثبت...' : 'ثبت'} onClick={save} disabled={saving} align="center" />
      </ProfilePageShell>

      <DocumentPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} store={store} meta={meta} />
    </>
  );

  async function uploadHeaderFooterAsset(kind: 'header' | 'footer', file: File | null) {
    if (!file) return;
    if (!isValidImageFile(file)) {
      setNoticeTone('error');
      setNotice('فرمت فایل مجاز نیست. لطفاً فایل PNG یا JPG بارگذاری کنید.');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setNoticeTone('error');
      setNotice('حجم فایل بیش از حد مجاز است.');
      return;
    }

    setSaving(true);
    setNotice('');
    setNoticeTone(null);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateBranding(
        kind === 'header'
          ? { headerImage: dataUrl, headerFileName: file.name }
          : { footerImage: dataUrl, footerFileName: file.name },
      );
      setNoticeTone('success');
      setNotice('فایل با موفقیت بارگذاری شد.');
    } catch {
      setNoticeTone('error');
      setNotice('فایل بارگذاری نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  }
}

function UploadInlineButton({ onChange }: { onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button type="button" className="branding-inline-upload" onClick={() => inputRef.current?.click()}>
        <Camera className="h-4 w-4" />
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </>
  );
}
