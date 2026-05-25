'use client';

import { Building2, Camera, FileText, Stamp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type BrandingSettings, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore } from '../profileStorage';
import { BUSINESS_PROFILE_BRANDING, BUSINESS_PROFILE_ROOT, getSelectTenantPath } from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
import { ProfileBackLink, ProfileCard, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

function readFileAsDataUrl(file: File | null): Promise<string> {
  if (!file) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

export default function BrandingPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');

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

  const save = async () => {
    setSaving(true);
    setNotice('');
    try {
      await persistProfileStore(store);
      router.push(BUSINESS_PROFILE_ROOT);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_BRANDING));
        return;
      }
      setNotice('ثبت برندینگ با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

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
          { label: 'لوگو و مهر' },
        ]}
      />

      {notice ? <LoadingCard label={notice} /> : null}

      <ProfilePageShell className="branding-reference-page">
        <div className="flex items-center justify-between gap-3">
          <ProfileBackLink href={BUSINESS_PROFILE_ROOT}>بازگشت به پروفایل کسب‌وکار</ProfileBackLink>
          <span className="status-chip status-chip-completed">{meta.brandCode || 'DS'}</span>
        </div>

        <ProfileCard className="branding-reference-card">
          <ProfileHeading title="لوگو و مهر" description="خروجی‌های رسمی کسب‌وکار را با فایل‌های برندینگ تکمیل کنید." />

          <div className="branding-top-grid">
            <BrandUploadCard
              title="لوگوی رسمی"
              description="لوگو در قراردادها و گزارش‌ها استفاده می‌شود."
              value={store.branding.logoImage}
              icon={<Building2 />}
              onChange={async (file) => {
                const dataUrl = await readFileAsDataUrl(file);
                updateBranding({ logoImage: dataUrl });
              }}
            />

            <BrandUploadCard
              title="مهر رسمی دیجیتال"
              description="مهر برای خروجی‌های رسمی و واترمارک استفاده می‌شود."
              value={store.branding.sealImage}
              icon={<Stamp />}
              onChange={async (file) => {
                const dataUrl = await readFileAsDataUrl(file);
                updateBranding({ sealImage: dataUrl });
              }}
            />
          </div>

          <div className="branding-paper-card">
            <h2>سربرگ و پاورقی</h2>
            <div className="branding-paper-preview">
              <div className="branding-paper-slot top">
                {store.branding.headerImage ? <img src={store.branding.headerImage} alt="سربرگ" className="branding-paper-image" /> : <FileText />}
                <UploadInlineButton
                  onChange={async (file) => {
                    const dataUrl = await readFileAsDataUrl(file);
                    updateBranding({ headerImage: dataUrl });
                  }}
                />
              </div>
              <div className="branding-paper-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="branding-paper-slot bottom">
                {store.branding.footerImage ? <img src={store.branding.footerImage} alt="پاورقی" className="branding-paper-image" /> : <FileText />}
                <UploadInlineButton
                  onChange={async (file) => {
                    const dataUrl = await readFileAsDataUrl(file);
                    updateBranding({ footerImage: dataUrl });
                  }}
                />
              </div>
            </div>
            <p>سربرگ و پاورقی رسمی شامل نام شرکت، شناسه ملی، کد اقتصادی، آدرس و تلفن</p>
          </div>

          <label className="profile-field grid gap-2">
            <span className="profile-field-label text-[13px] font-bold text-[color:var(--text-strong)]">بیانیه حقوقی</span>
            <textarea
              className="profile-textarea app-control"
              value={store.branding.legalStatement}
              onChange={(event) => updateBranding({ legalStatement: event.target.value.slice(0, 800) })}
            />
          </label>
        </ProfileCard>

        <ProfileSubmitBar label={saving ? 'در حال ثبت...' : 'ثبت'} onClick={save} disabled={saving} align="center" />
      </ProfilePageShell>
    </>
  );
}

function BrandUploadCard({
  title,
  description,
  value,
  icon,
  onChange,
}: {
  title: string;
  description: string;
  value: string;
  icon: ReactNode;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="brand-upload-card">
      <h3>{title}</h3>
      <div className="brand-upload-preview">
        {value ? <img src={value} alt={title} className="brand-upload-image" /> : icon}
        <button type="button" className="brand-upload-action" onClick={() => inputRef.current?.click()}>
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <p>{description}</p>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </div>
  );
}

function UploadInlineButton({ onChange }: { onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button type="button" className="branding-inline-upload" onClick={() => inputRef.current?.click()}>
        <Camera className="h-4 w-4" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </>
  );
}
