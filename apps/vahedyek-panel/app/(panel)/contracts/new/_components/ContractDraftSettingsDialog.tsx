'use client';

import { Settings2, Sparkles } from 'lucide-react';
import { ContractModal } from './ContractModal';

export function ContractDraftSettingsDialog({
  open,
  loading = false,
  error = '',
  onApplySettings,
  onStartBlank,
}: {
  open: boolean;
  loading?: boolean;
  error?: string;
  onApplySettings: () => void;
  onStartBlank: () => void;
}) {
  return (
    <ContractModal
      open={open}
      onClose={() => {}}
      title="شروع پیش‌نویس قرارداد"
      description="برای ساخت پیش‌نویس جدید می‌توانید اطلاعات مالی ثبت‌شده در تنظیمات را به‌عنوان مقدار اولیه دریافت کنید."
      centeredTitle
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onStartBlank}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            شروع خالی
          </button>
          <button
            type="button"
            onClick={onApplySettings}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-cyan-600 bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'در حال دریافت...' : 'دریافت از تنظیمات'}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-right">
        {error ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
        <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/60 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-cyan-200 bg-white text-cyan-600">
              <Settings2 className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">دریافت اطلاعات از تنظیمات</h3>
              <p className="text-sm leading-7 text-slate-600">
                اگر این گزینه را تأیید کنید، مقادیر ثبت‌شده در تنظیمات مالی به‌عنوان مبنای اولیه این پیش‌نویس اعمال می‌شود و بعداً هم می‌توانید هر بخش را جداگانه تغییر دهید.
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-500">
          در صورت انتخاب «شروع خالی»، پیش‌نویس بدون اعمال مقادیر تنظیمات ساخته می‌شود و هر زمان بخواهید می‌توانید اطلاعات را دستی وارد یا ویرایش کنید.
        </p>
      </div>
    </ContractModal>
  );
}


