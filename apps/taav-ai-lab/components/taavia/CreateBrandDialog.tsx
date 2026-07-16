'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Sparkles, X } from 'lucide-react';
import { TaavButton, TaavDialog, TaavDialogContent, TaavDialogDescription, TaavDialogFooter, TaavDialogHeader, TaavDialogTitle } from '@repo/ui/taav';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import type { TaaviaBrand } from '@/app/lib/types/domain';

type BrandDialogSeed = Pick<TaaviaBrand, 'id' | 'name' | 'description' | 'icon'>;

export function CreateBrandDialog({ open, onOpenChange, tenantId, onSaved, mode = 'create', initialBrand = null }: { open: boolean; onOpenChange: (open: boolean) => void; tenantId: string; onSaved: (brandId: string) => void; mode?: 'create' | 'edit'; initialBrand?: BrandDialogSeed | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<{ extension: string; sizeBytes: number; previewData: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialBrand?.name ?? '');
    setDescription(initialBrand?.description ?? '');
    setIcon(initialBrand?.icon?.previewData ? { extension: initialBrand.icon.extension ?? 'image', sizeBytes: initialBrand.icon.sizeBytes ?? 0, previewData: initialBrand.icon.previewData } : null);
    setError(null);
  }, [open, initialBrand]);

  const handleIconPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('فقط فایل تصویری قابل انتخاب است.'); return; }
    const reader = new FileReader();
    reader.onload = () => setIcon({ extension: file.type.split('/')[1] ?? 'image', sizeBytes: file.size, previewData: typeof reader.result === 'string' ? reader.result : '' });
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!name.trim()) { setError('نام برند الزامی است.'); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch(mode === 'edit' && initialBrand ? `/api/businesses/${tenantId}/taavia/brands/${initialBrand.id}` : `/api/businesses/${tenantId}/taavia/brands`, { method: mode === 'edit' ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), description: description.trim() || null, icon }) });
      const payload = (await response.json().catch(() => null)) as { brand?: { id: string }; message?: string } | null;
      if (!response.ok || !payload?.brand?.id) throw new Error(payload?.message ?? 'ذخیره برند انجام نشد.');
      onOpenChange(false); onSaved(payload.brand.id);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'ذخیره برند انجام نشد.'); }
    finally { setLoading(false); }
  };

  return <TaavDialog open={open} onOpenChange={onOpenChange}><TaavDialogContent size="sm" contentClassName="ai-lab-dialog"><TaavDialogHeader><TaavDialogTitle>{mode === 'edit' ? 'ویرایش برند' : 'ایجاد برند جدید'}</TaavDialogTitle><TaavDialogDescription>اطلاعات پایه برند را مستقیم در پروفایل آن ثبت کنید.</TaavDialogDescription></TaavDialogHeader><div className="grid gap-4"><TaavFieldBlock label="نام برند" required htmlFor="brand-name"><TaavInput id="brand-name" value={name} onChange={(event) => setName(event.target.value)} disabled={loading} /></TaavFieldBlock><TaavFieldBlock label="توضیح کوتاه" htmlFor="brand-description"><TaavTextarea id="brand-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} disabled={loading} /></TaavFieldBlock><TaavFieldBlock label="آیکون برند" htmlFor="brand-icon"><div className="flex items-center gap-3"><input ref={fileInputRef} id="brand-icon" type="file" accept="image/*" className="sr-only" onChange={handleIconPick} /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]" aria-label="انتخاب آیکون برند">{icon?.previewData ? <img src={icon.previewData} alt="پیش‌نمایش آیکون" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" />}</button>{icon ? <TaavButton type="button" variant="ghost" tone="neutral" iconStart={<X className="h-4 w-4" />} onClick={() => setIcon(null)}>حذف آیکون</TaavButton> : <span className="text-xs text-[var(--taav-text-muted)]">تصویر کوچک و خوانا انتخاب کنید.</span>}</div></TaavFieldBlock>{error ? <p role="alert" className="m-0 text-sm text-[var(--taav-danger-strong)]">{error}</p> : null}</div><TaavDialogFooter><TaavButton variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>انصراف</TaavButton><TaavButton onClick={() => void submit()} disabled={loading} iconStart={<Sparkles className="h-4 w-4" />}>{loading ? 'در حال ذخیره…' : 'ذخیره برند'}</TaavButton></TaavDialogFooter></TaavDialogContent></TaavDialog>;
}
