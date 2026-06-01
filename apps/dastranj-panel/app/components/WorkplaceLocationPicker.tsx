'use client';

import { LocateFixed, MapPin, RefreshCcw, Search } from 'lucide-react';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { WORKPLACE_LOCATION_MAX_RADIUS, WORKPLACE_LOCATION_MIN_RADIUS } from '../lib/workplace-location';

type MapStatus = 'loading' | 'ready' | 'error';

type WorkplaceLocationPickerProps = {
  latitude: string;
  longitude: string;
  radius: number;
  status?: MapStatus;
  geolocationDenied?: boolean;
  onPickCoordinates: (coords: { latitude: number; longitude: number }) => void;
  onUseCurrentLocation: () => void;
  onRetryMap?: () => void;
};

const MAP_BOUNDS = {
  minLatitude: 35.55,
  maxLatitude: 35.86,
  minLongitude: 51.18,
  maxLongitude: 51.62,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function positionFromCoordinates(latitude: number, longitude: number) {
  const x =
    ((longitude - MAP_BOUNDS.minLongitude) / (MAP_BOUNDS.maxLongitude - MAP_BOUNDS.minLongitude)) * 100;
  const y =
    ((MAP_BOUNDS.maxLatitude - latitude) / (MAP_BOUNDS.maxLatitude - MAP_BOUNDS.minLatitude)) * 100;
  return { x: clamp(x, 6, 94), y: clamp(y, 6, 94) };
}

function coordinatesFromPosition(x: number, y: number) {
  const longitude = MAP_BOUNDS.minLongitude + (x / 100) * (MAP_BOUNDS.maxLongitude - MAP_BOUNDS.minLongitude);
  const latitude = MAP_BOUNDS.maxLatitude - (y / 100) * (MAP_BOUNDS.maxLatitude - MAP_BOUNDS.minLatitude);
  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

export function WorkplaceLocationPicker({
  latitude,
  longitude,
  radius,
  status = 'loading',
  geolocationDenied = false,
  onPickCoordinates,
  onUseCurrentLocation,
  onRetryMap,
}: WorkplaceLocationPickerProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hasSelection = Boolean(latitude && longitude);
  const selectedLatitude = hasSelection ? Number(latitude) : null;
  const selectedLongitude = hasSelection ? Number(longitude) : null;
  const markerPosition = useMemo(() => {
    if (selectedLatitude == null || selectedLongitude == null || !Number.isFinite(selectedLatitude) || !Number.isFinite(selectedLongitude)) {
      return { x: 50, y: 50 };
    }
    return positionFromCoordinates(selectedLatitude, selectedLongitude);
  }, [selectedLatitude, selectedLongitude]);

  const radiusPreviewSize = clamp(radius * 2.2, WORKPLACE_LOCATION_MIN_RADIUS * 5, WORKPLACE_LOCATION_MAX_RADIUS / 2);

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (status !== 'ready') return;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
    onPickCoordinates(coordinatesFromPosition(x, y));
  };

  const coordinateLabel =
    selectedLatitude != null && selectedLongitude != null && Number.isFinite(selectedLatitude) && Number.isFinite(selectedLongitude)
      ? `${selectedLatitude.toFixed(6)} ، ${selectedLongitude.toFixed(6)}`
      : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است';

  return (
    <section className="location-map-panel">
      <div className="location-map-header">
        <div>
          <strong>انتخاب محل روی نقشه</strong>
          <span>نقطه را روی نقشه انتخاب کنید یا از موقعیت فعلی خودتان استفاده کنید.</span>
        </div>
        <button
          type="button"
          className="location-map-locate"
          onClick={onUseCurrentLocation}
          aria-label="استفاده از موقعیت فعلی من"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      <div className="location-map-canvas" ref={canvasRef} onClick={handleCanvasClick} role="button" tabIndex={0}>
        <div className="location-map-search" onClick={(event) => event.stopPropagation()}>
          <Search className="h-4 w-4" aria-hidden />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجوی آدرس یا نام محل"
            aria-label="جستجوی آدرس یا نام محل"
          />
        </div>

        {status === 'loading' ? (
          <div className="location-map-status">
            <div className="location-map-status-box">
              <strong>نقشه در حال بارگذاری است.</strong>
              <span>لطفا چند لحظه صبر کنید.</span>
            </div>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="location-map-status">
            <div className="location-map-status-box is-error">
              <strong>نقشه بارگذاری نشد. دوباره تلاش کنید یا آدرس را دستی وارد کنید.</strong>
              <button
                type="button"
                className="location-map-status-retry"
                onClick={(event) => {
                  event.stopPropagation();
                  onRetryMap?.();
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                تلاش مجدد
              </button>
            </div>
          </div>
        ) : null}

        {status === 'ready' ? (
          <>
            {hasSelection ? (
              <>
                <div
                  className="location-map-radius-preview"
                  style={{
                    width: `${radiusPreviewSize}px`,
                    height: `${radiusPreviewSize}px`,
                    left: `${markerPosition.x}%`,
                    top: `${markerPosition.y}%`,
                  }}
                  aria-hidden
                />
                <div className="location-map-selected" style={{ left: `${markerPosition.x}%`, top: `${markerPosition.y}%` }} aria-hidden>
                  <MapPin className="h-6 w-6" />
                </div>
              </>
            ) : (
              <div className="location-map-selected is-empty" aria-hidden>
                <MapPin className="h-6 w-6" />
              </div>
            )}

            <div className="location-map-legend">
              <span>مختصات انتخاب‌شده: {coordinateLabel}</span>
              <span>پیش‌نمایش شعاع: {radius.toLocaleString('fa-IR')} متر</span>
            </div>
          </>
        ) : null}
      </div>

      {geolocationDenied ? (
        <p className="location-map-warning">دسترسی به موقعیت مکانی فعال نیست. می‌توانید محل را دستی روی نقشه انتخاب کنید.</p>
      ) : null}

      <div className="location-coord-strip">
        <div>
          <span>مختصات انتخاب‌شده</span>
          <strong>{coordinateLabel}</strong>
        </div>
        <div>
          <span>شعاع پیش‌نمایش</span>
          <strong>{radius.toLocaleString('fa-IR')} متر</strong>
        </div>
      </div>
    </section>
  );
}
