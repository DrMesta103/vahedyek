import Link from 'next/link';
import { Plus } from 'lucide-react';

type ModuleAddTileProps = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function ModuleAddTile({ href, label, onClick }: ModuleAddTileProps) {
  const content = (
    <>
      <span className="module-add-tile-icon" aria-hidden>
        <Plus className="h-7 w-7" strokeWidth={2.4} />
      </span>
      <span className="module-add-tile-text">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="module-add-tile" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? '#'} className="module-add-tile">
      {content}
    </Link>
  );
}
