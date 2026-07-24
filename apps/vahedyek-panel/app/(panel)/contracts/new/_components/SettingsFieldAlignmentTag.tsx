'use client';

export type SettingsFieldAlignmentStatus = 'equal' | 'different' | 'missing' | 'idle';

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

  if (status === 'missing') {
    return (
      <span className="inline-flex max-w-full rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        در تنظیمات ثبت نشده
      </span>
    );
  }

  const trimmed = settingsLabel?.trim() ?? '';
  return (
    <span className="inline-flex max-w-full flex-wrap items-center justify-end gap-1.5">
      <span className="inline-flex max-w-full rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium leading-5 text-amber-900">
        مغایرت با تنظیمات
      </span>
      {trimmed ? (
        <span className="inline-flex max-w-full rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium leading-5 text-amber-900">
          در تنظیمات: {trimmed}
        </span>
      ) : null}
    </span>
  );
}
