'use client';

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
import { LockKeyhole } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogTitle,
} from '@repo/ui/taav';

const STORAGE_KEY = 'taav-ai-lab:admin-gate:unlocked-at';
const UNLOCK_TTL_MS = 30 * 60 * 1000;

type AdminGateContextValue = {
  isUnlocked: boolean;
  requireUnlock: (action: () => void) => void;
  lock: () => void;
};

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

function isUnlockValid(unlockedAt: number | null) {
  if (!unlockedAt || !Number.isFinite(unlockedAt)) return false;
  return Date.now() - unlockedAt < UNLOCK_TTL_MS;
}

function readStoredUnlockAt() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number(raw) : null;
  if (!isUnlockValid(parsed)) {
    if (raw) sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return parsed;
}

export function useAdminGate() {
  const context = useContext(AdminGateContext);
  if (!context) {
    throw new Error('useAdminGate must be used within AdminGateProvider');
  }
  return context;
}

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const [unlockedAt, setUnlockedAt] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setUnlockedAt(readStoredUnlockAt());
  }, []);

  const markUnlocked = useCallback(() => {
    const now = Date.now();
    setUnlockedAt(now);
    sessionStorage.setItem(STORAGE_KEY, String(now));
  }, []);

  const lock = useCallback(() => {
    setUnlockedAt(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const requireUnlock = useCallback((action: () => void) => {
    const storedUnlockAt = readStoredUnlockAt();
    if (isUnlockValid(storedUnlockAt)) {
      setUnlockedAt(storedUnlockAt);
      action();
      return;
    }

    pendingActionRef.current = action;
    setUsername('');
    setPassword('');
    setError('');
    setSubmitting(false);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    pendingActionRef.current = null;
    setUsername('');
    setPassword('');
    setError('');
    setSubmitting(false);
  }, []);

  const handleVerify = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError('نام کاربری و رمز عبور الزامی است.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/settings/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setError(payload?.message ?? 'نام کاربری یا رمز عبور اشتباه است.');
        return;
      }

      markUnlocked();
      setDialogOpen(false);
      const pendingAction = pendingActionRef.current;
      pendingActionRef.current = null;
      pendingAction?.();
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  const value = useMemo(
    () => ({
      isUnlocked: isUnlockValid(unlockedAt),
      requireUnlock,
      lock,
    }),
    [lock, requireUnlock, unlockedAt],
  );

  return (
    <AdminGateContext.Provider value={value}>
      {children}

      <TaavDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeDialog();
        }}
      >
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog ai-lab-admin-gate-dialog">
          <header className="ai-lab-admin-gate-header">
            <div className="ai-lab-admin-gate-header-icon" aria-hidden="true">
              <LockKeyhole className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <TaavDialogTitle className="ai-lab-admin-gate-title">تأیید دسترسی ادمین</TaavDialogTitle>
              <TaavDialogDescription className="ai-lab-admin-gate-subtitle">
                برای انجام این عملیات، اطلاعات ادمین پلتفرم را وارد کنید.
              </TaavDialogDescription>
            </div>
          </header>

          <div className="ai-lab-admin-gate-form">
            <label className="ai-lab-admin-gate-label" htmlFor="admin-gate-username">
              نام کاربری
            </label>
            <input
              id="admin-gate-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
              }}
              disabled={submitting}
              className="ai-lab-admin-gate-input"
            />

            <label className="ai-lab-admin-gate-label" htmlFor="admin-gate-password">
              رمز عبور
            </label>
            <input
              id="admin-gate-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              disabled={submitting}
              className="ai-lab-admin-gate-input"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleVerify();
                }
              }}
            />

            {error ? <p className="ai-lab-admin-gate-error">{error}</p> : null}
          </div>

          <footer className="ai-lab-admin-gate-footer">
            <button type="button" className="ai-lab-admin-gate-cancel" onClick={closeDialog} disabled={submitting}>
              انصراف
            </button>
            <button
              type="button"
              className="ai-lab-admin-gate-submit"
              onClick={() => void handleVerify()}
              disabled={submitting}
            >
              {submitting ? 'در حال بررسی...' : 'تأیید'}
            </button>
          </footer>
        </TaavDialogContent>
      </TaavDialog>
    </AdminGateContext.Provider>
  );
}
