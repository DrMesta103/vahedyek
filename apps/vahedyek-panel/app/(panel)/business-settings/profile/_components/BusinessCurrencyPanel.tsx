'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrencyBySettings, loadProfileStore, saveProfileStore, type CurrencySettings } from './profileStorage';
import { ProfileCard, ProfileChipGroup, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

export function BusinessCurrencyPanel() {
  const router = useRouter();
  const [settings, setSettings] = useState<CurrencySettings>({ baseCurrency: 'irr', quoteCurrency: 'toman' });

  useEffect(() => {
    setSettings(loadProfileStore().currency);
  }, []);

  const save = () => {
    const store = loadProfileStore();
    saveProfileStore({ ...store, currency: settings });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading title="ارز پایه" description="ارز مرجع نمایش قراردادها و گزارش‌ها را تنظیم کنید." />

        <ProfileChipGroup label="ارز پایه" items={[{ value: 'irr', label: 'ریال (ایران)' }]} value={settings.baseCurrency} onChange={() => undefined} />
        <ProfileChipGroup
          label="ارز مرجع"
          items={[
            { value: 'irr', label: 'ریال' },
            { value: 'toman', label: 'تومان' },
          ]}
          value={settings.quoteCurrency}
          onChange={(value) => setSettings((current) => ({ ...current, quoteCurrency: value }))}
        />
        <p className="profile-settings-preview">نمونه نمایش مبلغ: {formatCurrencyBySettings(1250000, settings)}</p>
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}
