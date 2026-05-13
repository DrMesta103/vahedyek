'use client';

import { useCallback } from 'react';
import { Eye } from 'lucide-react';
import { AppendixDeliveryDateEditor } from './AppendixDeliveryDateEditor';
import { AppendixPartiesEditor } from './AppendixPartiesEditor';
import { AppendixAdjustmentEditor } from './AppendixAdjustmentEditor';
import { AppendixContractBaseCostsEditor } from './AppendixContractBaseCostsEditor';
import { AppendixSideCostsEditor } from './AppendixSideCostsEditor';
import { useAppendixEditor } from './AppendixEditorContext';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  SupportedAppendixTagKey,
} from '../../../types/contract';

function getTagTitle(tag: SupportedAppendixTagKey) {
  switch (tag) {
    case 'adjustment':
      return 'تعدیل';
    case 'contract-base-costs':
      return 'هزینه های اصل قرارداد';
    case 'side-costs':
      return 'هزینه های جانبی';
    case 'first-party':
      return 'طرف اول';
    case 'second-party':
      return 'طرف دوم';
    case 'unit-delivery-date':
      return 'تاریخ تحویل واحد';
  }
}

function getTagDescription(tag: SupportedAppendixTagKey) {
  switch (tag) {
    case 'adjustment':
      return 'اعمال تعدیل در قالب یک ردیف مالی ثابت';
    case 'contract-base-costs':
      return 'اصلاح ردیف مالی اصل قرارداد و سررسیدهای پرداخت اصلی';
    case 'side-costs':
      return 'مدیریت ردیف های مالی جانبی قرارداد';
    case 'unit-delivery-date':
      return 'ثبت تاریخ جدید تحویل واحد';
    default:
      return 'اصلاح اطلاعات و سهم طرفین در الحاقیه';
  }
}

export function AppendixTagPageRenderer({ tag }: { tag: SupportedAppendixTagKey }) {
  const { contract, payloads, updateTagPayload, openPreviousDialog, buildPartyReturnTo, dialogSignal, setDialogSignal } = useAppendixEditor();
  const payload = payloads[tag];

  const handleDeliveryDateChange = useCallback(
    (value: string) => {
      updateTagPayload(tag, { ...(payload as AppendixDeliveryDatePayload), nextDate: value });
    },
    [payload, tag, updateTagPayload],
  );

  const handlePartiesChange = useCallback(
    (value: AppendixPartiesPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleAdjustmentChange = useCallback(
    (value: AppendixAdjustmentPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleContractBaseCostsChange = useCallback(
    (value: AppendixContractBaseCostsPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleSideCostsChange = useCallback(
    (value: AppendixSideCostsPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  if (!payload) {
    return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6 text-center text-sm font-semibold text-slate-500">داده این بخش هنوز آماده نشده است.</div>;
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-right">
          <div className="text-[18px] font-black text-slate-900">{getTagTitle(tag)}</div>
          <p className="mt-1 text-[12px] font-semibold leading-7 text-slate-500">{getTagDescription(tag)}</p>
        </div>

        <button
          type="button"
          onClick={() => openPreviousDialog(tag)}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700"
        >
          <Eye className="h-4 w-4" />
          مشاهده داده قبلی
        </button>
      </div>

      {tag === 'unit-delivery-date' ? (
        <AppendixDeliveryDateEditor nextDate={(payload as AppendixDeliveryDatePayload).nextDate} onNextDateChange={handleDeliveryDateChange} />
      ) : null}

      {tag === 'first-party' || tag === 'second-party' ? (
        <div className="mt-6">
          <AppendixPartiesEditor
            side={tag}
            value={payload as AppendixPartiesPayload}
            initialParties={contract?.data?.parties ?? null}
            returnTo={buildPartyReturnTo(tag)}
            onChange={handlePartiesChange}
            openDialogSignal={dialogSignal?.side === tag ? dialogSignal.nonce : undefined}
            onDialogSignalConsumed={() => setDialogSignal(null)}
          />
        </div>
      ) : null}

      {tag === 'adjustment' ? (
        <div className="mt-6">
          <AppendixAdjustmentEditor value={payload as AppendixAdjustmentPayload} onChange={handleAdjustmentChange} />
        </div>
      ) : null}

      {tag === 'contract-base-costs' ? (
        <div className="mt-6">
          <AppendixContractBaseCostsEditor value={payload as AppendixContractBaseCostsPayload} onChange={handleContractBaseCostsChange} />
        </div>
      ) : null}

      {tag === 'side-costs' ? (
        <div className="mt-6">
          <AppendixSideCostsEditor value={payload as AppendixSideCostsPayload} onChange={handleSideCostsChange} />
        </div>
      ) : null}
    </div>
  );
}
