import { MapPin } from 'lucide-react';
import { resolveLocationMapPin } from '../../../lib/location-map-pin';
import { LocationCardActions } from './LocationCardActions';

type LocationWorkplaceCardProps = {
  id: string;
  title: string;
  radius: number;
  latitude: { toString(): string } | string | null;
  longitude: { toString(): string } | string | null;
  isPrimaryOnboarding?: boolean;
};

export function LocationWorkplaceCard({ id, title, radius, latitude, longitude, isPrimaryOnboarding }: LocationWorkplaceCardProps) {
  const pin = resolveLocationMapPin(latitude, longitude);

  return (
    <article className="location-workplace-card">
      <div className="location-workplace-card-top">
        <LocationCardActions id={id} title={title} />
        {isPrimaryOnboarding ? <span className="location-card-primary-badge">محل اصلی</span> : null}
      </div>
      <div className="location-workplace-card-body">
        <div className="location-workplace-map" aria-hidden>
          <div className="location-workplace-map-pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <MapPin className="h-5 w-5" strokeWidth={2.4} />
          </div>
        </div>
        <div className="location-workplace-copy">
          <h3>{title}</h3>
          <p>شعاع مجاز ثبت تردد: {radius.toLocaleString('fa-IR')} متر</p>
        </div>
      </div>
    </article>
  );
}
