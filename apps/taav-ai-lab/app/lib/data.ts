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
  deleteTaaviaBrandForTenant,
  updateTaaviaBrandModelPreferences,
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
