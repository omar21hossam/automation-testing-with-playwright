/**
 * Minimal HTTP clients for the supported LLM providers.
 */
import { handleApiError, resolveProviderConfig, toErrorMessage } from './aiConfig';
import type { AiProvider, ChatMessage, SmartLocatorLogger } from '../types';

type AiLogger = Pick<SmartLocatorLogger, 'warn' | 'error'>;

/**
 * Calls an OpenAI-compatible chat-completions endpoint.
 *
 * @param messages System and user messages sent to the model.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when configuration or the request fails.
 */
async function callOpenAi(messages: ChatMessage[], logger?: AiLogger): Promise<string | null> {
  const cfg = resolveProviderConfig('openai', logger);
  if (!cfg) return null;
  const response = await fetch(cfg.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({ model: cfg.model, temperature: 0.1, messages }),
  });
  if (!response.ok) {
    await handleApiError(response, 'openai', logger);
    return null;
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? null;
}

/**
 * Calls Groq's OpenAI-compatible chat-completions endpoint.
 *
 * @param messages System and user messages sent to the model.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when configuration or the request fails.
 */
async function callGroq(messages: ChatMessage[], logger?: AiLogger): Promise<string | null> {
  const cfg = resolveProviderConfig('groq', logger);
  if (!cfg) return null;
  const response = await fetch(cfg.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({ model: cfg.model, temperature: 0.1, messages }),
  });
  if (!response.ok) {
    await handleApiError(response, 'groq', logger);
    return null;
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? null;
}

/**
 * Calls the Gemini generate-content endpoint.
 *
 * @param messages System and user messages sent to the model.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when configuration or the request fails.
 */
async function callGemini(messages: ChatMessage[], logger?: AiLogger): Promise<string | null> {
  const cfg = resolveProviderConfig('gemini', logger);
  if (!cfg) return null;
  const system = messages.find((message) => message.role === 'system')?.content ?? '';
  const user = messages
    .filter((message) => message.role !== 'system')
    .map((message) => message.content)
    .join('\n\n');
  const endpoint = `${cfg.apiUrl}/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.1 },
    }),
  });
  if (!response.ok) {
    await handleApiError(response, 'gemini', logger);
    return null;
  }
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

/**
 * Dispatches chat messages to the selected built-in provider.
 *
 * @param provider LLM provider to call.
 * @param messages System and user messages sent to the model.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when the client cannot produce a response.
 */
export async function callAiProvider(
  provider: AiProvider,
  messages: ChatMessage[],
  logger?: AiLogger,
): Promise<string | null> {
  try {
    if (provider === 'openai') return await callOpenAi(messages, logger);
    if (provider === 'gemini') return await callGemini(messages, logger);
    return await callGroq(messages, logger);
  } catch (error) {
    logger?.error('AI_PROVIDER', `Unhandled ${provider} client error`, {
      provider,
      message: toErrorMessage(error),
    });
    return null;
  }
}
