'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProfileStore, saveProfileStore, type MeasurementSettings } from './profileStorage';
import { ProfileCard, ProfileChipGroup, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

export function BusinessMeasurementPanel() {
  const router = useRouter();
  const [settings, setSettings] = useState<MeasurementSettings>({ unit: 'meter' });

  useEffect(() => {
    setSettings(loadProfileStore().measurement);
  }, []);

  const save = () => {
    const store = loadProfileStore();
    saveProfileStore({ ...store, measurement: settings });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading title="واحد اندازه‌گیری" description="واحد پیش‌فرض متراژ ملک را انتخاب کنید." />

        <ProfileChipGroup
          label="واحد اندازه‌گیری"
          items={[
            { value: 'meter', label: 'متر مربع' },
            { value: 'foot', label: 'فوت مربع' },
          ]}
          value={settings.unit}
          onChange={(value) => setSettings({ unit: value })}
        />
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}
