import { notFound } from 'next/navigation';
import PanelLayout from '../../../../components/PanelLayout';
import { getApprovalUsageOption } from '../../_components/approvalProcessConfig';
import ApprovalUsageTypePageClient from './page.client';

export default async function BusinessApprovalUsageTypePage({
  params,
}: {
  params: Promise<{ usageType: string }>;
}) {
  const { usageType } = await params;
  const usage = getApprovalUsageOption(usageType);

  if (!usage) {
    notFound();
  }

  return (
    <PanelLayout>
      <ApprovalUsageTypePageClient usage={usage} />
    </PanelLayout>
  );
}
