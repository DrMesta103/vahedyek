'use client';

export type SettingsFieldAlignmentStatus = 'equal' | 'different' | 'idle';

type SettingsFieldAlignmentTagProps = {
  status: SettingsFieldAlignmentStatus;
  settingsLabel?: string | null;
};

export function SettingsFieldAlignmentTag({ status, settingsLabel }: SettingsFieldAlignmentTagProps) {
  if (status === 'idle') return null;

  if (status === 'equal') {
    return (
      <span className="inline-flex max-w-full rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-800">
        سازگار با تنظیمات
      </span>
    );
  }

  const label = settingsLabel?.trim() ? `در تنظیمات: ${settingsLabel.trim()}` : 'مغایرت با تنظیمات';
  return (
    <span className="inline-flex max-w-full rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium leading-5 text-amber-900">
      {label}
    </span>
  );
}
