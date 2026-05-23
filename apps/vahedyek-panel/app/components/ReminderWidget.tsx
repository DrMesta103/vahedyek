'use client';

import Link from 'next/link';
import { Bell, CheckCircle2, GripVertical, Loader2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { isReminderTargetUser, type ReminderDigest } from '../lib/reminder';

const POSITION_KEY = 'vahedyekReminderWidgetPos:v1';
const RELOAD_MARKER_KEY = 'vahedyekReminderReloadHandled:v1';
const REMINDER_INTERVAL_MS = 15 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const IDLE_DIALOG_MS = 60 * 1000;
const ACTIVITY_DEBOUNCE_MS = 1600;
const POINTER_MOVE_INTERVAL_MS = 90 * 1000;
const DRAG_THRESHOLD_PX = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readHadReload() {
  if (typeof window === 'undefined') return false;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav?.type !== 'reload') return false;

  const marker = String(Math.trunc(performance.timeOrigin));
  try {
    const handledMarker = sessionStorage.getItem(RELOAD_MARKER_KEY);
    if (handledMarker === marker) return false;
    sessionStorage.setItem(RELOAD_MARKER_KEY, marker);
    return true;
  } catch {
    return true;
  }
}

function formatPagePath(path: string | null) {
  if (!path) return 'صفحه‌ای ثبت نشده است';
  return path;
}

function getPageTitle() {
  const heading = document.querySelector('h1')?.textContent?.trim();
  if (heading) return heading;
  return document.title.replace(/\s*\|\s*.*$/, '').trim() || document.title;
}

function cleanText(input: string | null | undefined) {
  return input?.replace(/\s+/g, ' ').trim() ?? '';
}

function describeReminderEmailStatus(status: 'sent' | 'missing' | 'config_missing' | 'failed') {
  if (status === 'sent') return 'ارسال شد';
  if (status === 'config_missing') return 'تنظیمات SMTP ناقص است';
  if (status === 'failed') return 'ارسال ناموفق بود';
  return 'برای کاربر ایمیل ثبت نشده';
}

function getControlLabel(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return '';
  const el = target.closest<HTMLElement>('button, a, input, textarea, select, [role="button"], [aria-label], label') ?? target;
  const aria = cleanText(el.getAttribute('aria-label') || el.getAttribute('title'));
  if (aria) return aria;
  const text = cleanText(el.innerText || el.textContent);
  if (text) return text.slice(0, 80);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    const label =
      cleanText(el.getAttribute('placeholder')) ||
      cleanText(el.getAttribute('name')) ||
      cleanText(el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent : '');
    return label;
  }
  return '';
}

function describeAction(event: Event) {
  const label = getControlLabel(event.target);
  if (event.type === 'keydown') return label ? `تایپ در ${label}` : 'تایپ در صفحه';
  if (event.type === 'input') return label ? `ویرایش ${label}` : 'ویرایش یک فیلد';
  if (event.type === 'change') return label ? `تغییر ${label}` : 'تغییر یک مقدار';
  if (event.type === 'pointerdown') return label ? `کلیک روی ${label}` : 'کلیک در صفحه';
  return label || 'انجام کار در صفحه';
}

export default function ReminderWidget() {
  const pathname = usePathname();
  const { data: authContext, loading } = useAuthContext();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [digest, setDigest] = useState<ReminderDigest | null>(null);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openTour, setOpenTour] = useState(false);
  const [closingTour, setClosingTour] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [pulse, setPulse] = useState(false);

  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const pendingInputRef = useRef(false);
  const activityTimerRef = useRef<number | null>(null);
  const idleDialogTimerRef = useRef<number | null>(null);
  const idleDialogShownRef = useRef(false);
  const lastPointerMoveSentRef = useRef(0);
  const reloadRef = useRef(readHadReload());
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  const closeTourTimerRef = useRef<number | null>(null);
  const shownCustomNoticeRef = useRef<string | null>(null);

  const enabled = isReminderTargetUser(authContext?.user);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    return () => {
      if (closeTourTimerRef.current) window.clearTimeout(closeTourTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(POSITION_KEY);
      const parsed = raw ? (JSON.parse(raw) as { x?: unknown; y?: unknown }) : null;
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        setPosition({
          x: clamp(parsed.x, 8, window.innerWidth - 64),
          y: clamp(parsed.y, 8, window.innerHeight - 64),
        });
        return;
      }
    } catch {
      /* ignore */
    }
    setPosition({ x: 76, y: Math.max(96, Math.round(window.innerHeight / 2 + 40)) });
  }, []);

  const postActivity = useCallback(
    async (hasInput: boolean, actionSummary?: string | null, hasInteraction = hasInput) => {
      if (!enabled) return;
      try {
        await fetch('/api/reminder/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname, pageTitle: getPageTitle(), hasInput, hasInteraction, actionSummary }),
        });
      } catch {
        /* best effort */
      }
    },
    [enabled, pathname],
  );

  const scheduleInputActivity = useCallback((actionSummary?: string) => {
    pendingInputRef.current = true;
    if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    activityTimerRef.current = window.setTimeout(() => {
      activityTimerRef.current = null;
      pendingInputRef.current = false;
      void postActivity(true, actionSummary);
    }, ACTIVITY_DEBOUNCE_MS);
  }, [postActivity]);

  useEffect(() => {
    if (!enabled) return;
    void postActivity(false);
  }, [enabled, pathname, postActivity]);

  const loadDigest = useCallback(
    async (forceReloadFlag = false, preferDialog = false) => {
      if (!enabled || document.visibilityState !== 'visible') return;
      setFetching(true);
      try {
        const reload = forceReloadFlag || reloadRef.current;
        const query = new URLSearchParams({
          reload: reload ? '1' : '0',
          path: pathname,
          title: getPageTitle(),
        });
        const response = await fetch(`/api/reminder/digest?${query.toString()}`, { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as ReminderDigest | { enabled?: false; message?: string } | null;
        if (!response.ok || !payload || payload.enabled === false) return;

        reloadRef.current = false;
        const nextDigest = payload as ReminderDigest;
        setDigest(nextDigest);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 900);

        if (
          nextDigest.customNotice &&
          shownCustomNoticeRef.current !== nextDigest.customNotice.id &&
          typeof window !== 'undefined' &&
          'Notification' in window
        ) {
          shownCustomNoticeRef.current = nextDigest.customNotice.id;
          if (Notification.permission === 'granted') {
            new Notification(nextDigest.customNotice.title, {
              body: nextDigest.customNotice.message,
            });
          }
        }

        if (preferDialog || nextDigest.presentation === 'tour') {
          setOpenTour(true);
          setOpenTooltip(false);
        } else {
          setOpenTooltip(true);
          setOpenTour(false);
        }
      } finally {
        setFetching(false);
      }
    },
    [enabled, pathname],
  );

  const scheduleIdleDialog = useCallback(() => {
    if (!enabled) return;
    if (idleDialogTimerRef.current) window.clearTimeout(idleDialogTimerRef.current);
    idleDialogTimerRef.current = window.setTimeout(() => {
      idleDialogTimerRef.current = null;
      if (document.visibilityState !== 'visible' || idleDialogShownRef.current) return;
      idleDialogShownRef.current = true;
      void loadDigest(false, true);
    }, IDLE_DIALOG_MS);
  }, [enabled, loadDigest]);

  useEffect(() => {
    if (!enabled) return;
    void postActivity(false);
    const heartbeatId = window.setInterval(() => void postActivity(false), HEARTBEAT_INTERVAL_MS);
    scheduleIdleDialog();

    const resetIdleDialog = () => {
      idleDialogShownRef.current = false;
      scheduleIdleDialog();
    };

    const onMeaningfulInput = (event: Event) => {
      resetIdleDialog();
      scheduleInputActivity(describeAction(event));
    };
    const onPointerMove = () => {
      resetIdleDialog();
      const now = Date.now();
      if (now - lastPointerMoveSentRef.current < POINTER_MOVE_INTERVAL_MS) return;
      lastPointerMoveSentRef.current = now;
      void postActivity(false, null, true);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetIdleDialog();
        return;
      }
      if (idleDialogTimerRef.current) {
        window.clearTimeout(idleDialogTimerRef.current);
        idleDialogTimerRef.current = null;
      }
    };

    window.addEventListener('keydown', onMeaningfulInput);
    window.addEventListener('pointerdown', onMeaningfulInput, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('input', onMeaningfulInput);
    window.addEventListener('change', onMeaningfulInput);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(heartbeatId);
      window.removeEventListener('keydown', onMeaningfulInput);
      window.removeEventListener('pointerdown', onMeaningfulInput);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('input', onMeaningfulInput);
      window.removeEventListener('change', onMeaningfulInput);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
      if (idleDialogTimerRef.current) window.clearTimeout(idleDialogTimerRef.current);
    };
  }, [enabled, postActivity, scheduleIdleDialog, scheduleInputActivity]);

  useEffect(() => {
    if (!enabled) return;
    const initialId = reloadRef.current ? window.setTimeout(() => void loadDigest(true, true), 1400) : null;
    const intervalId = window.setInterval(() => void loadDigest(false, true), REMINDER_INTERVAL_MS);
    return () => {
      if (initialId) window.clearTimeout(initialId);
      window.clearInterval(intervalId);
    };
  }, [enabled, loadDigest]);

  const acknowledgeTour = async () => {
    setClosingTour(true);
    if (closeTourTimerRef.current) window.clearTimeout(closeTourTimerRef.current);
    closeTourTimerRef.current = window.setTimeout(() => {
      setOpenTour(false);
      setOpenTooltip(false);
      setClosingTour(false);
      closeTourTimerRef.current = null;
    }, 320);
    try {
      await fetch('/api/reminder/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId: digest?.customNotice?.id ?? null }),
      });
    } catch {
      /* best effort */
    }
  };

  if (loading || !enabled || !position) return null;

  return (
    <>
      <div
        className="reminder-widget"
        style={{ left: position.x, top: position.y }}
        dir="rtl"
        onPointerMove={(event) => {
          if (!dragOffsetRef.current) return;
          if (!draggedRef.current && dragStartRef.current) {
            const deltaX = Math.abs(event.clientX - dragStartRef.current.x);
            const deltaY = Math.abs(event.clientY - dragStartRef.current.y);
            if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) return;
          }
          const next = {
            x: clamp(event.clientX - dragOffsetRef.current.dx, 8, window.innerWidth - 64),
            y: clamp(event.clientY - dragOffsetRef.current.dy, 8, window.innerHeight - 64),
          };
          draggedRef.current = true;
          positionRef.current = next;
          setPosition(next);
        }}
        onPointerUp={(event) => {
          if (!dragOffsetRef.current) return;
          dragOffsetRef.current = null;
          dragStartRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
          try {
            localStorage.setItem(POSITION_KEY, JSON.stringify(positionRef.current ?? position));
          } catch {
            /* ignore */
          }
        }}
      >
        {openTooltip && digest ? (
          <section className="reminder-tooltip" role="status">
            <button type="button" className="reminder-close" onClick={() => setOpenTooltip(false)} aria-label="بستن">
              <X className="h-4 w-4" />
            </button>
            <strong>{digest.title}</strong>
            <span>{digest.activitySummary}</span>
            {digest.lastVisitedPage ? (
              <div className="reminder-last-page">
                <span>آخرین صفحه‌ای که در آن بودید</span>
                <strong>{digest.lastVisitedPageTitle || formatPagePath(digest.lastVisitedPage)}</strong>
                {digest.lastVisitedPageReviewed ? <span className="reminder-page-reviewed">بررسی شده</span> : null}
                <small dir="ltr">{formatPagePath(digest.lastVisitedPage)}</small>
              </div>
            ) : null}
            {digest.auditItems.length ? (
              <div className="reminder-last-logs">
                <span>۵ لاگ آخر</span>
                <ul>
                  {digest.auditItems.slice(0, 5).map((item, index) => (
                    <li key={`audit-${index}-${item.label}`}>
                      {item.href ? (
                        <Link href={item.href} className="reminder-log-link" onClick={() => setOpenTooltip(false)}>
                          {item.label}
                        </Link>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        <button
          type="button"
          className={`reminder-fab${pulse ? ' is-pulsing' : ''}`}
          title="یادآور"
          onPointerDown={(event) => {
            dragOffsetRef.current = {
              dx: event.clientX - position.x,
              dy: event.clientY - position.y,
            };
            dragStartRef.current = {
              x: event.clientX,
              y: event.clientY,
            };
            draggedRef.current = false;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onClick={() => {
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            if (digest) {
              setOpenTooltip(false);
              setOpenTour(true);
              return;
            }
            void loadDigest(false, true);
          }}
        >
          {fetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />}
          <GripVertical className="reminder-grip" />
        </button>
      </div>

      {openTour && digest ? (
        <div
          className={`reminder-tour${closingTour ? ' is-closing' : ''}`}
          dir="rtl"
          lang="fa"
          style={
            {
              '--reminder-fab-x': `${position.x}px`,
              '--reminder-fab-y': `${position.y}px`,
            } as CSSProperties
          }
        >
          <section className={`reminder-tour-panel${closingTour ? ' is-closing' : ''}`}>
            <div className="reminder-tour-icon">
              <Bell className="h-7 w-7" />
            </div>
            <div className="reminder-tour-content">
              <span className="reminder-kicker">یادآور تست هر ۱۵ دقیقه</span>
              <h2>{digest.title}</h2>
              <p>{digest.activitySummary}</p>
              {digest.lastVisitedPage ? (
                <div className="reminder-tour-path">
                  <span>آخرین صفحه‌ای که در آن بودید</span>
                  <strong>{digest.lastVisitedPageTitle || formatPagePath(digest.lastVisitedPage)}</strong>
                  {digest.lastVisitedPageReviewed ? <span className="reminder-page-reviewed">بررسی شده</span> : null}
                  <small dir="ltr">{formatPagePath(digest.lastVisitedPage)}</small>
                </div>
              ) : null}
              {digest.customNotice ? (
                <div className="reminder-tour-channel-status">
                  <span>?????: {describeReminderEmailStatus(digest.customNotice.emailStatus)}</span>
                  <span>پوش: در صف نمایش</span>
                </div>
              ) : null}
              {digest.auditItems.length ? (
                <div className="reminder-tour-list">
                  {digest.auditItems.slice(0, 5).map((item, index) => (
                    <article key={`audit-tour-${index}-${item.label}`}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {item.href ? (
                          <Link href={item.href} className="reminder-log-link" onClick={() => setOpenTour(false)}>
                            {item.label}
                          </Link>
                        ) : (
                          item.label
                        )}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="reminder-tour-empty">مورد تازه‌ای برای نمایش در لاگ‌ها یا گفتگوها پیدا نشد.</div>
              )}
              <div className="reminder-tour-actions">
                <button type="button" onClick={acknowledgeTour}>
                  متوجه شدم
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
