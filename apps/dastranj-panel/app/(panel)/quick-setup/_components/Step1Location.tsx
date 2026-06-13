'use client';

import { CircleAlert, CheckCircle2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelFormModal } from '../../../components/PanelFormModal';
import { WorkplaceLocationPicker } from '../../../components/WorkplaceLocationPicker';
import { saveLocationFromQuickSetupAction } from '../../../lib/actions';
import {
  WORKPLACE_LOCATION_DEFAULT_RADIUS,
  WORKPLACE_LOCATION_RADIUS_PRESETS,
  toWorkplaceLocationDraft,
  validateWorkplaceLocationDraft,
} from '../../../lib/workplace-location';
import { mockAddressFromMapPick, WORKPLACE_LOCATION_FIELD_TOOLTIPS } from '../../../lib/workplace-location-ui';
import type { LocationSummaryItem } from './quick-setup.types';

type Step1LocationProps = {
  isCompleted: boolean;
  initialLocation: LocationSummaryItem | null;
  onComplete: (value: LocationSummaryItem) => void;
};

export type Step1LocationHandle = {
  requestExit: () => void;
};

function draftFromLocation(location: LocationSummaryItem | null) {
  return toWorkplaceLocationDraft({
    title: location?.title ?? '',
    address: location?.address ?? '',
    description: location?.description ?? '',
    radius: String(location?.allowedRadiusMeters ?? location?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS),
    latitude: location?.latitude ?? '',
    longitude: location?.longitude ?? '',
  });
}

function buildFormData(draft: ReturnType<typeof draftFromLocation>) {
  const formData = new FormData();
  formData.set('title', draft.title);
  formData.set('address', draft.address);
  formData.set('description', draft.description);
  formData.set('radius', draft.radius);
  formData.set('latitude', draft.latitude);
  formData.set('longitude', draft.longitude);
  return formData;
}

function isSameDraft(left: ReturnType<typeof draftFromLocation>, right: ReturnType<typeof draftFromLocation>) {
  return (
    left.title.trim() === right.title.trim() &&
    left.address.trim() === right.address.trim() &&
    left.description.trim() === right.description.trim() &&
    left.radius.trim() === right.radius.trim() &&
    left.latitude.trim() === right.latitude.trim() &&
    left.longitude.trim() === right.longitude.trim()
  );
}

export default forwardRef<Step1LocationHandle, Step1LocationProps>(function Step1Location(
  { isCompleted, initialLocation, onComplete },
  ref,
) {
  const router = useRouter();
  const [title, setTitle] = useState(initialLocation?.title ?? '');
  const [address, setAddress] = useState(initialLocation?.address ?? '');
  const [description, setDescription] = useState(initialLocation?.description ?? '');
  const [radius, setRadius] = useState(String(initialLocation?.allowedRadiusMeters ?? initialLocation?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS));
  const [latitude, setLatitude] = useState(initialLocation?.latitude ?? '');
  const [longitude, setLongitude] = useState(initialLocation?.longitude ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [geolocationDenied, setGeolocationDenied] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [radiusMode, setRadiusMode] = useState<'preset' | 'custom'>(
    WORKPLACE_LOCATION_RADIUS_PRESETS.some(
      (value) => value === Number(initialLocation?.allowedRadiusMeters ?? initialLocation?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS),
    )
      ? 'preset'
      : 'custom',
  );
  const radiusInputRef = useRef<HTMLInputElement | null>(null);
  const [baselineDraft, setBaselineDraft] = useState(() => draftFromLocation(initialLocation));
  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (!initialLocation) return;
    const nextDraft = draftFromLocation(initialLocation);
    setTitle(nextDraft.title);
    setAddress(nextDraft.address);
    setDescription(nextDraft.description);
    setRadius(nextDraft.radius);
    setLatitude(nextDraft.latitude);
    setLongitude(nextDraft.longitude);
    setBaselineDraft(nextDraft);
    setRadiusMode(WORKPLACE_LOCATION_RADIUS_PRESETS.some((value) => value === Number(nextDraft.radius)) ? 'preset' : 'custom');
  }, [initialLocation?.id]);

  const currentDraft = useMemo(
    () =>
      toWorkplaceLocationDraft({
        title,
        address,
        description,
        radius,
        latitude,
        longitude,
      }),
    [address, description, latitude, longitude, radius, title],
  );

  const hasUnsavedChanges = useMemo(() => !isSameDraft(currentDraft, baselineDraft), [baselineDraft, currentDraft]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      setSuccessMessage('');
      setSaveError('');
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMapStatus('ready'), 180);
    return () => window.clearTimeout(timer);
  }, [initialLocation?.id]);

  useImperativeHandle(ref, () => ({
    requestExit: () => {
      if (!hasUnsavedChanges) {
        router.push('/business-settings');
        return;
      }
      setExitOpen(true);
    },
  }));

  const updateRadius = (nextValue: number, mode: 'preset' | 'custom' = 'preset') => {
    setRadius(String(nextValue));
    setRadiusMode(mode);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocationDenied(false);
        setLatitude(Number(position.coords.latitude.toFixed(6)).toString());
        setLongitude(Number(position.coords.longitude.toFixed(6)).toString());
        if (!address.trim()) {
          setAddress('موقعیت فعلی من');
        }
        setMapStatus('ready');
      },
      (error) => {
        setGeolocationDenied(error.code === error.PERMISSION_DENIED);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const handleMapRetry = () => {
    setMapStatus('loading');
    window.setTimeout(() => setMapStatus('ready'), 220);
  };

  const handlePickCoordinates = ({
    latitude: nextLatitude,
    longitude: nextLongitude,
    address: pickedAddress,
  }: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setGeolocationDenied(false);
    setLatitude(String(nextLatitude));
    setLongitude(String(nextLongitude));
    setAddress(pickedAddress ?? mockAddressFromMapPick(nextLatitude, nextLongitude));
    clearError('latitude');
    clearError('address');
  };

  const saveLocation = async (advance: boolean) => {
    const validation = validateWorkplaceLocationDraft(currentDraft);
    setErrors(validation.valid ? {} : validation.errors);
    setSaveError('');
    setSuccessMessage('');

    if (!validation.valid) {
      return null;
    }

    setSaving(true);
    try {
      const result = await saveLocationFromQuickSetupAction(buildFormData(currentDraft));
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setSaveError(result.message ?? 'محل کار ذخیره نشد. دوباره تلاش کنید.');
        return null;
      }

      const saved = result.location;
      const nextDraft = draftFromLocation({
        ...saved,
        radius: saved.allowedRadiusMeters,
        allowedRadiusMeters: saved.allowedRadiusMeters,
      });
      setTitle(saved.title);
      setAddress(saved.address);
      setDescription(saved.description ?? '');
      setRadius(String(saved.allowedRadiusMeters));
      setRadiusMode(
        WORKPLACE_LOCATION_RADIUS_PRESETS.some((value) => value === Number(saved.allowedRadiusMeters)) ? 'preset' : 'custom',
      );
      setLatitude(saved.latitude ?? '');
      setLongitude(saved.longitude ?? '');
      setSuccessMessage('محل کار اصلی با موفقیت ثبت شد.');
      setErrors({});
      setBaselineDraft(draftFromLocation(saved));

      if (advance) {
        onComplete(saved);
      }

      return nextDraft;
    } catch {
      setSaveError('محل کار ذخیره نشد. دوباره تلاش کنید.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted && initialLocation) {
    return (
      <section className="quick-setup-stage-card">
        <div className="quick-setup-stage-header">
          <div className="quick-setup-stage-title">
            <h2>محل کار اصلی را تعریف کنید</h2>
            <p>این محل برای کنترل ثبت ورود و خروج موبایلی کارکنان استفاده می‌شود.</p>
          </div>
          <div className="quick-setup-pill is-success">تکمیل شده</div>
        </div>

        <div className="quick-setup-stage-body">
          <div className="quick-setup-location-completed">
            <div className="quick-setup-location-card">
              <div>عنوان محل کار: {initialLocation.title}</div>
              <span>آدرس محل کار: {initialLocation.address}</span>
              <span>مختصات انتخاب‌شده: {initialLocation.latitude ?? '-'} ، {initialLocation.longitude ?? '-'}</span>
              <span>شعاع مجاز ثبت تردد: {initialLocation.allowedRadiusMeters.toLocaleString('fa-IR')} متر</span>
              <span>توضیحات تکمیلی: {initialLocation.description || 'ثبت نشده است'}</span>
            </div>
            <a href="/locations" className="quick-setup-primary-action">
              برای مدیریت کامل‌تر محل‌های کار، به بخش محل‌های کار بروید.
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="quick-setup-stage-card">
        <div className="quick-setup-stage-header">
          <div className="quick-setup-stage-title">
            <h2>محل کار اصلی را تعریف کنید</h2>
            <p>این محل برای کنترل ثبت ورود و خروج موبایلی کارکنان استفاده می‌شود.</p>
          </div>
        </div>

        <div className="quick-setup-stage-body">
          <div className="quick-setup-info-panel quick-setup-info-panel-primary">
            <div className="quick-setup-info-head">
              <strong>موقعیت اصلی سازمان</strong>
              <span>کارکنان فقط زمانی می‌توانند ورود یا خروج خود را ثبت کنند که داخل شعاع مجاز این محل باشند.</span>
            </div>
            <div className="quick-setup-location-hint">
              در این مرحله فقط یک محل کار اصلی ثبت می‌شود. بعداً می‌توانید از بخش تنظیمات، شعبه‌ها یا پروژه‌های بیشتری اضافه کنید.
            </div>
          </div>

          <div className="quick-setup-location-layout">
            <div className="quick-setup-map-panel">
              <WorkplaceLocationPicker
                latitude={latitude}
                longitude={longitude}
                radius={Number(radius) || WORKPLACE_LOCATION_DEFAULT_RADIUS}
                status={mapStatus}
                geolocationDenied={geolocationDenied}
                onPickLocation={handlePickCoordinates}
                onUseCurrentLocation={handleUseCurrentLocation}
                onRetryMap={handleMapRetry}
              />
            </div>

            <div className="quick-setup-location-form">
              <label className="quick-setup-field">
                <span><b>*</b> عنوان محل کار</span>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    clearError('title');
                  }}
                  aria-invalid={Boolean(errors.title)}
                />
                <small className="quick-setup-field-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.title}</small>
                {errors.title ? <small className="quick-setup-field-error">{errors.title}</small> : null}
              </label>

              <label className="quick-setup-field">
                <span><b>*</b> آدرس محل کار</span>
                <input
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                    clearError('address');
                  }}
                  aria-invalid={Boolean(errors.address)}
                />
                <small className="quick-setup-field-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.address}</small>
                {errors.address ? <small className="quick-setup-field-error">{errors.address}</small> : null}
              </label>

              <label className="quick-setup-field">
                <span>توضیحات تکمیلی</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="quick-setup-textarea"
                />
                <small className="quick-setup-field-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.description}</small>
              </label>

              <div className="quick-setup-field">
                <span><b>*</b> شعاع مجاز ثبت تردد</span>
                <div className="quick-setup-radius-presets" role="group" aria-label="شعاع مجاز ثبت تردد">
                  {WORKPLACE_LOCATION_RADIUS_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={radius === String(preset) ? 'is-selected' : ''}
                    onClick={() => {
                      updateRadius(preset, 'preset');
                      clearError('radius');
                    }}
                  >
                    {preset.toLocaleString('fa-IR')} متر
                  </button>
                  ))}
                  <button
                  type="button"
                  className={radiusMode === 'custom' ? 'is-selected' : ''}
                  onClick={() => {
                    setRadiusMode('custom');
                    radiusInputRef.current?.focus();
                    }}
                  >
                    مقدار دلخواه
                  </button>
                </div>
                <input
                  ref={radiusInputRef}
                  value={radius}
                  onChange={(event) => {
                    setRadius(event.target.value);
                    setRadiusMode('custom');
                    clearError('radius');
                  }}
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.radius)}
                />
                <small className="quick-setup-field-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.radius}</small>
                {errors.radius ? <small className="quick-setup-field-error">{errors.radius}</small> : null}
                {Number(radius) > 50 ? <small className="quick-setup-warning">شعاع زیاد ممکن است دقت کنترل تردد را کاهش دهد.</small> : null}
              </div>

              <div className="quick-setup-field">
                <span>مختصات انتخاب‌شده</span>
                <div className="quick-setup-coord-card">
                  {latitude && longitude ? (
                    <strong>{Number(latitude).toFixed(6)} ، {Number(longitude).toFixed(6)}</strong>
                  ) : (
                    <strong>هنوز نقطه‌ای روی نقشه انتخاب نشده است.</strong>
                  )}
                </div>
                <small className="quick-setup-field-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.coordinates}</small>
                {errors.latitude ? <small className="quick-setup-field-error">{errors.latitude}</small> : null}
              </div>

              {saveError ? (
                <div className="quick-setup-save-error" role="alert">
                  <CircleAlert className="h-4 w-4" aria-hidden />
                  {saveError}
                </div>
              ) : null}
              {successMessage ? (
                <div className="quick-setup-save-success" role="status">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {successMessage}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="quick-setup-navigation-row">
          <button type="button" className="quick-setup-secondary-action" onClick={() => void saveLocation(false)} disabled={saving}>
            ذخیره پیش‌نویس
          </button>
          <button
            type="button"
            className="quick-setup-indigo-action"
            onClick={async () => {
              await saveLocation(true);
            }}
            disabled={saving}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره و ادامه به تقویم کاری'}
          </button>
        </div>
      </section>

      {exitOpen ? (
        <PanelFormModal
          open={exitOpen}
          title="تغییرات شما ذخیره نشده است"
          lead="آیا می‌خواهید بدون ذخیره خارج شوید؟"
          onClose={() => setExitOpen(false)}
          footer={
            <div className="unsaved-guard-actions">
              <button
                type="button"
                className="quick-setup-indigo-action"
                onClick={async () => {
                  const saved = await saveLocation(false);
                  if (!saved) return;
                  router.push('/business-settings');
                }}
                disabled={saving}
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره و خروج'}
              </button>
              <button
                type="button"
                className="quick-setup-secondary-action"
                onClick={() => router.push('/business-settings')}
                disabled={saving}
              >
                بدون ذخیره خارج شوم
              </button>
              <button type="button" className="quick-setup-secondary-action" onClick={() => setExitOpen(false)} disabled={saving}>
                انصراف
              </button>
            </div>
          }
        >
          <div className="unsaved-guard-dialog" />
        </PanelFormModal>
      ) : null}
    </>
  );
});
