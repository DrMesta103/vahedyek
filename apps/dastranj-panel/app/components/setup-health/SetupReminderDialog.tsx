'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PanelFormModal } from '../PanelFormModal';
import { markReminderShownAction, snoozeTenantSetupReminderAction } from '../../lib/setup-health-actions';
import type { SetupHealthItem, SetupHealthReminder } from '../../lib/setup-health';

const REMINDER_INTERVAL_MS = 60 * 60 * 1000;

type SetupReminderDialogProps = {
  tenantId: string;
  reminder: SetupHealthReminder;
  criticalItems: SetupHealthItem[];
};

export function SetupReminderDialog({ tenantId, reminder, criticalItems }: SetupReminderDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const shownRef = useRef(false);
  const missingItems = useMemo(
    () => criticalItems.filter((item) => item.status === 'incomplete').slice(0, 6),
    [criticalItems],
  );

  useEffect(() => {
    setOpen(true);

    if (shownRef.current) return;
    shownRef.current = true;
    startTransition(() => {
      void markReminderShownAction(reminder.key);
    });
  }, [tenantId, reminder.key]);

  useEffect(() => {
    if (!open) return;
    if (pathname === '/login' || pathname === '/register' || pathname === '/select-tenant') {
      setOpen(false);
    }
  }, [open, pathname]);

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register' || pathname === '/select-tenant') return;

    const timer = window.setInterval(() => {
      setOpen(true);
    }, REMINDER_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [pathname]);

  const closeForCurrentSession = () => {
    setOpen(false);
  };

  return (
    <PanelFormModal
      open={open}
      title="تنظیمات ضروری این کسب‌وکار هنوز کامل نشده است"
      lead="برای اینکه تردد، درخواست‌ها و مدیریت کارکنان بدون اختلال کار کند، این تنظیمات را تکمیل کنید."
      onClose={closeForCurrentSession}
      footer={
        <div className="setup-reminder-dialog-footer">
          <Link
            href={reminder.route}
            className="setup-reminder-dialog-primary"
            onClick={() => setOpen(false)}
          >
            {reminder.ctaLabel}
          </Link>
          <button
            type="button"
            className="setup-reminder-dialog-secondary"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void snoozeTenantSetupReminderAction(reminder.key, 1).then(() => {
                  setOpen(false);
                  router.refresh();
                });
              })
            }
          >
            {isPending ? 'در حال ثبت...' : 'مجدد یادآوری کن'}
          </button>
        </div>
      }
    >
      <div className="setup-reminder-dialog-body">
        <section className="setup-reminder-dialog-hero">
          <div>
            <span className="setup-reminder-dialog-kicker">اقدام پیشنهادی بعدی</span>
            <h3>{reminder.title}</h3>
            <p>{reminder.description}</p>
          </div>
        </section>

        <section className="setup-reminder-dialog-card">
          <div className="setup-reminder-dialog-card-head">
            <strong>این تنظیمات هنوز وارد نشده‌اند</strong>
            <span>{missingItems.length} مورد ناقص</span>
          </div>
          <ul className="setup-reminder-dialog-list">
            {missingItems.map((item) => (
              <li key={item.key} className="setup-reminder-dialog-list-item">
                <span>{item.label}</span>
                <b>ناقص</b>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PanelFormModal>
  );
}
