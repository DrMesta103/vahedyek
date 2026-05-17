'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { GripVertical, Loader2, Map as MapIcon, Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import { BusinessSwitch, FormTextInput, SectionCard, SectionHeader, TagPills } from '../../../contracts/new/_components/ContractFormPrimitives';

import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import type { WorkflowStepDefinition } from '../../../../lib/workflowTypes';
import {
  attachApproverToStep,
  buildApprovalProcessDraft,
  buildApprovalRoadmapItems,
  getApprovalProcessDraftStorageKey,
  parseApprovalProcessDraft,
} from '../../../../lib/approvalProcessEditor';
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

function RoadmapModal({
  open,
  onClose,
  steps,
  users,
  finalApproverUserId,
  buyerShouldApprove,
}: {
  open: boolean;
  onClose: () => void;
  steps: WorkflowStepDefinition[];
  users: UserOpt[];
  finalApproverUserId: string;
  buyerShouldApprove: boolean;
}) {
  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user.label])), [users]);
  const roadmapItems = useMemo(() => buildApprovalRoadmapItems(steps), [steps]);
  const finalProcessApprover = finalApproverUserId ? userMap.get(finalApproverUserId) ?? finalApproverUserId : '';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#251d2b]/60 p-4" onClick={onClose}>
      <div
        className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-[#fcfcfb] shadow-[0_30px_90px_rgba(24,24,27,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#6f5c75_0%,#5a4b63_100%)] px-6 py-6 text-white sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_42%)]" />
          <button
            type="button"
            onClick={onClose}
            className="absolute left-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="بستن"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative text-right">
            <div className="text-[28px] font-black tracking-tight sm:text-[40px]">رودمپ فرایند تایید</div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              عنوان هر مرحله، تاییدکنندگان، شرط تکمیل و تاییدکننده نهایی از داده فعلی فرم خوانده می‌شود.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-white/12 px-3 py-1.5">{buyerShouldApprove ? 'خریدار فعال است' : 'بدون تایید خریدار'}</span>
              {finalProcessApprover ? <span className="rounded-full bg-white/12 px-3 py-1.5">نهایی کل: {finalProcessApprover}</span> : null}
            </div>
          </div>
        </div>

        <div className="overflow-auto px-4 py-5 sm:px-7 sm:py-7">
          {roadmapItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-[14px] font-semibold text-slate-500">
              هنوز مرحله‌ای برای نمایش رودمپ تعریف نشده است.
            </div>
          ) : (
            <div className="relative space-y-10">
              <div className="pointer-events-none absolute bottom-8 right-1/2 top-3 hidden w-[3px] translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#9cc7bf_0%,#7daed7_24%,#746989_50%,#df6878_74%,#f2c864_100%)] sm:block" />
              {roadmapItems.map((item) => {
                const hue = item.index % 5;
                const accent = hue === 0 ? '#9cc7bf' : hue === 1 ? '#7daed7' : hue === 2 ? '#746989' : hue === 3 ? '#df6878' : '#f2c864';
                const alignRight = item.index % 2 === 0;

                return (
                  <div key={item.id} className="relative sm:min-h-[220px]">
                    <div className="relative grid items-start gap-4 sm:grid-cols-[1fr,96px,1fr]">
                      <div className={`${alignRight ? 'sm:order-3' : 'sm:order-1'} order-2`}>
                        <div className={`rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${alignRight ? 'sm:ml-8 text-left' : 'sm:mr-8 text-right'}`}>
                          <div className={`text-[18px] font-black ${alignRight ? 'text-left' : 'text-right'}`} style={{ color: accent }}>
                            {item.title}
                          </div>
                          <div className={`mt-3 flex flex-wrap gap-2 ${alignRight ? 'justify-start' : 'justify-end'}`}>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">{item.processingLabel}</span>
                            <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ backgroundColor: `${accent}18`, color: accent }}>
                              {item.completionLabel}
                            </span>
                          </div>
                          <div className={`mt-4 text-[11px] font-bold text-slate-500 ${alignRight ? 'text-left' : 'text-right'}`}>تاییدکنندگان مرحله</div>
                          {item.approverIds.length ? (
                            <div className={`mt-2 flex flex-wrap gap-2 ${alignRight ? 'justify-start' : 'justify-end'}`}>
                              {item.approverIds.map((approverId, approverIndex) => {
                                const isFinalApprover = approverId === item.finalApproverId;
                                return (
                                  <div
                                    key={`${item.id}:${approverId}`}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold text-slate-700"
                                    style={{
                                      borderColor: isFinalApprover ? `${accent}66` : '#e2e8f0',
                                      backgroundColor: isFinalApprover ? `${accent}14` : '#ffffff',
                                    }}
                                  >
                                    <span>{userMap.get(approverId) ?? approverId}</span>
                                    <span className="text-slate-400">اولویت {approverIndex + 1}</span>
                                    {isFinalApprover ? <span style={{ color: accent }}>نهایی</span> : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className={`mt-2 text-[11px] font-semibold text-slate-400 ${alignRight ? 'text-left' : 'text-right'}`}>
                              تاییدکننده‌ای انتخاب نشده است.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="order-1 flex flex-col items-center sm:order-2">
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
                          <div className="absolute inset-[10px] rounded-full opacity-15" style={{ backgroundColor: accent }} />
                          <span className="relative text-[34px] font-black leading-none" style={{ color: accent }}>
                            {String(item.index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="mt-2 text-[12px] font-bold text-slate-400">مرحله</div>
                        {item.index !== roadmapItems.length - 1 ? <div className="mt-2 hidden h-24 w-[2px] rounded-full bg-slate-200 sm:block" /> : null}
                      </div>

                      <div className={`${alignRight ? 'sm:order-1' : 'sm:order-3'} order-3`}>
                        <div className={`rounded-[24px] px-4 py-4 ${alignRight ? 'sm:mr-8 text-right' : 'sm:ml-8 text-left'}`}>
                          {item.finalApproverId ? (
                            <div className={`mb-3 flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                              <div className="rounded-full px-3 py-1.5 text-[10px] font-black" style={{ backgroundColor: `${accent}18`, color: accent }}>
                                تاییدکننده نهایی: {userMap.get(item.finalApproverId) ?? item.finalApproverId}
                              </div>
                            </div>
                          ) : null}
                          <div className="space-y-1 text-[13px] leading-7 text-slate-500">
                            <div>
                              عنوان مرحله: <span className="font-bold text-slate-700">{item.title}</span>
                            </div>
                            <div>
                              شرط تکمیل: <span className="font-bold text-slate-700">{item.completionLabel}</span>
                            </div>
                            <div>
                              نوع پیشروی: <span className="font-bold text-slate-700">{item.processingLabel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  onAddEmployee,
}: {
  step: WorkflowStepDefinition;
  index: number;
  isLast: boolean;
  isOpen: boolean;
  users: UserOpt[];
  onChange: (next: WorkflowStepDefinition) => void;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
  onAddEmployee: () => void;
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
              <Badge variant={approverCount ? 'default' : 'muted'}>{approverCount} تاییدکننده</Badge>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-600 hover:bg-rose-50"
                onClick={(e) => {
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
                    <span>تاییدکنندگان</span>
                  </div>
                </div>
                <InlineGuide>ابتدا خالی است. با جستجو، کارکنان، صاحب کسب‌وکار یا سهامداران ثبت‌شده را اضافه کنید.</InlineGuide>

                <Select
                  options={approverOptions}
                  value={null}
                  onValueChange={(v) => onChange({ ...step, approvers: [...step.approvers, v] })}
                  placeholder="افزودن تاییدکننده…"
                  searchPlaceholder="جستجوی کارمند…"
                  emptyText="کاربری مطابق جستجو پیدا نشد."
                  footerAction={{ label: 'افزودن کارمند جدید', onClick: onAddEmployee }}
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
                            aria-label="حذف تاییدکننده"
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
                <InlineGuide>اگر تاییدکننده نهایی مرحله تایید نداده باشد، این شرط مشخص می‌کند مرحله با چه تعداد تایید کامل شود.</InlineGuide>

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
                      <span className="text-[13px] font-black text-[var(--text-strong)]">تایید کامل</span>
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          step.logic.mode === 'ALL_MUST_APPROVE' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] ring-4 ring-teal-50' : 'border-slate-300 bg-white'
                        }`}
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 block text-[12px] font-normal leading-6 text-[var(--text-muted)]">همه تاییدکنندگان این مرحله باید تایید ثبت کنند.</span>
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
                      <span className="text-[13px] font-black text-[var(--text-strong)]">حد نصاب تایید</span>
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          step.logic.mode === 'MINIMUM_COUNT' ? 'border-[var(--dark-teal)] bg-[var(--dark-teal)] ring-4 ring-teal-50' : 'border-slate-300 bg-white'
                        }`}
                        aria-hidden
                      />
                    </span>
                    <span className="mt-2 block text-[12px] font-normal leading-6 text-[var(--text-muted)]">با رسیدن تاییدهای مثبت به تعداد تعیین‌شده، مرحله کامل می‌شود.</span>
                  </button>
                </div>

                {step.logic.mode === 'MINIMUM_COUNT' ? (
                  <div className="mt-3 rounded-2xl border border-teal-100 bg-white p-3">
                    <div className="mb-2 text-right">
                      <span className="text-[12px] font-extrabold text-[var(--text-strong)]">تعداد تایید لازم برای تکمیل مرحله</span>
                      <InlineGuide>این عدد نمی‌تواند بیشتر از تعداد تاییدکنندگان مرحله باشد.</InlineGuide>
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
                      <span>تاییدکننده نهایی مرحله</span>
                    </div>
                  </div>
                  <InlineGuide>اگر این شخص تایید بدهد، مرحله فوری کامل می‌شود. اگر نهایی کل فرایند تعریف نشده باشد، فقط نهایی همین مرحله می‌تواند رد کامل و بازگشت به پیش‌نویس انجام دهد.</InlineGuide>
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
                    نکته: تاییدکننده نهایی باید جزو تاییدکنندگان همین مرحله باشد.
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isNew = !workflowId;
  const draftKey = useMemo(() => getApprovalProcessDraftStorageKey(workflowId), [workflowId]);
  const restoredDraftRef = useRef(false);
  const appliedCreatedApproverRef = useRef('');

  const [users, setUsers] = useState<UserOpt[]>([]);
  const [error, setError] = useState('');
  const [saveOk, setSaveOk] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [usageType, setUsageType] = useState<ApprovalUsageKey | ''>('');
  const [usedUsageTypes, setUsedUsageTypes] = useState<ApprovalUsageKey[]>([]);
  const [finalApproverUserId, setFinalApproverUserId] = useState<string>('');
  const [buyerShouldApprove, setBuyerShouldApprove] = useState(true);
  const [workflowActive, setWorkflowActive] = useState(true);

  const [globalType, setGlobalType] = useState<'PARALLEL' | 'SEQUENTIAL'>('PARALLEL');
  const [steps, setSteps] = useState<WorkflowStepDefinition[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const persistDraft = useCallback(
    (targetStageId: string | null = null) => {
      if (typeof window === 'undefined') return;
      const draft = buildApprovalProcessDraft({
        title,
        usageType,
        finalApproverUserId,
        buyerShouldApprove,
        workflowActive,
        globalType,
        steps,
        openStepId,
        targetStageId,
      });
      window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
    },
    [buyerShouldApprove, draftKey, finalApproverUserId, globalType, openStepId, steps, title, usageType, workflowActive],
  );

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(draftKey);
  }, [draftKey]);

  const buildCleanEditorUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('createdEmployeeId');
    params.delete('createdEmployeeLabel');
    params.delete('approvalStageId');
    params.delete('approvalReturnMode');
    params.delete('approvalDraftKey');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const pushEmployeeCreation = useCallback(
    (targetStageId: string) => {
      persistDraft(targetStageId);
      const params = new URLSearchParams({
        returnTo: buildCleanEditorUrl(),
        approvalDraftKey: draftKey,
        approvalStageId: targetStageId,
        approvalReturnMode: 'add-approver',
      });
      router.push(`/employees/new?${params.toString()}`);
    },
    [buildCleanEditorUrl, draftKey, persistDraft, router],
  );

  const load = useCallback(() => {
    startTransition(async () => {
      setError('');
      setLoaded(false);

      if (isNew) {
        const [uRes, wfListRes] = await Promise.all([listTenantMembersForApproversAction(), listApprovalWorkflowsAction()]);
        if (uRes.ok) setUsers(uRes.users as UserOpt[]);
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
      if (uRes.ok) setUsers(uRes.users as UserOpt[]);
      if (wfListRes.ok) setUsedUsageTypes(usedUsageTypesFromItems(wfListRes.items, workflowId));

      setTitle(wfRes.item.title);
      setUsageType(wfRes.item.usageTypes?.[0] ?? '');
      setFinalApproverUserId(wfRes.item.finalApproverUserId ?? '');
      setBuyerShouldApprove(wfRes.item.buyerShouldApprove);
      setWorkflowActive(wfRes.item.active);

      const loadedSteps = wfRes.item.steps.map((step) => ({
        ...step,
        finalApproverId: step.finalApproverId ?? null,
      }));
      const distinct = new Set(loadedSteps.map((step) => step.type));
      setGlobalType(distinct.size === 1 ? loadedSteps[0]?.type ?? 'PARALLEL' : 'PARALLEL');
      setSteps(loadedSteps);
      setOpenStepId((prev) => {
        if (prev && loadedSteps.some((step) => step.id === prev)) return prev;
        return loadedSteps[0]?.id ?? null;
      });
      setLoaded(true);
    });
  }, [isNew, workflowId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!loaded || restoredDraftRef.current || typeof window === 'undefined') return;
    restoredDraftRef.current = true;
    const parsed = parseApprovalProcessDraft(window.sessionStorage.getItem(draftKey));
    if (!parsed) return;

    setTitle(parsed.title);
    setUsageType(parsed.usageType);
    setFinalApproverUserId(parsed.finalApproverUserId);
    setBuyerShouldApprove(parsed.buyerShouldApprove);
    setWorkflowActive(parsed.workflowActive);
    setGlobalType(parsed.globalType);
    setSteps(parsed.steps);
    setOpenStepId(parsed.openStepId ?? parsed.targetStageId ?? parsed.steps[0]?.id ?? null);
  }, [draftKey, loaded]);

  useEffect(() => {
    if (!loaded) return;

    const createdEmployeeId = searchParams.get('createdEmployeeId');
    const createdEmployeeLabel = searchParams.get('createdEmployeeLabel');
    const targetStageId = searchParams.get('approvalStageId');
    if (!createdEmployeeId || !targetStageId) return;

    const applyKey = `${createdEmployeeId}:${targetStageId}`;
    if (appliedCreatedApproverRef.current === applyKey) return;
    appliedCreatedApproverRef.current = applyKey;

    setUsers((current) => {
      if (current.some((user) => user.id === createdEmployeeId)) return current;
      if (!createdEmployeeLabel) return current;
      return [...current, { id: createdEmployeeId, label: createdEmployeeLabel }];
    });
    setSteps((current) => attachApproverToStep(current, targetStageId, createdEmployeeId));
    setOpenStepId(targetStageId);
    persistDraft(targetStageId);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('createdEmployeeId');
    params.delete('createdEmployeeLabel');
    params.delete('approvalStageId');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [loaded, pathname, persistDraft, router, searchParams]);

  const disabledUsageSet = useMemo(() => new Set(usedUsageTypes), [usedUsageTypes]);

  const chooseUsageType = (nextUsageKey: ApprovalUsageKey) => {
    if (disabledUsageSet.has(nextUsageKey)) return;
    setUsageType((prev) => (prev === nextUsageKey ? '' : nextUsageKey));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setSteps(arrayMove(steps, oldIndex, newIndex));
  };

  const tasks = useMemo(() => {
    const titleOk = title.trim().length > 0;
    const usageOk = Boolean(usageType);
    const stepsOk = steps.length > 0 && steps.every((step) => step.title.trim().length > 0 && step.approvers.length > 0);
    const finalApproverOk = steps.every((step) => !step.finalApproverId || step.approvers.includes(step.finalApproverId));
    return { ok: titleOk && usageOk && stepsOk && finalApproverOk, finalApproverOk };
  }, [title, usageType, steps]);

  const saveNow = () => {
    startTransition(async () => {
      setError('');
      setSaveOk('');
      const normalizedSteps = steps.map((step, index) => ({
        ...step,
        type: globalType,
        isFinal: index === steps.length - 1,
      }));
      const payload = {
        title,
        usageTypes: usageType ? [usageType] : [],
        steps: normalizedSteps,
        finalApproverUserId: finalApproverUserId || null,
        buyerShouldApprove,
        active: isNew ? true : workflowActive,
      };
      const res = isNew ? await createApprovalWorkflowAction(payload) : await updateApprovalWorkflowAction(workflowId, payload);
      if (!res.ok) {
        setError('message' in res ? res.message : 'ذخیره انجام نشد.');
        return;
      }
      clearDraft();
      setSaveOk('ذخیره شد.');
      window.setTimeout(() => setSaveOk(''), 1500);
      router.refresh();
      window.setTimeout(() => {
        router.push('/business-settings/approval-process');
      }, 350);
    });
  };

  return (
    <div className="workflow-editor-root mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8" dir="rtl" lang="fa">
      <div className="mb-5 flex flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-black text-[var(--text-strong)]">{isNew ? 'ثبت فرایند تایید' : 'مدیریت فرایند تایید'}</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRoadmapOpen(true)}
          disabled={steps.length === 0}
          className="h-11 shrink-0 rounded-full border-slate-200 bg-white px-5 text-[12px] font-bold text-slate-700 disabled:opacity-50"
        >
          <MapIcon className="h-4 w-4" aria-hidden />
          نمایش رودمپ
        </Button>
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
            <SectionHeader label="فرایند تایید" description="تنظیمات کلی فرایند" />
            <div className="space-y-5 p-5">
              <FieldWithGuide
                label="عنوان فرایند"
                guide="نام مسیر تایید را وارد کنید. همین عنوان در کارت فهرست فرایندها و هنگام استفاده در قرارداد نمایش داده می‌شود."
              >
                <FormTextInput value={title} onChange={setTitle} dir="rtl" placeholder="مثلا فرایند فروش واحد مسکونی" />
              </FieldWithGuide>

              <FieldWithGuide
                label="نوع پردازش مراحل"
                guide="بدون ترتیب یعنی مراحل مستقل تایید می‌گیرند. مرحله‌به‌مرحله یعنی ترتیب مراحل باید رعایت شود."
              >
                <TagPills
                  options={[
                    { value: 'PARALLEL', label: 'بدون ترتیب' },
                    { value: 'SEQUENTIAL', label: 'مرحله‌به‌مرحله' },
                  ]}
                  value={globalType}
                  onChange={(nextType) => {
                    setGlobalType(nextType);
                    setSteps((prev) => prev.map((step) => ({ ...step, type: nextType })));
                  }}
                />
              </FieldWithGuide>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-right">
                    <div>
                      <p className="text-[13px] font-black text-[var(--text-strong)]">خریدار در فرایند</p>
                      <InlineGuide>اگر فعال باشد، خریدار هم باید در مسیر تایید قرارداد تایید ثبت کند.</InlineGuide>
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
                <InlineGuide>برای هر فرایند فقط یک نوع کاربری واحد انتخاب می‌شود. نوع‌های دارای فرایند قبلی غیرفعال هستند.</InlineGuide>
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
              label="تاییدکننده نهایی (اختیاری)"
              description="اگر این شخص تایید بدهد، فرایند فوراً تمام می‌شود و نیازی به طی مراحل نیست. نکته: در صورت انتخاب، فقط همین شخص می‌تواند «رد کامل و بازگشت قرارداد به پیش‌نویس» را انجام دهد."
            />
            <div className="p-5">
              <div className="mb-3 text-right">
                <span className="text-[12px] font-extrabold text-[var(--text-strong)]">انتخاب تاییدکننده نهایی کل فرایند</span>
                <InlineGuide>تایید این شخص کل فرایند را فوری تمام می‌کند. در صورت انتخاب، فقط همین شخص اجازه رد کامل و بازگشت قرارداد به پیش‌نویس را دارد.</InlineGuide>
              </div>
              <Select
                options={[{ value: '', label: '— (ندارد)' }, ...users.map((user) => ({ value: user.id, label: user.label }))]}
                value={finalApproverUserId || ''}
                onValueChange={(value) => setFinalApproverUserId(value || '')}
                placeholder="انتخاب کنید…"
                searchPlaceholder="جستجو…"
                emptyText="—"
              />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader label="مراحل" description="تعریف مراحل و تاییدکنندگان هر مرحله" />
            <div className="p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-right">
                  <span className="text-[12px] font-extrabold text-[var(--text-strong)]">ساخت مسیر مرحله‌ای</span>
                  <InlineGuide>در شروع ثبت فرایند هیچ مرحله‌ای ساخته نمی‌شود. با افزودن مرحله، عنوان، تاییدکنندگان، منطق تایید و تاییدکننده نهایی همان مرحله را تنظیم کنید.</InlineGuide>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 whitespace-nowrap rounded-full border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700"
                    onClick={() => setRoadmapOpen(true)}
                    disabled={steps.length === 0}
                  >
                    <MapIcon className="h-4 w-4" aria-hidden />
                    نمایش رودمپ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 shrink-0 whitespace-nowrap rounded-full border-teal-100 bg-teal-50/70 px-4 text-[12px] font-bold text-[var(--dark-teal)] hover:bg-teal-100"
                    onClick={() => {
                      const next = defaultStep(globalType);
                      setSteps((prev) => [...prev, next]);
                      setOpenStepId(next.id);
                    }}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    افزودن مرحله
                  </Button>
                </div>
              </div>

              {steps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-[13px] font-semibold leading-7 text-[var(--text-muted)]">
                  هنوز مرحله‌ای تعریف نشده است. برای شروع مسیر تایید، «افزودن مرحله» را انتخاب کنید.
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                    <Accordion>
                      {steps.map((step, index) => (
                        <SortableStepAccordion
                          key={step.id}
                          step={step}
                          index={index}
                          isLast={index === steps.length - 1}
                          isOpen={openStepId === step.id}
                          users={users}
                          onChange={(next) => setSteps((prev) => prev.map((item) => (item.id === step.id ? next : item)))}
                          onOpenChange={(open) => setOpenStepId(open ? step.id : null)}
                          onRemove={() => setSteps((prev) => prev.filter((item) => item.id !== step.id))}
                          onAddEmployee={() => pushEmployeeCreation(step.id)}
                        />
                      ))}
                    </Accordion>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </SectionCard>

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

      <RoadmapModal
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        steps={steps}
        users={users}
        finalApproverUserId={finalApproverUserId}
        buyerShouldApprove={buyerShouldApprove}
      />
    </div>
  );
}
