'use client';

import { CheckCircle2, OctagonAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type AppToastType = 'error' | 'success';

type AppToastPayload = {
  type: AppToastType;
  message: string;
  duration?: number;
};

type AppToastState = AppToastPayload & {
  id: number;
};

type AppToastContextValue = {
  showToast: (payload: AppToastPayload) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  clearToast: () => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

const DEFAULT_DURATIONS: Record<AppToastType, number> = {
  error: 3600,
  success: 2200,
};

function toastStyles(type: AppToastType) {
  if (type === 'error') {
    return {
      wrapper:
        'border-red-300 bg-red-50/95 text-[#1e40af] shadow-[0_18px_40px_rgba(239,68,68,0.18)]',
      iconWrap: 'bg-red-100 text-red-600 border border-red-200',
      close: 'text-red-400 hover:bg-red-100 hover:text-red-600',
      title: 'خطا',
      Icon: OctagonAlert,
    };
  }

  return {
    wrapper:
      'border-[color-mix(in_srgb,var(--dark-teal)_35%,#bfdbfe)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[#0f3b8f] shadow-[0_18px_40px_rgba(17,181,201,0.18)]',
    iconWrap: 'bg-white text-[color-mix(in_srgb,var(--dark-teal)_88%,black)] border border-[color-mix(in_srgb,var(--dark-teal)_20%,#dbeafe)]',
    close: 'text-sky-400 hover:bg-white/80 hover:text-sky-700',
    title: 'عملیات موفق',
    Icon: CheckCircle2,
  };
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<AppToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (payload: AppToastPayload) => {
      const nextToast: AppToastState = {
        ...payload,
        id: Date.now(),
      };

      setToast(nextToast);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(
        () => {
          setToast((current) => (current?.id === nextToast.id ? null : current));
          timeoutRef.current = null;
        },
        payload.duration ?? DEFAULT_DURATIONS[payload.type],
      );
    },
    [],
  );

  const value = useMemo<AppToastContextValue>(
    () => ({
      showToast,
      showError: (message, duration) => showToast({ type: 'error', message, duration }),
      showSuccess: (message, duration) => showToast({ type: 'success', message, duration }),
      clearToast,
    }),
    [clearToast, showToast],
  );

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  const styles = toast ? toastStyles(toast.type) : null;

  return (
    <AppToastContext.Provider value={value}>
      {children}
      {toast && styles ? (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[140] flex justify-center px-4" dir="rtl" lang="fa">
          <div
            className={`pointer-events-auto w-full max-w-xl rounded-[24px] border px-4 py-3 text-right ${styles.wrapper}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={clearToast}
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition ${styles.close}`}
                aria-label="بستن پیام"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-end gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-black">{styles.title}</div>
                    <div className="mt-1 text-[14px] font-bold leading-6">{toast.message}</div>
                  </div>
                  <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
                    <styles.Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(AppToastContext);
  if (!context) {
    throw new Error('useAppToast must be used inside AppToastProvider');
  }
  return context;
}
