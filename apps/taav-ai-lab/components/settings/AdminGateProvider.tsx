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
import { AdminGateDialog } from './AdminGateDialog';

const UNLOCK_TTL_MS = 90_000;

type AdminGateContextValue = {
  isUnlocked: boolean;
  requireUnlock: (onSuccess: () => void) => void;
  lock: () => void;
};

const AdminGateContext = createContext<AdminGateContextValue | null>(null);

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const [unlockUntil, setUnlockUntil] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const isUnlocked = unlockUntil !== null && Date.now() < unlockUntil;

  const lock = useCallback(() => {
    setUnlockUntil(null);
  }, []);

  useEffect(() => {
    if (!unlockUntil) return;
    const remaining = unlockUntil - Date.now();
    if (remaining <= 0) {
      lock();
      return;
    }
    const timer = window.setTimeout(lock, remaining);
    return () => window.clearTimeout(timer);
  }, [unlockUntil, lock]);

  const tryUnlock = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(payload?.message ?? 'نام کاربری یا رمز عبور اشتباه است.');
        return false;
      }
      setUnlockUntil(Date.now() + UNLOCK_TTL_MS);
      setDialogOpen(false);
      pendingActionRef.current?.();
      pendingActionRef.current = null;
      return true;
    } catch {
      setError('خطا در ارتباط با سرور.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requireUnlock = useCallback(
    (onSuccess: () => void) => {
      if (unlockUntil !== null && Date.now() < unlockUntil) {
        onSuccess();
        return;
      }
      pendingActionRef.current = onSuccess;
      setError(null);
      setDialogOpen(true);
    },
    [unlockUntil],
  );

  const value = useMemo(
    () => ({ isUnlocked, requireUnlock, lock }),
    [isUnlocked, requireUnlock, lock],
  );

  return (
    <AdminGateContext.Provider value={value}>
      {children}
      <AdminGateDialog
        open={dialogOpen}
        error={error}
        loading={loading}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            pendingActionRef.current = null;
            setError(null);
          }
        }}
        onSubmit={tryUnlock}
      />
    </AdminGateContext.Provider>
  );
}

export function useAdminGate() {
  const context = useContext(AdminGateContext);
  if (!context) {
    throw new Error('useAdminGate must be used within AdminGateProvider');
  }
  return context;
}
