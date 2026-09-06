/**
 * Environment-based configuration for the built-in LLM providers.
 * Endpoints and secrets come only from the consumer process environment.
 */
import type { AiProvider, ProviderConfig, SmartLocatorLogger } from '../types';

type ProviderEnvMap = {
  model?: string;
  apiUrl?: string;
  apiKey?: string;
};

const VALID_PROVIDERS: AiProvider[] = ['openai', 'gemini', 'groq', 'cursor'];

/**
 * Reads model, endpoint, and API-key environment variables for one provider.
 *
 * @param provider Provider whose environment values should be read.
 * @returns Raw environment values, which may be undefined.
 */
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
  if (provider === 'cursor') {
    return { model: process.env.CURSOR_MODEL };
  }
  return {
    model: process.env.GROQ_MODEL,
    apiUrl: process.env.GROQ_API_URL,
    apiKey: process.env.GROQ_API_KEY,
  };
}

/**
 * Resolves the Cursor CLI executable and extra argv prefix from `CURSOR_CLI`.
 *
 * @returns Command name and optional prefix arguments (for `cursor agent`).
 */
export function resolveCursorCliInvocation(): { command: string; prefixArgs: string[] } {
  const raw = process.env.CURSOR_CLI?.trim() || 'agent';
  const parts = raw.split(/\s+/).filter(Boolean);
  return { command: parts[0] ?? 'agent', prefixArgs: parts.slice(1) };
}

/**
 * Resolves `LLM_PROVIDER`, falling back to OpenAI for missing or invalid values.
 *
 * @param logger Optional logger used to report an invalid value.
 * @returns The selected built-in provider.
 */
export function resolveAiProvider(logger?: Pick<SmartLocatorLogger, 'warn'>): AiProvider {
  const raw = (process.env.LLM_PROVIDER ?? 'openai').toLowerCase();
  if ((VALID_PROVIDERS as string[]).includes(raw)) return raw as AiProvider;
  logger?.warn('AI_CONFIG', 'Invalid LLM_PROVIDER value; defaulting to openai', { value: raw });
  return 'openai';
}

/**
 * Resolves provider settings from the consumer environment only.
 *
 * HTTP providers require key, URL, and model. Cursor CLI requires none of those;
 * an empty model uses the CLI default.
 *
 * @param provider Provider to configure; defaults to `LLM_PROVIDER`.
 * @param logger Optional logger used for missing credential warnings.
 * @returns Complete provider configuration, or `null` when required HTTP fields are missing.
 */
export function resolveProviderConfig(
  provider = resolveAiProvider(),
  logger?: Pick<SmartLocatorLogger, 'warn'>,
): ProviderConfig | null {
  const env = readProviderEnv(provider);
  const model = env.model?.trim() ?? '';

  if (provider === 'cursor') {
    return { provider, model };
  }

  const apiKey = env.apiKey?.trim() ?? '';
  const apiUrl = env.apiUrl?.trim() ?? '';
  if (!apiKey) {
    logger?.warn('AI_CONFIG', `API key is missing for provider: ${provider}`);
    return null;
  }
  if (!apiUrl) {
    logger?.warn('AI_CONFIG', `API URL is missing for provider: ${provider}`);
    return null;
  }
  if (!model) {
    logger?.warn('AI_CONFIG', `Model is missing for provider: ${provider}`);
    return null;
  }
  return { provider, model, apiUrl, apiKey };
}

/**
 * Converts any thrown value to a readable error string.
 *
 * @param error Unknown thrown value.
 * @returns Error message suitable for logs.
 */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Reads and logs a failed provider response.
 *
 * @param response Failed HTTP response.
 * @param provider Provider that returned the response.
 * @param logger Optional logger that receives status and a truncated body.
 */
export async function handleApiError(
  response: Response,
  provider: AiProvider,
  logger?: Pick<SmartLocatorLogger, 'error'>,
): Promise<void> {
  const body = await response.text().catch(() => '');
  logger?.error('AI_PROVIDER', `${provider} API request failed (${response.status})`, {
    provider,
    status: response.status,
    body: body.slice(0, 500),
  });
}
