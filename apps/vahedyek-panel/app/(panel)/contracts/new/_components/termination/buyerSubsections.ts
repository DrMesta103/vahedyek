import type { BuyerTerminationSubsectionId, TerminationBuyerPanel } from '../../../../../types/contract';

export type DraftBuyerTerminationSubsectionId = Exclude<BuyerTerminationSubsectionId, 'draftTemplateUsage'>;

export const BUYER_SUBSECTION_IDS: DraftBuyerTerminationSubsectionId[] = [
  'lateDelivery',
  'specificationChanges',
  'breachOfObligations',
  'areaDiscrepancy',
  'notification',
];

export function isBuyerTerminationSubsectionPanel(panel: TerminationBuyerPanel): panel is DraftBuyerTerminationSubsectionId {
  return panel !== 'list' && panel !== 'draftTemplateUsage';
}
