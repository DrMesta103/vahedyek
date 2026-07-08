import type {
  OcrTemplateInputSchema,
  OcrTemplateOutputResult,
  OcrTemplateScenario,
  OcrSimulationStatus,
} from '../ocr-simulator-data';

export type OcrSimulationSourceType = 'sample' | 'upload';

export type OcrSimulationField = {
  key: string;
  label: string;
  value: string;
};

export type Tenant = {
  id: string;
  ownerUserId: string;
  name: string;
  slug?: string;
  brandCode?: string;
  packageKey?: string | null;
  billingCycle?: 'monthly' | 'yearly' | null;
  logoUrl: string;
  tokenLimit: number;
  usedTokens: number;
  ocrTestsCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
};

export type SimulatorUser = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
};

export type TaaviaBrand = {
  id: string;
  tenantId: string;
  name: string;
  createdByUserId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  intake?: {
    description?: string;
    iconName?: string;
    iconDataUrl?: string;
  };
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>>;
};

export type TaaviaBrandModelServiceKey =
  | 'adminAgent'
  | 'knowledgeBase'
  | 'faqAssistant'
  | 'ocr'
  | 'embeddings'
  | 'vision'
  | 'speechToText'
  | 'textToSpeech';

export type TaaviaUseCaseKey =
  | 'support'
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'product'
  | 'management'
  | 'it'
  | 'all';

export type TaaviaBrandSetup = {
  selectedUseCases: TaaviaUseCaseKey[];
};

export type OcrSimulationJob = {
  id: string;
  tenantId: string;
  sourceType: OcrSimulationSourceType;
  sourceName: string;
  sourceLabel: string;
  fileType: string;
  fileSize: number | null;
  sampleId: string | null;
  templateId: string | null;
  templateLabel: string | null;
  scenario: OcrTemplateScenario | null;
  status: OcrSimulationStatus;
  progress: number;
  confidence: number;
  pageCount: number;
  tokensUsed: number;
  summary: string;
  previewText: string;
  templateSchema: OcrTemplateInputSchema | null;
  resultJson: OcrTemplateOutputResult | null;
  extractedJson: Record<string, string>;
  extractedFields: OcrSimulationField[];
  warnings: string[];
  error: string | null;
  terminalStatus: 'completed' | 'failed';
  createdAt: string;
  startedAt: string;
  readyAt: string;
  completedAt: string | null;
  updatedAt: string;
};

export type CreateSimulatorUserInput = {
  firstName: string;
  lastName: string;
  identifier: string;
  mobile?: string;
  password: string;
};

export type CreateTenantInput = {
  name: string;
  logoUrl: string;
  tokenLimit: number;
  ownerFirstName?: string;
  ownerLastName?: string;
  slug?: string;
  brandCode?: string;
  packageKey?: string | null;
  billingCycle?: 'monthly' | 'yearly' | null;
};

export type CreateTaaviaBrandInput = {
  tenantId: string;
  name: string;
  intake?: {
    description?: string;
    iconName?: string;
    iconDataUrl?: string;
  };
  modelPreferences?: Partial<Record<TaaviaBrandModelServiceKey, string>>;
};

export type UpdateTaaviaBrandInput = CreateTaaviaBrandInput & {
  brandId: string;
};

export type CreateOcrSimulationInput = {
  tenantId: string;
  sourceType: OcrSimulationSourceType;
  sourceName: string;
  fileType?: string | null;
  fileSize?: number | null;
  sampleId?: string | null;
  templateId?: string | null;
  scenario?: OcrTemplateScenario | null;
  sampleText?: string | null;
  transportMode?: 'rest' | 'grpc' | null;
  modelId?: string | null;
};

export type TaaviaChatMessage = {
  id: string;
  role: 'system' | 'assistant' | 'user';
  content: string;
  status: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};
