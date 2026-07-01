'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Eye, MoreVertical, Pencil, Plus, Trash2, ArrowRight, CalendarRange, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { PhysicalProgressScheduleSummary } from '@/lib/physicalProgressScheduleLogic';

type BlockOption = {
  id: string;
  name: string;
};

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
}: {
  blocks: BlockOption[];
  selectedBlockIds: string[];
  onChange: (blockIds: string[]) => void;
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
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-[8px] border border-slate-200 bg-white px-4 text-sm text-slate-800"
      >
        <span className={selectedNames.length ? '' : 'text-slate-400'}>
          {selectedNames.length ? selectedNames.join('، ') : 'انتخاب بلوک‌ها'}
        </span>
        <span className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-[8px] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="max-h-56 space-y-2 overflow-auto">
            {blocks.map((block) => {
              const checked = selectedBlockIds.includes(block.id);
              return (
                <label key={block.id} className="flex items-center justify-between rounded-[8px] border border-slate-200 px-3 py-2 text-sm">
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
  const searchParams = useSearchParams();
  const focusedBlockId = searchParams.get('blockId')?.trim() || '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [schedules, setSchedules] = useState<PhysicalProgressScheduleSummary[]>([]);
  const [expandedScheduleKeys, setExpandedScheduleKeys] = useState<string[]>([]);
  const [duplicateSchedule, setDuplicateSchedule] = useState<PhysicalProgressScheduleSummary | null>(null);
  const [duplicateTitle, setDuplicateTitle] = useState('');
  const [duplicateBlockIds, setDuplicateBlockIds] = useState<string[]>([]);
  const [openScheduleMenuKey, setOpenScheduleMenuKey] = useState('');

  const focusedBlock = useMemo(() => blocks.find((block) => block.id === focusedBlockId) ?? null, [blocks, focusedBlockId]);
  const visibleSchedules = useMemo(
    () => (focusedBlockId ? schedules.filter((schedule) => schedule.blockId === focusedBlockId) : schedules),
    [focusedBlockId, schedules],
  );
  const createHref = focusedBlockId
    ? `/business-settings/project/physical-progress-schedules/new?blockId=${encodeURIComponent(focusedBlockId)}`
    : '/business-settings/project/physical-progress-schedules/new';

  async function loadData() {
    setLoading(true);
    setMessage('');
    try {
      const [scheduleResponse, blockResponse] = await Promise.all([
        fetch('/api/business-settings/project/physical-progress-schedules', { cache: 'no-store' }),
        fetch('/api/business-settings/project/blocks', { cache: 'no-store' }),
      ]);

      const scheduleData = (await scheduleResponse.json()) as { schedules?: PhysicalProgressScheduleSummary[]; message?: string };
      const blockData = (await blockResponse.json()) as { blocks?: Array<{ id: string; name: string }>; message?: string };

      if (!scheduleResponse.ok) throw new Error(scheduleData.message ?? 'دریافت برنامه‌ها ناموفق بود.');
      if (!blockResponse.ok) throw new Error(blockData.message ?? 'دریافت بلوک‌ها ناموفق بود.');

      setSchedules(scheduleData.schedules ?? []);
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

  async function archiveSchedule(schedule: PhysicalProgressScheduleSummary) {
    if (!window.confirm(`برنامه "${schedule.title}" برای بلوک ${schedule.blockName} آرشیو شود؟`)) return;
    setMessage('');
    try {
      const response = await fetch(`/api/business-settings/project/physical-progress-schedules/${schedule.scheduleKey}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { schedules?: PhysicalProgressScheduleSummary[]; message?: string };
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

      const data = (await response.json()) as { schedules?: PhysicalProgressScheduleSummary[]; message?: string };
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
            <p>در این بخش می‌توانید برنامه زمان‌بندی کلان پیشرفت فیزیکی پروژه را برای هر بلوک تعریف کنید. این برنامه مبنای گزارش پیشرفت، اقساط مبتنی بر پیشرفت فیزیکی و برخی فرایندهای قراردادی خواهد بود.</p>
          </div>
          <div className="project-flow-hero-actions">
            <Link href={createHref}>
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                افزودن برنامه جدید
              </Button>
            </Link>
          </div>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت برنامه‌های زمان‌بندی...</div> : null}

        {!loading ? (
          <div className="rounded-[8px] border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-800">لیست برنامه‌ها</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {focusedBlock
                    ? `در حال مشاهده برنامه‌های بلوک ${focusedBlock.name} هستید.`
                    : 'هر برنامه به یک بلوک مستقل متصل است و ویرایش آن نسخه جدید می‌سازد.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {focusedBlock ? (
                  <Link href="/business-settings/project/physical-progress-schedules" className="inline-flex h-9 items-center rounded-[8px] border border-slate-200 px-3 text-[12px] font-bold text-slate-700">
                    همه بلوک‌ها
                  </Link>
                ) : null}
                <Badge variant="muted">{new Intl.NumberFormat('fa-IR').format(visibleSchedules.length)} برنامه</Badge>
              </div>
            </div>

            {!visibleSchedules.length ? (
              <div className="business-blocks-state">
                {focusedBlock ? 'برای این بلوک هنوز برنامه‌ای ثبت نشده است.' : 'هنوز برنامه‌ای ثبت نشده است.'}
              </div>
            ) : null}

            <div className="space-y-3">
              {visibleSchedules.map((schedule) => {
                const expanded = expandedScheduleKeys.includes(schedule.scheduleKey);
                const editHref = `/business-settings/project/physical-progress-schedules/${schedule.scheduleKey}/edit`;

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

                      <div className="relative">
                        <button
                          type="button"
                          className="business-block-card-menu"
                          aria-label="عملیات برنامه"
                          onClick={() => setOpenScheduleMenuKey((current) => (current === schedule.scheduleKey ? '' : schedule.scheduleKey))}
                        >
                          <MoreVertical />
                        </button>
                        {openScheduleMenuKey === schedule.scheduleKey ? (
                          <div className="business-block-menu-popover left-0 right-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedScheduleKeys((current) =>
                                  expanded ? current.filter((item) => item !== schedule.scheduleKey) : [...current, schedule.scheduleKey],
                                );
                                setOpenScheduleMenuKey('');
                              }}
                            >
                              <Eye /> مشاهده
                            </button>
                            <Link
                              href={editHref}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                              onClick={() => setOpenScheduleMenuKey('')}
                            >
                              <Pencil className="h-4 w-4" /> ویرایش
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setDuplicateSchedule(schedule);
                                setDuplicateTitle(`${schedule.title} - کپی`);
                                setDuplicateBlockIds([]);
                                setOpenScheduleMenuKey('');
                              }}
                            >
                              <Copy /> دپلیکیت
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                archiveSchedule(schedule);
                                setOpenScheduleMenuKey('');
                              }}
                            >
                              <Trash2 /> آرشیو
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {expanded ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {schedule.stages.map((stage) => (
                          <div key={stage.id} className="rounded-[8px] border border-slate-200 bg-white p-3">
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


