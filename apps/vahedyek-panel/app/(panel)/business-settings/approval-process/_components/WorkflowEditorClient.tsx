'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
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
import { BusinessSwitch, FieldGroup, FormTextInput, SectionCard, SectionHeader, TagPills } from '../../../contracts/new/_components/ContractFormPrimitives';

import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import type { WorkflowStepDefinition } from '../../../../lib/workflowTypes';
import {
  getApprovalWorkflowAction,
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
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 text-[12px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)]"
                onClick={(e) => {
                  // Keep delete available even when collapsed; don't toggle accordion.
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                حذف مرحله
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
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-right text-[12px] font-extrabold text-[var(--text-strong)]">عنوان مرحله</span>
                </div>
                <input
                  dir="rtl"
                  value={step.title}
                  onChange={(e) => onChange({ ...step, title: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 text-right text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_15%,transparent)]"
                />
                <HelperText text="عنوانی کوتاه و قابل فهم برای این مرحله. در حالت جمع‌شده فقط همین عنوان نمایش داده می‌شود." />
              </label>
            </div>

            <div className="space-y-3">
              <div className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)]/30 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-right text-[12px] font-extrabold text-[var(--text-strong)]">تأییدکنندگان</div>
                </div>
                <HelperText text="ابتدا خالی است. با جستجو، افراد را اضافه کنید. پس از انتخاب، در لیست زیر نمایش داده می‌شوند." />

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
                      const isFinal = step.finalApproverId === uid;
                      return (
                        <span
                          key={uid}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-bold ${
                            isFinal
                              ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)] text-[var(--dark-teal)]'
                              : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)]'
                          }`}
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
                  <div className="text-right text-[12px] font-extrabold text-[var(--text-strong)]">منطق تأیید مرحله</div>
                </div>
                <HelperText text="این منطق فقط زمانی استفاده می‌شود که تأییدکنندهٔ نهایی مرحله رأی نداده باشد." />

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={step.logic.mode === 'ALL_MUST_APPROVE' ? 'primary' : 'outline'}
                    className="h-10"
                    onClick={() => onChange({ ...step, logic: { mode: 'ALL_MUST_APPROVE' } })}
                  >
                    همه باید تأیید کنند
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={step.logic.mode === 'MINIMUM_COUNT' ? 'primary' : 'outline'}
                    className="h-10"
                    onClick={() =>
                      onChange({
                        ...step,
                        logic: { mode: 'MINIMUM_COUNT', count: Math.min(2, Math.max(1, step.approvers.length || 1)) },
                      })
                    }
                  >
                    حداقل تعداد
                  </Button>
                </div>

                {step.logic.mode === 'MINIMUM_COUNT' ? (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-right text-[12px] font-bold text-[var(--text-muted)]">حداقل تعداد لازم</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, step.approvers.length || 1)}
                      dir="ltr"
                      className="h-10 w-24 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-2 text-center text-[13px] font-bold"
                      value={step.logic.count}
                      onChange={(e) =>
                        onChange({
                          ...step,
                          logic: { mode: 'MINIMUM_COUNT', count: Math.max(1, Number(e.target.value) || 1) },
                        })
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-right text-[12px] font-extrabold text-[var(--text-strong)]">تأییدکننده نهایی مرحله</div>
                  </div>
                  <HelperText text="یک نفر می‌تواند به عنوان «نهایی» برای این مرحله انتخاب شود؛ تأیید این شخص مرحله را فوراً تکمیل می‌کند. همچنین اگر «تأییدکننده نهایی کل فرایند» تعریف نشده باشد، فقط تأییدکننده نهایی همین مرحله می‌تواند «رد کامل و بازگشت به پیش‌نویس» انجام دهد." />
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
        const uRes = await listTenantMembersForApproversAction();
        if (uRes.ok) setUsers(uRes.users as any);
        const initialStep = defaultStep('PARALLEL');
        setTitle('فرایند جدید');
        setUsageType('');
        setFinalApproverUserId('');
        setBuyerShouldApprove(true);
        setWorkflowActive(true);
        setGlobalType('PARALLEL');
        setSteps([initialStep]);
        setOpenStepId(initialStep.id);
        setLoaded(true);
        return;
      }

      const [wfRes, uRes] = await Promise.all([getApprovalWorkflowAction(workflowId), listTenantMembersForApproversAction()]);
      if (!wfRes.ok || !wfRes.item) {
        setError(wfRes.message ?? 'فرایند یافت نشد.');
        setLoaded(true);
        return;
      }
      if (uRes.ok) setUsers(uRes.users as any);

      setTitle(wfRes.item.title);
      setUsageType(wfRes.item.usageTypes?.[0] ?? '');
      setFinalApproverUserId(wfRes.item.finalApproverUserId ?? '');
      setBuyerShouldApprove(wfRes.item.buyerShouldApprove);
      setWorkflowActive(wfRes.item.active);

      const loadedSteps = (wfRes.item.steps.length ? wfRes.item.steps : [defaultStep('PARALLEL')]).map((s) => ({
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

  const chooseUsageType = (k: ApprovalUsageKey) => {
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
            <FieldGroup label="عنوان فرایند" hint="عنوانی که در فهرست فرایندها و در قراردادها نمایش داده می‌شود.">
              <FormTextInput value={title} onChange={setTitle} dir="rtl" placeholder="مثلا فرایند فروش واحد مسکونی" />
            </FieldGroup>

            <FieldGroup label="نوع پردازش مراحل" hint="موازی: همه تأییدکنندگان مرحله می‌توانند همزمان رأی دهند. سری: هر مرحله طبق ترتیب تأییدکنندگان پیش می‌رود.">
              <TagPills
                options={[
                  { value: 'PARALLEL', label: 'موازی' },
                  { value: 'SEQUENTIAL', label: 'سری' },
                ]}
                value={globalType}
                onChange={(v) => {
                  setGlobalType(v);
                  setSteps((prev) => prev.map((s) => ({ ...s, type: v })));
                }}
              />
            </FieldGroup>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-right">
                  <p className="text-[13px] font-black text-[var(--text-strong)]">خریدار در فرایند</p>
                  <p className="mt-1 text-[11px] font-semibold leading-6 text-[var(--text-muted)]">اگر فعال باشد، خریدار قبل از ورود فرایند به سازمان باید تأیید کند.</p>
                </div>
                <BusinessSwitch checked={buyerShouldApprove} onChange={setBuyerShouldApprove} onLabel="بله" offLabel="خیر" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader label="انواع کاربری واحد" description="هر فرایند فقط می‌تواند یک نوع کاربری داشته باشد." />
          <div className="flex flex-wrap gap-2 p-5">
            {approvalUsageOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => chooseUsageType(opt.id as ApprovalUsageKey)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                  usageType === (opt.id as ApprovalUsageKey)
                    ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]'
                    : 'border-[var(--border-color)] bg-[var(--surface)]'
                }`}
              >
                {opt.shortTitle}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader
            label="تأییدکننده نهایی (اختیاری)"
            description="اگر این شخص رأی بدهد، فرایند فوراً تمام می‌شود و نیازی به طی مراحل نیست. نکته: در صورت انتخاب، فقط همین شخص می‌تواند «رد کامل و بازگشت قرارداد به پیش‌نویس» را انجام دهد."
          />
          <div className="p-5">
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
            <Button
              type="button"
              variant="outline"
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

