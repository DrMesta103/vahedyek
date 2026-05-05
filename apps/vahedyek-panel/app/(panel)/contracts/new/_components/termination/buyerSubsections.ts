import type { BuyerTerminationSubsectionId, TerminationBuyerPanel } from '../../../../../types/contract';

export const BUYER_SUBSECTION_IDS: BuyerTerminationSubsectionId[] = [
  'lateDelivery',
  'specificationChanges',
  'breachOfObligations',
  'areaDiscrepancy',
  'notification',
];

export function isBuyerTerminationSubsectionPanel(panel: TerminationBuyerPanel): panel is BuyerTerminationSubsectionId {
  return panel !== 'list';
}
