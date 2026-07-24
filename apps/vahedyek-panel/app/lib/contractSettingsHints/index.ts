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
  resolveForgivenessFieldHints,
  resolveInterestFieldHints,
  getDomainFieldHint,
} from './forgivenessInterestFieldHints';

export {
  resolveDiscountFieldHints,
  buildDiscountRuleHintState,
} from './discountFieldHints';

export {
  resolveBuilderPenaltyFieldHints,
} from './builderPenaltyFieldHints';

export type { DomainFieldHint } from './domainFieldHints';
