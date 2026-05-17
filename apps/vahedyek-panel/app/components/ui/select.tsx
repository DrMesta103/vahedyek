'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { Button } from './button';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'انتخاب کنید…',
  searchPlaceholder = 'جستجو…',
  emptyText = 'موردی یافت نشد.',
  disabled = false,
  renderSelected,
  footerAction,
}: {
  options: SelectOption[];
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  renderSelected?: (opt: SelectOption | null) => ReactNode;
  footerAction?: { label: string; onClick: () => void };
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [options, q]);

  const selected = useMemo(() => options.find((o) => o.value === (value ?? '')) ?? null, [options, value]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 text-right text-[13px] font-semibold text-[var(--text-body)] disabled:opacity-55"
      >
        <span className={`min-w-0 truncate ${selected ? 'text-[var(--text-body)]' : 'text-[var(--text-muted)]'}`}>
          {renderSelected ? renderSelected(selected) : selected?.label ?? placeholder}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[var(--text-faint)]" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-faint)]" aria-hidden />
        )}
      </button>

      {open && !disabled ? (
        <div className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--text-faint)]" aria-hidden />
            <input
              dir="rtl"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-right text-[12px] font-semibold outline-none placeholder:text-[var(--text-faint)]"
            />
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setQ('')}
                aria-label="پاک‌کردن جستجو"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            ) : null}
          </div>

          <ul className="max-h-64 overflow-auto py-1">
            {filtered.length ? (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    disabled={Boolean(opt.disabled)}
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setQ('');
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-right text-[12px] font-semibold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-50"
                  >
                    <span className="min-w-0 truncate">{opt.label}</span>
                    {selected?.value === opt.value ? (
                      <Check className="h-4 w-4 shrink-0 text-[var(--dark-teal)]" aria-hidden />
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-right text-[12px] font-semibold text-[var(--text-muted)]">{emptyText}</li>
            )}
          </ul>

          {footerAction ? (
            <div className="border-t border-[var(--border-color)] p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQ('');
                  footerAction.onClick();
                }}
                className="flex w-full items-center justify-center rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-[12px] font-bold text-[var(--dark-teal)] transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_10%,white)]"
              >
                {footerAction.label}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
