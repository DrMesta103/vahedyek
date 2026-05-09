'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { BusinessSwitch, FormTextInput, SectionCard, SectionHeader, TagPills } from '../../../contracts/new/_components/ContractFormPrimitives';

import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import type { WorkflowStepDefinition } from '../../../../lib/workflowTypes';
import {
  getApprovalWorkflowAction,
  listApprovalWorkflowsAction,
  listTenantMembersForApproversAction,
  createApprovalWorkflowAction,
  updateApprovalWorkflowAction,
} from '../../../../actions/workflowActions';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

type UserOpt = { id: string; label: string };

function newStepId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

function defaultStep(globalType: 'PARALLEL' | 'SEQUENTIAL'): WorkflowStepDefinition {
  return {
    id: newStepId(),
    title: 'مرحله جدید',
    approvers: [],
    finalApproverId: null,
    logic: { mode: 'ALL_MUST_APPROVE' },
    type: globalType,
    permissions: { rejectToDraftApproverIds: 'ALL_APPROVERS', requestRevisionApproverIds: 'ALL_APPROVERS' },
    isFinal: false,
  };
}

function HelperText({ text }: { text: string }) {
  return <div className="mt-1 text-right text-[11px] font-semibold leading-6 text-[var(--text-muted)]">{text}</div>;
}

function InlineGuide({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 text-right text-[12px] font-normal leading-6 text-[var(--text-muted)] ${className}`.trim()}>{children}</p>;
}

function LabelWithGuide({ label, guide }: { label: string; guide: ReactNode }) {
  return (
    <div className="mb-1.5 text-right">
      <span className="text-[12px] font-extrabold text-[var(--text-strong)]">{label}</span>
      <InlineGuide>{guide}</InlineGuide>
    </div>
  );
}

function FieldWithGuide({
  label,
  guide,
  hint,
  children,
}: {
  label: string;
  guide: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-right">
      <LabelWithGuide label={label} guide={guide} />
      {children}
      {hint ? <HelperText text={hint} /> : null}
    </label>
  );
}

function usedUsageTypesFromItems(
  items: readonly { id: string; usageTypes: ApprovalUsageKey[] }[],
  currentWorkflowId?: string,
) {
  const keys = new Set<ApprovalUsageKey>();
  for (const item of items) {
    if (currentWorkflowId && item.id === currentWorkflowId) continue;
    for (const key of item.usageTypes ?? []) keys.add(key);
  }
  return Array.from(keys);
}

function SortableStepAccordion({
  step,
  index,
  isLast,
  isOpen,
  users,
  onChange,
  onOpenChange,
  onRemove,
}: {
  step: WorkflowStepDefinition;
  index: number;
  isLast: boolean;
  isOpen: boolean;
  users: UserOpt[];
  onChange: (next: WorkflowStepDefinition) => void;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  const approverCount = step.approvers.length;
  const approverOptions = users.map((u) => ({ value: u.id, label: u.label, disabled: step.approvers.includes(u.id) }));
  const finalApproverOptions = users
    .filter((u) => step.approvers.includes(u.id))
    .map((u) => ({ value: u.id, label: u.label }));

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={step.id} open={isOpen}>
        <AccordionTrigger
          onToggle={() => onOpenChange(!isOpen)}
          rightSlot={
            <div className="flex items-center gap-2">
              {isLast ? <Badge variant="warning">مرحله نهایی</Badge> : null}
              <Badge variant={approverCount ? 'default' : 'muted'}>{approverCount} تأییدکننده</Badge>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-600 hover:bg-rose-50"
                onClick={(e) => {
                  // Keep delete available even when collapsed; don't toggle accordion.
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
                aria-label="جابجایی مرحله"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" aria-hidden />
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-black text-[var(--text-muted)]">مرحله {index + 1}:</span>
            <span className="truncate text-[14px] font-black text-[var(--text-strong)]">{step.title || '—'}</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="space-y-4 text-right">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <label className="block flex-1">
                <LabelWithGuide
                  label="عنوان مرحله"
                  guide="عنوان کوتاه و قابل فهمی که وقتی مرحله جمع شده باشد، کنار شماره مرحله نمایش داده می‌شود."
                />
                <input
                  dir="rtl"
                  value={step.title}
                  onChange={(e) => onChange({ ...step, title: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 text-right text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_15%,transparent)]"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)]/30 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-right text-[12px] font-extrabold text-[var(--text-strong)]">
                    <span>تأییدکنندگان</span>
                  </div>
                </div>
                <InlineGuide>ابتدا خالی است. با جستجو، کارکنان، صاحب کسب‌وکار یا سهامداران ثبت‌شده را اضافه کنید.</InlineGuide>

                <Select
                  options={approverOptions}
                  value={null}
                  onValueChange={(v) => onChange({ ...step, approvers: [...step.approvers, v] })}
                  placeholder="افزودن تأییدکننده…"
                  searchPlaceholder="جستجوی کارمند…"
                  emptyText="کاربری مطابق جستجو پیدا نشد."
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {step.approvers.length === 0 ? (
                    <span className="text-right text-[12px] font-semibold text-[var(--text-muted)]">هنوز کسی انتخاب نشده است.</span>
                  ) : (
                    step.approvers.map((uid) => {
                      const label = users.find((u) => u.id === uid)?.label ?? uid;
                      return (
                        <span
                          key={uid}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1 text-[12px] font-bold text-[var(--text-body)]"
                        >
                          <span className="truncate">{label}</span>
                          <button
                            type="button"
                            className="rounded-full px-1 text-[var(--text-faint)] hover:text-rose-700"
                            aria-label="حذف تأییدکننده"
                            onClick={() => {
                              const next = step.approvers.filter((x) => x !== uid);
                              onChange({
                                ...step,
                                approvers: next,
                                finalApproverId: step.finalApproverId === uid ? null : step.finalApproverId,
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)]/30 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-right text-[12px] font-extrabold text-[var(--text-strong)]">
                    <span>شرط تکمیل مرحله</span>
                  </div>
                </div>
                <InlineGuide>اگر تأییدکننده نهایی مرحله رأی نداده باشد، این شرط مشخص می‌کند مرحله با چه تعداد رأی تأیید کامل شود.</InlineGuide>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className={`rounded-2xl border p-3 text-right transition ${
                      step.logic.mode === 'ALL_MUST_APPROVE'
                        ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_9%,white)] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-teal-200'
                    }`}
                    onClick={() => onChange({ ...step, logic: { mode: 'ALL_MUST_APPROVE' } })}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-black text-[var(--text-strong)]">تأیید کامل</span>
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          step.logic.mode === 'ALL_MUST_APPROVE' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] ring-4 ring-teal-50' : 'border-slate-300 bg-white'
                        }`}
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 block text-[12px] font-normal leading-6 text-[var(--text-muted)]">همه تأییدکنندگان این مرحله باید رأی تأیید بدهند.</span>
                  </button>
                  <button
                    type="button"
                    className={`rounded-2xl border p-3 text-right transition ${
                      step.logic.mode === 'MINIMUM_COUNT'
                        ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_9%,white)] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-teal-200'
                    }`}
                    onClick={() =>
                      onChange({
                        ...step,
                        logic: { mode: 'MINIMUM_COUNT', count: Math.min(2, Math.max(1, step.approvers.length || 1)) },
                      })
                    }
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-black text-[var(--text-strong)]">حد نصاب تأیید</span>
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          step.logic.mode === 'MINIMUM_COUNT' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] ring-4 ring-teal-50' : 'border-slate-300 bg-white'
                        }`}
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 block text-[12px] font-normal leading-6 text-[var(--text-muted)]">با رسیدن رأی‌های مثبت به تعداد تعیین‌شده، مرحله کامل می‌شود.</span>
                  </button>
                </div>

                {step.logic.mode === 'MINIMUM_COUNT' ? (
                  <div className="mt-3 rounded-2xl border border-teal-100 bg-white p-3">
                    <div className="mb-2 text-right">
                      <span className="text-[12px] font-extrabold text-[var(--text-strong)]">تعداد رأی لازم برای تکمیل مرحله</span>
                      <InlineGuide>این عدد نمی‌تواند بیشتر از تعداد تأییدکنندگان مرحله باشد.</InlineGuide>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, step.approvers.length || 1)}
                      dir="ltr"
                      className="no-number-spin h-11 w-28 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-2 text-center text-[14px] font-bold outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_15%,transparent)]"
                      value={step.logic.count}
                      onChange={(e) =>
                        onChange({
                          ...step,
                          logic: {
                            mode: 'MINIMUM_COUNT',
                            count: Math.min(Math.max(1, step.approvers.length || 1), Math.max(1, Number(e.target.value) || 1)),
                          },
                        })
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-right text-[12px] font-extrabold text-[var(--text-strong)]">
                      <span>تأییدکننده نهایی مرحله</span>
                    </div>
                  </div>
                  <InlineGuide>اگر این شخص رأی تأیید بدهد، مرحله فوری کامل می‌شود. اگر نهایی کل فرآیند تعریف نشده باشد، فقط نهایی همین مرحله می‌تواند رد کامل و بازگشت به پیش‌نویس انجام دهد.</InlineGuide>
                  <Select
                    options={[{ value: '', label: '— (ندارد)' }, ...finalApproverOptions]}
                    value={step.finalApproverId ?? ''}
                    onValueChange={(v) => onChange({ ...step, finalApproverId: v ? v : null })}
                    placeholder="انتخاب کنید…"
                    searchPlaceholder="جستجو…"
                    emptyText="—"
                    disabled={finalApproverOptions.length === 0}
                  />
                  <div className="mt-2 text-right text-[11px] font-semibold text-[var(--text-muted)]">
                    نکته: تأییدکننده نهایی باید جزو تأییدکنندگان همین مرحله باشد.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function WorkflowEditorClient({ workflowId }: { workflowId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isNew = !workflowId;
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [error, setError] = useState('');
  const [saveOk, setSaveOk] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [openStepId, setOpenStepId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [usageType, setUsageType] = useState<ApprovalUsageKey | ''>('');
  const [usedUsageTypes, setUsedUsageTypes] = useState<ApprovalUsageKey[]>([]);
  const [finalApproverUserId, setFinalApproverUserId] = useState<string>('');
  const [buyerShouldApprove, setBuyerShouldApprove] = useState(true);
  const [workflowActive, setWorkflowActive] = useState(true);

  const [globalType, setGlobalType] = useState<'PARALLEL' | 'SEQUENTIAL'>('PARALLEL');
  // Important: keep deterministic SSR/CSR markup (avoid random ids before hydration).
  const [steps, setSteps] = useState<WorkflowStepDefinition[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(() => {
    startTransition(async () => {
      setError('');
      if (isNew) {
        const [uRes, wfListRes] = await Promise.all([listTenantMembersForApproversAction(), listApprovalWorkflowsAction()]);
        if (uRes.ok) setUsers(uRes.users as any);
        if (wfListRes.ok) setUsedUsageTypes(usedUsageTypesFromItems(wfListRes.items));
        setTitle('فرایند جدید');
        setUsageType('');
        setFinalApproverUserId('');
        setBuyerShouldApprove(true);
        setWorkflowActive(true);
        setGlobalType('PARALLEL');
        setSteps([]);
        setOpenStepId(null);
        setLoaded(true);
        return;
      }

      const [wfRes, uRes, wfListRes] = await Promise.all([
        getApprovalWorkflowAction(workflowId),
        listTenantMembersForApproversAction(),
        listApprovalWorkflowsAction(),
      ]);
      if (!wfRes.ok || !wfRes.item) {
        setError(wfRes.message ?? 'فرایند یافت نشد.');
        setLoaded(true);
        return;
      }
      if (uRes.ok) setUsers(uRes.users as any);
      if (wfListRes.ok) setUsedUsageTypes(usedUsageTypesFromItems(wfListRes.items, workflowId));

      setTitle(wfRes.item.title);
      setUsageType(wfRes.item.usageTypes?.[0] ?? '');
      setFinalApproverUserId(wfRes.item.finalApproverUserId ?? '');
      setBuyerShouldApprove(wfRes.item.buyerShouldApprove);
      setWorkflowActive(wfRes.item.active);

      const loadedSteps = wfRes.item.steps.map((s) => ({
        ...s,
        finalApproverId: s.finalApproverId ?? null,
      }));
      const distinct = new Set(loadedSteps.map((s) => s.type));
      setGlobalType(distinct.size === 1 ? (loadedSteps[0]!.type as any) : 'PARALLEL');
      setSteps(loadedSteps);
      setOpenStepId((prev) => {
        if (prev && loadedSteps.some((s) => s.id === prev)) return prev;
        return loadedSteps[0]?.id ?? null;
      });
      setLoaded(true);
    });
  }, [isNew, workflowId]);

  useEffect(() => {
    void load();
  }, [load]);

  const disabledUsageSet = useMemo(() => new Set(usedUsageTypes), [usedUsageTypes]);

  const chooseUsageType = (k: ApprovalUsageKey) => {
    if (disabledUsageSet.has(k)) return;
    setUsageType((prev) => (prev === k ? '' : k));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setSteps(arrayMove(steps, oldIndex, newIndex));
  };

  const tasks = useMemo(() => {
    const titleOk = title.trim().length > 0;
    const usageOk = Boolean(usageType);
    const stepsOk = steps.length > 0 && steps.every((s) => s.title.trim().length > 0 && s.approvers.length > 0);
    const finalApproverOk = steps.every((s) => !s.finalApproverId || s.approvers.includes(s.finalApproverId));
    return { ok: titleOk && usageOk && stepsOk && finalApproverOk, finalApproverOk };
  }, [title, usageType, steps]);

  const saveNow = () => {
    startTransition(async () => {
      setError('');
      setSaveOk('');
      const normalizedSteps = steps.map((s, idx) => ({
        ...s,
        type: globalType,
        isFinal: idx === steps.length - 1,
      }));
      const payload = {
        title,
        usageTypes: usageType ? [usageType] : [],
        steps: normalizedSteps,
        finalApproverUserId: finalApproverUserId || null,
        buyerShouldApprove,
        active: isNew ? true : workflowActive,
      };
      const res = isNew
        ? await createApprovalWorkflowAction(payload)
        : await updateApprovalWorkflowAction(workflowId, payload);
      if (!res.ok) {
        setError('message' in res ? res.message : 'ذخیره انجام نشد.');
        return;
      }
      setSaveOk('ذخیره شد.');
      window.setTimeout(() => setSaveOk(''), 1500);
      router.refresh();
      // After successful save, return to workflows list.
      window.setTimeout(() => {
        router.push('/business-settings/approval-process');
      }, 350);
    });
  };

  return (
    <div className="workflow-editor-root mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8" dir="rtl" lang="fa">
      <div className="mb-5 text-right">
        <h1 className="mt-2 text-2xl font-black text-[var(--text-strong)]">{isNew ? 'ثبت فرایند تأیید' : 'مدیریت فرایند تأیید'}</h1>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-[13px] font-bold text-rose-800">
          {error}
        </div>
      ) : null}
      {saveOk ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right text-[13px] font-bold text-emerald-800">
          {saveOk}
        </div>
      ) : null}

      {!loaded ? (
        <SectionCard className="p-6 text-right">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            در حال بارگذاری فرایند…
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-4">
        <SectionCard>
          <SectionHeader label="فرایند تأیید" description="تنظیمات کلی فرایند" />
          <div className="space-y-5 p-5">
            <FieldWithGuide
              label="عنوان فرایند"
              guide="نام مسیر تأیید را وارد کنید. همین عنوان در کارت فهرست فرآیندها و هنگام استفاده در قرارداد نمایش داده می‌شود."
            >
              <FormTextInput value={title} onChange={setTitle} dir="rtl" placeholder="مثلا فرایند فروش واحد مسکونی" />
            </FieldWithGuide>

            <FieldWithGuide
              label="نوع پردازش مراحل"
              guide="بدون ترتیب یعنی مراحل مستقل رأی می‌گیرند. مرحله‌به‌مرحله یعنی ترتیب مراحل باید رعایت شود."
            >
              <TagPills
                options={[
                  { value: 'PARALLEL', label: 'بدون ترتیب' },
                  { value: 'SEQUENTIAL', label: 'مرحله‌به‌مرحله' },
                ]}
                value={globalType}
                onChange={(v) => {
                  setGlobalType(v);
                  setSteps((prev) => prev.map((s) => ({ ...s, type: v })));
                }}
              />
            </FieldWithGuide>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-right">
                  <div>
                    <p className="text-[13px] font-black text-[var(--text-strong)]">خریدار در فرایند</p>
                    <InlineGuide>اگر فعال باشد، خریدار هم باید در مسیر تأیید قرارداد رأی بدهد.</InlineGuide>
                  </div>
                </div>
                <BusinessSwitch checked={buyerShouldApprove} onChange={setBuyerShouldApprove} onLabel="بله" offLabel="خیر" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader label="انواع کاربری واحد" description="هر فرایند فقط می‌تواند یک نوع کاربری داشته باشد." />
          <div className="p-5">
            <div className="mb-3 text-right">
              <span className="text-[12px] font-extrabold text-[var(--text-strong)]">انتخاب نوع کاربری</span>
              <InlineGuide>برای هر فرآیند فقط یک نوع کاربری واحد انتخاب می‌شود. نوع‌های دارای فرآیند قبلی غیرفعال هستند.</InlineGuide>
            </div>
            <div className="flex flex-wrap gap-2">
            {approvalUsageOptions.map((opt) => {
              const key = opt.id as ApprovalUsageKey;
              const disabled = disabledUsageSet.has(key);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => chooseUsageType(key)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    usageType === key
                      ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]'
                      : disabled
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70'
                        : 'border-[var(--border-color)] bg-[var(--surface)] hover:border-teal-200 hover:text-[var(--dark-teal)]'
                  }`}
                >
                  {opt.shortTitle}
                  {disabled ? <span className="mr-1 text-[10px] font-normal">(ثبت شده)</span> : null}
                </button>
              );
            })}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader
            label="تأییدکننده نهایی (اختیاری)"
            description="اگر این شخص رأی بدهد، فرایند فوراً تمام می‌شود و نیازی به طی مراحل نیست. نکته: در صورت انتخاب، فقط همین شخص می‌تواند «رد کامل و بازگشت قرارداد به پیش‌نویس» را انجام دهد."
          />
          <div className="p-5">
            <div className="mb-3 text-right">
              <span className="text-[12px] font-extrabold text-[var(--text-strong)]">انتخاب تأییدکننده نهایی کل فرآیند</span>
              <InlineGuide>رأی این شخص کل فرآیند را فوری تمام می‌کند. در صورت انتخاب، فقط همین شخص اجازه رد کامل و بازگشت قرارداد به پیش‌نویس را دارد.</InlineGuide>
            </div>
            <Select
              options={[{ value: '', label: '— (ندارد)' }, ...users.map((u) => ({ value: u.id, label: u.label }))]}
              value={finalApproverUserId || ''}
              onValueChange={(v) => setFinalApproverUserId(v || '')}
              placeholder="انتخاب کنید…"
              searchPlaceholder="جستجو…"
              emptyText="—"
            />
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader label="مراحل" description="تعریف مراحل و تأییدکنندگان هر مرحله" />
          <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-right">
              <span className="text-[12px] font-extrabold text-[var(--text-strong)]">ساخت مسیر مرحله‌ای</span>
              <InlineGuide>در شروع ثبت فرآیند هیچ مرحله‌ای ساخته نمی‌شود. با افزودن مرحله، عنوان، تأییدکنندگان، منطق رأی و تأییدکننده نهایی همان مرحله را تنظیم کنید.</InlineGuide>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 whitespace-nowrap rounded-full border-teal-100 bg-teal-50/70 px-4 text-[12px] font-bold text-[var(--dark-teal)] hover:bg-teal-100"
              onClick={() => {
                const next = defaultStep(globalType);
                setSteps((s) => [...s, next]);
                setOpenStepId(next.id);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              افزودن مرحله
            </Button>
          </div>

          {steps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-[13px] font-semibold leading-7 text-[var(--text-muted)]">
              هنوز مرحله‌ای تعریف نشده است. برای شروع مسیر تأیید، «افزودن مرحله» را انتخاب کنید.
            </div>
          ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <Accordion>
                {steps.map((step, index) => (
                  <SortableStepAccordion
                    key={step.id}
                    step={step}
                    index={index}
                    isLast={index === steps.length - 1}
                    isOpen={openStepId === step.id}
                    users={users}
                    onChange={(next) => setSteps((prev) => prev.map((x) => (x.id === step.id ? next : x)))}
                    onOpenChange={(open) => setOpenStepId(open ? step.id : null)}
                    onRemove={() => setSteps((prev) => prev.filter((x) => x.id !== step.id))}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
          )}
          </div>
        </SectionCard>

        {/* Sticky Save Button (inside content width; doesn't cover sidebar) */}
        <div className="sticky bottom-4 z-30">
          <div className="mx-auto flex max-w-6xl justify-end bg-transparent px-3 py-3">
            <Button variant="primary" onClick={saveNow} disabled={isPending || !tasks.ok} className="min-w-[180px]">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              ذخیره
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

