'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PersianDatePicker } from '@repo/ui';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarRange,
  Copy,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';

type BlockOption = {
  id: string;
  name: string;
};

type ScheduleStage = {
  id: string;
  title: string;
  weight: number;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
  order: number;
};

type ScheduleSummary = {
  scheduleKey: string;
  latestVersionId: string;
  blockId: string;
  blockName: string;
  title: string;
  version: number;
  stageCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  sourceVersionId?: string | null;
  stages: ScheduleStage[];
};

type BuilderState = {
  title: string;
  blockIds: string[];
  stages: ScheduleStage[];
};

type StageDraft = {
  title: string;
  customTitle: string;
  weight: string;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
};

const OTHER_STAGE_VALUE = 'سایر';

function formatPersianDate(value: string) {
  return value || '---';
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatWeight(value: number) {
  return `${new Intl.NumberFormat('fa-IR').format(value)}٪`;
}

function createEmptyBuilder(): BuilderState {
  return {
    title: '',
    blockIds: [],
    stages: [],
  };
}

function createEmptyStageDraft(): StageDraft {
  return {
    title: '',
    customTitle: '',
    weight: '',
    plannedStartDate: '',
    plannedEndDate: '',
    description: '',
  };
}

function computeTotalWeight(stages: ScheduleStage[]) {
  return Math.round(stages.reduce((sum, stage) => sum + Number(stage.weight || 0), 0) * 100) / 100;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function compareDateText(left: string, right: string) {
  return normalizeDigits(left).localeCompare(normalizeDigits(right), 'en');
}

function Dialog({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="business-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="business-dialog max-w-3xl">
        <button type="button" className="business-dialog-close" onClick={onClose} aria-label="بستن">
          <X />
        </button>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="business-block-form-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function BlockMultiSelect({
  blocks,
  selectedBlockIds,
  onChange,
  disabled = false,
}: {
  blocks: BlockOption[];
  selectedBlockIds: string[];
  onChange: (blockIds: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedNames = useMemo(
    () => blocks.filter((block) => selectedBlockIds.includes(block.id)).map((block) => block.name),
    [blocks, selectedBlockIds],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between rounded-2xl border border-slate-200 px-4 text-sm ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white text-slate-800'}`}
      >
        <span className={selectedNames.length ? '' : 'text-slate-400'}>
          {selectedNames.length ? selectedNames.join('، ') : 'انتخاب بلوک‌ها'}
        </span>
        <span className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>

      {open && !disabled ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="max-h-56 space-y-2 overflow-auto">
            {blocks.map((block) => {
              const checked = selectedBlockIds.includes(block.id);
              return (
                <label key={block.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <span>{block.name}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      if (event.target.checked) onChange([...selectedBlockIds, block.id]);
                      else onChange(selectedBlockIds.filter((item) => item !== block.id));
                    }}
                  />
                </label>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              بستن
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProjectPhysicalProgressSchedulesPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [stageLibrary, setStageLibrary] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builder, setBuilder] = useState<BuilderState>(createEmptyBuilder());
  const [editingScheduleKey, setEditingScheduleKey] = useState<string | null>(null);
  const [expandedScheduleKeys, setExpandedScheduleKeys] = useState<string[]>([]);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [stageDialogIndex, setStageDialogIndex] = useState<number | null>(null);
  const [stageDraft, setStageDraft] = useState<StageDraft>(createEmptyStageDraft());
  const [stageError, setStageError] = useState('');
  const [duplicateSchedule, setDuplicateSchedule] = useState<ScheduleSummary | null>(null);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [duplicateBlockIds, setDuplicateBlockIds] = useState<string[]>([]);

  const totalWeight = useMemo(() => computeTotalWeight(builder.stages), [builder.stages]);
  const editingSchedule = useMemo(
    () => (editingScheduleKey ? schedules.find((item) => item.scheduleKey === editingScheduleKey) ?? null : null),
    [editingScheduleKey, schedules],
  );

  async function loadData() {
    setLoading(true);
    setMessage('');
    try {
      const [scheduleResponse, blockResponse] = await Promise.all([
        fetch('/api/business-settings/project/physical-progress-schedules', { cache: 'no-store' }),
        fetch('/api/business-settings/project/blocks', { cache: 'no-store' }),
      ]);

      const scheduleData = (await scheduleResponse.json()) as { schedules?: ScheduleSummary[]; stageLibrary?: string[]; message?: string };
      const blockData = (await blockResponse.json()) as { blocks?: Array<{ id: string; name: string }>; message?: string };

      if (!scheduleResponse.ok) throw new Error(scheduleData.message ?? 'دریافت برنامه‌ها ناموفق بود.');
      if (!blockResponse.ok) throw new Error(blockData.message ?? 'دریافت بلوک‌ها ناموفق بود.');

      setSchedules(scheduleData.schedules ?? []);
      setStageLibrary(scheduleData.stageLibrary ?? []);
      setBlocks((blockData.blocks ?? []).map((block) => ({ id: block.id, name: block.name })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'دریافت اطلاعات ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetBuilder() {
    setBuilder(createEmptyBuilder());
    setEditingScheduleKey(null);
    setBuilderOpen(false);
  }

  function openCreateBuilder() {
    setBuilder(createEmptyBuilder());
    setEditingScheduleKey(null);
    setBuilderOpen(true);
    setMessage('');
  }

  function openEditBuilder(schedule: ScheduleSummary) {
    setBuilder({
      title: schedule.title,
      blockIds: [schedule.blockId],
      stages: schedule.stages.map((stage, index) => ({ ...stage, order: index })),
    });
    setEditingScheduleKey(schedule.scheduleKey);
    setBuilderOpen(true);
    setMessage('');
  }

  function openStageDialog(index?: number) {
    if (typeof index === 'number') {
      const stage = builder.stages[index];
      setStageDraft({
        title: stageLibrary.includes(stage.title) ? stage.title : OTHER_STAGE_VALUE,
        customTitle: stageLibrary.includes(stage.title) ? '' : stage.title,
        weight: String(stage.weight),
        plannedStartDate: stage.plannedStartDate,
        plannedEndDate: stage.plannedEndDate,
        description: stage.description,
      });
      setStageDialogIndex(index);
    } else {
      setStageDraft(createEmptyStageDraft());
      setStageDialogIndex(null);
    }
    setStageError('');
    setStageDialogOpen(true);
  }

  function submitStageDialog() {
    const title = stageDraft.title === OTHER_STAGE_VALUE ? stageDraft.customTitle.trim() : stageDraft.title.trim();
    const weight = Number(normalizeDigits(stageDraft.weight).replace(/,/g, ''));

    if (!title) {
      setStageError('عنوان مرحله الزامی است.');
      return;
    }
    if (!(weight > 0 && weight <= 100)) {
      setStageError('وزن مرحله باید بین ۱ تا ۱۰۰ باشد.');
      return;
    }
    if (!stageDraft.plannedStartDate || !stageDraft.plannedEndDate) {
      setStageError('تاریخ شروع و پایان الزامی است.');
      return;
    }
    if (compareDateText(stageDraft.plannedEndDate, stageDraft.plannedStartDate) <= 0) {
      setStageError('تاریخ پایان باید بعد از تاریخ شروع باشد.');
      return;
    }

    const duplicateTitle = builder.stages.some(
      (stage, index) => index !== stageDialogIndex && stage.title.trim().toLocaleLowerCase('fa-IR') === title.toLocaleLowerCase('fa-IR'),
    );
    if (duplicateTitle) {
      setStageError('عنوان مرحله تکراری است.');
      return;
    }

    const nextStage: ScheduleStage = {
      id: stageDialogIndex !== null ? builder.stages[stageDialogIndex].id : crypto.randomUUID(),
      title,
      weight,
      plannedStartDate: stageDraft.plannedStartDate,
      plannedEndDate: stageDraft.plannedEndDate,
      description: stageDraft.description.trim(),
      order: stageDialogIndex ?? builder.stages.length,
    };

    setBuilder((current) => {
      const nextStages = [...current.stages];
      if (stageDialogIndex !== null) nextStages[stageDialogIndex] = nextStage;
      else nextStages.push(nextStage);
      return {
        ...current,
        stages: nextStages.map((stage, index) => ({ ...stage, order: index })),
      };
    });
    setStageDialogOpen(false);
  }

  function moveStage(index: number, direction: -1 | 1) {
    setBuilder((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.stages.length) return current;
      const nextStages = [...current.stages];
      const [item] = nextStages.splice(index, 1);
      nextStages.splice(nextIndex, 0, item);
      return {
        ...current,
        stages: nextStages.map((stage, order) => ({ ...stage, order })),
      };
    });
  }

  async function submitBuilder() {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        title: builder.title,
        blockIds: builder.blockIds,
        stages: builder.stages.map((stage) => ({
          title: stage.title,
          weight: stage.weight,
          plannedStartDate: stage.plannedStartDate,
          plannedEndDate: stage.plannedEndDate,
          description: stage.description,
          order: stage.order,
        })),
      };

      const response = await fetch(
        editingScheduleKey
          ? `/api/business-settings/project/physical-progress-schedules/${editingScheduleKey}`
          : '/api/business-settings/project/physical-progress-schedules',
        {
          method: editingScheduleKey ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as { schedules?: ScheduleSummary[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره برنامه ناموفق بود.');

      setSchedules(data.schedules ?? []);
      resetBuilder();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره برنامه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  async function archiveSchedule(schedule: ScheduleSummary) {
    if (!window.confirm(`برنامه "${schedule.title}" برای بلوک ${schedule.blockName} آرشیو شود؟`)) return;
    setMessage('');
    try {
      const response = await fetch(`/api/business-settings/project/physical-progress-schedules/${schedule.scheduleKey}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { schedules?: ScheduleSummary[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'آرشیو برنامه ناموفق بود.');
      setSchedules(data.schedules ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'آرشیو برنامه ناموفق بود.');
    }
  }

  async function submitDuplicate() {
    if (!duplicateSchedule) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/business-settings/project/physical-progress-schedules/${duplicateSchedule.scheduleKey}/duplicate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: duplicateTitle,
            blockIds: duplicateBlockIds,
          }),
        },
      );

      const data = (await response.json()) as { schedules?: ScheduleSummary[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? 'دپلیکیت برنامه ناموفق بود.');
      setSchedules(data.schedules ?? []);
      setDuplicateSchedule(null);
      setDuplicateTitle('');
      setDuplicateBlockIds([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'دپلیکیت برنامه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  const saveDisabled =
    saving ||
    !builder.title.trim() ||
    !builder.blockIds.length ||
    !builder.stages.length ||
    Math.abs(totalWeight - 100) > 0.001;

  return (
    <section className="business-block-form-page" aria-label="برنامه زمان‌بندی پیشرفت فیزیکی">
      <div className="business-block-form-card project-flow-form-card">
        <div className="project-flow-hero">
          <div className="project-flow-hero-icon">
            <CalendarRange />
          </div>
          <div className="project-flow-hero-copy">
            <Link href="/business-settings/project" className="project-flow-hero-back" aria-label="بازگشت">
              <ArrowRight />
              <span>بازگشت</span>
            </Link>
            <h1>برنامه زمان‌بندی پیشرفت فیزیکی پروژه</h1>
            <p>در این بخش می‌توانید برنامه زمان‌بندی کلان پیشرفت فیزیکی پروژه را برای هر بلوک تعریف کنید. این برنامه مبنای گزارش پیشرفت، اقساط مبتنی بر پیشرفت فیزیکی و برخی فرآیندهای قراردادی خواهد بود.</p>
          </div>
          <div className="project-flow-hero-actions">
            <Button variant="primary" onClick={openCreateBuilder}>
              <Plus className="h-4 w-4" />
              افزودن برنامه جدید
            </Button>
          </div>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت برنامه‌های زمان‌بندی...</div> : null}

        {!loading ? (
          <>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-800">لیست برنامه‌ها</h2>
                  <p className="mt-1 text-sm text-slate-500">هر برنامه به یک بلوک مستقل متصل است و ویرایش آن نسخه جدید می‌سازد.</p>
                </div>
                <Badge variant="muted">{new Intl.NumberFormat('fa-IR').format(schedules.length)} برنامه</Badge>
              </div>

              {!schedules.length ? <div className="business-blocks-state">هنوز برنامه‌ای ثبت نشده است.</div> : null}

              <div className="space-y-3">
                {schedules.map((schedule) => {
                  const expanded = expandedScheduleKeys.includes(schedule.scheduleKey);
                  return (
                    <article key={schedule.scheduleKey} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-slate-800">{schedule.title}</h3>
                            <Badge>{schedule.blockName}</Badge>
                            <Badge variant="warning">نسخه {new Intl.NumberFormat('fa-IR').format(schedule.version)}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>{new Intl.NumberFormat('fa-IR').format(schedule.stageCount)} مرحله</span>
                            <span>جمع وزن: {formatWeight(schedule.totalWeight)}</span>
                            <span>ایجادکننده: {schedule.createdByName}</span>
                            <span>ایجاد: {formatDateTime(schedule.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpandedScheduleKeys((current) =>
                                expanded ? current.filter((item) => item !== schedule.scheduleKey) : [...current, schedule.scheduleKey],
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            مشاهده
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditBuilder(schedule)}>
                            <Pencil className="h-4 w-4" />
                            ویرایش
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDuplicateSchedule(schedule);
                              setDuplicateTitle(`${schedule.title} - کپی`);
                              setDuplicateBlockIds([]);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            دپلیکیت
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => archiveSchedule(schedule)}>
                            <Trash2 className="h-4 w-4" />
                            آرشیو
                          </Button>
                        </div>
                      </div>

                      {expanded ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {schedule.stages.map((stage) => (
                            <div key={stage.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-sm text-slate-800">{stage.title}</strong>
                                <Badge variant="success">{formatWeight(stage.weight)}</Badge>
                              </div>
                              <p className="mt-2 text-xs text-slate-500">
                                {formatPersianDate(stage.plannedStartDate)} تا {formatPersianDate(stage.plannedEndDate)}
                              </p>
                              {stage.description ? <p className="mt-2 text-xs leading-6 text-slate-600">{stage.description}</p> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>

            {builderOpen ? (
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{editingSchedule ? 'ویرایش برنامه زمان‌بندی' : 'ایجاد برنامه زمان‌بندی'}</h2>
                    <p className="mt-1 text-sm text-slate-500">اگر چند بلوک را همزمان انتخاب کنید، سیستم برای هر بلوک یک برنامه مستقل ایجاد می‌کند.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetBuilder}>
                    <X className="h-4 w-4" />
                    بستن
                  </Button>
                </div>

                {editingSchedule ? (
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    ویرایش این برنامه باعث ایجاد نسخه جدید برای قراردادهای آینده خواهد شد. قراردادهای قبلی بدون تغییر باقی می‌مانند.
                  </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="عنوان برنامه" required>
                    <input
                      value={builder.title}
                      onChange={(event) => setBuilder((current) => ({ ...current, title: event.target.value.slice(0, 120) }))}
                      placeholder="مثلاً برنامه زمان‌بندی بلوک‌های B"
                    />
                  </Field>

                  <Field label="انتخاب بلوک‌ها" required hint="می‌توانید یک یا چند بلوک با برنامه مشابه را انتخاب کنید.">
                    <BlockMultiSelect
                      blocks={blocks}
                      selectedBlockIds={builder.blockIds}
                      disabled={Boolean(editingSchedule)}
                      onChange={(blockIds) => setBuilder((current) => ({ ...current, blockIds }))}
                    />
                  </Field>
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">کتابخانه مراحل</h3>
                      <p className="mt-1 text-xs text-slate-500">می‌توانید از مراحل پیشنهادی استفاده کنید یا مرحله سفارشی بسازید.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...stageLibrary, OTHER_STAGE_VALUE].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                        onClick={() => {
                          setStageDraft((current) => ({
                            ...current,
                            title: stage,
                            customTitle: stage === OTHER_STAGE_VALUE ? current.customTitle : '',
                          }));
                          setStageDialogIndex(null);
                          setStageError('');
                          setStageDialogOpen(true);
                        }}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800">مراحل برنامه</h3>
                      <p className="mt-1 text-xs text-slate-500">جمع وزن مراحل باید دقیقاً برابر با ۱۰۰٪ باشد.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openStageDialog()}>
                      <Plus className="h-4 w-4" />
                      افزودن مرحله
                    </Button>
                  </div>

                  {!builder.stages.length ? <div className="business-blocks-state">هنوز مرحله‌ای تعریف نشده است.</div> : null}

                  <div className="space-y-3">
                    {builder.stages.map((stage, index) => (
                      <div key={stage.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-slate-300" />
                          <div>
                            <div className="font-bold text-slate-800">{stage.title}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatWeight(stage.weight)} | {stage.plannedStartDate} تا {stage.plannedEndDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" onClick={() => moveStage(index, -1)} disabled={index === 0}>
                            بالا
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => moveStage(index, 1)} disabled={index === builder.stages.length - 1}>
                            پایین
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openStageDialog(index)}>
                            <Pencil className="h-4 w-4" />
                            ویرایش
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setBuilder((current) => ({
                                ...current,
                                stages: current.stages.filter((item) => item.id !== stage.id).map((item, order) => ({ ...item, order })),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${Math.abs(totalWeight - 100) > 0.001 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        جمع وزن مراحل: {formatWeight(totalWeight)}
                        {Math.abs(totalWeight - 100) > 0.001 ? ' | جمع وزن مراحل باید دقیقاً ۱۰۰٪ باشد.' : ' | اعتبارسنجی وزن‌ها کامل است.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <Button variant="outline" onClick={resetBuilder}>
                    انصراف
                  </Button>
                  <Button variant="primary" onClick={submitBuilder} disabled={saveDisabled}>
                    {saving ? 'در حال ذخیره...' : editingSchedule ? 'ثبت نسخه جدید' : 'ذخیره برنامه'}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {stageDialogOpen ? (
          <Dialog title={stageDialogIndex !== null ? 'ویرایش مرحله' : 'افزودن مرحله جدید'} onClose={() => setStageDialogOpen(false)}>
            {stageError ? <div className="business-blocks-state is-error">{stageError}</div> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="عنوان مرحله" required>
                <select value={stageDraft.title} onChange={(event) => setStageDraft((current) => ({ ...current, title: event.target.value }))}>
                  <option value="">انتخاب مرحله</option>
                  {stageLibrary.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                  <option value={OTHER_STAGE_VALUE}>{OTHER_STAGE_VALUE}</option>
                </select>
              </Field>

              <Field label="وزن مرحله از کل پروژه (%)" required hint="این درصد سهم این مرحله از پیشرفت کل پروژه را مشخص می‌کند.">
                <input value={stageDraft.weight} onChange={(event) => setStageDraft((current) => ({ ...current, weight: event.target.value }))} inputMode="decimal" />
              </Field>
            </div>

            {stageDraft.title === OTHER_STAGE_VALUE ? (
              <Field label="عنوان سفارشی مرحله" required>
                <input value={stageDraft.customTitle} onChange={(event) => setStageDraft((current) => ({ ...current, customTitle: event.target.value.slice(0, 80) }))} />
              </Field>
            ) : null}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="تاریخ شروع برنامه‌ریزی‌شده" required>
                <PersianDatePicker value={stageDraft.plannedStartDate} onChange={(value) => setStageDraft((current) => ({ ...current, plannedStartDate: value }))} placeholder="انتخاب تاریخ" containerClassName="w-full" />
              </Field>
              <Field label="تاریخ پایان برنامه‌ریزی‌شده" required>
                <PersianDatePicker value={stageDraft.plannedEndDate} onChange={(value) => setStageDraft((current) => ({ ...current, plannedEndDate: value }))} placeholder="انتخاب تاریخ" containerClassName="w-full" />
              </Field>
            </div>

            <Field label="توضیحات">
              <textarea
                rows={4}
                value={stageDraft.description}
                onChange={(event) => setStageDraft((current) => ({ ...current, description: event.target.value.slice(0, 500) }))}
                placeholder="توضیحات تکمیلی مرحله"
              />
            </Field>

            <div className="business-dialog-actions">
              <Button variant="outline" onClick={() => setStageDialogOpen(false)}>
                انصراف
              </Button>
              <Button variant="primary" onClick={submitStageDialog}>
                ثبت
              </Button>
            </div>
          </Dialog>
        ) : null}

        {duplicateSchedule ? (
          <Dialog
            title="دپلیکیت برنامه"
            subtitle={`برنامه "${duplicateSchedule.title}" برای بلوک‌های مقصد جدید کپی می‌شود و هر بلوک نسخه مستقل خودش را خواهد داشت.`}
            onClose={() => setDuplicateSchedule(null)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="عنوان برنامه جدید" required>
                <input value={duplicateTitle} onChange={(event) => setDuplicateTitle(event.target.value.slice(0, 120))} />
              </Field>
              <Field label="بلوک‌های مقصد" required>
                <BlockMultiSelect blocks={blocks} selectedBlockIds={duplicateBlockIds} onChange={setDuplicateBlockIds} />
              </Field>
            </div>

            <div className="business-dialog-actions">
              <Button variant="outline" onClick={() => setDuplicateSchedule(null)}>
                انصراف
              </Button>
              <Button variant="primary" onClick={submitDuplicate} disabled={saving || !duplicateTitle.trim() || !duplicateBlockIds.length}>
                {saving ? 'در حال دپلیکیت...' : 'ثبت دپلیکیت'}
              </Button>
            </div>
          </Dialog>
        ) : null}
      </div>
    </section>
  );
}
