import PanelLayout from '../../../../../components/PanelLayout';
import { ContractRuleDetailsPanel } from '../../../_components/ContractRuleDetailsPanel';

export default async function InstallmentsProgressBasedPage({
  searchParams,
}: {
  searchParams?: Promise<{ groupId?: string | string[] }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const groupId = Array.isArray(resolvedSearchParams.groupId)
    ? resolvedSearchParams.groupId[0]
    : resolvedSearchParams.groupId;

  return (
    <PanelLayout>
      <ContractRuleDetailsPanel
        ruleId="installments"
        forcedTabId="progress-based"
        backHref="/business-settings/contract-rules/installments"
        submitRedirectHref="/business-settings/contract-rules/installments"
        standaloneProgressGroupId={groupId}
      />
    </PanelLayout>
  );
}
