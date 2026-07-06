/**
 * Data access facade — PostgreSQL-backed replacements for simulator-store.
 */
export type {
  Tenant,
  SimulatorUser,
  TaaviaBrand,
  OcrSimulationJob,
  OcrSimulationField,
  OcrSimulationSourceType,
  CreateSimulatorUserInput,
  CreateTenantInput,
  CreateTaaviaBrandInput,
  CreateOcrSimulationInput,
  TaaviaChatMessage,
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
} from './repositories/users';

export {
  getTenantsForUser,
  getSuggestedBusinessNames,
  getTenantForUser,
  createTenantForUser,
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
} from './types/ai-accounts';

export {
  listAiProviderAccounts,
  getAiProviderAccountById,
  createAiProviderAccount,
  updateAiProviderAccount,
  toggleAiProviderAccountStatus,
  deleteAiProviderAccount,
  parseAiProviderType,
  isValidPurchaseEmail,
} from './repositories/ai-accounts';

export {
  calculateAiUsageCost,
  formatTokenPriceUsd,
  parseNonNegativeDecimal,
} from './ai-usage-cost';

export type { AiUsageCostAccount, AiUsageCostResult } from './ai-usage-cost';

export type {
  AiProviderModelPublic,
  AiProviderAccountDetail,
  CreateAiProviderModelInput,
  UpdateAiProviderModelInput,
} from './types/ai-provider-models';

export {
  listAiProviderModels,
  getAiProviderModelById,
  getAiProviderAccountDetail,
  createAiProviderModel,
  updateAiProviderModel,
  toggleAiProviderModelStatus,
  deleteAiProviderModel,
  parseAiProviderModelType,
  parseAiProviderPricingUnit,
  hasAnyPositivePrice,
} from './repositories/ai-provider-models';
