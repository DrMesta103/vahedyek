'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PersianDatePicker } from '@repo/ui';
import { BusinessSettingsSubmitButton } from './BusinessSettingsSubmitButton';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  CalendarRange,
  Check,
  Square,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PHYSICAL_PROGRESS_STAGE_LIBRARY,
  type PhysicalProgressScheduleStage,
  type PhysicalProgressScheduleSummary,
} from '@/lib/physicalProgressScheduleLogic';

type BlockOption = {
  id: string;
  name: string;
};

type BuilderState = {
  title: string;
  blockIds: string[];
  stages: PhysicalProgressScheduleStage[];
};

type StageDraft = {
  title: string;
  customTitle: string;
  weight: string;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
  isCompleted: boolean;
};

type SortMode = 'manual' | 'start-asc' | 'start-desc' | 'end-asc' | 'end-desc';

const OTHER_STAGE_VALUE = 'سایر';

function createEmptyBuilder(): BuilderState {
  return { title: '', blockIds: [], stages: [] };
}

function createEmptyStageDraft(): StageDraft {
  return {
    title: '',
    customTitle: '',
    weight: '',
    plannedStartDate: '',
    plannedEndDate: '',
    description: '',
    isCompleted: false,
  };
}

function computeTotalWeight(stages: PhysicalProgressScheduleStage[]) {
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

function formatWeight(value: number) {
  return `${new Intl.NumberFormat('fa-IR').format(value)}٪`;
}

function getAutoNumberedStageTitle(title: string, stages: PhysicalProgressScheduleStage[], editingIndex: number | null) {
  const existingTitles = new Set(
    stages
      .filter((_, index) => index !== editingIndex)
      .map((stage) => stage.title.trim().toLocaleLowerCase('fa-IR')),
  );

  const normalized = title.trim().toLocaleLowerCase('fa-IR');
  if (!existingTitles.has(normalized)) return title;

  let counter = 2;
  while (existingTitles.has(`${title} ${counter}`.trim().toLocaleLowerCase('fa-IR'))) {
    counter += 1;
  }

  return `${title} ${counter}`;
}

function getStageTagCount(stages: PhysicalProgressScheduleStage[], tag: string) {
  return stages.filter((stage) => stage.libraryTag === tag).length;
}

function reorderStages(stages: PhysicalProgressScheduleStage[]) {
  return stages.map((stage, index) => ({ ...stage, order: index }));
}

function sortStages(stages: PhysicalProgressScheduleStage[], mode: SortMode) {
  if (mode === 'manual') {
    return reorderStages([...stages].sort((left, right) => left.order - right.order));
  }

  const sorted = [...stages].sort((left, right) => {
    if (mode === 'start-asc') return compareDateText(left.plannedStartDate, right.plannedStartDate);
    if (mode === 'start-desc') return compareDateText(right.plannedStartDate, left.plannedStartDate);
    if (mode === 'end-asc') return compareDateText(left.plannedEndDate, right.plannedEndDate);
    return compareDateText(right.plannedEndDate, left.plannedEndDate);
  });

  return reorderStages(sorted);
}

function sortModeLabel(mode: SortMode) {
  switch (mode) {
    case 'start-asc':
      return 'شروع: قدیم به جدید';
    case 'start-desc':
      return 'شروع: جدید به قدیم';
    case 'end-asc':
      return 'پایان: قدیم به جدید';
    case 'end-desc':
      return 'پایان: جدید به قدیم';
    default:
      return 'ترتیب دستی';
  }
}

function Field({
  label,
  required,
  hint,
  tooltip,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <label className="business-block-form-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      {children}
      {hint ? <small>{hint}</small> : tooltip ? <small>{tooltip}</small> : null}
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
        className={`flex h-11 w-full items-center justify-between rounded-[8px] border border-slate-200 px-4 text-sm ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white text-slate-800'}`}
        title="انتخاب بلوک‌های مرتبط با این برنامه زمان‌بندی"
      >
        <span className={selectedNames.length ? '' : 'text-slate-400'}>
          {selectedNames.length ? selectedNames.join('، ') : 'انتخاب بلوک‌ها'}
        </span>
        <span className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>

      {open && !disabled ? (
        <div className="absolute z-20 mt-2 w-full rounded-[8px] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="max-h-56 space-y-2 overflow-auto">
            {blocks.map((block) => {
              const checked = selectedBlockIds.includes(block.id);
              return (
                <button
                  key={block.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-[8px] border px-3 py-2 text-sm transition ${
                    checked
                      ? 'border-[color:var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_8%,white)] text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-pressed={checked}
                  onClick={() => {
                    if (checked) onChange(selectedBlockIds.filter((item) => item !== block.id));
                    else onChange([...selectedBlockIds, block.id]);
                  }}
                >
                  <span>{block.name}</span>
                  <span className="flex h-5 w-5 items-center justify-center text-[color:var(--dark-teal)]">
                    {checked ? <Check className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-300" />}
                  </span>
                </button>
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

function SortDropdown({
  sortMode,
  open,
  onToggle,
  onSelect,
}: {
  sortMode: SortMode;
  open: boolean;
  onToggle: () => void;
  onSelect: (mode: SortMode) => void;
}) {
  const options: Array<{ value: SortMode; label: string }> = [
    { value: 'manual', label: 'ترتیب دستی' },
    { value: 'start-asc', label: 'تاریخ شروع: قدیم به جدید' },
    { value: 'start-desc', label: 'تاریخ شروع: جدید به قدیم' },
    { value: 'end-asc', label: 'تاریخ پایان: قدیم به جدید' },
    { value: 'end-desc', label: 'تاریخ پایان: جدید به قدیم' },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        title="مرتب‌سازی مراحل بر اساس ترتیب دستی یا تاریخ شروع و پایان"
      >
        <ArrowDownUp className="h-4 w-4" />
        {sortModeLabel(sortMode)}
      </button>

      {open ? (
        <div className="absolute left-0 z-20 mt-2 min-w-60 rounded-[8px] border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`flex w-full rounded-[8px] px-3 py-2 text-right text-sm ${option.value === sortMode ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StageCard({
  stage,
  onEdit,
  onDelete,
  menuOpen,
  onToggleMenu,
}: {
  stage: PhysicalProgressScheduleStage;
  onEdit: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[8px] border border-slate-200 bg-white px-4 py-4 ${isDragging ? 'shadow-[0_12px_35px_rgba(15,23,42,0.16)]' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 cursor-grab rounded-[8px] border border-slate-200 p-2 text-slate-400 active:cursor-grabbing"
            aria-label="جابجایی مرحله"
            title="برای تغییر ترتیب، این مرحله را بکشید و در جای جدید رها کنید"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-sm text-slate-900">{stage.title}</strong>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">{formatWeight(stage.weight)}</span>
            </div>
            <div className="text-xs text-slate-500">
              {stage.plannedStartDate} تا {stage.plannedEndDate}
            </div>
            {stage.description ? <p className="text-xs leading-6 text-slate-500">{stage.description}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              className="rounded-[8px] border border-slate-200 p-2 text-slate-500"
              aria-label="عملیات مرحله"
              title="عملیات مرحله"
              onClick={onToggleMenu}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="business-block-menu-popover left-0 right-auto">
                <button type="button" onClick={onEdit}>
                  <Pencil /> ویرایش
                </button>
                <button type="button" onClick={onDelete}>
                  <Trash2 /> حذف
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectPhysicalProgressScheduleForm({ scheduleKey }: { scheduleKey?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusedBlockId = searchParams.get('blockId')?.trim() || '';
  const isEditing = Boolean(scheduleKey);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [stageError, setStageError] = useState('');
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [builder, setBuilder] = useState<BuilderState>(createEmptyBuilder());
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [stageDialogIndex, setStageDialogIndex] = useState<number | null>(null);
  const [stageDraft, setStageDraft] = useState<StageDraft>(createEmptyStageDraft());
  const [openStageMenuId, setOpenStageMenuId] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('manual');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const totalWeight = useMemo(() => computeTotalWeight(builder.stages), [builder.stages]);
  const completedWeight = useMemo(
    () => Math.round(builder.stages.filter((stage) => stage.isCompleted).reduce((sum, stage) => sum + stage.weight, 0) * 100) / 100,
    [builder.stages],
  );
  const remainingWeight = Math.max(0, Math.round((100 - completedWeight) * 100) / 100);
  const focusedBlock = useMemo(() => blocks.find((block) => block.id === focusedBlockId) ?? null, [blocks, focusedBlockId]);
  const backHref = focusedBlockId
    ? `/business-settings/project/physical-progress-schedules?blockId=${encodeURIComponent(focusedBlockId)}`
    : '/business-settings/project/physical-progress-schedules';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setMessage('');
      try {
        const blockResponse = await fetch('/api/business-settings/project/blocks', { cache: 'no-store' });
        const blockData = (await blockResponse.json()) as { blocks?: Array<{ id: string; name: string }>; message?: string };
        if (!blockResponse.ok) throw new Error(blockData.message ?? 'دریافت بلوک‌ها ناموفق بود.');

        const nextBlocks = (blockData.blocks ?? []).map((block) => ({ id: block.id, name: block.name }));
        setBlocks(nextBlocks);

        if (scheduleKey) {
          const scheduleResponse = await fetch(`/api/business-settings/project/physical-progress-schedules/${scheduleKey}`, { cache: 'no-store' });
          const scheduleData = (await scheduleResponse.json()) as { schedule?: PhysicalProgressScheduleSummary; message?: string };
          if (!scheduleResponse.ok || !scheduleData.schedule) {
            throw new Error(scheduleData.message ?? 'برنامه زمان‌بندی پیدا نشد.');
          }

          setBuilder({
            title: scheduleData.schedule.title,
            blockIds: [scheduleData.schedule.blockId],
            stages: scheduleData.schedule.stages.map((stage, index) => ({ ...stage, order: index })),
          });
        } else {
          const initialFocusedBlock = focusedBlockId ? nextBlocks.find((block) => block.id === focusedBlockId) ?? null : null;
          setBuilder({
            title: initialFocusedBlock ? `برنامه زمان‌بندی ${initialFocusedBlock.name}` : '',
            blockIds: initialFocusedBlock ? [initialFocusedBlock.id] : [],
            stages: [],
          });
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'دریافت اطلاعات ناموفق بود.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [focusedBlockId, scheduleKey]);

  function openStageDialog(index?: number, selectedTitle?: string) {
    if (typeof index === 'number') {
      const stage = builder.stages[index];
      const exactLibraryMatch = PHYSICAL_PROGRESS_STAGE_LIBRARY.includes((stage.libraryTag ?? stage.title) as never);
      setStageDraft({
        title: exactLibraryMatch ? stage.libraryTag ?? stage.title : OTHER_STAGE_VALUE,
        customTitle: exactLibraryMatch ? '' : stage.title,
        weight: String(stage.weight),
        plannedStartDate: stage.plannedStartDate,
        plannedEndDate: stage.plannedEndDate,
        description: stage.description,
        isCompleted: stage.isCompleted,
      });
      setStageDialogIndex(index);
    } else {
      setStageDraft({ ...createEmptyStageDraft(), title: selectedTitle ?? '' });
      setStageDialogIndex(null);
    }

    setOpenStageMenuId('');
    setStagePickerOpen(true);
    setStageError('');
    setStageDialogOpen(true);
  }

  function openStagePicker() {
    setStagePickerOpen(true);
    setStageDialogOpen(false);
    setStageDialogIndex(null);
    setStageDraft(createEmptyStageDraft());
    setStageError('');
  }

  function submitStageDialog() {
    const selectedTitle = stageDraft.title === OTHER_STAGE_VALUE ? stageDraft.customTitle.trim() : stageDraft.title.trim();
    const weight = Number(normalizeDigits(stageDraft.weight).replace(/,/g, ''));

    if (!selectedTitle) {
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

    const title = stageDraft.title === OTHER_STAGE_VALUE
      ? selectedTitle
      : getAutoNumberedStageTitle(selectedTitle, builder.stages, stageDialogIndex);

    const nextStage: PhysicalProgressScheduleStage = {
      id: stageDialogIndex !== null ? builder.stages[stageDialogIndex].id : crypto.randomUUID(),
      title,
      weight,
      plannedStartDate: stageDraft.plannedStartDate,
      plannedEndDate: stageDraft.plannedEndDate,
      description: stageDraft.description.trim(),
      order: stageDialogIndex ?? builder.stages.length,
      isCompleted: stageDraft.isCompleted,
      completedAt: stageDraft.isCompleted ? new Date().toISOString() : null,
      libraryTag: stageDraft.title === OTHER_STAGE_VALUE ? null : stageDraft.title,
    };

    setBuilder((current) => {
      const nextStages = [...current.stages];
      if (stageDialogIndex !== null) nextStages[stageDialogIndex] = nextStage;
      else nextStages.push(nextStage);
      return { ...current, stages: reorderStages(nextStages) };
    });

    setStagePickerOpen(false);
    setStageDialogOpen(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSortMode('manual');
    setBuilder((current) => {
      const oldIndex = current.stages.findIndex((stage) => stage.id === active.id);
      const newIndex = current.stages.findIndex((stage) => stage.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return {
        ...current,
        stages: reorderStages(arrayMove(current.stages, oldIndex, newIndex)),
      };
    });
  }

  function applySort(mode: SortMode) {
    setSortMode(mode);
    setSortDropdownOpen(false);
    setBuilder((current) => ({ ...current, stages: sortStages(current.stages, mode) }));
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
          isCompleted: stage.isCompleted,
          completedAt: stage.completedAt,
          libraryTag: stage.libraryTag,
        })),
      };

      const response = await fetch(
        scheduleKey
          ? `/api/business-settings/project/physical-progress-schedules/${scheduleKey}`
          : '/api/business-settings/project/physical-progress-schedules',
        {
          method: scheduleKey ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'ذخیره برنامه ناموفق بود.');

      router.push(backHref);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره برنامه ناموفق بود.');
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
    <section className="business-block-form-page" aria-label={isEditing ? 'ویرایش برنامه زمان‌بندی پیشرفت فیزیکی' : 'ایجاد برنامه زمان‌بندی پیشرفت فیزیکی'}>
      <div className="business-block-form-card project-flow-form-card">
        <div className="project-flow-hero">
          <div className="project-flow-hero-icon">
            <CalendarRange />
          </div>
          <div className="project-flow-hero-copy">
            <Link href={backHref} className="project-flow-hero-back" aria-label="بازگشت">
              <ArrowRight />
              <span>بازگشت</span>
            </Link>
            <h1>{isEditing ? 'ویرایش برنامه زمان‌بندی' : 'ایجاد برنامه زمان‌بندی'}</h1>
            <p>فرم به‌صورت مینیمال بازطراحی شد تا تمرکز روی ترتیب، زمان، وضعیت و پیشرفت واقعی هر مرحله باشد.</p>
          </div>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت اطلاعات فرم...</div> : null}

        {!loading ? (
          <div className="mt-6 space-y-5 rounded-[8px] border border-slate-200 bg-white p-5">
            {isEditing ? (
              <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                ویرایش این برنامه باعث ایجاد نسخه جدید برای قراردادهای آینده خواهد شد. قراردادهای قبلی بدون تغییر باقی می‌مانند.
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="عنوان برنامه" required tooltip="نام برنامه‌ای که در لیست‌ها و گزارش‌ها نمایش داده می‌شود.">
                <input
                  value={builder.title}
                  onChange={(event) => setBuilder((current) => ({ ...current, title: event.target.value.slice(0, 120) }))}
                  placeholder={focusedBlock ? `مثلاً برنامه زمان‌بندی ${focusedBlock.name}` : 'مثلاً برنامه زمان‌بندی بلوک‌های B'}
                />
              </Field>

              <Field
                label="انتخاب بلوک‌ها"
                required
                tooltip="می‌توانید یک یا چند بلوک با برنامه مشابه را انتخاب کنید."
              >
                <BlockMultiSelect
                  blocks={blocks}
                  selectedBlockIds={builder.blockIds}
                  disabled={Boolean(scheduleKey) || Boolean(focusedBlockId)}
                  onChange={(blockIds) => setBuilder((current) => ({ ...current, blockIds }))}
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">پیشرفت تحقق‌یافته</div>
                <div className="mt-2 text-lg font-black text-slate-900">{formatWeight(completedWeight)}</div>
              </div>
              <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">مانده پروژه</div>
                <div className="mt-2 text-lg font-black text-slate-900">{formatWeight(remainingWeight)}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800">مراحل برنامه</h3>
                  <p className="mt-1 text-xs text-slate-500">جابجایی با drag & drop انجام می‌شود و می‌توانید با منوی sort ترتیب تاریخ‌ها را هم بازچینش کنید.</p>
                </div>

                <div className="flex items-center gap-2">
                  <SortDropdown
                    sortMode={sortMode}
                    open={sortDropdownOpen}
                    onToggle={() => setSortDropdownOpen((current) => !current)}
                    onSelect={applySort}
                  />
                  <Button size="sm" variant="outline" onClick={openStagePicker} title="افزودن یک مرحله جدید به برنامه">
                    <Plus className="h-4 w-4" />
                    افزودن مرحله
                  </Button>
                </div>
              </div>

              {!builder.stages.length ? <div className="business-blocks-state">هنوز مرحله‌ای تعریف نشده است.</div> : null}

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={builder.stages.map((stage) => stage.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {builder.stages.map((stage, index) => (
                      <StageCard
                        key={stage.id}
                        stage={stage}
                        menuOpen={openStageMenuId === stage.id}
                        onToggleMenu={() => setOpenStageMenuId((current) => (current === stage.id ? '' : stage.id))}
                        onEdit={() => {
                          openStageDialog(index);
                          setOpenStageMenuId('');
                        }}
                        onDelete={() => {
                          setBuilder((current) => ({
                            ...current,
                            stages: reorderStages(current.stages.filter((item) => item.id !== stage.id)),
                          }));
                          setOpenStageMenuId('');
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {stagePickerOpen ? (
                <div className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
                  <div className="rounded-[8px] border border-slate-200 bg-white p-4">
                    <div className="mb-5">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{stageDialogIndex !== null ? 'ویرایش مرحله' : 'افزودن مرحله'}</h4>
                          <p className="mt-1 text-xs text-slate-500">جزئیات مرحله انتخاب‌شده را تکمیل کنید.</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-black text-slate-800">عنوان مرحله</div>
                        <p className="mt-1 text-xs text-slate-500">یکی از عنوان‌های مرحله را انتخاب کنید تا فرم همان مرحله برای تکمیل جزئیات باز شود.</p>
                        <p className="mt-1 text-xs text-slate-500">عنوان مرحله را انتخاب کنید. تعداد استفاده هر تگ روی خودش نمایش داده می‌شود.</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[...PHYSICAL_PROGRESS_STAGE_LIBRARY, OTHER_STAGE_VALUE].map((stage) => {
                          const usageCount = stage === OTHER_STAGE_VALUE ? builder.stages.filter((item) => !item.libraryTag).length : getStageTagCount(builder.stages, stage);
                          const isSelected = stageDraft.title === stage;

                          return (
                            <button
                              key={stage}
                              type="button"
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                                isSelected
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : 'border-slate-200 bg-white text-slate-700'
                              }`}
                              title={`انتخاب عنوان مرحله ${stage}`}
                              onClick={() => openStageDialog(undefined, stage)}
                            >
                              {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                              <span>{stage}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {new Intl.NumberFormat('fa-IR').format(usageCount)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {stageDialogOpen ? (
                      <>
                        {stageError ? <div className="business-blocks-state is-error">{stageError}</div> : null}

                      {stageDraft.title === OTHER_STAGE_VALUE ? (
                        <Field label="عنوان سفارشی مرحله" required tooltip="برای مرحله‌ای که در فهرست پیشنهادی نیست، عنوان سفارشی وارد کنید.">
                          <input value={stageDraft.customTitle} onChange={(event) => setStageDraft((current) => ({ ...current, customTitle: event.target.value.slice(0, 80) }))} />
                        </Field>
                      ) : null}

                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <Field label="وزن مرحله از کل پروژه (%)" required tooltip="درصد سهم این مرحله از کل پیشرفت پروژه. مجموع همه مراحل باید ۱۰۰٪ باشد.">
                          <input
                            value={stageDraft.weight}
                            onChange={(event) => setStageDraft((current) => ({ ...current, weight: event.target.value }))}
                            inputMode="decimal"
                          />
                        </Field>
                        <Field label="تاریخ شروع برنامه‌ریزی‌شده" required tooltip="تاریخی که این مرحله باید از آن آغاز شود.">
                          <PersianDatePicker value={stageDraft.plannedStartDate} onChange={(value) => setStageDraft((current) => ({ ...current, plannedStartDate: value }))} placeholder="انتخاب تاریخ" containerClassName="w-full" />
                        </Field>
                        <Field label="تاریخ پایان برنامه‌ریزی‌شده" required tooltip="تاریخی که این مرحله باید تا آن زمان تکمیل شده باشد.">
                          <PersianDatePicker value={stageDraft.plannedEndDate} onChange={(value) => setStageDraft((current) => ({ ...current, plannedEndDate: value }))} placeholder="انتخاب تاریخ" containerClassName="w-full" />
                        </Field>
                      </div>

                      <Field label="توضیحات" tooltip="شرح تکمیلی مرحله، وابستگی‌ها یا توضیح اجرایی مربوط به آن.">
                        <textarea
                          rows={4}
                          value={stageDraft.description}
                          onChange={(event) => setStageDraft((current) => ({ ...current, description: event.target.value.slice(0, 500) }))}
                          placeholder="توضیحات تکمیلی مرحله"
                        />
                      </Field>

                      <div className="mt-4 flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStageDialogOpen(false);
                            setStagePickerOpen(false);
                          }}
                        >
                          انصراف
                        </Button>
                        <Button variant="primary" onClick={submitStageDialog}>
                          ثبت مرحله
                        </Button>
                      </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className={`mt-4 rounded-[8px] px-4 py-3 text-sm ${Math.abs(totalWeight - 100) > 0.001 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    جمع وزن مراحل: {formatWeight(totalWeight)}
                    {Math.abs(totalWeight - 100) > 0.001 ? ' | جمع وزن مراحل باید دقیقاً ۱۰۰٪ باشد.' : ' | وزن‌ها معتبر هستند.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href={backHref}>
                <Button variant="outline">انصراف</Button>
              </Link>
              <BusinessSettingsSubmitButton
                saving={saving}
                disabled={saveDisabled && !saving}
                onClick={submitBuilder}
                label={isEditing ? 'ثبت نسخه جدید' : 'ذخیره برنامه مبنا'}
                widthClass="w-[140px]"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}




