import Link from 'next/link';
import { Plus } from 'lucide-react';

export function ModuleAddTile({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="module-add-tile">
      <span className="module-add-tile-icon" aria-hidden>
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </span>
      <span className="module-add-tile-text">{label}</span>
    </Link>
  );
}
