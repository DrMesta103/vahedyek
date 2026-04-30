'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type SearchableSelectOption = { value: string; label: string };

export function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
  className = '',
}: {
  options: SearchableSelectOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);
  const filtered = useMemo(() => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())), [options, query]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((c) => !c)}
        className="flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] px-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected?.label ?? placeholder}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && !disabled ? (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-3 py-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.length ? (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(option.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-right text-[13px] transition-colors hover:bg-slate-50 ${
                      option.value === value ? 'font-semibold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.value === value ? <span>✓</span> : null}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-3 text-center text-[12px] text-slate-400">{emptyText}</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

