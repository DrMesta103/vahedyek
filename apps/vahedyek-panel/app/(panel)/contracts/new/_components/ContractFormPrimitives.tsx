'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Calendar, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { Input, PersianDatePicker } from '@repo/ui';

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
  invalid = false,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </label>
      <div className={invalid ? 'rounded-xl border border-rose-300 bg-rose-50/40 p-2' : ''}>{children}</div>
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
  inputMode,
  dir,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  dir?: 'ltr' | 'rtl';
  invalid?: boolean;
}) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      inputMode={inputMode}
      dir={dir}
      aria-invalid={invalid}
      endAdornment={Icon ? <Icon className="h-4 w-4 text-slate-400" /> : undefined}
      className={`h-[42px] rounded-xl border bg-[image:var(--control-bg-gradient)] text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 focus:ring-4 ${
        invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/10'
      } ${Icon ? 'pr-10 pl-3.5' : 'px-3.5'} ${className}`}
    />
  );
}

export function FormDateInput({
  value,
  onChange,
  placeholder,
  icon: Icon = null,
  className = '',
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType | null;
  className?: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      {Icon ? <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /> : null}
      <PersianDatePicker
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'انتخاب تاریخ'}
        withCalendarIcon={!Icon}
        className={`h-[42px] w-full rounded-xl border bg-[image:var(--control-bg-gradient)] ${Icon ? 'pr-10 pl-3.5' : 'px-3.5'} text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-slate-400 outline-none transition-all ${
          invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'
        } ${className}`}
      />
    </div>
  );
}

export function TagPill({
  label,
  active,
  onClick,
  title,
  className = '',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-pressed={active}
      data-tag-pill="true"
      data-active={active ? 'true' : 'false'}
      className={`inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-[12px] whitespace-nowrap transition-all max-sm:min-h-11 ${
        active
          ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] font-semibold text-[var(--text-strong)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]'
          : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)] hover:bg-[var(--surface-soft)]'
      } ${className}`}
    >
      {active ? (
        <span aria-hidden="true" className="choice-pill__check inline-flex h-3 w-3 shrink-0 items-center justify-center">
          <style>
            {`
              .choice-pill__check {
                transform-origin: center;
                animation: choice-pill-check-appear 120ms ease-out both;
              }
              @keyframes choice-pill-check-appear {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .choice-pill__check-path {
                stroke-dasharray: 30;
                stroke-dashoffset: 30;
                animation: choice-pill-check-draw 360ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both;
              }
              @keyframes choice-pill-check-draw {
                to { stroke-dashoffset: 0; }
              }
            `}
          </style>
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path className="choice-pill__check-path" d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : null}
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
  options: ReadonlyArray<{ value: T; label: string; tooltip?: string }>;
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex max-sm:max-w-full max-sm:overflow-x-auto max-sm:pb-1 gap-2 ${wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1'} ${className}`}>
      {options.map((option) => (
        <TagPill
          key={option.value}
          label={option.label}
          active={value === option.value}
          title={option.tooltip}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

export function MultiTagPills<T extends string>({
  options,
  values,
  onChange,
  wrap = true,
  className = '',
}: {
  options: ReadonlyArray<{ value: T; label: string; tooltip?: string }>;
  values: T[];
  onChange: (values: T[]) => void;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex max-sm:max-w-full max-sm:overflow-x-auto max-sm:pb-1 gap-2 ${wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto pb-1'} ${className}`}>
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <TagPill
            key={option.value}
            label={option.label}
            active={active}
            title={option.tooltip}
            onClick={() => onChange(active ? values.filter((v) => v !== option.value) : [...values, option.value])}
          />
        );
      })}
    </div>
  );
}

export function BusinessSwitch({
  checked,
  onChange,
  onLabel = 'فعال',
  offLabel = 'غیرفعال',
  className = '',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`business-switch shrink-0 ${className}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="business-switch-option is-on">{onLabel}</span>
      <span className="business-switch-option is-off">{offLabel}</span>
    </button>
  );
}

export function InlineSelect({
  value,
  onSelect,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid = false,
}: {
  value: string;
  onSelect: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  invalid?: boolean;
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
        className={`flex h-[42px] w-full items-center justify-between rounded-xl border bg-[image:var(--control-bg-gradient)] px-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all ${
          invalid ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10'
        }`}
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
  invalid = false,
}: {
  label: string;
  items: { id: string; name: string; sub?: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyText: string;
  itemsPerRow?: number;
  invalid?: boolean;
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
    <div className={`space-y-2 ${invalid ? 'rounded-xl border border-rose-300 bg-rose-50/40 p-3' : ''}`}>
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
