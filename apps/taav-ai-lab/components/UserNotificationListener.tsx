'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserNotificationEvent } from '@/app/lib/data';

const POLL_INTERVAL_MS = 15000;
const AUTO_DISMISS_MS = 6000;

export function UserNotificationListener() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<UserNotificationEvent[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let disposed = false;

    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' });
        if (response.status === 401) {
          router.replace('/login?inactive=1');
          router.refresh();
          return;
        }
        if (!response.ok) return;

        const payload = (await response.json().catch(() => null)) as { notifications?: UserNotificationEvent[] } | null;
        const incoming = (payload?.notifications ?? []).filter((item) => !seenRef.current.has(item.id));
        if (incoming.length === 0 || disposed) return;

        for (const item of incoming) {
          seenRef.current.add(item.id);
        }

        setNotifications((current) => [...current, ...incoming]);
      } catch {
        // no-op; polling is best-effort
      }
    };

    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((notification) =>
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, AUTO_DISMISS_MS),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications]);

  const visibleNotifications = useMemo(() => notifications.slice(-3), [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="ai-lab-user-notification-stack" aria-live="polite" aria-atomic="true">
      {visibleNotifications.map((notification) => (
        <article key={notification.id} className="ai-lab-user-notification-toast">
          <div className="ai-lab-user-notification-icon" aria-hidden="true">
            <BellRing className="h-4 w-4" />
          </div>
          <div className="ai-lab-user-notification-copy">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
          <button
            type="button"
            className="ai-lab-user-notification-close"
            onClick={() => {
              setNotifications((current) => current.filter((item) => item.id !== notification.id));
            }}
            aria-label="بستن نوتیفیکیشن"
          >
            <X className="h-4 w-4" />
          </button>
        </article>
      ))}
    </div>
  );
}
