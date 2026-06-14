'use client';

import { LocateFixed, MapPin, RefreshCcw, Search } from 'lucide-react';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { WORKPLACE_LOCATION_MAX_RADIUS, WORKPLACE_LOCATION_MIN_RADIUS } from '../lib/workplace-location';
import { mockAddressFromMapPick } from '../lib/workplace-location-ui';

type MapStatus = 'loading' | 'ready' | 'error';

type WorkplaceLocationPickerProps = {
  latitude: string;
  longitude: string;
  radius: number;
  status?: MapStatus;
  geolocationDenied?: boolean;
  onPickLocation: (coords: { latitude: number; longitude: number; address?: string }) => void;
  onUseCurrentLocation: () => void;
  onRetryMap?: () => void;
};

type LocationSuggestion = {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  keywords: string[];
};

const MAP_BOUNDS = {
  minLatitude: 35.55,
  maxLatitude: 35.86,
  minLongitude: 51.18,
  maxLongitude: 51.62,
};

const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  {
    id: 'central-office',
    title: 'دفتر مرکزی',
    address: 'تهران، خیابان ولیعصر، حوالی میدان ونک',
    latitude: 35.7488,
    longitude: 51.4148,
    keywords: ['دفتر', 'مرکز', 'ولیعصر', 'ونک'],
  },
  {
    id: 'north-branch',
    title: 'شعبه شمال',
    address: 'تهران، نیاوران، خیابان باهنر',
    latitude: 35.8064,
    longitude: 51.4705,
    keywords: ['شمال', 'نیاوران', 'باهنر', 'شعبه'],
  },
  {
    id: 'west-workshop',
    title: 'کارگاه غرب',
    address: 'تهران، صادقیه، بلوار آیت‌الله کاشانی',
    latitude: 35.7209,
    longitude: 51.3359,
    keywords: ['غرب', 'صادقیه', 'کاشانی', 'کارگاه'],
  },
  {
    id: 'east-depot',
    title: 'انبار شرق',
    address: 'تهران، تهرانپارس، بلوار پروین',
    latitude: 35.7353,
    longitude: 51.5602,
    keywords: ['شرق', 'تهرانپارس', 'انبار', 'پروین'],
  },
  {
    id: 'south-branch',
    title: 'مرکز جنوب',
    address: 'تهران، شهرری، خیابان فداییان اسلام',
    latitude: 35.6026,
    longitude: 51.4392,
    keywords: ['جنوب', 'شهرری', 'فداییان', 'مرکز'],
  },
];

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

function normalizeSearchQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function WorkplaceLocationPicker({
  latitude,
  longitude,
  radius,
  status = 'loading',
  geolocationDenied = false,
  onPickLocation,
  onUseCurrentLocation,
  onRetryMap,
}: WorkplaceLocationPickerProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hasSelection = Boolean(latitude && longitude);
  const selectedLatitude = hasSelection ? Number(latitude) : null;
  const selectedLongitude = hasSelection ? Number(longitude) : null;
  const markerPosition = useMemo(() => {
    if (
      selectedLatitude == null ||
      selectedLongitude == null ||
      !Number.isFinite(selectedLatitude) ||
      !Number.isFinite(selectedLongitude)
    ) {
      return { x: 50, y: 50 };
    }
    return positionFromCoordinates(selectedLatitude, selectedLongitude);
  }, [selectedLatitude, selectedLongitude]);

  const radiusPreviewSize = clamp(radius * 2.2, WORKPLACE_LOCATION_MIN_RADIUS * 5, WORKPLACE_LOCATION_MAX_RADIUS / 2);
  const normalizedQuery = normalizeSearchQuery(searchQuery);
  const filteredSuggestions = useMemo(() => {
    if (!normalizedQuery) return LOCATION_SUGGESTIONS;
    return LOCATION_SUGGESTIONS.filter((item) => {
      const haystack = normalizeSearchQuery([item.title, item.address, ...item.keywords].join(' '));
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const latitudeLabel =
    selectedLatitude != null &&
    selectedLongitude != null &&
    Number.isFinite(selectedLatitude) &&
    Number.isFinite(selectedLongitude)
      ? selectedLatitude.toFixed(6)
      : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است.';
  const longitudeLabel =
    selectedLatitude != null &&
    selectedLongitude != null &&
    Number.isFinite(selectedLatitude) &&
    Number.isFinite(selectedLongitude)
      ? selectedLongitude.toFixed(6)
      : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است.';

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (status !== 'ready') return;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
    const coords = coordinatesFromPosition(x, y);
    onPickLocation({
      ...coords,
      address: mockAddressFromMapPick(coords.latitude, coords.longitude),
    });
  };

  return (
    <section className="location-map-panel">
      <div className="location-map-header">
        <div>
          <strong>انتخاب محل روی نقشه</strong>
          <span>آدرس یا نام محل را جستجو کنید، سپس نقطه دقیق را روی نقشه تأیید کنید.</span>
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

        <div className="location-map-search-help" onClick={(event) => event.stopPropagation()}>
          <span>با جستجو، محل را سریع‌تر پیدا کنید و بعد نقطه دقیق را روی نقشه تأیید کنید.</span>
        </div>

        <div className="location-map-search-results" onClick={(event) => event.stopPropagation()}>
          {filteredSuggestions.length ? (
            filteredSuggestions.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                className="location-map-search-result"
                onClick={() => {
                  onPickLocation({
                    latitude: item.latitude,
                    longitude: item.longitude,
                    address: item.address,
                  });
                  setSearchQuery(item.title);
                }}
              >
                <strong>{item.title}</strong>
                <span>{item.address}</span>
              </button>
            ))
          ) : (
            <div className="location-map-search-empty">نتیجه‌ای برای این جستجو پیدا نشد.</div>
          )}
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
              <strong>نقشه در حال حاضر در دسترس نیست. دوباره تلاش کنید.</strong>
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
              <span>{hasSelection ? 'نقطه انتخاب‌شده ثبت شد.' : 'هنوز نقطه‌ای روی نقشه انتخاب نشده است.'}</span>
              <span>عرض جغرافیایی: {latitudeLabel}</span>
              <span>طول جغرافیایی: {longitudeLabel}</span>
              <span>شعاع پیش‌نمایش: {radius.toLocaleString('fa-IR')} متر</span>
            </div>
          </>
        ) : null}
      </div>

      {geolocationDenied ? (
        <p className="location-map-warning">دسترسی به موقعیت مکانی فعال نیست. می‌توانید محل را دستی روی نقشه انتخاب کنید.</p>
      ) : null}
    </section>
  );
}
