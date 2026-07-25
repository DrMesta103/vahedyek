export {
  resolvePrepaymentAmountReference,
  resolvePrepaymentHintReference,
  resolvePrepaymentDueScheduleHint,
  getPrepaymentInstallmentConfig,
  type SettingsRuleLike,
  type DueItemLike,
} from './prepaymentHints';

export {
  resolveInstallmentHintReference,
  resolveInstallmentDueScheduleHint,
} from './installmentHints';

export {
  parseInstallmentWindow,
  parseJalaliDate,
  describeDueInterval,
  isDueIntervalAligned,
  compareJalaliDate,
} from './dueScheduleUtils';

export { resolveDomainRuleHint, resolveRuleHintOrFallback } from './domainRuleHints';

export {
  resolveTerminationHint,
  resolveTerminationFieldHints,
  getTerminationFieldHint,
} from './terminationHints';

export {
  BOOTSTRAP_DEFAULT_PENALTY_TYPE_ID,
  buildBuyerPenaltyTypeRuleState,
  buyerPenaltyAlignmentTag,
  getBuyerPenaltyFieldHint,
  resolveBuyerPenaltiesPartyHint,
  resolveBuyerPenaltyFieldHints,
  resolveBuyerPenaltySettingsTargetTypeId,
  resolveBuyerPenaltyTypeHint,
  scopeBuyerPenaltySettingsToType,
  type BuyerPenaltyFieldHint,
  type BuyerPenaltyFieldHintKey,
} from './penaltyHints';

export {
  resolveForgivenessEntryHint,
  resolveForgivenessFieldHints,
  resolveInterestFieldHints,
  getDomainFieldHint,
} from './forgivenessInterestFieldHints';

export {
  resolveDiscountFieldHints,
  resolveDiscountTypeHint,
  buildDiscountRuleHintState,
} from './discountFieldHints';

export {
  resolveBuilderPenaltyFieldHints,
  resolveBuilderPenaltySectionHint,
} from './builderPenaltyFieldHints';

export type { DomainFieldHint } from './domainFieldHints';

export { canAlignWithSettings, aggregateAlignmentStatuses } from './alignWithSettings';

