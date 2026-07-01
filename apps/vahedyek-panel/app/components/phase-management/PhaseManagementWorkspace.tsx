'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, Plus } from 'lucide-react';

type RoadmapTaskStatus = 'pending' | 'in-progress' | 'done';

type RoadmapTask = {
  id: string;
  title: string;
  section: string;
  dueDate: string;
  status: RoadmapTaskStatus;
  note: string;
};

type WorkspaceStore = {
  roadmapTasks: RoadmapTask[];
};

const STORAGE_KEY = 'vahedyek.phase-management.workspace.v2';

const roadmapTaskStatusOptions: Array<{ value: RoadmapTaskStatus; label: string }> = [
  { value: 'pending', label: 'انجام‌نشده' },
  { value: 'in-progress', label: 'در حال انجام' },
  { value: 'done', label: 'انجام‌شده' },
];

const seedRoadmapTasks: RoadmapTask[] = [
  {
    id: 'roadmap-task-1',
    title: 'تنظیمات سود',
    section: 'قواعد مالی و قراردادی',
    dueDate: '25 خرداد 1405',
    status: 'done',
    note: 'انجام شده در نظر گرفته شود.',
  },
  {
    id: 'roadmap-task-2',
    title: 'تنظیمات وام',
    section: 'قواعد مالی و قراردادی',
    dueDate: '25 خرداد 1404',
    status: 'done',
    note: 'انجام شده در نظر گرفته شود.',
  },
  {
    id: 'roadmap-task-3',
    title: 'پیش پرداخت',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-4',
    title: 'اقساط',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-5',
    title: 'تنظیمات تعدیل',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-6',
    title: 'هزینه‌های جانبی',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-7',
    title: 'تنظیمات تخفیف',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-8',
    title: 'تنظیمات جریمه خریدار',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-9',
    title: 'تنظیمات جریمه سازنده',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-10',
    title: 'تنظیمات فسخ سازنده',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-11',
    title: 'تنظیمات فسخ خریدار',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-12',
    title: 'تنظیمات بخشودگی',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-13',
    title: 'سود دریافتی',
    section: 'قواعد مالی و قراردادی',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-14',
    title: 'تنظیمات وام',
    section: 'قواعد مالی و قراردادی',
    dueDate: '25 خرداد 1404',
    status: 'done',
    note: 'انجام شده در نظر گرفته شود.',
  },
  {
    id: 'roadmap-task-15',
    title: 'بلوک و برج‌ها',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-16',
    title: 'طبقات',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-17',
    title: 'واحد',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-18',
    title: 'انباری',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-19',
    title: 'پارکینگ',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-20',
    title: 'رفاهی',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-21',
    title: 'مشخصات فنی پروژه',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-22',
    title: 'نوع مالکیت و اطلاعات پایه',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-23',
    title: 'شرکای اصلی',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-24',
    title: 'نماینده قانونی',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-25',
    title: 'شماره حساب',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-26',
    title: 'لوگو و مهر',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-27',
    title: 'ارز پایه',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-28',
    title: 'زبان‌های فعال',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-29',
    title: 'تقویم',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-30',
    title: 'واحداندازه‌گیری',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
  {
    id: 'roadmap-task-31',
    title: 'راه‌های ارتباطی',
    section: 'مدیریت پروژه و اطلاعات پایه',
    dueDate: 'ثبت نشده',
    status: 'done',
    note: 'این بخش را انجام‌شده در نظر بگیر.',
  },
];

type RoadmapTaskDraft = {
  title: string;
  section: string;
  dueDate: string;
  status: RoadmapTaskStatus;
  note: string;
};

const initialRoadmapTaskDraft: RoadmapTaskDraft = {
  title: '',
  section: '',
  dueDate: '',
  status: 'pending',
  note: '',
};

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roadmapTaskStatusMeta(status: RoadmapTaskStatus) {
  switch (status) {
    case 'done':
      return { label: 'انجام‌شده', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    case 'in-progress':
      return { label: 'در حال انجام', badge: 'border-amber-200 bg-amber-50 text-amber-700' };
    default:
      return { label: 'انجام‌نشده', badge: 'border-slate-200 bg-slate-100 text-slate-700' };
  }
}

export default function PhaseManagementWorkspace() {
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>(seedRoadmapTasks);
  const [roadmapTaskDraft, setRoadmapTaskDraft] = useState<RoadmapTaskDraft>(initialRoadmapTaskDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkspaceStore>;
        if (Array.isArray(parsed.roadmapTasks) && parsed.roadmapTasks.length) {
          setRoadmapTasks(parsed.roadmapTasks);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: WorkspaceStore = { roadmapTasks };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, roadmapTasks]);

  const roadmapStats = useMemo(
    () => ({
      total: roadmapTasks.length,
      done: roadmapTasks.filter((task) => task.status === 'done').length,
      active: roadmapTasks.filter((task) => task.status === 'in-progress').length,
    }),
    [roadmapTasks],
  );

  function addRoadmapTask() {
    if (!roadmapTaskDraft.title.trim() || !roadmapTaskDraft.section.trim() || !roadmapTaskDraft.dueDate.trim()) return;
    const next: RoadmapTask = {
      id: createId('roadmap-task'),
      title: roadmapTaskDraft.title.trim(),
      section: roadmapTaskDraft.section.trim(),
      dueDate: roadmapTaskDraft.dueDate.trim(),
      status: roadmapTaskDraft.status,
      note: roadmapTaskDraft.note.trim(),
    };
    setRoadmapTasks((current) => [next, ...current]);
    setRoadmapTaskDraft(initialRoadmapTaskDraft);
  }

  function updateRoadmapTaskStatus(id: string, status: RoadmapTaskStatus) {
    setRoadmapTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  return (
    <main className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-base font-black text-slate-950">تسک‌های زمان‌بندی‌شده</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                فقط همین بخش در مدیریت فازها نگه داشته شده است.
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <CompactStat label="کل تسک‌ها" value={toFa(roadmapStats.total)} />
              <CompactStat label="انجام‌شده" value={toFa(roadmapStats.done)} />
              <CompactStat label="در حال انجام" value={toFa(roadmapStats.active)} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {roadmapTasks.length ? (
              roadmapTasks.map((task, index) => {
                const meta = roadmapTaskStatusMeta(task.status);
                return (
                  <article
                    key={task.id}
                    className={`rounded-[8px] border px-5 py-5 ${
                      task.status === 'done'
                        ? 'border-emerald-200 bg-[linear-gradient(180deg,#ffffff,#f6fffb)]'
                        : 'border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fbfdff)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          تسک {toFa(index + 1)}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}>{meta.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateRoadmapTaskStatus(task.id, task.status === 'done' ? 'in-progress' : 'done')}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {task.status === 'done' ? 'بازگشت به در حال انجام' : 'علامت به‌عنوان انجام‌شده'}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_240px]">
                      <div>
                        <div className="text-lg font-black text-slate-950">{task.title}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-600">{task.note || 'بدون توضیح'}</div>
                      </div>
                      <div className="grid gap-2 rounded-[8px] bg-slate-50 p-4 text-xs font-semibold text-slate-600">
                        <RowMeta label="بخش" value={task.section || '-'} />
                        <RowMeta label="تاریخ پایان" value={task.dueDate || '-'} />
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <BlankWorkspaceCard title="هنوز تسکی ثبت نشده است" body="از فرم کنار صفحه می‌توانی اولین تسک را اضافه کنی." />
            )}
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-black text-slate-950">افزودن تسک جدید</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">مثلاً: تنظیمات سود یا تنظیمات وام</div>
            <div className="mt-4 grid gap-3">
              <input
                value={roadmapTaskDraft.title}
                onChange={(e) => setRoadmapTaskDraft((c) => ({ ...c, title: e.target.value }))}
                placeholder="عنوان تسک"
                className={inputClass}
              />
              <input
                value={roadmapTaskDraft.section}
                onChange={(e) => setRoadmapTaskDraft((c) => ({ ...c, section: e.target.value }))}
                placeholder="بخش"
                className={inputClass}
              />
              <input
                value={roadmapTaskDraft.dueDate}
                onChange={(e) => setRoadmapTaskDraft((c) => ({ ...c, dueDate: e.target.value }))}
                placeholder="تاریخ پایان مثل 25 خرداد 1405"
                className={inputClass}
              />
              <select
                value={roadmapTaskDraft.status}
                onChange={(e) => setRoadmapTaskDraft((c) => ({ ...c, status: e.target.value as RoadmapTaskStatus }))}
                className={inputClass}
              >
                {roadmapTaskStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={roadmapTaskDraft.note}
                onChange={(e) => setRoadmapTaskDraft((c) => ({ ...c, note: e.target.value }))}
                placeholder="توضیح"
                className={textAreaClass}
              />
              <button type="button" onClick={addRoadmapTask} className={primaryButtonClass}>
                <Plus className="h-4 w-4" />
                افزودن تسک
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-slate-50 px-3 py-3">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-950">{value}</div>
    </div>
  );
}

function RowMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-white bg-white px-3 py-2">
      <span>{label}</span>
      <span className="font-black text-slate-800">{value}</span>
    </div>
  );
}

function BlankWorkspaceCard({
  title,
  body,
  compact = false,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[8px] border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? 'px-4 py-6' : 'px-6 py-10'}`}>
      <div className="text-sm font-black text-slate-800">{title}</div>
      <div className="mt-2 text-xs leading-6 text-slate-500">{body}</div>
    </div>
  );
}

function toFa(value: number) {
  return value.toLocaleString('fa-IR');
}

const inputClass =
  'h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-300';
const textAreaClass =
  'min-h-[92px] w-full rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-300';
const primaryButtonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[color:var(--dark-teal)] px-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';


