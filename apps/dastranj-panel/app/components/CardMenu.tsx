'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

type CardMenuItem =
  | {
      kind: 'link';
      href: string;
      label: string;
      tone?: 'default' | 'danger';
    }
  | {
      kind: 'submit';
      label: string;
      tone?: 'default' | 'danger';
      action: (formData: FormData) => void | Promise<void>;
      hiddenFields?: Record<string, string>;
    };

type CardMenuProps = {
  items: CardMenuItem[];
};

const OPEN_EVENT = 'dastranj:card-menu-open';

export function CardMenu({ items }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleMenuOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ menuId: string }>).detail;
      if (detail.menuId !== menuId) {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener(OPEN_EVENT, handleMenuOpen as EventListener);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener(OPEN_EVENT, handleMenuOpen as EventListener);
    };
  }, [menuId, open]);

  const toggleMenu = () => {
    const next = !open;
    if (next) {
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { menuId } }));
    }
    setOpen(next);
  };

  return (
    <div className="card-menu" ref={rootRef}>
      <button type="button" className="card-menu-trigger" aria-label="منوی عملیات" onClick={toggleMenu}>
        ⋮
      </button>
      {open ? (
        <div className="card-menu-dropdown">
          {items.map((item) =>
            item.kind === 'link' ? (
              <Link
                key={`${item.kind}-${item.href}-${item.label}`}
                href={item.href}
                className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <form key={`${item.kind}-${item.label}`} action={item.action}>
                {Object.entries(item.hiddenFields ?? {}).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <button type="submit" className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}>
                  {item.label}
                </button>
              </form>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
