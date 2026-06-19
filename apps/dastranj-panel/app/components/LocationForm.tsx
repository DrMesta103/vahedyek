'use client';

import { TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { WorkplaceLocationPicker } from './WorkplaceLocationPicker';
import { UnsavedChangesDialog, useUnsavedLeaveGuard } from './UnsavedChangesGuard';
import {
  WORKPLACE_LOCATION_DEFAULT_RADIUS,
  WORKPLACE_LOCATION_MAX_RADIUS,
  WORKPLACE_LOCATION_MIN_RADIUS,
  WORKPLACE_LOCATION_RADIUS_PRESETS,
  toWorkplaceLocationDraft,
  validateWorkplaceLocationDraft,
} from '../lib/workplace-location';
import { mockAddressFromMapPick, WORKPLACE_LOCATION_FIELD_TOOLTIPS } from '../lib/workplace-location-ui';

type LocationFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  backHref?: string;
  backLabel?: string;
  initialValues?: {
    id?: string;
    title?: string;
    radius?: number;
    address?: string;
    description?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  };
};

function formatRadius(value: string) {
  const normalized = value.trim();
  if (!normalized) return '—';
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed.toLocaleString('fa-IR') : normalized;
}

function formatCoordinate(value: string) {
  const normalized = value.trim();
  if (!normalized) return '—';
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed.toFixed(6) : normalized;
}

const CUSTOM_RADIUS_VALUE = '__custom_radius__';

export function LocationForm({ action, submitLabel, backHref, backLabel, initialValues }: LocationFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [radius, setRadius] = useState(String(initialValues?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS));
  const [latitude, setLatitude] = useState(initialValues?.latitude ?? '');
  const [longitude, setLongitude] = useState(initialValues?.longitude ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const [radiusMode, setRadiusMode] = useState<'preset' | 'custom'>(
    WORKPLACE_LOCATION_RADIUS_PRESETS.some((value) => value === Number(initialValues?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS))
      ? 'preset'
      : 'custom',
  );
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [geolocationDenied, setGeolocationDenied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMapStatus('ready'), 180);
    return () => window.clearTimeout(timer);
  }, [initialValues?.id]);

  const initialDraft = useMemo(
    () =>
      toWorkplaceLocationDraft({
        title: initialValues?.title ?? '',
        address: initialValues?.address ?? '',
        description: initialValues?.description ?? '',
        radius: String(initialValues?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS),
        latitude: initialValues?.latitude ?? '',
        longitude: initialValues?.longitude ?? '',
      }),
    [initialValues?.address, initialValues?.description, initialValues?.latitude, initialValues?.longitude, initialValues?.radius, initialValues?.title],
  );

  const draft = useMemo(
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

  const validation = useMemo(() => validateWorkplaceLocationDraft(draft), [draft]);
  const hasUnsavedChanges =
    draft.title !== initialDraft.title ||
    draft.address !== initialDraft.address ||
    draft.description !== initialDraft.description ||
    draft.radius !== initialDraft.radius ||
    draft.latitude !== initialDraft.latitude ||
    draft.longitude !== initialDraft.longitude;
  const radiusLabel = formatRadius(radius);
  const hasPoint = Boolean(latitude && longitude);
  const summaryText = validation.valid
    ? `نقطه روی نقشه انتخاب شد و شعاع مجاز ثبت تردد ${radiusLabel} متر است.`
    : `شعاع مجاز ثبت تردد: ${radiusLabel} متر`;

  function isRedirectError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
    );
  }

  const clearError = (key: string) => {
    setSaveError('');
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
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

  const handlePickLocation = ({
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

  async function saveDraft() {
    setSaveError('');
    setErrors(validation.valid ? {} : validation.errors);
    if (!validation.valid) {
      return false;
    }
    const formElement = formRef.current;
    if (!formElement) return false;

    setSaving(true);
    try {
      await action(new FormData(formElement));
      return true;
    } catch (error) {
      if (isRedirectError(error)) return true;
      setSaveError('محل کار ذخیره نشد. دوباره تلاش کنید.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  const unsavedLeaveGuard = useUnsavedLeaveGuard({
    hasUnsavedChanges,
    onSaveAndLeave: saveDraft,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveDraft();
  };

  const updateRadius = (nextValue: number, mode: 'preset' | 'custom' = 'preset') => {
    setRadius(String(nextValue));
    setRadiusMode(mode);
  };

  return (
    <>
      <form ref={formRef} className="location-form-layout" onSubmit={handleSubmit}>
        {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />

        <WorkplaceLocationPicker
          latitude={latitude}
          longitude={longitude}
          radius={Number(radius) || WORKPLACE_LOCATION_DEFAULT_RADIUS}
          status={mapStatus}
          geolocationDenied={geolocationDenied}
          onPickLocation={handlePickLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          onRetryMap={handleMapRetry}
        />

        <div className="location-form-panel">
          <div className="form-grid">
          <label>
            <span>عنوان محل کار</span>
            <input
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearError('title');
              }}
              aria-invalid={Boolean(errors.title)}
            />
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.title}</small>
            {errors.title ? <small className="location-form-error">{errors.title}</small> : null}
          </label>

          <label className="full-span">
            <span>آدرس محل کار</span>
            <textarea
              name="address"
              rows={4}
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                clearError('address');
              }}
              aria-invalid={Boolean(errors.address)}
            />
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.address}</small>
            {errors.address ? <small className="location-form-error">{errors.address}</small> : null}
          </label>

          <label className="full-span">
            <span>توضیحات تکمیلی</span>
            <textarea
              name="description"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSaveError('');
              }}
            />
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.description}</small>
          </label>

          <label className="full-span">
            <span>شعاع مجاز ثبت تردد</span>
            <TaavChoiceChipGroup
              ariaLabel="شعاع مجاز ثبت تردد"
              options={[
                ...WORKPLACE_LOCATION_RADIUS_PRESETS.map((preset) => ({
                  value: String(preset),
                  label: `${preset.toLocaleString('fa-IR')} متر`,
                })),
                { value: CUSTOM_RADIUS_VALUE, label: 'مقدار دلخواه' },
              ]}
              value={radiusMode === 'custom' ? CUSTOM_RADIUS_VALUE : radius}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] ?? '' : next;
                if (value === CUSTOM_RADIUS_VALUE) {
                  setRadiusMode('custom');
                  setSaveError('');
                  return;
                }
                updateRadius(Number(value), 'preset');
                clearError('radius');
              }}
            />
            <div className="location-radius-input-row">
              <input
                name="radius"
                type="number"
                min={WORKPLACE_LOCATION_MIN_RADIUS}
                max={WORKPLACE_LOCATION_MAX_RADIUS}
                value={radius}
                onChange={(event) => {
                  setRadius(event.target.value);
                  setRadiusMode('custom');
                  clearError('radius');
                }}
                placeholder="مثلاً ۳۰"
                aria-invalid={Boolean(errors.radius)}
              />
              <span>متر</span>
            </div>
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.radius}</small>
            {errors.radius ? <small className="location-form-error">{errors.radius}</small> : null}
          </label>
        </div>

          <div className="location-coord-strip">
            <label>
              <span>عرض جغرافیایی</span>
              <input readOnly value={formatCoordinate(latitude)} />
            </label>
            <label>
              <span>طول جغرافیایی</span>
              <input readOnly value={formatCoordinate(longitude)} />
            </label>
          </div>

          <div className="location-save-summary" aria-live="polite">
            <strong>{validation.valid ? 'محل آماده ثبت است.' : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است.'}</strong>
            <span>{summaryText}</span>
            <small>{hasPoint ? 'مختصات از انتخاب روی نقشه گرفته می‌شود و دستی ویرایش نمی‌شود.' : 'ابتدا نقطه محل کار را روی نقشه انتخاب کنید.'}</small>
            {errors.latitude ? <small className="location-form-error">{errors.latitude}</small> : null}
            {saveError ? <small className="location-form-error" role="alert">{saveError}</small> : null}
          </div>

          <div className="full-span location-form-actions">
            <button type="submit" className="location-indigo-action">
              {saving ? 'در حال ذخیره...' : submitLabel}
            </button>
            {backHref ? (
              <button
                type="button"
                className="calendar-create-cancel"
                onClick={() => unsavedLeaveGuard.requestLeave(() => router.push(backHref))}
              >
                {backLabel ?? 'بازگشت'}
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <UnsavedChangesDialog
        open={unsavedLeaveGuard.dialogOpen}
        saving={unsavedLeaveGuard.saving || saving}
        onSaveAndLeave={unsavedLeaveGuard.confirmSaveAndLeave}
        onDiscardAndLeave={unsavedLeaveGuard.confirmDiscardAndLeave}
        onCancel={unsavedLeaveGuard.closeDialog}
      />
    </>
  );
}
