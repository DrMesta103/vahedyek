'use client';

import { useCallback } from 'react';
import { Eye } from 'lucide-react';
import { AppendixDeliveryDateEditor } from './AppendixDeliveryDateEditor';
import { AppendixPartiesEditor } from './AppendixPartiesEditor';
import { AppendixAdjustmentEditor } from './AppendixAdjustmentEditor';
import { AppendixContractBaseCostsEditor } from './AppendixContractBaseCostsEditor';
import { AppendixGenericTagEditor } from './AppendixGenericTagEditor';
import { AppendixLoanEditor } from './AppendixLoanEditor';
import { AppendixMaterialSpecsChangeEditor } from './AppendixTechnicalSpecsEditor';
import { AppendixPenaltyWaiverEditor } from './AppendixPenaltyWaiverEditor';
import { AppendixBuilderPenaltyEditor } from './AppendixBuilderPenaltyEditor';
import { AppendixBuilderCancellationEditor, AppendixBuyerCancellationEditor } from './AppendixTerminationEditor';
import { AppendixSideCostsEditor } from './AppendixSideCostsEditor';
import { useAppendixEditor } from './AppendixEditorContext';
import { CONTRACT_APPENDIX_TAG_MAP } from '../../../lib/contractAppendixConfig';
import {
  GENERIC_CONDITION_APPENDIX_TAGS,
  GENERIC_DATE_APPENDIX_TAGS,
  GENERIC_FINANCIAL_APPENDIX_TAGS,
  type AppendixBuilderPenaltyPayload,
  type AppendixGenericPayload,
} from '../../../lib/appendixPayloads';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixLoanPayload,
  AppendixMaterialSpecsChangePayload,
  AppendixPenaltyWaiverPayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  SupportedAppendixTagKey,
} from '../../../types/contract';

function getTagTitle(tag: SupportedAppendixTagKey) {
  const definition = CONTRACT_APPENDIX_TAG_MAP.get(tag);
  if (definition?.title) return definition.title;
  switch (tag) {
    case 'loan':
      return 'وام';
    case 'adjustment':
      return 'تعدیل';
    case 'contract-base-costs':
      return 'هزینه های اصل قرارداد';
    case 'side-costs':
      return 'هزینه های جانبی';
    case 'material-specs-change':
      return 'تغییرات مشخصات فنی پروژه';
    case 'first-party':
      return 'طرف اول';
    case 'second-party':
      return 'طرف دوم';
    case 'unit-delivery-date':
      return 'تاریخ تحویل واحد';
    case 'unit-delivery':
      return 'تحویل واحد';
    case 'forgiveness':
      return 'بخشودگی';
    case 'contract-costs':
      return 'هزینه مربوط به قرارداد';
    case 'penalty-waiver':
      return 'جرائم کارفرما';
    case 'builder-penalty':
      return 'جرائم سازنده';
    case 'builder-cancellation':
      return 'فسخ سازنده';
    case 'buyer-cancellation':
      return 'فسخ خریدار';
    case 'workshop-conditions':
      return 'شرایط ساخت';
    case 'arbitration':
      return 'داوری';
    case 'due-dates':
      return 'تاریخ سررسید ها';
    case 'commitment-date':
      return 'تاریخ وجه التزام';
  }
}

function getTagDescription(tag: SupportedAppendixTagKey) {
  const definition = CONTRACT_APPENDIX_TAG_MAP.get(tag);
  if (definition?.description) return definition.description;
  switch (tag) {
    case 'loan':
      return 'ثبت وضعیت پرداخت و تنظیمات الحاقیه وام';
    case 'adjustment':
      return 'اعمال تعدیل در قالب یک ردیف مالی ثابت';
    case 'contract-base-costs':
      return 'اصلاح ردیف مالی اصل قرارداد و سررسیدهای پرداخت اصلی';
    case 'side-costs':
      return 'مدیریت ردیف های مالی جانبی قرارداد';
    case 'material-specs-change':
      return 'ثبت پرونده تغییرات مشخصات فنی پروژه و فعال‌سازی نتیجه قراردادی بر اساس مستندات و وضعیت تأیید خریدار';
    case 'unit-delivery-date':
      return 'ثبت تاریخ جدید تحویل واحد';
    case 'unit-delivery':
      return 'تغییرات مالی مرتبط با تحویل واحد';
    case 'forgiveness':
      return 'بخشودگی اقلام قرارداد';
    case 'contract-costs':
      return 'هزینه‌های جدید مربوط به قرارداد';
    case 'penalty-waiver':
      return 'تنظیم جرائم کارفرما با ساختاری مشابه بخش پیش‌نویس جریمه';
    case 'builder-penalty':
      return 'تنظیم جرائم سازنده با ساختاری مشابه بخش پیش‌نویس جریمه';
    case 'builder-cancellation':
      return 'تنظیم فسخ سازنده با ساختاری مشابه بخش پیش‌نویس فسخ';
    case 'buyer-cancellation':
      return 'تنظیم فسخ خریدار با ساختاری مشابه بخش پیش‌نویس فسخ';
    case 'workshop-conditions':
      return 'اصلاح شرایط ساخت و تعهدات پروژه';
    case 'arbitration':
      return 'تغییر در بندهای داوری و حل اختلاف';
    case 'due-dates':
      return 'تغییر در تاریخ سررسیدها';
    case 'commitment-date':
      return 'تغییر در تاریخ‌های وجه التزام';
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

  const handleLoanChange = useCallback(
    (value: AppendixLoanPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleMaterialSpecsChange = useCallback(
    (value: AppendixMaterialSpecsChangePayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handlePenaltyWaiverChange = useCallback(
    (value: AppendixPenaltyWaiverPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleBuilderPenaltyChange = useCallback(
    (value: AppendixBuilderPenaltyPayload) => {
      updateTagPayload(tag, value);
    },
    [tag, updateTagPayload],
  );

  const handleGenericChange = useCallback(
    (value: AppendixGenericPayload) => {
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

      {tag === 'loan' ? (
        <div className="mt-6">
          <AppendixLoanEditor value={payload as AppendixLoanPayload} onChange={handleLoanChange} />
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

      {tag === 'material-specs-change' ? (
        <div className="mt-6">
          <AppendixMaterialSpecsChangeEditor value={payload as AppendixMaterialSpecsChangePayload} onChange={handleMaterialSpecsChange} />
        </div>
      ) : null}

      {tag === 'penalty-waiver' ? (
        <div className="mt-6">
          <AppendixPenaltyWaiverEditor value={payload as AppendixPenaltyWaiverPayload} onChange={handlePenaltyWaiverChange} />
        </div>
      ) : null}

      {tag === 'builder-penalty' ? (
        <div className="mt-6">
          <AppendixBuilderPenaltyEditor value={payload as AppendixBuilderPenaltyPayload} onChange={handleBuilderPenaltyChange} />
        </div>
      ) : null}

      {tag === 'builder-cancellation' ? (
        <div className="mt-6">
          <AppendixBuilderCancellationEditor />
        </div>
      ) : null}

      {tag === 'buyer-cancellation' ? (
        <div className="mt-6">
          <AppendixBuyerCancellationEditor />
        </div>
      ) : null}

      {GENERIC_FINANCIAL_APPENDIX_TAGS.includes(tag as (typeof GENERIC_FINANCIAL_APPENDIX_TAGS)[number]) ||
      GENERIC_CONDITION_APPENDIX_TAGS.includes(tag as (typeof GENERIC_CONDITION_APPENDIX_TAGS)[number]) ||
      GENERIC_DATE_APPENDIX_TAGS.includes(tag as (typeof GENERIC_DATE_APPENDIX_TAGS)[number]) ? (
        <AppendixGenericTagEditor tag={tag} value={payload as AppendixGenericPayload} onChange={handleGenericChange} />
      ) : null}
    </div>
  );
}
