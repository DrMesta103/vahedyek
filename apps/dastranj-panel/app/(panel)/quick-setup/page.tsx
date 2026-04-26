import { getQuickSetupChecklist } from '../../lib/data';
import { QuickSetupFlow } from './_components/QuickSetupFlow';

export default async function QuickSetupPage() {
  const data = await getQuickSetupChecklist();

  return <QuickSetupFlow profileName={data.profile?.brandName ?? null} steps={data.steps} />;
}
