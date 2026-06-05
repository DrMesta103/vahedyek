'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { WorkplaceLocationPicker } from './WorkplaceLocationPicker';
import {
  WORKPLACE_LOCATION_DEFAULT_RADIUS,
  WORKPLACE_LOCATION_RADIUS_PRESETS,
  toWorkplaceLocationDraft,
  validateWorkplaceLocationDraft,
} from '../lib/workplace-location';
import { mockAddressFromMapPick, WORKPLACE_LOCATION_FIELD_TOOLTIPS } from '../lib/workplace-location-ui';

type LocationFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
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

export function LocationForm({ action, submitLabel, initialValues }: LocationFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [radius, setRadius] = useState(String(initialValues?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS));
  const [latitude, setLatitude] = useState(initialValues?.latitude ?? '');
  const [longitude, setLongitude] = useState(initialValues?.longitude ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [radiusMode, setRadiusMode] = useState<'preset' | 'custom'>(
    WORKPLACE_LOCATION_RADIUS_PRESETS.some((value) => value === Number(initialValues?.radius ?? WORKPLACE_LOCATION_DEFAULT_RADIUS))
      ? 'preset'
      : 'custom',
  );
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [geolocationDenied, setGeolocationDenied] = useState(false);
  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setMapStatus('ready'), 180);
    return () => window.clearTimeout(timer);
  }, [initialValues?.id]);

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

  const handlePickCoordinates = ({ latitude: nextLatitude, longitude: nextLongitude }: { latitude: number; longitude: number }) => {
    setGeolocationDenied(false);
    setLatitude(String(nextLatitude));
    setLongitude(String(nextLongitude));
    setAddress(mockAddressFromMapPick(nextLatitude, nextLongitude));
    clearError('latitude');
    clearError('address');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const validation = validateWorkplaceLocationDraft(draft);
    setErrors(validation.valid ? {} : validation.errors);
    if (!validation.valid) {
      event.preventDefault();
    }
  };

  const updateRadius = (nextValue: number, mode: 'preset' | 'custom' = 'preset') => {
    setRadius(String(nextValue));
    setRadiusMode(mode);
  };

  return (
    <form action={action} className="location-form-layout" onSubmit={handleSubmit}>
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />

      <WorkplaceLocationPicker
        latitude={latitude}
        longitude={longitude}
        radius={Number(radius) || WORKPLACE_LOCATION_DEFAULT_RADIUS}
        status={mapStatus}
        geolocationDenied={geolocationDenied}
        onPickCoordinates={handlePickCoordinates}
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

          <label>
            <span>آدرس محل کار</span>
            <input
              name="address"
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
            <textarea name="description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.description}</small>
          </label>

          <label className="full-span">
            <span>شعاع مجاز ثبت تردد</span>
            <div className="location-radius-presets">
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
                onClick={() => setRadiusMode('custom')}
              >
                مقدار دلخواه
              </button>
            </div>
            <input
              name="radius"
              type="number"
              min={5}
              max={500}
              value={radius}
              onChange={(event) => {
                setRadius(event.target.value);
                setRadiusMode('custom');
                clearError('radius');
              }}
              aria-invalid={Boolean(errors.radius)}
            />
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.radius}</small>
            {errors.radius ? <small className="location-form-error">{errors.radius}</small> : null}
            {Number(radius) > 50 ? <small className="location-form-warning">شعاع زیاد ممکن است دقت کنترل تردد را کاهش دهد.</small> : null}
          </label>
        </div>

        <div className="location-coord-strip">
          <div>
            <span>مختصات انتخاب‌شده</span>
            <strong>
              {latitude && longitude ? `${Number(latitude).toFixed(6)} ، ${Number(longitude).toFixed(6)}` : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است.'}
            </strong>
            <small className="location-form-hint">{WORKPLACE_LOCATION_FIELD_TOOLTIPS.coordinates}</small>
            {errors.latitude ? <small className="location-form-error">{errors.latitude}</small> : null}
          </div>
          <div>
            <span>پیش‌نمایش شعاع</span>
            <strong>{Number(radius || WORKPLACE_LOCATION_DEFAULT_RADIUS).toLocaleString('fa-IR')} متر</strong>
          </div>
        </div>

        <div className="full-span">
          <button type="submit" className="location-indigo-action">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
