"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Music2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";

type UiType = "TEXT" | "IMAGE" | "VOICE" | "VIDEO";
const types: Array<{ id: UiType; label: string; help: string; icon: typeof FileText; accept?: string }> = [
  { id: "TEXT", label: "متن", help: "نوشتن متن معرفی برند", icon: FileText },
  { id: "IMAGE", label: "تصویر", help: "آپلود تصویر معرفی برند", icon: ImageIcon, accept: "image/jpeg,image/png,image/webp" },
  { id: "VOICE", label: "صوت", help: "آپلود فایل صوتی معرفی برند", icon: Music2, accept: "audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4" },
  { id: "VIDEO", label: "ویدیو", help: "آپلود فایل ویدیویی معرفی برند", icon: Video, accept: "video/mp4,video/webm,video/quicktime" },
];

export function AddBrandIntroductionDialog({ businessId, brandId, open, onClose }: { businessId: string; brandId: string; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [type, setType] = useState<UiType>("TEXT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setTimeout(() => closeRef.current?.focus(), 0);
  }, [open]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, saving]);
  if (!open) return null;
  const selected = types.find((item) => item.id === type)!;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) return setError("عنوان الزامی است.");
    if (type === "TEXT" && !content.trim()) return setError("متن معرفی الزامی است.");
    if (type !== "TEXT" && !file) return setError("یک فایل انتخاب کنید.");
    setSaving(true);
    try {
      const url = `/api/businesses/${businessId}/taavia/brands/${brandId}/brand-info`;
      const response =
        type === "TEXT"
          ? await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, textContent: content }) })
          : await fetch(url, {
              method: "POST",
              body: (() => {
                const form = new FormData();
                form.set("type", type);
                form.set("title", title);
                form.set("file", file!);
                return form;
              })(),
            });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "ثبت منبع انجام نشد.");
      setTitle("");
      setContent("");
      setFile(null);
      onClose();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت منبع انجام نشد.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4" role="presentation">
      <form onSubmit={submit} dir="rtl" role="dialog" aria-modal="true" aria-labelledby="add-intro-title" aria-describedby="add-intro-description" className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-slate-600/50 bg-[var(--taav-surface)] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[var(--taav-border-subtle)] p-6">
          <button ref={closeRef} type="button" onClick={onClose} aria-label="بستن پنجره" className="rounded-lg p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
            <X />
          </button>
          <div className="text-right">
            <h2 id="add-intro-title" className="m-0 text-2xl font-black">
              افزودن معرفی برند
            </h2>
            <p id="add-intro-description" className="mt-2 text-sm text-[var(--taav-text-muted)]">
              یک نوع محتوای معرفی برند انتخاب کنید و اطلاعات آن را وارد نمایید.
            </p>
          </div>
        </header>
        <div className="space-y-5 p-6">
          <fieldset>
            <legend className="mb-3 font-bold">نوع محتوا را انتخاب کنید</legend>
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {types.map((item) => {
                const Icon = item.icon;
                return (
                  <label key={item.id} className={`cursor-pointer rounded-xl border p-4 text-center transition ${type === item.id ? "border-violet-400 bg-violet-500/10" : "border-[var(--taav-border-subtle)]"}`}>
                    <input
                      className="sr-only"
                      type="radio"
                      name="contentType"
                      checked={type === item.id}
                      onChange={() => {
                        setType(item.id);
                        setFile(null);
                      }}
                    />
                    <Icon className="mx-auto h-8 w-8 text-violet-300" />
                    <b className="mt-2 block">{item.label}</b>
                    <span className="mt-1 block text-xs text-[var(--taav-text-muted)]">{item.help}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="block font-bold">
            عنوان <span className="text-rose-300">*</span>
            <input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-transparent p-3 font-normal outline-none focus:border-violet-400" placeholder="مثال: معرفی کلی برند" />
            <span className="mt-1 block text-left text-xs text-[var(--taav-text-muted)]">
              <bdi>{title.length}/120</bdi>
            </span>
          </label>
          {type === "TEXT" ? (
            <label className="block font-bold">
              متن معرفی <span className="text-rose-300">*</span>
              <textarea value={content} maxLength={5000} onChange={(event) => setContent(event.target.value)} className="mt-2 min-h-44 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-transparent p-3 font-normal outline-none focus:border-violet-400" placeholder="متن کامل معرفی برند را وارد کنید…" />
              <span className="mt-1 block text-left text-xs text-[var(--taav-text-muted)]">
                <bdi>{content.length}/5000</bdi>
              </span>
            </label>
          ) : (
            <label className="block rounded-xl border border-dashed border-violet-300/40 p-5 text-center font-bold">
              فایل {selected.label} <span className="text-rose-300">*</span>
              <input type="file" accept={selected.accept} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-sm font-normal" />
              {file ? (
                <p className="mt-3 text-sm text-emerald-300">
                  <bdi>{file.name}</bdi> — <bdi>{(file.size / 1024 / 1024).toFixed(2)} MB</bdi>
                </p>
              ) : (
                <p className="mt-3 text-xs font-normal text-[var(--taav-text-muted)]">فقط یک فایل با فرمت مجاز انتخاب کنید.</p>
              )}
            </label>
          )}
          <p className="rounded-xl border border-violet-300/20 bg-violet-500/5 p-3 text-sm text-[var(--taav-text-muted)]">این منبع پس از ثبت، فعال است و در Buildهای آیندهٔ Knowledge Base استفاده می‌شود.</p>
          {error ? (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          ) : null}
        </div>
        <footer className="flex justify-start gap-3 border-t border-[var(--taav-border-subtle)] p-5">
          <button disabled={saving} className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white disabled:opacity-50">
            {saving ? "در حال ثبت..." : "ثبت منبع"}
          </button>
          <button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-[var(--taav-border-subtle)] px-5 py-3">
            انصراف
          </button>
        </footer>
      </form>
    </div>
  );
}
