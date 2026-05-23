'use client';

import { BellRing, Loader2, Mail, Save, SendHorizonal } from 'lucide-react';
import { useEffect, useState } from 'react';

type ReminderTargetUser = {
  userId: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
};

type ReminderSettings = {
  notificationEmail: string | null;
};

type ReminderNotifyResponse = {
  notification?: {
    emailStatus?: 'sent' | 'missing' | 'config_missing' | 'failed';
    pushStatus?: 'queued';
    targetEmail?: string | null;
  };
  message?: string;
} | null;

export function ReminderSettingsPanel() {
  const [targetUser, setTargetUser] = useState<ReminderTargetUser | null>(null);
  const [settings, setSettings] = useState<ReminderSettings>({ notificationEmail: null });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [title, setTitle] = useState('یادآور مدیر');
  const [messageText, setMessageText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/settings/reminder', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as {
        settings?: ReminderSettings;
        targetUser?: ReminderTargetUser | null;
        message?: string;
      } | null;
      if (!response.ok) throw new Error(payload?.message ?? 'دریافت تنظیمات یادآور انجام نشد.');
      setTargetUser(payload?.targetUser ?? null);
      setSettings({ notificationEmail: payload?.settings?.notificationEmail ?? null });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'دریافت تنظیمات یادآور انجام نشد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/settings/reminder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const payload = (await response.json().catch(() => null)) as { settings?: ReminderSettings; message?: string } | null;
      if (!response.ok) throw new Error(payload?.message ?? 'ذخیره ایمیل مقصد انجام نشد.');
      setSettings({ notificationEmail: payload?.settings?.notificationEmail ?? null });
      setMessage('ایمیل مقصد یادآور ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره ایمیل مقصد انجام نشد.');
    } finally {
      setSavingSettings(false);
    }
  };

  const sendNotification = async () => {
    if (!messageText.trim()) {
      setError('متن یادآور را وارد کنید.');
      return;
    }

    setSending(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/settings/reminder/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message: messageText,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ReminderNotifyResponse;
      if (!response.ok) throw new Error(payload?.message ?? 'ارسال یادآور انجام نشد.');

      const emailStatus = payload?.notification?.emailStatus;
      setMessage(
        emailStatus === 'sent'
          ? 'یادآور ثبت شد. پوش درون پنل در صف نمایش است و ایمیل هم با موفقیت ارسال شد.'
          : emailStatus === 'config_missing'
            ? 'یادآور ثبت شد. پوش درون پنل در صف نمایش است اما تنظیمات SMTP برای ارسال ایمیل کامل نیست.'
            : emailStatus === 'failed'
              ? 'یادآور ثبت شد. پوش درون پنل در صف نمایش است اما ارسال ایمیل با خطا مواجه شد.'
              : 'یادآور ثبت شد. پوش درون پنل در صف نمایش است اما برای ارسال ایمیل مقصدی پیدا نشد.',
      );
      setMessageText('');
      setTitle('یادآور مدیر');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'ارسال یادآور انجام نشد.');
    } finally {
      setSending(false);
    }
  };

  const testPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setError('مرورگر این دستگاه از نوتیفیکیشن پشتیبانی نمی‌کند.');
      return;
    }

    setTestingPush(true);
    setMessage('');
    setError('');
    try {
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        throw new Error('اجازه نمایش نوتیفیکیشن در مرورگر داده نشد.');
      }

      new Notification('تست پوش یادآور', {
        body: 'این یک نوتیفیکیشن آزمایشی برای مرورگر فعلی است.',
      });
      setMessage('پوش آزمایشی برای همین مرورگر نمایش داده شد.');
    } catch (pushError) {
      setError(pushError instanceof Error ? pushError.message : 'تست پوش انجام نشد.');
    } finally {
      setTestingPush(false);
    }
  };

  return (
    <section className="reminder-settings-card" dir="rtl">
      <div className="reminder-settings-head">
        <div>
          <span>
            <BellRing className="h-4 w-4" />
            ارسال یادآور
          </span>
          <h2>ارسال پیام یادآور</h2>
          <p>ایمیل مقصد را به صورت داینامیک ثبت کنید، برای پوش مرورگر تست بگیرید، و بعد متن یادآور را برای کاربر هدف ارسال کنید.</p>
        </div>
        <div className="reminder-settings-actions">
          <button type="button" onClick={testPush} disabled={testingPush || loading} className="reminder-settings-save is-secondary">
            {testingPush ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
            تست پوش
          </button>
          <button type="button" onClick={sendNotification} disabled={sending || loading || !targetUser} className="reminder-settings-save">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
            ارسال
          </button>
        </div>
      </div>

      {loading ? (
        <div className="reminder-settings-state">
          <Loader2 className="h-5 w-5 animate-spin" />
          در حال دریافت تنظیمات یادآور...
        </div>
      ) : null}
      {message ? <div className="access-panel-message">{message}</div> : null}
      {error ? <div className="access-panel-error">{error}</div> : null}
      {!loading && !targetUser && !error ? <div className="access-panel-error">کاربر هدف یادآور در این کسب و کار پیدا نشد.</div> : null}

      {!loading ? (
        <div className="reminder-settings-compose">
          <div className="reminder-settings-recipient">
            <div>
              <span>گیرنده هدف</span>
              <strong>{targetUser?.fullName ?? 'نامشخص'}</strong>
            </div>
            <div>
              <span>موبایل هدف</span>
              <strong dir="ltr">{targetUser?.mobile ?? 'ثبت نشده'}</strong>
            </div>
            <div>
              <span>ایمیل ثبت شده روی کاربر</span>
              <strong dir="ltr">{targetUser?.email ?? 'ثبت نشده'}</strong>
            </div>
            <div>
              <span>ایمیل مقصد فعال</span>
              <strong dir="ltr">{settings.notificationEmail ?? targetUser?.email ?? 'ثبت نشده'}</strong>
            </div>
          </div>

          <div className="reminder-settings-inline-grid">
            <label className="reminder-settings-field">
              <span>ایمیل مقصد یادآور</span>
              <input
                value={settings.notificationEmail ?? ''}
                onChange={(event) => setSettings((current) => ({ ...current, notificationEmail: event.target.value || null }))}
                className="app-text-input"
                placeholder="example@email.com"
                dir="ltr"
              />
            </label>

            <button type="button" onClick={saveSettings} disabled={savingSettings || loading} className="reminder-settings-save reminder-settings-inline-button">
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              ذخیره ایمیل
            </button>
          </div>

          <label className="reminder-settings-field">
            <span>عنوان پیام</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 120))}
              className="app-text-input"
              placeholder="مثلاً یادآور مدیر"
            />
          </label>

          <label className="reminder-settings-field">
            <span>متن یادآور</span>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value.slice(0, 1200))}
              className="app-textarea reminder-settings-textarea"
              placeholder="پیام موردنظر را وارد کنید..."
              rows={6}
            />
            <small>{messageText.length}/1200</small>
          </label>

          <div className="reminder-settings-hint">
            <Mail className="h-4 w-4" />
            <span>اگر ایمیل مقصد خالی بماند، همان ایمیل ثبت شده روی کاربر هدف استفاده می‌شود.</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
