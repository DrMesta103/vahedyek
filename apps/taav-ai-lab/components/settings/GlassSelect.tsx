'use client';

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { TaavPopover, TaavPopoverContent, TaavPopoverTrigger } from '@repo/ui/taav';

export type GlassSelectOption = {
  label: string;
  value: string;
  description?: string;
};

type GlassSelectProps = {
  id: string;
  value: string;
  options: GlassSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function GlassSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'انتخاب کنید',
  disabled = false,
  className,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.value === value),
    );
    setHighlightedIndex(selectedIndex);
  }, [options, value]);

  const commitSelection = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + options.length) % options.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commitSelection(options[index]?.value ?? value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <TaavPopover open={open} onOpenChange={setOpen}>
      <TaavPopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={['ai-lab-glass-select-trigger', disabled ? 'is-disabled' : '', className].filter(Boolean).join(' ')}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
        >
          <span className={selectedOption ? 'ai-lab-glass-select-value' : 'ai-lab-glass-select-placeholder'}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
        </button>
      </TaavPopoverTrigger>

      <TaavPopoverContent
        side="bottom"
        align="start"
        size="md"
        contentClassName="ai-lab-glass-select-popover"
      >
        <div id={`${id}-listbox`} role="listbox" className="ai-lab-glass-select-list">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  'ai-lab-glass-select-option',
                  isSelected ? 'is-selected' : '',
                  isHighlighted ? 'is-highlighted' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlightedIndex(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                onClick={() => commitSelection(option.value)}
              >
                <span className="ai-lab-glass-select-option-copy">
                  <strong>{option.label}</strong>
                  {option.description ? <small>{option.description}</small> : null}
                </span>
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </TaavPopoverContent>
    </TaavPopover>
  );
}
