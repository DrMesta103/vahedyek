import { Building2 } from 'lucide-react';
import { fallbackLogoLabel } from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/data';

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
    <div className={small ? 'ai-lab-business-avatar ai-lab-business-avatar-sm' : 'ai-lab-business-avatar'}>
      <Building2 className={small ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.7} />
      <span className="sr-only">{fallbackLogoLabel(business) || 'کسب‌وکار'}</span>
    </div>
  );
}
