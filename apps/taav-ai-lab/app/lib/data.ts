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
} from './repositories/taavia-brands';

export {
  getAdminAgentConversation,
  getOrCreateAdminAgentConversation,
  addAdminAgentUserMessage,
  sendAdminAgentMessage,
} from './repositories/conversations';

export {
  getGlobalSettings,
  updateUsdToToman,
  updateModelPrice,
  verifyPlatformAdmin,
} from './repositories/global-settings';
