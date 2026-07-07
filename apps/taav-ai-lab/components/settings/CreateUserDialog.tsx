'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Building2, ImagePlus, Shield, UserRoundPlus } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavInput } from '@repo/ui/taav/forms';
import { TaavButton } from '@repo/ui/taav/primitives';
import type { AdminBusinessRow, AdminUserRow } from '@/app/lib/data';
import { useAdminGate } from './AdminGateProvider';
import { GlassSelect } from './GlassSelect';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

function isAcceptedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('خواندن تصویر انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

type CreateUserDialogProps = {
  businesses: AdminBusinessRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (user: AdminUserRow) => void;
  user?: AdminUserRow | null;
  onUpdated?: (user: AdminUserRow) => void;
};

export function CreateUserDialog({
  businesses,
  open,
  onOpenChange,
  onCreated,
  user,
  onUpdated,
}: CreateUserDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { requireUnlock } = useAdminGate();
  const editingUser = user ?? null;
  const isEditMode = editingUser !== null;

  const [userType, setUserType] = useState<'tenant' | 'system'>('tenant');
  const [tenantId, setTenantId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setUserType('tenant');
      setTenantId('');
      setFirstName('');
      setLastName('');
      setMobile('');
      setPassword('');
      setAvatarUrl('');
      setIsActive(true);
      setImageLoading(false);
      setSubmitting(false);
      setError('');
      return;
    }

    if (editingUser) {
      setUserType(editingUser.isSystemUser ? 'system' : 'tenant');
      setTenantId(editingUser.tenantIds[0] ?? '');
      setFirstName(editingUser.firstName);
      setLastName(editingUser.lastName);
      setMobile(editingUser.mobile ?? '');
      setPassword('');
      setAvatarUrl(editingUser.avatarUrl ?? '');
      setIsActive(editingUser.isActive);
      setImageLoading(false);
      setSubmitting(false);
      setError('');
    }
  }, [editingUser, open]);

  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        label: business.name,
        value: business.id,
      })),
    [businesses],
  );

  const typeOptions = [
    { label: 'عضو کسب‌وکار', value: 'tenant', description: 'برای یکی از tenantها کار می‌کند.' },
    { label: 'سیستم تاو', value: 'system', description: 'کاربر سیستمی بدون membership tenant.' },
  ];

  const statusOptions = [
    { label: 'فعال', value: 'active', description: 'اجازه ورود و فعالیت در سیستم را دارد.' },
    { label: 'غیرفعال', value: 'inactive', description: 'ورود و همه عملیات‌های سیستم برای او بسته می‌شود.' },
  ];

  const avatarFallback = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.trim() || 'TA';

  const applyAvatarFile = async (file: File) => {
    if (!isAcceptedImage(file)) {
      setError('فقط فایل‌های تصویری برای آواتار مجاز هستند.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم آواتار نباید بیشتر از 5 مگابایت باشد.');
      return;
    }

    setImageLoading(true);
    setError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'خواندن آواتار انجام نشد.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await applyAvatarFile(file);
    }
    event.target.value = '';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      if (isEditMode && editingUser) {
        const response = await fetch('/api/settings/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            firstName,
            lastName,
            avatarUrl: avatarUrl || null,
            tenantId: userType === 'tenant' ? tenantId || null : null,
            systemUser: userType === 'system',
            isActive,
          }),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string; user?: AdminUserRow } | null;
        if (!response.ok || !payload?.user) {
          throw new Error(payload?.message || 'ویرایش کاربر انجام نشد.');
        }

        onUpdated?.(payload.user);
      } else {
        const response = await fetch('/api/settings/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            mobile,
            password,
            avatarUrl: avatarUrl || null,
            tenantId: userType === 'tenant' ? tenantId || null : null,
            systemUser: userType === 'system',
            isActive,
          }),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string; user?: AdminUserRow } | null;
        if (!response.ok || !payload?.user) {
          throw new Error(payload?.message || 'ثبت کاربر انجام نشد.');
        }

        onCreated?.(payload.user);
      }

      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'عملیات کاربر انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-admin-user-dialog ai-lab-admin-user-dialog--compact">
        <header className="ai-lab-create-header ai-lab-admin-user-dialog-headline">
          <div className="ai-lab-create-header-icon" aria-hidden="true">
            <UserRoundPlus className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="ai-lab-create-header-copy">
            <TaavDialogTitle className="ai-lab-create-title">
              {isEditMode ? 'ویرایش کاربر' : 'ثبت کاربر جدید'}
            </TaavDialogTitle>
            <TaavDialogDescription className="ai-lab-create-subtitle">
              {isEditMode
                ? 'پروفایل، جایگاه سازمانی و وضعیت دسترسی این کاربر را مدیریت کنید.'
                : 'کاربر را با آواتار، هویت و جایگاه سازمانی ثبت کنید.'}
            </TaavDialogDescription>
          </div>
        </header>

        <div className="ai-lab-admin-user-dialog-body ai-lab-admin-user-dialog-body--compact">
          <section className="ai-lab-admin-user-form-section ai-lab-admin-user-form-section--compact">
            <div className="ai-lab-admin-user-form-head">
              <span>1</span>
              <div>
                <h3>جایگاه سازمانی</h3>
                <p>اول مشخص کنید این کاربر عضو یکی از کسب‌وکارها است یا به‌عنوان کاربر سیستم تاو ثبت می‌شود.</p>
              </div>
            </div>

            <div className="ai-lab-admin-user-role-choice-grid">
              <button
                type="button"
                className={userType === 'tenant' ? 'ai-lab-admin-user-role-choice is-active' : 'ai-lab-admin-user-role-choice'}
                onClick={() => {
                  setUserType('tenant');
                  setError('');
                }}
              >
                <div className="ai-lab-admin-user-role-choice-icon" aria-hidden="true">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="ai-lab-admin-user-role-choice-copy">
                  <strong>{typeOptions[0]?.label}</strong>
                  <span>{typeOptions[0]?.description}</span>
                </div>
              </button>

              <button
                type="button"
                className={userType === 'system' ? 'ai-lab-admin-user-role-choice is-active' : 'ai-lab-admin-user-role-choice'}
                onClick={() => {
                  setUserType('system');
                  setTenantId('');
                  setError('');
                }}
              >
                <div className="ai-lab-admin-user-role-choice-icon" aria-hidden="true">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="ai-lab-admin-user-role-choice-copy">
                  <strong>{typeOptions[1]?.label}</strong>
                  <span>{typeOptions[1]?.description}</span>
                </div>
              </button>
            </div>

            {userType === 'tenant' ? (
              <div className="ai-lab-admin-user-form-grid">
                <div className="ai-lab-admin-user-form-field ai-lab-admin-user-form-field--wide">
                  <label htmlFor="admin-user-business">انتخاب کسب‌وکار</label>
                  <GlassSelect
                    id="admin-user-business"
                    value={tenantId}
                    options={businessOptions}
                    onChange={setTenantId}
                    disabled={submitting}
                    placeholder="از بین کسب‌وکارها یکی را انتخاب کنید"
                  />
                </div>
              </div>
            ) : (
              <div className="ai-lab-admin-user-inline-note">
                این کاربر بدون اتصال به tenant و به‌عنوان کاربر داخلی سیستم تاو ثبت می‌شود.
              </div>
            )}
          </section>

          <section className="ai-lab-admin-user-form-section ai-lab-admin-user-form-section--compact">
            <div className="ai-lab-admin-user-form-head">
              <span>2</span>
              <div>
                <h3>هویت و آواتار</h3>
                <p>هویت کاربر را ثبت کنید و در صورت نیاز یک آواتار ساده برای او انتخاب کنید.</p>
              </div>
            </div>

            <div className="ai-lab-admin-user-identity-row">
              <div className="ai-lab-admin-user-avatar-panel">
                <div className="ai-lab-admin-user-avatar-preview-shell">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="پیش‌نمایش آواتار کاربر" className="ai-lab-admin-user-avatar-preview-image" />
                  ) : (
                    <span>{avatarFallback}</span>
                  )}
                </div>

                <div className="ai-lab-admin-user-avatar-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="sr-only"
                    onChange={handleFilePick}
                    disabled={submitting || imageLoading}
                  />
                  <button
                    type="button"
                    className="ai-lab-admin-user-avatar-pick"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting || imageLoading}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {avatarUrl ? 'تغییر تصویر' : 'انتخاب فایل'}
                  </button>
                </div>
              </div>

              <div className="ai-lab-admin-user-form-grid ai-lab-admin-user-form-grid--identity">
                <div className="ai-lab-admin-user-form-field">
                  <label htmlFor="admin-user-first-name">نام</label>
                  <TaavInput
                    id="admin-user-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="مثلاً نازنین"
                    disabled={submitting}
                  />
                </div>

                <div className="ai-lab-admin-user-form-field">
                  <label htmlFor="admin-user-last-name">نام خانوادگی</label>
                  <TaavInput
                    id="admin-user-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="مثلاً رضایی"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="ai-lab-admin-user-form-section ai-lab-admin-user-form-section--compact">
            <div className="ai-lab-admin-user-form-head">
              <span>3</span>
              <div>
                <h3>{isEditMode ? 'دسترسی' : 'ورود'}</h3>
                <p>
                  {isEditMode
                    ? 'شماره موبایل در این فاز فقط برای مشاهده است و وضعیت دسترسی کاربر را هم از همین بخش کنترل می‌کنید.'
                    : 'موبایل به‌عنوان شناسه ورود و رمز عبور اولیه کاربر ثبت می‌شود.'}
                </p>
              </div>
            </div>

            <div className="ai-lab-admin-user-form-grid">
              {isEditMode ? (
                <div className="ai-lab-admin-user-form-field">
                  <label htmlFor="admin-user-status">وضعیت کاربر</label>
                  <GlassSelect
                    id="admin-user-status"
                    value={isActive ? 'active' : 'inactive'}
                    options={statusOptions}
                    onChange={(nextValue) => setIsActive(nextValue === 'active')}
                  />
                </div>
              ) : null}

              <div className="ai-lab-admin-user-form-field">
                <label htmlFor="admin-user-mobile">شماره موبایل</label>
                <TaavInput
                  id="admin-user-mobile"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="مثلاً 09123456789"
                  disabled={submitting || isEditMode}
                  dir="ltr"
                />
              </div>

              {!isEditMode ? (
                <div className="ai-lab-admin-user-form-field">
                  <label htmlFor="admin-user-password">رمز عبور</label>
                  <TaavInput
                    id="admin-user-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="حداقل 6 کاراکتر"
                    disabled={submitting}
                    dir="ltr"
                  />
                </div>
              ) : null}
            </div>
          </section>

          {error ? <div className="ai-lab-admin-user-form-error">{error}</div> : null}
        </div>

        <footer className="ai-lab-create-footer ai-lab-admin-user-dialog-footer ai-lab-admin-user-dialog-footer--compact">
          <TaavButton variant="secondary" tone="neutral" onClick={() => onOpenChange(false)} disabled={submitting}>
            انصراف
          </TaavButton>
          <TaavButton
            onClick={() =>
              requireUnlock(() => {
                void handleSubmit();
              })
            }
            loading={submitting}
            disabled={submitting || imageLoading}
          >
            {isEditMode ? 'ذخیره تغییرات' : 'ثبت کاربر'}
          </TaavButton>
        </footer>
      </TaavDialogContent>
    </TaavDialog>
  );
}
