'use client';

import Link from 'next/link';
import { useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markReminderShownAction, snoozeTenantSetupReminderAction } from '../../lib/setup-health-actions';
import type { SetupHealthReminder } from '../../lib/setup-health';

type SetupReminderBannerProps = {
  reminder: SetupHealthReminder;
};

export function SetupReminderBanner({ reminder }: SetupReminderBannerProps) {
  const router = useRouter();
  const shownRef = useRef(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    startTransition(() => {
      void markReminderShownAction(reminder.key);
    });
  }, [reminder.key]);

  return (
    <section className="setup-reminder-banner" dir="rtl" lang="fa">
      <div className="setup-reminder-banner-text">
        <p className="setup-reminder-banner-kicker">راه‌اندازی سیستم هنوز کامل نیست.</p>
        <h2>{reminder.title}</h2>
        <p>برای استفاده دقیق‌تر از دسترنج، تنظیمات ضروری کسب‌وکار را مرحله‌به‌مرحله تکمیل کنید.</p>
        <p className="setup-reminder-banner-description">{reminder.description}</p>
      </div>
      <div className="setup-reminder-banner-actions">
        <Link href={reminder.route} className="setup-reminder-primary-link">
          {reminder.ctaLabel}
        </Link>
        <button
          type="button"
          className="setup-reminder-secondary-button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void snoozeTenantSetupReminderAction(reminder.key, 24).then(() => {
                router.refresh();
              });
            })
          }
        >
          {isPending ? 'در حال ثبت...' : 'بعداً یادآوری کن'}
        </button>
      </div>
    </section>
  );
}
