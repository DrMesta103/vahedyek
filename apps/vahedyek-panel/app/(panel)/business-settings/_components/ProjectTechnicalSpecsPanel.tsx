'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, TaavTextarea } from '@repo/ui';
import { Plus, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import type { TechnicalSpecItem } from '../../../actions/contractSteps789';

type DialogState =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      itemId: string;
    }
  | null;

type TechnicalSpecFormState = {
  title: string;
  standard: string;
};

function normalizeSpecItem(item: TechnicalSpecItem, index: number): TechnicalSpecItem {
  return {
    id: item.id || `spec-${index + 1}`,
    title: item.title?.trim() ?? '',
    standard: item.standard?.trim() ?? '',
    location: item.location?.trim() ?? '',
    systemKey: item.systemKey?.trim() || undefined,
  };
}

async function fetchTechnicalSpecs() {
  const response = await fetch('/api/business-settings/project/technical-specs', { cache: 'no-store' });
  const data = (await response.json()) as { technicalSpecs?: unknown; message?: string };

  if (!response.ok) throw new Error(data.message ?? 'دریافت مشخصات فنی ناموفق بود.');
  return Array.isArray(data.technicalSpecs) ? data.technicalSpecs : [];
}

function EmptyState() {
  return (
    <div className="rounded-[8px] border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
      <p className="text-[15px] font-bold text-slate-600">هنوز مشخصه‌ای ثبت نشده است.</p>
      <p className="mt-2 text-[13px] leading-7 text-slate-400">برای شروع، روی دکمه ثبت مشخصات فنی بزنید و اولین مورد را اضافه کنید.</p>
    </div>
  );
}

export function ProjectTechnicalSpecsPanel({ returnTo = '' }: { returnTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [specs, setSpecs] = useState<TechnicalSpecItem[]>([]);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [menuOpenId, setMenuOpenId] = useState('');
  const [form, setForm] = useState<TechnicalSpecFormState>({ title: '', standard: '' });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const rawSpecs = await fetchTechnicalSpecs();
        if (!mounted) return;
        setSpecs(rawSpecs.map((item, index) => normalizeSpecItem(item as TechnicalSpecItem, index)));
      } catch (error) {
        if (mounted) setMessage(error instanceof Error ? error.message : 'دریافت مشخصات فنی ناموفق بود.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpenId) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-spec-menu]')) {
        setMenuOpenId('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpenId]);

  async function persistSpecs(nextSpecs: TechnicalSpecItem[]) {
    const normalized = nextSpecs.map((item, index) => normalizeSpecItem(item, index)).filter((item) => item.title.length > 0);
    const response = await fetch('/api/business-settings/project/technical-specs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
    });
    const data = (await response.json()) as { technicalSpecs?: unknown; message?: string };
    if (!response.ok) throw new Error(data.message ?? 'ذخیره مشخصات فنی ناموفق بود.');

    const savedSpecs = Array.isArray(data.technicalSpecs) ? data.technicalSpecs : normalized;
    const next = savedSpecs.map((item, index) => normalizeSpecItem(item as TechnicalSpecItem, index));
    setSpecs(next);
    return next;
  }

  function openCreateDialog() {
    setForm({ title: '', standard: '' });
    setDialog({ mode: 'create' });
  }

  function openEditDialog(item: TechnicalSpecItem) {
    setForm({
      title: item.title ?? '',
      standard: item.standard ?? '',
    });
    setDialog({ mode: 'edit', itemId: item.id });
    setMenuOpenId('');
  }

  function closeDialog() {
    setDialog(null);
    setForm({ title: '', standard: '' });
  }

  async function removeSpec(itemId: string) {
    const item = specs.find((spec) => spec.id === itemId);
    if (!item) return;
    if (!window.confirm(`مشخصه "${item.title}" حذف شود؟`)) return;
    setMenuOpenId('');
    setSaving(true);
    setMessage('');
    try {
      await persistSpecs(specs.filter((spec) => spec.id !== itemId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'حذف مشخصات فنی ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  async function submitDialog() {
    const title = form.title.trim();
    const standard = form.standard.trim();
    if (!title) return;

    setSaving(true);
    setMessage('');

    try {
      const nextSpecs =
        dialog?.mode === 'edit'
          ? specs.map((item) =>
              item.id === dialog.itemId
                ? {
                    ...item,
                    title,
                    standard,
                  }
                : item,
            )
          : [
              ...specs,
              {
                id: `custom-${crypto.randomUUID()}`,
                title,
                standard,
                location: '',
              },
            ];

      await persistSpecs(nextSpecs);

      if (returnTo) router.push(returnTo);
      else closeDialog();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ذخیره مشخصات فنی ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.title.trim().length > 0;
  const backHref = returnTo || '/business-settings/project';

  return (
    <section
      className="project-technical-specs-page"
      aria-label="مشخصات فنی پروژه"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.12) 1px, transparent 0), radial-gradient(circle at 22px 22px, rgba(148, 163, 184, 0.05) 1px, transparent 0), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.96))',
        backgroundSize: '36px 36px, 72px 72px, auto',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1344px] flex-col gap-4 px-0 pb-12 pt-4">
        <div className="relative min-h-[64px]">
          <Link
            href={backHref}
            className="absolute left-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-400 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="بازگشت"
          >
            <X className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={openCreateDialog}
            className="business-blocks-add absolute right-0 top-0"
          >
            <span>ثبت مشخصات فنی</span>
            <Plus className="h-5 w-5" />
          </button>

          <p className="mx-auto max-w-[1120px] px-16 pt-1 text-center text-[13px] font-semibold leading-8 text-slate-600">
            در این بخش مشخصات فنی پروژه مانند نوع مصالح، سیستم‌های تأسیساتی، امکانات داخلی واحدها (مانند کابینت، کفپوش، درب‌ها و غیره) را تعریف کنید.
            این اطلاعات در قراردادها و مشخصات فنی واحدها مورد استفاده قرار می‌گیرد.
          </p>
        </div>

        {message ? <div className="business-blocks-state is-error">{message}</div> : null}
        {loading ? <div className="business-blocks-state">در حال دریافت مشخصات فنی...</div> : null}

        {!loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {specs.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState />
              </div>
            ) : null}
            {specs.map((item) => (
              <article
                key={item.id}
                className="relative min-h-[192px] rounded-[8px] border border-slate-300/80 bg-white/90 p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)] backdrop-blur-[2px]"
              >
                <div className="absolute left-4 top-4" data-spec-menu>
                  <button
                    type="button"
                    className="business-block-card-menu"
                    aria-label={`گزینه‌های ${item.title}`}
                    onClick={() => setMenuOpenId((current) => (current === item.id ? '' : item.id))}
                  >
                    <MoreVertical />
                  </button>
                  {menuOpenId === item.id ? (
                    <div className="business-block-menu-popover left-0 right-auto mt-2 min-w-[148px]" onClick={(event) => event.stopPropagation()}>
                      <button type="button" onClick={() => openEditDialog(item)}>
                        <Pencil /> ویرایش
                      </button>
                      <button type="button" onClick={() => removeSpec(item.id)}>
                        <Trash2 /> حذف
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2 pl-12 text-right">
                  <span className="text-[14px] font-black text-slate-600">عنوان</span>
                  <h2 className="text-[18px] font-bold leading-8 text-slate-700">{item.title}</h2>
                </div>

                <div className="my-4 border-t border-slate-200" />

                <div className="grid gap-2 text-right">
                  <span className="text-[14px] font-black text-slate-600">توضیحات</span>
                  <p className="text-[15px] leading-8 text-slate-500 whitespace-pre-wrap">{item.standard || '—'}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {dialog ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-[404px] overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="technical-specs-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-8 pt-8 text-right">
              <h2 id="technical-specs-dialog-title" className="text-[26px] font-black leading-10 text-slate-700">
                مشخصات فنی پروژه
              </h2>
              <p className="mt-4 text-[13px] leading-7 text-slate-600">
                عنوان را انتخاب کرده و توضیح فنی مربوط به آن را وارد کنید. از این تگ‌ها برای نمایش راحت‌تر و هماهنگی در ثبت استفاده کنید.
              </p>
            </div>

            <div className="grid gap-5 px-8 pb-8 pt-6">
              <label className="grid gap-2 text-right">
                <span className="text-[15px] font-bold text-slate-600">
                  عنوان <span className="text-rose-500">*</span>
                </span>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="مثال: UPS و ژنراتور"
                  autoFocus
                  maxLength={120}
                  className="h-12 rounded-[8px] border-slate-300 px-4 text-[14px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-[color:var(--dark-teal)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_12%,transparent)]"
                />
              </label>

              <label className="grid gap-2 text-right">
                <span className="text-[15px] font-bold text-slate-600">
                  توضیحات <span className="text-rose-500">*</span>
                </span>
                <TaavTextarea
                  value={form.standard}
                  onChange={(event) => setForm((current) => ({ ...current, standard: event.target.value }))}
                  placeholder="جزئیات فنی را بنویسید..."
                  minRows={4}
                  maxLength={800}
                  wrapperClassName="rounded-[8px] border-slate-300"
                  inputClassName="px-0 py-0 text-[14px] leading-8 text-slate-700 placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-8 py-6">
              <button
                type="button"
                className="text-[15px] font-bold text-slate-500 transition hover:text-slate-700"
                onClick={closeDialog}
              >
                لغو
              </button>
              <button
                type="button"
                className="text-[15px] font-bold text-[var(--dark-teal)] transition hover:text-[color-mix(in_srgb,var(--dark-teal)_80%,black)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={submitDialog}
                disabled={!canSubmit || saving}
              >
                {saving ? 'در حال ثبت...' : 'تایید'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


