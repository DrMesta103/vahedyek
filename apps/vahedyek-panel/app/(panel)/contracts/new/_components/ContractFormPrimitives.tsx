'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Calendar, Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { PersianDatePicker } from '../../../../components/ui/PersianDatePicker';

export function SectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function SectionHeader({ label, description }: { label: string; description?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
    </div>
  );
}

export function FieldGroup({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function FormTextInput({
  value,
  onChange,
  placeholder,
  icon: Icon,
  disabled,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="relative">
      {Icon ? <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-[42px] w-full rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:bg-slate-50 disabled:text-slate-400 ${Icon ? 'pr-10 pl-3.5' : 'px-3.5'} ${className}`}
      />
    </div>
  );
}

export function FormDateInput({
  value,
  onChange,
  placeholder,
  icon: Icon = Calendar,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <PersianDatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'انتخاب تاریخ'}
        className={`h-[42px] w-full rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] pr-10 pl-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 ${className}`}
      />
    </div>
  );
}

export function TagPill({
  label,
  active,
  onClick,
  className = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tag-pill="true"
      data-active={active ? 'true' : 'false'}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-4 text-[12px] whitespace-nowrap transition-all ${
        active
          ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] font-semibold text-[var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      } ${className}`}
    >
      {active ? <Check className="h-3 w-3 shrink-0 stroke-[2.75]" /> : null}
      {label}
    </button>
  );
}

export function TagPills<T extends string>({
  options,
  value,
  onChange,
  wrap = true,
  className = '',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex gap-1.5 ${wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1'} ${className}`}>
      {options.map((option) => (
        <TagPill key={option.value} label={option.label} active={value === option.value} onClick={() => onChange(option.value)} />
      ))}
    </div>
  );
}

export function InlineSelect({
  value,
  onSelect,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: {
  value: string;
  onSelect: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
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

  const filtered = options.filter((option) => option.label.includes(query));
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] px-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')}>
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            ) : null}
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
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
                    className={`flex w-full items-center px-3 py-2 text-right text-[13px] transition-colors hover:bg-slate-50 ${
                      value === option.value ? 'font-semibold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {option.label}
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

export function ExpandableTagGroup({
  label,
  items,
  selectedId,
  onSelect,
  emptyText,
  itemsPerRow = 8,
}: {
  label: string;
  items: { id: string; name: string; sub?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyText: string;
  itemsPerRow?: number;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim() ? items.filter((item) => item.name.includes(query) || (item.sub ?? '').includes(query)) : items;
  const visible = expanded ? filtered : filtered.slice(0, itemsPerRow);
  const hasMore = filtered.length > itemsPerRow;

  const openSearch = () => {
    setSearchOpen(true);
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setExpanded(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-bold text-slate-700">
          {label}
          <span className="text-rose-500">*</span>
        </label>

        {!searchOpen ? (
          <button type="button" onClick={openSearch} className="relative top-[4px] flex h-4 w-4 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-600">
            <Search className="h-3 w-3" />
          </button>
        ) : null}

        <div
          className={`relative flex items-center overflow-hidden rounded-md border bg-white transition-[max-width,opacity,border-color] duration-200 ease-out ${
            searchOpen ? 'max-w-[176px] border-slate-300 opacity-100' : 'max-w-0 border-transparent opacity-0'
          }`}
          style={{ height: '22px' }}
        >
          <Search className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`جستجو در ${label}...`}
            tabIndex={searchOpen ? 0 : -1}
            className="h-full w-44 bg-transparent pr-6 pl-6 text-[10px] font-light text-slate-600 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            tabIndex={searchOpen ? 0 : -1}
            className="absolute left-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-slate-400">{emptyText}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {visible.map((item) => (
              <TagPill key={item.id} label={item.sub ? `${item.name} · ${item.sub}` : item.name} active={selectedId === item.id} onClick={() => onSelect(item.id)} />
            ))}
            {filtered.length === 0 ? <p className="text-[12px] text-slate-400">موردی یافت نشد</p> : null}
          </div>

          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" /> نمایش کمتر
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> {filtered.length - itemsPerRow} مورد بیشتر
                </>
              )}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

