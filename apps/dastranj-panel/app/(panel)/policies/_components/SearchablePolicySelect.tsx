'use client';

import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string; hint?: string };

export function SearchablePolicySelect({
  name,
  value,
  options,
  placeholder,
}: {
  name: string;
  value: string;
  options: Option[];
  placeholder: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const selectedOption = options.find((option) => option.value === selected) ?? null;

  return (
    <div ref={rootRef} className="shift-search-select" dir="rtl">
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        className="shift-search-select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedOption ? 'shift-search-select-value' : 'shift-search-select-placeholder'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="shift-search-select-trigger-icons" aria-hidden>
          <X className="shift-search-select-clear-icon" />
          <ChevronDown className="shift-search-select-chevron" />
        </span>
      </button>

      {open ? (
        <div
          className="shift-search-select-popover"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <button
                key={option.value}
                type="button"
                className={isSelected ? 'shift-search-select-option is-selected group' : 'shift-search-select-option group'}
                onClick={() => {
                  setSelected(option.value);
                  setOpen(false);
                }}
              >
                <span className="shift-search-select-option-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
