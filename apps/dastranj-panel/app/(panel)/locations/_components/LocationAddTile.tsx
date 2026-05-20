import Link from 'next/link';
import { Plus } from 'lucide-react';

export function LocationAddTile() {
  return (
    <Link href="/locations/new" className="location-add-tile">
      <span className="location-add-tile-icon" aria-hidden>
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </span>
      <span className="location-add-tile-text">برای افزودن محل کار کلیک کنید.</span>
    </Link>
  );
}
