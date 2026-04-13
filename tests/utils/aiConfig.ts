import path from 'path';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

export type AiProvider = 'openai' | 'gemini' | 'groq';

export type ProviderConfig = {
  provider: AiProvider;
  model: string;
  apiUrl: string;
  apiKey: string;
};

type ProviderEnvMap = {
  model?: string;
  apiUrl?: string;
  apiKey?: string;
};

const PROVIDER_DEFAULTS: Record<AiProvider, { model: string; apiUrl: string }> = {
  openai: {
    model: 'gpt-4o-mini',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
  },
  gemini: {
    model: 'gemini-1.5-flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  groq: {
    model: 'llama-3.3-70b-versatile',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  },
};

function readProviderEnv(provider: AiProvider): ProviderEnvMap {
  if (provider === 'openai') {
    return {
      model: process.env.OPENAI_MODEL,
      apiUrl: process.env.OPENAI_API_URL,
      apiKey: process.env.OPENAI_API_KEY,
    };
  }
  if (provider === 'gemini') {
    return {
      model: process.env.GEMINI_MODEL,
      apiUrl: process.env.GEMINI_API_URL,
      apiKey: process.env.GEMINI_API_KEY,
    };
  }
  return {
    model: process.env.GROQ_MODEL,
    apiUrl: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
  };
}

export function resolveAiProvider(): AiProvider {
  const raw = (process.env.LLM_PROVIDER ?? 'openai').toLowerCase();
  if (raw === 'openai' || raw === 'gemini' || raw === 'groq') {
    return raw;
  }
  logger.warn('AI_CONFIG', 'Invalid LLM_PROVIDER value, defaulting to openai', { value: raw });
  return 'openai';
}

export function resolveProviderConfig(provider = resolveAiProvider()): ProviderConfig | null {
  const env = readProviderEnv(provider);
  const defaults = PROVIDER_DEFAULTS[provider];
  const model = env.model?.trim() || defaults.model;
  const apiUrl = env.apiUrl?.trim() || defaults.apiUrl;
  const apiKey = env.apiKey?.trim() ?? '';

  if (!model) {
    logger.error('AI_CONFIG', `Model could not be resolved for provider: ${provider}`);
    return null;
  }
  if (!apiUrl) {
    logger.error('AI_CONFIG', `API URL could not be resolved for provider: ${provider}`);
    return null;
  }
  if (!apiKey) {
    logger.warn('AI_CONFIG', `API key is missing for provider: ${provider}`);
    return null;
  }

  return { provider, model, apiUrl, apiKey };
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function handleApiError(response: Response, provider: AiProvider): Promise<void> {
  const body = await response.text().catch(() => '');
  logger.error('AI_PROVIDER', `${provider} API request failed (${response.status})`, {
    provider,
    status: response.status,
    body: body.slice(0, 500),
  });
}
