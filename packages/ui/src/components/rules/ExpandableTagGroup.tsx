'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="m18 15-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type ExpandableTagGroupItem = { id: string; name: string; sub?: string; disabled?: boolean };

export function ExpandableTagGroup({
  label,
  items,
  selectedId,
  onSelect,
  emptyText,
  itemsPerRow = 8,
  required,
  className = '',
  showSearch = true,
  invalid = false,
  onDisabledSelect,
}: {
  label: string;
  items: ExpandableTagGroupItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyText: string;
  itemsPerRow?: number;
  required?: boolean;
  className?: string;
  showSearch?: boolean;
  invalid?: boolean;
  onDisabledSelect?: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((item) => item.name.includes(q) || (item.sub ?? '').includes(q));
  }, [items, query]);

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

  useEffect(() => {
    if (!showSearch && searchOpen) closeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSearch]);

  return (
    <div className={cn('space-y-2', invalid && 'rounded-xl border border-rose-300 bg-rose-50/40 p-3', className)}>
      <div className="flex items-center gap-2">
        <label className="text-[13px] font-bold text-slate-700">
          {label}
          {required ? <span className="text-rose-500">*</span> : null}
        </label>

        {showSearch && !searchOpen ? (
          <button
            type="button"
            onClick={openSearch}
            className="relative top-[4px] flex h-4 w-4 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-600"
            aria-label={`جستجو در ${label}`}
          >
            <SearchIcon className="h-3 w-3" />
          </button>
        ) : null}

        {showSearch ? (
          <div
            className={cn(
              'relative flex items-center overflow-hidden rounded-md border bg-white transition-[max-width,opacity,border-color] duration-200 ease-out',
              searchOpen ? 'max-w-[176px] border-slate-300 opacity-100' : 'max-w-0 border-transparent opacity-0',
            )}
            style={{ height: '22px' }}
          >
            <SearchIcon className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 shrink-0 text-slate-400" />
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
              aria-label="بستن جستجو"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-slate-400">{emptyText}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {visible.map((item) => {
              const active = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.disabled) {
                      onDisabledSelect?.(item.id);
                      return;
                    }
                    onSelect(item.id);
                  }}
                  data-tag-pill="true"
                  data-active={active ? 'true' : 'false'}
                  aria-disabled={item.disabled || undefined}
                  className={cn(
                    'inline-flex h-[34px] items-center rounded-full border px-4 text-[12px] font-medium whitespace-nowrap transition-all',
                    item.disabled
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-400'
                      : '',
                    active
                      ? 'border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]'
                      : 'border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]',
                  )}
                >
                  {item.sub ? `${item.name} · ${item.sub}` : item.name}
                </button>
              );
            })}

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
                  <ChevronUpIcon className="h-3 w-3" /> نمایش کمتر
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-3 w-3" /> {filtered.length - itemsPerRow} مورد بیشتر
                </>
              )}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

