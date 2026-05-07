'use client';

import { useMemo, useState } from 'react';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react';

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

type MapPoint = {
  id: string;
  label: string;
  lat: string;
  lng: string;
  x: number;
  y: number;
};

const MAP_POINTS: MapPoint[] = [
  { id: 'tehran-center', label: 'مرکز شهر', lat: '35.699739', lng: '51.338097', x: 48, y: 50 },
  { id: 'north-office', label: 'شمال', lat: '35.783115', lng: '51.425682', x: 66, y: 24 },
  { id: 'west-hub', label: 'غرب', lat: '35.744251', lng: '51.209943', x: 20, y: 40 },
  { id: 'south-yard', label: 'جنوب', lat: '35.620421', lng: '51.420112', x: 63, y: 77 },
];

function formatAddress(lat: string, lng: string) {
  return `مختصات انتخابی: ${lng}, ${lat}`;
}

export function LocationForm({ action, submitLabel, initialValues }: LocationFormProps) {
  const initialPoint = useMemo<MapPoint>(() => {
    if (initialValues?.latitude && initialValues?.longitude) {
      return {
        id: 'saved-point',
        label: 'نقطه ذخیره‌شده',
        lat: initialValues.latitude,
        lng: initialValues.longitude,
        x: 48,
        y: 50,
      };
    }

    return MAP_POINTS[0];
  }, [initialValues?.latitude, initialValues?.longitude]);

  const [selectedPoint, setSelectedPoint] = useState(initialPoint);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? formatAddress(initialPoint.lat, initialPoint.lng));
  const [radius, setRadius] = useState(String(initialValues?.radius ?? 100));
  const [description, setDescription] = useState(initialValues?.description ?? '');

  const pickPoint = (point: MapPoint) => {
    setSelectedPoint(point);
    setAddress(formatAddress(point.lat, point.lng));
  };

  return (
    <form action={action} className="location-form-layout">
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      <input type="hidden" name="latitude" value={selectedPoint.lat} />
      <input type="hidden" name="longitude" value={selectedPoint.lng} />

      <div className="location-form-panel">
        <div className="form-grid">
          <label>
            <span>عنوان</span>
            <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            <span>شعاع مجاز (متر)</span>
            <input name="radius" type="number" value={radius} onChange={(event) => setRadius(event.target.value)} required />
          </label>
          <label className="full-span">
            <span>آدرس</span>
            <input name="address" value={address} onChange={(event) => setAddress(event.target.value)} required />
          </label>
          <label className="full-span">
            <span>توضیح</span>
            <textarea name="description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>

        <div className="location-coord-strip">
          <div>
            <span>عرض جغرافیایی</span>
            <strong>{selectedPoint.lat}</strong>
          </div>
          <div>
            <span>طول جغرافیایی</span>
            <strong>{selectedPoint.lng}</strong>
          </div>
        </div>

        <div className="full-span">
          <button type="submit" className="primary-button">
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="location-map-panel">
        <div className="location-map-header">
          <div>
            <strong>انتخاب محل از روی مختصات</strong>
            <span>فعلاً این نقشه ماک است و چند نقطه نمونه برای انتخاب دارد.</span>
          </div>
          <button
            type="button"
            className="location-map-locate"
            onClick={() => pickPoint(MAP_POINTS[0])}
            aria-label="بازگشت به نقطه مرکزی"
          >
            <LocateFixed size={16} />
          </button>
        </div>

        <div className="location-map-canvas">
          <div
            className="location-map-selected"
            style={{ left: `${selectedPoint.x}%`, top: `${selectedPoint.y}%` }}
            title={selectedPoint.label}
          >
            <MapPin size={18} />
          </div>

          {MAP_POINTS.map((point) => (
            <button
              key={point.id}
              type="button"
              className={`location-map-point${selectedPoint.id === point.id ? ' is-active' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => pickPoint(point)}
            >
              <span>{point.label}</span>
            </button>
          ))}

          <div className="location-map-legend">
            <span>شبکه ماک</span>
            <span>نقطه فعلی: {selectedPoint.label}</span>
          </div>
        </div>

        <div className="location-radius-controls">
          <button type="button" onClick={() => setRadius((current) => String(Math.max(20, Number(current || '100') - 20)))}>
            <Minus size={16} />
          </button>
          <strong>{radius} متر</strong>
          <button type="button" onClick={() => setRadius((current) => String(Math.min(500, Number(current || '100') + 20)))}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </form>
  );
}
