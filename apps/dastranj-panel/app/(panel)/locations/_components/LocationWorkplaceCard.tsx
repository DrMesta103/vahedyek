import { MapPin } from 'lucide-react';
import { resolveLocationMapPin } from '../../../lib/location-map-pin';
import { LocationCardActions } from './LocationCardActions';

type LocationWorkplaceCardProps = {
  id: string;
  title: string;
  address: string;
  radius: number;
  latitude: { toString(): string } | string | null;
  longitude: { toString(): string } | string | null;
  description?: string | null;
  isActive: boolean;
  isPrimaryOnboarding?: boolean;
  usageCount?: number;
};

function shortenText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

export function LocationWorkplaceCard({
  id,
  title,
  address,
  radius,
  latitude,
  longitude,
  description,
  isActive,
  isPrimaryOnboarding,
  usageCount = 0,
}: LocationWorkplaceCardProps) {
  const pin = resolveLocationMapPin(latitude, longitude);
  const isIncomplete =
    !title.trim() ||
    !address.trim() ||
    !Number.isFinite(Number(latitude ?? '')) ||
    !Number.isFinite(Number(longitude ?? '')) ||
    !Number.isFinite(radius) ||
    radius <= 0;
  const statusLabel = isIncomplete ? 'ناقص' : isActive ? 'فعال' : 'غیرفعال';
  const statusClass = isIncomplete ? 'is-warning' : isActive ? 'is-active' : 'is-inactive';

  return (
    <article className="location-workplace-card">
      <div className="location-workplace-card-top">
        <div className="location-workplace-badges">
          <span className={`location-workplace-status-badge ${statusClass}`}>{statusLabel}</span>
          {isPrimaryOnboarding ? <span className="location-card-primary-badge">محل اصلی</span> : null}
        </div>
        <LocationCardActions
          id={id}
          title={title}
          isActive={isActive}
          isPrimary={Boolean(isPrimaryOnboarding)}
          usageCount={usageCount}
        />
      </div>

      <div className="location-workplace-card-body">
        <div className="location-workplace-map" aria-hidden>
          <div className="location-workplace-map-note">نمایش موقعیت تقریبی</div>
          <div className="location-workplace-map-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <MapPin className="h-5 w-5" strokeWidth={2.4} />
          </div>
        </div>

        <div className="location-workplace-copy">
          <div className="location-workplace-title-row">
            <h3>{title}</h3>
            <span className="location-workplace-radius">{radius.toLocaleString('fa-IR')} متر</span>
          </div>
          <p className="location-workplace-address">{shortenText(address, 96)}</p>
          {description ? <span className="location-workplace-description">{shortenText(description, 140)}</span> : null}
          <span className="location-workplace-meta">شعاع مجاز ثبت تردد</span>
        </div>
      </div>
    </article>
  );
}
