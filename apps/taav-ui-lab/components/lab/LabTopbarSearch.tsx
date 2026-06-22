'use client';

import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@repo/ui/taav/primitives';
import { filterLabSearchIndex } from '@/lib/lab-search-index';

export function LabTopbarSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => filterLabSearchIndex(query), [query]);
  const showResults = open && query.trim().length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const navigateTo = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative w-full flex-1 lg:max-w-md">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-subtle)]" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && results[0]) {
            event.preventDefault();
            navigateTo(results[0].href);
          }
        }}
        placeholder="جستجو در مستندات TaavUI..."
        className="h-10 w-full rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] bg-[var(--taav-surface-soft)] pr-10 pl-10 text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)] placeholder:text-[var(--taav-text-subtle)] focus:border-[color:var(--taav-brand-border)] focus:outline-none focus:shadow-[var(--taav-focus-ring)]"
        aria-label="جستجو در مستندات"
        aria-expanded={showResults}
        aria-controls="lab-topbar-search-results"
        role="combobox"
        autoComplete="off"
      />
      {query ? (
        <button
          type="button"
          className="absolute left-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[var(--taav-radius-sm)] text-[var(--taav-text-subtle)] hover:bg-[var(--taav-surface-muted)] hover:text-[var(--taav-text-body)]"
          onClick={() => {
            setQuery('');
            setOpen(false);
            inputRef.current?.focus();
          }}
          aria-label="پاک کردن جستجو"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {showResults ? (
        <div
          id="lab-topbar-search-results"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-border)] bg-[var(--taav-surface)] shadow-[var(--taav-shadow-md)]"
          role="listbox"
        >
          {results.length ? (
            <ul className="m-0 max-h-80 list-none overflow-y-auto p-2">
              {results.map((entry) => (
                <li key={entry.href}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col gap-1 rounded-[var(--taav-radius-md)] px-3 py-2.5 text-right transition',
                      'hover:bg-[var(--taav-surface-muted)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]',
                    )}
                    onClick={() => navigateTo(entry.href)}
                    role="option"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                        {entry.label}
                      </span>
                      <span className="shrink-0 text-[length:var(--taav-text-2xs)] font-bold text-[var(--taav-text-subtle)]">
                        {entry.section}
                      </span>
                    </span>
                    {entry.badge ? (
                      <span className="text-[length:var(--taav-text-xs)] font-semibold text-[var(--taav-brand-strong)]">
                        {entry.badge}
                      </span>
                    ) : null}
                    {entry.description ? (
                      <span className="text-[length:var(--taav-text-xs)] leading-6 text-[var(--taav-text-muted)]">
                        {entry.description}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 text-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
              نتیجه‌ای برای «{query.trim()}» پیدا نشد.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
