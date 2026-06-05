import { BusinessSettingsPageClient } from './_components/BusinessSettingsPageClient';
import { resolveTenantSetupHealthForCurrentUser } from '../../lib/setup-health';

export default async function BusinessSettingsPage() {
  const { setupHealth } = await resolveTenantSetupHealthForCurrentUser({
    fallbackOnError: true,
    debugLabel: 'business-settings',
  });

  return <BusinessSettingsPageClient setupHealth={setupHealth} />;
}
