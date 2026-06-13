'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

function isRedirectError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: unknown }).digest === 'string' &&
    String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
  );
}

export function CardMenu({ items }: CardMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingItemIndex, setPendingItemIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  const runSubmitAction = async (item: Extract<CardMenuItem, { kind: 'submit' }>) => {
    const formData = new FormData();
    Object.entries(item.hiddenFields ?? {}).forEach(([name, value]) => {
      formData.set(name, value);
    });

    setSubmitting(true);
    setSubmitError(null);

    try {
      await item.action(formData);
      router.refresh();
      setPendingItemIndex(null);
    } catch (error) {
      if (isRedirectError(error)) {
        setPendingItemIndex(null);
        return;
      }
      setSubmitError(
        error instanceof Error ? error.message : '\u0627\u0646\u062c\u0627\u0645 \u0639\u0645\u0644\u06cc\u0627\u062a \u0628\u0627 \u062e\u0637\u0627 \u0645\u0648\u0627\u062c\u0647 \u0634\u062f.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMenu = () => {
    const next = !open;
    if (next) {
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { menuId } }));
      setSubmitError(null);
    }
    setOpen(next);
  };

  const pendingItem = pendingItemIndex === null ? null : items[pendingItemIndex];

  return (
    <>
      <div className={`card-menu ${open ? 'is-open' : ''}`} ref={rootRef}>
        <button
          type="button"
          className="card-menu-trigger"
          aria-label="\u0645\u0646\u0648\u06cc \u0639\u0645\u0644\u06cc\u0627\u062a"
          onClick={toggleMenu}
        >
          <span aria-hidden>{'\u22EE'}</span>
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
                    setSubmitError(null);
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
                <button
                  key={`${item.kind}-${item.label}`}
                  type="button"
                  className={item.tone === 'danger' ? 'card-menu-delete' : 'card-menu-link'}
                  onClick={() => {
                    setOpen(false);
                    void runSubmitAction(item);
                  }}
                >
                  {item.icon ? <span className="card-menu-item-icon">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>

      {pendingItem && pendingItem.kind === 'submit' && pendingItem.confirm ? (
        <ConfirmDialog
          open
          title={pendingItem.confirm.title}
          description={pendingItem.confirm.description}
          error={submitError}
          confirmLabel={
            submitting ? '\u062f\u0631 \u062d\u0627\u0644 \u0627\u0646\u062c\u0627\u0645...' : pendingItem.confirm.confirmLabel
          }
          cancelLabel={pendingItem.confirm.cancelLabel}
          tone={pendingItem.tone}
          confirmDisabled={submitting}
          cancelDisabled={submitting}
          onCancel={() => {
            setPendingItemIndex(null);
            setSubmitError(null);
          }}
          onConfirm={() => {
            void runSubmitAction(pendingItem);
          }}
        />
      ) : null}
    </>
  );
}
