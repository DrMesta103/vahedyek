/**
 * Data access facade — PostgreSQL-backed replacements for simulator-store.
 */
export type {
  Tenant,
  SimulatorUser,
  AdminUserRow,
  UpdateAdminUserInput,
  UserNotificationEvent,
  TaaviaBrand,
  OcrSimulationJob,
  OcrSimulationField,
  OcrSimulationSourceType,
  CreateSimulatorUserInput,
  CreateAdminUserInput,
  CreateTenantInput,
  CreateTaaviaBrandInput,
  CreateOcrSimulationInput,
  TaaviaChatMessage,
  TaaviaBrandModelServiceKey,
} from './types/domain';

export {
  OCR_SAMPLE_LIBRARY,
  getOcrSampleById,
  getOcrSamplesByLane,
} from './ocr-simulator-data';

export type {
  OcrSampleDocument,
  OcrSampleLane,
  OcrSimulationStatus,
  OcrTemplateScenario,
} from './ocr-simulator-data';

export { verifyPassword } from './auth';

export {
  getUserByEmail,
  getUserById,
  getUserByIdentifier,
  createSimulatorUser,
  listAllUsersForAdmin,
  createUserForAdmin,
  updateUserForAdmin,
  toggleUserActiveStatus,
  sendTestNotificationToUser,
  consumeUnreadNotificationsForUser,
} from './repositories/users';

export {
  getTenantsForUser,
  getSuggestedBusinessNames,
  getTenantForUser,
  createTenantForUser,
  listAllBusinessesForAdmin,
  updateTenantTokenLimit,
  type AdminBusinessRow,
} from './repositories/businesses';

export {
  getOcrJobsForTenant,
  getOcrJobForTenant,
  createOcrJobForTenant,
} from './repositories/ocr-jobs';

export {
  getTaaviaBrandsForTenant,
  getTaaviaBrandForTenant,
  createTaaviaBrandForTenant,
  updateTaaviaBrandForTenant,
  setTaaviaBrandStatus,
  deleteTaaviaBrandForTenant,
} from './repositories/taavia-brands';

export {
  getAdminAgentConversation,
  getOrCreateAdminAgentConversation,
  getAdminAgentSetupState,
  addAdminAgentUserMessage,
  updateAdminAgentSetupState,
  sendAdminAgentMessage,
} from './repositories/conversations';

export {
  getGlobalSettings,
  createModelSettings,
  updateUsdToToman,
  updateModelPrice,
  updateModelSettings,
  verifyPlatformAdmin,
} from './repositories/global-settings';

export type {
  AiProviderAccountPublic,
  AiProviderAccountSummary,
  AiProviderType,
  CreateAiProviderAccountInput,
  UpdateAiProviderAccountInput,
} from './types/ai-accounts';

export {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_TYPES,
  AI_ACCOUNT_PROVIDER_TYPES,
  isAiAccountProviderType,
  DuplicateAiProviderError,
} from './types/ai-accounts';

export {
  listAiProviderAccounts,
  getAiProviderAccountById,
  createAiProviderAccount,
  updateAiProviderAccount,
  toggleAiProviderAccountStatus,
  deleteAiProviderAccount,
  parseAiProviderType,
  parseAiAccountProviderType,
  isValidPurchaseEmail,
} from './repositories/ai-accounts';

export {
  calculateAiUsageCost,
  formatCostUsd,
  formatTokenPriceUsd,
  parseNonNegativeDecimal,
  usdToTomanCost,
} from './ai-usage-cost';

export type { AiUsageCostAccount, AiUsageCostResult } from './ai-usage-cost';

export {
  buildOcrCostMeta,
  buildOcrUsageCost,
  formatCostToman,
  formatPerTokenPriceToman,
  mapOcrProviderToAccountType,
  readOcrCostFromMetaWithToman,
  resolveOcrModelPricing,
} from './ocr-ai-pricing';

export type { OcrAiUsageCost, OcrModelPricing } from './ocr-ai-pricing';

export type {
  AiProviderModelPublic,
  AiProviderAccountDetail,
  CreateAiProviderModelInput,
  UpdateAiProviderModelInput,
  UsedBrandTagsByModelType,
} from './types/ai-provider-models';

export type { TaaviaBrandAiModelPurpose } from './taavia-ai-models';
export { TAAVIA_BRAND_AI_MODEL_PURPOSES, TAAVIA_PURPOSE_LABELS, TAAVIA_PURPOSE_DESCRIPTIONS } from './taavia-ai-models';

export {
  getTaaviaBrandModelAssignments,
  getTaaviaBrandModelAssignmentHistory,
  assignTaaviaBrandModel,
} from './repositories/taavia-brand-model-assignments';

export { recordTaaviaBrandAiUsage } from './repositories/taavia-brand-ai-usage';

export {
  listAiProviderModels,
  getAiProviderModelById,
  getAiProviderAccountDetail,
  listSystemOcrModels,
  listActiveChatModels,
  createAiProviderModel,
  updateAiProviderModel,
  toggleAiProviderModelStatus,
  deleteAiProviderModel,
  parseAiProviderModelType,
  parseAiProviderPricingUnit,
  parseAiProviderModelBrandTag,
  listUsedBrandTagsByModelType,
  hasAnyPositivePrice,
} from './repositories/ai-provider-models';
