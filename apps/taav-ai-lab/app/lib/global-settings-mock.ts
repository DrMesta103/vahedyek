export type Provider = 'openai' | 'google' | 'xai' | 'deepseek';

export type ModelCategory = 'chat' | 'embedding' | 'ocr';

export type PricingModel = {
  id: string;
  provider: Provider;
  providerLabel: string;
  name: string;
  category: ModelCategory;
  pricePer100TokensUsd: number;
  relatedModelIds: string[];
};

export type ApiKeyEntry = {
  id: string;
  provider: Provider;
  label: string;
  maskedKey: string;
  fullKey: string;
  modelIds: string[];
};

export type GlobalSettingsData = {
  usdToToman: number;
  models: PricingModel[];
  apiKeys: ApiKeyEntry[];
};

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, string> = {
  chat: 'گفتگو',
  embedding: 'امبدینگ',
  ocr: 'OCR',
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'ChatGPT',
  google: 'Gemini',
  xai: 'Grok',
  deepseek: 'DeepSeek',
};

export const GLOBAL_SETTINGS_MOCK: GlobalSettingsData = {
  usdToToman: 92000,
  models: [
    {
      id: 'gpt-4-5',
      provider: 'openai',
      providerLabel: 'ChatGPT',
      name: 'GPT-4.5',
      category: 'chat',
      pricePer100TokensUsd: 2.0,
      relatedModelIds: ['text-embedding-3-large', 'gpt-4o-ocr'],
    },
    {
      id: 'text-embedding-3-large',
      provider: 'openai',
      providerLabel: 'ChatGPT',
      name: 'text-embedding-3-large',
      category: 'embedding',
      pricePer100TokensUsd: 0.5,
      relatedModelIds: ['gpt-4.5'],
    },
    {
      id: 'gpt-4o-ocr',
      provider: 'openai',
      providerLabel: 'ChatGPT',
      name: 'GPT-4o OCR',
      category: 'ocr',
      pricePer100TokensUsd: 2.5,
      relatedModelIds: ['gpt-4.5'],
    },
    {
      id: 'gemini-2-flash',
      provider: 'google',
      providerLabel: 'Gemini',
      name: 'Gemini 2.0 Flash',
      category: 'chat',
      pricePer100TokensUsd: 0.8,
      relatedModelIds: ['text-embedding-004'],
    },
    {
      id: 'text-embedding-004',
      provider: 'google',
      providerLabel: 'Gemini',
      name: 'text-embedding-004',
      category: 'embedding',
      pricePer100TokensUsd: 0.3,
      relatedModelIds: ['gemini-2-flash'],
    },
    {
      id: 'grok-2',
      provider: 'xai',
      providerLabel: 'Grok',
      name: 'Grok-2',
      category: 'chat',
      pricePer100TokensUsd: 1.5,
      relatedModelIds: [],
    },
    {
      id: 'deepseek-v3',
      provider: 'deepseek',
      providerLabel: 'DeepSeek',
      name: 'DeepSeek-V3',
      category: 'chat',
      pricePer100TokensUsd: 0.6,
      relatedModelIds: ['deepseek-ocr'],
    },
    {
      id: 'deepseek-ocr',
      provider: 'deepseek',
      providerLabel: 'DeepSeek',
      name: 'DeepSeek-OCR',
      category: 'ocr',
      pricePer100TokensUsd: 1.2,
      relatedModelIds: ['deepseek-v3'],
    },
  ],
  apiKeys: [
    {
      id: 'openai-prod',
      provider: 'openai',
      label: 'OpenAI Production',
      maskedKey: 'sk-...7xQ9',
      fullKey: 'sk-proj-7xQ9mK2pL8nR4vW1tY6uI3oP0aS5dF9gH2jK4lZ6xC8vB1nM3qW7eR0tY',
      modelIds: ['gpt-4-5', 'text-embedding-3-large', 'gpt-4o-ocr'],
    },
    {
      id: 'openai-dev',
      provider: 'openai',
      label: 'OpenAI Development',
      maskedKey: 'sk-...3kLm',
      fullKey: 'sk-proj-3kLm9nP2qR5sT8uV1wX4yZ7aB0cD3eF6gH9iJ2kL5mN8oP1qR4sT7uV',
      modelIds: ['gpt-4-5', 'gpt-4o-ocr'],
    },
    {
      id: 'google-main',
      provider: 'google',
      label: 'Google AI Studio',
      maskedKey: 'AIz...9fK2',
      fullKey: 'AIzaSyD9fK2mN5pQ8rS1tU4vW7xY0zA3bC6dE9fG2hJ5kL8mN1oP4qR7sT0uV',
      modelIds: ['gemini-2-flash', 'text-embedding-004'],
    },
    {
      id: 'xai-main',
      provider: 'xai',
      label: 'xAI API',
      maskedKey: 'xai-...4nRt',
      fullKey: 'xai-4nRt8pQ2sU5vX8yZ1aC4dF7gH0jK3lM6nP9qS2tV5wY8zB1eG4hJ7kN0mQ',
      modelIds: ['grok-2'],
    },
    {
      id: 'deepseek-main',
      provider: 'deepseek',
      label: 'DeepSeek API',
      maskedKey: 'ds-...8wXp',
      fullKey: 'ds-8wXp3kM6nQ9rT2uV5xY8zA1bD4eG7hJ0kL3mN6pQ9sT2vW5xZ8aC1fH4jM7nP',
      modelIds: ['deepseek-v3', 'deepseek-ocr'],
    },
  ],
};

export function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

export function formatToman(value: number) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(value));
}

export function tokensToUsd(tokens: number, pricePer100TokensUsd: number) {
  return (tokens / 100) * pricePer100TokensUsd;
}

export function tokensToToman(tokens: number, pricePer100TokensUsd: number, usdToToman: number) {
  return tokensToUsd(tokens, pricePer100TokensUsd) * usdToToman;
}
