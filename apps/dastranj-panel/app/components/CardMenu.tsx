'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

type ConfirmConfig = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type CardMenuItem =
  | {
      kind: 'link';
      href: string;
      label: string;
      icon?: ReactNode;
      tone?: 'default' | 'danger';
    }
  | {
      kind: 'submit';
      label: string;
      icon?: ReactNode;
      tone?: 'default' | 'danger';
      action: (formData: FormData) => void | Promise<void>;
      hiddenFields?: Record<string, string>;
      confirm?: ConfirmConfig;
    }
  | {
      kind: 'action';
      label: string;
      icon?: ReactNode;
      tone?: 'default' | 'danger';
      onClick: () => void;
    };

type CardMenuProps = {
  items: CardMenuItem[];
};

const OPEN_EVENT = 'dastranj:card-menu-open';

export function CardMenu({ items }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const [pendingItemIndex, setPendingItemIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const confirmFormRef = useRef<HTMLFormElement | null>(null);
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

  const pendingItem = pendingItemIndex === null ? null : items[pendingItemIndex];

  return (
    <>
      <div className={`card-menu ${open ? 'is-open' : ''}`} ref={rootRef}>
        <button type="button" className="card-menu-trigger" aria-label="منوی عملیات" onClick={toggleMenu}>
          <span aria-hidden>⋮</span>
        </button>
        {open ? (
          <div className="card-menu-dropdown">
            {items.map((item, index) =>
              item.kind === 'link' ? (
                <Link
                  key={`${item.kind}-${item.href}-${item.label}`}
                  href={item.href}
                  className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}
                  onClick={() => setOpen(false)}
                >
                  {item.icon ? <span className="card-menu-item-icon">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </Link>
              ) : item.kind === 'submit' && item.confirm ? (
                <button
                  key={`${item.kind}-${item.label}`}
                  type="button"
                  className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}
                  onClick={() => {
                    setOpen(false);
                    setPendingItemIndex(index);
                  }}
                >
                  {item.icon ? <span className="card-menu-item-icon">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </button>
              ) : item.kind === 'action' ? (
                <button
                  key={`${item.kind}-${item.label}`}
                  type="button"
                  className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  {item.icon ? <span className="card-menu-item-icon">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </button>
              ) : (
                <form key={`${item.kind}-${item.label}`} action={item.action}>
                  {Object.entries(item.hiddenFields ?? {}).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))}
                  <button type="submit" className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}>
                    {item.icon ? <span className="card-menu-item-icon">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </button>
                </form>
              ),
            )}
          </div>
        ) : null}
      </div>

      {pendingItem && pendingItem.kind === 'submit' && pendingItem.confirm ? (
        <>
          <form ref={confirmFormRef} action={pendingItem.action}>
            {Object.entries(pendingItem.hiddenFields ?? {}).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          </form>
          <ConfirmDialog
            open
            title={pendingItem.confirm.title}
            description={pendingItem.confirm.description}
            confirmLabel={pendingItem.confirm.confirmLabel}
            cancelLabel={pendingItem.confirm.cancelLabel}
            tone={pendingItem.tone}
            onCancel={() => setPendingItemIndex(null)}
            onConfirm={() => {
              confirmFormRef.current?.requestSubmit();
              setPendingItemIndex(null);
            }}
          />
        </>
      ) : null}
    </>
  );
}
