'use client';

import { Building2, FileText, Stamp } from 'lucide-react';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfileStore, persistProfileStore, type BrandingSettings } from './profileStorage';
import {
  ProfileCard,
  ProfileHeading,
  ProfilePageShell,
  ProfileSubmitBar,
  ProfileTextareaField,
  ProfileUploadCard,
} from './ProfileFormShell';

export function BusinessBrandingPanel() {
  const router = useRouter();
  const [branding, setBranding] = useState<BrandingSettings>({
    logoImage: '',
    sealImage: '',
    headerImage: '',
    footerImage: '',
    legalStatement: '',
  });

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setBranding(store.branding);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const readFile = (file: File | null, key: keyof BrandingSettings) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBranding((current) => ({ ...current, [key]: String(reader.result ?? '') }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    const store = await fetchProfileStore();
    await persistProfileStore({ ...store, branding });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading title="لوگو و مهر" description="خروجی‌های رسمی کسب‌وکار را با فایل‌های برندینگ تکمیل کنید." />

        <div className="branding-top-grid">
          <ProfileUploadCard
            title="لوگو رسمی"
            description="لوگو در قراردادها و گزارش‌ها استفاده می‌شود."
            value={branding.logoImage}
            icon={<Building2 />}
            onChange={(file) => readFile(file, 'logoImage')}
          />
          <ProfileUploadCard
            title="مهر رسمی دیجیتال"
            description="مهر برای خروجی‌های رسمی و واترمارک استفاده می‌شود."
            value={branding.sealImage}
            icon={<Stamp />}
            onChange={(file) => readFile(file, 'sealImage')}
          />
        </div>

        <div className="branding-paper-card">
          <h2>سربرگ و پاورقی</h2>
          <div className="branding-paper-preview">
            <div className="branding-paper-slot top">
              {branding.headerImage ? <img src={branding.headerImage} alt="سربرگ" className="branding-paper-image" /> : <FileText />}
              <UploadInlineButton onChange={(file) => readFile(file, 'headerImage')} />
            </div>
            <div className="branding-paper-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="branding-paper-slot bottom">
              {branding.footerImage ? <img src={branding.footerImage} alt="پاورقی" className="branding-paper-image" /> : <FileText />}
              <UploadInlineButton onChange={(file) => readFile(file, 'footerImage')} />
            </div>
          </div>
          <p>سربرگ و پاورقی رسمی شامل نام شرکت، شناسه ملی، کد اقتصادی، آدرس و تلفن</p>
        </div>

        <ProfileTextareaField
          label="بیانیه حقوقی"
          value={branding.legalStatement}
          onChange={(value) => setBranding((current) => ({ ...current, legalStatement: value.slice(0, 800) }))}
        />
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}

function UploadInlineButton({ onChange }: { onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button type="button" className="branding-inline-upload" onClick={() => inputRef.current?.click()}>
        دوربین
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </>
  );
}
