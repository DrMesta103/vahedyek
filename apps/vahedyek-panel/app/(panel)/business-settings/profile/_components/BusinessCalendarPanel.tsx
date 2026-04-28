'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfileStore, formatDateBySettings, persistProfileStore, type CalendarSettings } from './profileStorage';
import { ProfileCard, ProfileChipGroup, ProfileHeading, ProfilePageShell, ProfileSubmitBar } from './ProfileFormShell';

const formatOptions = [
  { value: 'yyyy/mm/dd', label: '1400/09/16' },
  { value: 'dd/mm/yyyy', label: '16/09/1400' },
  { value: 'yyyy/mm/dd-short', label: '09/16/1400' },
  { value: 'month-title', label: '16 آذر 1400' },
] as const;

export function BusinessCalendarPanel() {
  const router = useRouter();
  const [settings, setSettings] = useState<CalendarSettings>({ system: 'jalali', format: 'yyyy/mm/dd-short' });

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setSettings(store.calendar);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const save = async () => {
    const store = await fetchProfileStore();
    await persistProfileStore({ ...store, calendar: settings });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard className="calendar-settings-card">
        <ProfileHeading title="سیستم تقویم" description="نمایش تاریخ‌ها و فرمت اعداد را تنظیم کنید." />

        <ProfileChipGroup
          label="سیستم تقویم"
          hint="انتخاب تقویم مرجع برای نمایش تاریخ‌ها"
          items={[
            { value: 'jalali', label: 'هجری شمسی' },
            { value: 'gregorian', label: 'میلادی' },
          ]}
          value={settings.system}
          onChange={(value) => setSettings((current) => ({ ...current, system: value }))}
        />

        <ProfileChipGroup
          label="فرمت عدد و تاریخ"
          hint="فرمت تاریخ و جداکننده اعداد بر اساس Locale تنظیم می‌شود"
          items={formatOptions.map((item) => ({ value: item.value, label: item.label }))}
          value={settings.format}
          onChange={(value) => setSettings((current) => ({ ...current, format: value }))}
        />
        <p className="profile-settings-preview calendar-preview">نمونه نمایش تاریخ: {formatDateBySettings('1400-09-16', settings)}</p>
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}
