import PanelLayout from '../../../../components/PanelLayout';
import { ContractRuleDetailsPanel } from '../../_components/ContractRuleDetailsPanel';
import { CONTRACT_RULE_ITEMS, type ContractRuleId } from '../../../../lib/businessContractRules';
import { notFound } from 'next/navigation';

export default async function BusinessContractRuleDetailPage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = await params;

  if (!CONTRACT_RULE_ITEMS.some((item) => item.id === ruleId)) {
    notFound();
  }

  return (
    <PanelLayout>
      <ContractRuleDetailsPanel key={ruleId} ruleId={ruleId as ContractRuleId} />
    </PanelLayout>
  );
}
