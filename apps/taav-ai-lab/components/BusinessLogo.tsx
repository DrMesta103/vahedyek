import { ImageIcon } from 'lucide-react';
import { fallbackLogoLabel } from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/simulator-store';

export function BusinessLogo({ business, small = false }: { business: Pick<Tenant, 'name' | 'logoUrl'>; small?: boolean }) {
  if (business.logoUrl) {
    return (
      <img
        src={business.logoUrl}
        alt={`لوگوی ${business.name}`}
        className={small ? 'ai-lab-logo ai-lab-logo-sm object-cover' : 'ai-lab-logo object-cover'}
      />
    );
  }

  return (
    <div className={small ? 'ai-lab-logo ai-lab-logo-sm' : 'ai-lab-logo'}>
      {fallbackLogoLabel(business) || <ImageIcon className="h-5 w-5" />}
    </div>
  );
}
