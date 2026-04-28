'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfileStore, persistProfileStore, type LanguageSettings } from './profileStorage';
import { ProfileCard, ProfileChipGroup, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

const languageOptions = [
  { value: 'fa-IR', label: 'فارسی (fa-IR)' },
  { value: 'en-US', label: 'انگلیسی (en-US)' },
  { value: 'ar-AR', label: 'عربی (ar-AR)' },
  { value: 'fr-CA', label: 'فرانسوی (fr-CA)' },
] as const;

export function BusinessLanguagePanel() {
  const router = useRouter();
  const [settings, setSettings] = useState<LanguageSettings>({ defaultLanguage: 'fa-IR', activeLanguages: ['fa-IR'] });

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setSettings(store.languages);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const save = async () => {
    const store = await fetchProfileStore();
    await persistProfileStore({ ...store, languages: settings });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading title="زبان های فعال" description="زبان پیش‌فرض و زبان‌های در دسترس اپلیکیشن را تنظیم کنید." />

        <ProfileChipGroup
          label="زبان پیش فرض"
          hint="همه قراردادها و مکاتبات رسمی بر اساس این زبان تنظیم می‌شوند."
          items={[...languageOptions]}
          value={settings.defaultLanguage}
          onChange={(value) => setSettings((current) => ({ ...current, defaultLanguage: value }))}
        />

        <ProfileChipGroup
          label="زبان‌های فعال اپلیکیشن"
          hint="زبان‌های فعال برای نمایش به کاربران یا مشتریان"
          items={[...languageOptions]}
          value={settings.activeLanguages}
          multiple
          onChange={(value) =>
            setSettings((current) => ({
              ...current,
              activeLanguages: current.activeLanguages.includes(value)
                ? current.activeLanguages.filter((item) => item !== value)
                : [...current.activeLanguages, value],
            }))
          }
        />
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}
