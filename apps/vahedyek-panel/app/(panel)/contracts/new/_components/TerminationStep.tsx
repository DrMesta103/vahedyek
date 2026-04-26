'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Scale } from 'lucide-react';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldGroup, FormTextInput, SectionCard, SectionHeader } from './ContractFormPrimitives';
import { StickySubmitBar } from './StickySubmitBar';
import {
  ensureActiveDraftId,
  getFrontendStepDraft,
  getStepData,
  setFrontendStepDraft,
} from '../../../../lib/contractDraftClient';
import { validateTerminationStep } from '../../../../lib/contractValidation';
import type { ContractSubjectData, ContractTerminationData } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import type { ContractFlowSectionId } from './contractFlowSignals';
import { useContractFlowBasePath } from './useContractFlowBasePath';

const DEFAULT_TERMINATION_DATA: ContractTerminationData = {
  noticeDays: '10',
  cureDays: '15',
  settlementDays: '20',
  restitutionDays: '10',
  handoverDays: '7',
  customClauses: '',
  acknowledged: false,
};

function normalizeTerminationPayload(data: ContractTerminationData | null): ContractTerminationData {
  return {
    noticeDays: String(data?.noticeDays ?? DEFAULT_TERMINATION_DATA.noticeDays),
    cureDays: String(data?.cureDays ?? DEFAULT_TERMINATION_DATA.cureDays),
    settlementDays: String(data?.settlementDays ?? DEFAULT_TERMINATION_DATA.settlementDays),
    restitutionDays: String(data?.restitutionDays ?? DEFAULT_TERMINATION_DATA.restitutionDays),
    handoverDays: String(data?.handoverDays ?? DEFAULT_TERMINATION_DATA.handoverDays),
    customClauses: String(data?.customClauses ?? ''),
    acknowledged: Boolean(data?.acknowledged),
  };
}

function serializePayload(payload: ContractTerminationData) {
  return JSON.stringify(payload);
}

function normalizeNumericInput(value: string) {
  return value.replace(/\D/g, '');
}

export function TerminationStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [payload, setPayload] = useState<ContractTerminationData>(DEFAULT_TERMINATION_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const nextDraftId = await ensureActiveDraftId();
      if (!mounted) return;
      setDraftId(nextDraftId);

      try {
        const [frontendDraft, subject] = await Promise.all([
          Promise.resolve(getFrontendStepDraft<ContractTerminationData>(nextDraftId, 'termination')),
          getStepData<ContractSubjectData>(nextDraftId, 'subject'),
        ]);

        if (!mounted) return;
        const nextPayload = normalizeTerminationPayload(frontendDraft);
        setPayload(nextPayload);
        setSubjectData(subject);
        initialSnapshotRef.current = serializePayload(nextPayload);
        dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [stepId]);

  const validation = useMemo(() => validateTerminationStep(payload), [payload]);

  useEffect(() => {
    if (loading) return;
    const snapshot = serializePayload(payload);
    dispatchContractFlowDirty(stepId as ContractFlowSectionId, snapshot !== initialSnapshotRef.current);
  }, [loading, payload, stepId]);

  const labels = useMemo(() => {
    if (subjectData?.contractType === 'pre-sale') {
      return {
        partyOne: 'پیش‌فروشنده',
        partyTwo: 'پیش‌خریدار',
      };
    }

    return {
      partyOne: 'فروشنده',
      partyTwo: 'خریدار',
    };
  }, [subjectData?.contractType]);

  const clauseGroups = useMemo(
    () => [
      {
        title: `مواردی که به ${labels.partyOne} حق فسخ می‌دهد`,
        tone: 'rose',
        items: [
          `${labels.partyTwo} هر یک از اقساط یا تعهدات مالی مقرر در قرارداد را پس از ابلاغ اخطار کتبی، بیش از ${payload.noticeDays} روز به تأخیر اندازد و ظرف ${payload.cureDays} روز از تاریخ ابلاغ نیز تخلف را برطرف نکند.`,
          `${labels.partyTwo} بدون مجوز کتبی ${labels.partyOne}، حقوق و منافع ناشی از این قرارداد را به ثالث واگذار کند یا اقدامی انجام دهد که اجرای صحیح قرارداد یا انتقال رسمی را با مانع جدی مواجه سازد.`,
          `${labels.partyTwo} اسناد یا اطلاعات مؤثر بر احراز هویت، منبع وجوه، یا امکان تنظیم سند رسمی را خلاف واقع ارائه دهد و با وجود اخطار کتبی، ظرف ${payload.cureDays} روز نسبت به اصلاح آن اقدام نکند.`,
        ],
      },
      {
        title: `مواردی که به ${labels.partyTwo} حق فسخ می‌دهد`,
        tone: 'emerald',
        items: [
          `${labels.partyOne} مالکیت، اختیار قانونی انتقال، یا امکان انتقال رسمی موضوع قرارداد را نداشته باشد، یا وجود بازداشت، رهن، معارض، منع قانونی انتقال، یا بدهی مؤثر را پیش از قرارداد افشا نکرده باشد و ظرف ${payload.cureDays} روز از تاریخ اخطار کتبی نسبت به رفع مانع اقدام نکند.`,
          `${labels.partyOne} واحد، مشاعات، پارکینگ، انباری، یا اوصاف اصلی مورد توافق را به‌طور اساسی برخلاف قرارداد تحویل دهد یا بدون رضایت ${labels.partyTwo} تغییر دهد؛ به‌نحوی‌که عرفاً انتفاع متعارف مورد انتظار از ملک مختل شود.`,
          `${labels.partyOne} در تحویل مورد قرارداد یا فراهم کردن مقدمات تنظیم سند رسمی، پس از اخطار کتبی ${labels.partyTwo} و انقضای ${payload.noticeDays} روز، همچنان از انجام تعهد اصلی خود امتناع کند.`,
        ],
      },
      {
        title: 'تشریفات و آثار فسخ',
        tone: 'slate',
        items: [
          `اعمال حق فسخ منوط به ارسال اخطار کتبی و اعطای مهلت جبران به مدت ${payload.cureDays} روز است؛ مگر در مواردی که تخلف ذاتاً غیرقابل جبران باشد یا موضوع، فقدان اختیار قانونی انتقال و موانع ثبتی مؤثر باشد.`,
          `پس از اعلام فسخ، طرفین مکلف‌اند حداکثر ظرف ${payload.settlementDays} روز نسبت به تنظیم صورت‌جلسه تسویه، تعیین مطالبات، جرایم، خسارات قراردادی و هزینه‌های مستند اقدام کنند.`,
          `در صورت فسخ، هر مبلغی که باید به طرف مقابل مسترد شود، پس از کسر مطالبات قطعی، جرایم، خسارات و هزینه‌های قانونی یا قراردادی، حداکثر ظرف ${payload.restitutionDays} روز پرداخت خواهد شد.`,
          `چنانچه تحویل فیزیکی واحد، مدارک، کلیدها، یا مستندات مرتبط انجام شده باشد، طرف متصرف موظف است حداکثر ظرف ${payload.handoverDays} روز از تاریخ تسویه یا اعلام قطعی فسخ، مورد تحویل‌گرفته را به طرف مقابل عودت دهد.`,
        ],
      },
    ],
    [labels.partyOne, labels.partyTwo, payload.cureDays, payload.handoverDays, payload.noticeDays, payload.restitutionDays, payload.settlementDays],
  );

  const handleBack = () => router.push(basePath);

  const updatePayload = (key: keyof ContractTerminationData, value: string | boolean) => {
    setFormError('');
    setPayload((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (!draftId) return;

    const nextValidation = validateTerminationStep(payload);
    if (!nextValidation.valid) {
      setFormError(
        nextValidation.errors.acknowledged ??
          nextValidation.errors.noticeDays ??
          nextValidation.errors.cureDays ??
          nextValidation.errors.settlementDays ??
          nextValidation.errors.restitutionDays ??
          nextValidation.errors.handoverDays ??
          'اطلاعات شرایط فسخ کامل نیست.',
      );
      return;
    }

    setSaving(true);
    setFrontendStepDraft(draftId, 'termination', payload);
    initialSnapshotRef.current = serializePayload(payload);
    dispatchContractFlowDirty(stepId as ContractFlowSectionId, false);
    dispatchContractFlowSaved(stepId as ContractFlowSectionId);
    setSaving(false);
  };

  if (loading) {
    return <ContractStepLoader title={title} description="در حال آماده‌سازی بندهای فسخ قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-gray-500">بندهای متوازن برای حق فسخ هر دو طرف در قراردادهای ساختمانی.</p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md border px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-slate-700">
        <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
          <Scale className="h-4 w-4 text-cyan-700" />
          متن پیشنهادی قابل درج در قرارداد
        </div>
        این بخش با منطق رایج قراردادهای فروش و پیش‌فروش ساختمان تنظیم شده است: ابتدا اخطار کتبی، سپس مهلت رفع تخلف، و بعد اعمال فسخ و تسویه.
      </div>

      <SectionCard>
        <SectionHeader label="پارامترهای اجرایی فسخ" description="این مقادیر داخل متن بندهای فسخ جای‌گذاری می‌شوند." />
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <FieldGroup label="مهلت اخطار کتبی" required hint="به روز">
            <FormTextInput value={payload.noticeDays} onChange={(value) => updatePayload('noticeDays', normalizeNumericInput(value))} placeholder="مثال: 10" />
          </FieldGroup>
          <FieldGroup label="مهلت رفع تخلف" required hint="به روز">
            <FormTextInput value={payload.cureDays} onChange={(value) => updatePayload('cureDays', normalizeNumericInput(value))} placeholder="مثال: 15" />
          </FieldGroup>
          <FieldGroup label="مهلت تسویه پس از فسخ" required hint="به روز">
            <FormTextInput value={payload.settlementDays} onChange={(value) => updatePayload('settlementDays', normalizeNumericInput(value))} placeholder="مثال: 20" />
          </FieldGroup>
          <FieldGroup label="مهلت عودت و تخلیه" required hint="به روز">
            <FormTextInput value={payload.handoverDays} onChange={(value) => updatePayload('handoverDays', normalizeNumericInput(value))} placeholder="مثال: 7" />
          </FieldGroup>
          <FieldGroup label="مهلت استرداد وجوه" required hint="به روز">
            <FormTextInput
              value={payload.restitutionDays}
              onChange={(value) => updatePayload('restitutionDays', normalizeNumericInput(value))}
              placeholder="مثال: 10"
            />
          </FieldGroup>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-3">
        {clauseGroups.map((group) => (
          <div
            key={group.title}
            className={`rounded-2xl border p-5 ${
              group.tone === 'rose'
                ? 'border-rose-100 bg-rose-50/40'
                : group.tone === 'emerald'
                  ? 'border-emerald-100 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
            <ol className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
              {group.items.map((item, index) => (
                <li key={`${group.title}-${index}`} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm">
                    {new Intl.NumberFormat('fa-IR').format(index + 1)}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <SectionCard>
        <SectionHeader label="ملاحظه تکمیلی" description="اگر این پروژه بند خاصی دارد، اینجا اضافه کنید تا کنار متن اصلی استفاده شود." />
        <div className="p-5">
          <textarea
            value={payload.customClauses}
            onChange={(event) => updatePayload('customClauses', event.target.value)}
            rows={5}
            placeholder="مثال: در صورت تغییر متراژ مفید بیش از حد توافق، طرف متضرر حق مطالبه تعدیل یا فسخ خواهد داشت."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          />
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
          <input
            type="checkbox"
            checked={payload.acknowledged}
            onChange={(event) => updatePayload('acknowledged', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
          />
          <span>
            این متن به عنوان پیش‌نویس اجرایی بند فسخ بررسی شد و در صورت لزوم با شرایط خاص پروژه، مجوزها، برنامه پرداخت و متن نهایی قرارداد تطبیق داده می‌شود.
          </span>
        </label>
      </div>

      {payload.customClauses.trim() ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-7 text-slate-700">
          <div className="mb-2 font-bold text-slate-900">بند تکمیلی پیشنهادی شما</div>
          {payload.customClauses}
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4" />
            خطا در ثبت شرایط فسخ
          </div>
          <p className="mt-1">{formError}</p>
        </div>
      ) : null}

      <StickySubmitBar
        label="ثبت شرایط فسخ"
        loadingLabel="در حال ثبت..."
        onClick={handleSave}
        disabled={saving}
        embedded={embedded}
        submitId={stepId}
      />
    </div>
  );
}
