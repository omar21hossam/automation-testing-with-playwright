import { handleApiError, resolveProviderConfig, toErrorMessage, type AiProvider } from './aiConfig';
import { logger } from './logger';

type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

async function callOpenAi(messages: ChatMessage[]): Promise<string | null> {
  const cfg = resolveProviderConfig('openai');
  if (!cfg) return null;

  const res = await fetch(cfg.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.1,
      messages,
    }),
  });

  if (!res.ok) {
    await handleApiError(res, 'openai');
    return null;
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGrok(messages: ChatMessage[]): Promise<string | null> {
  const cfg = resolveProviderConfig('grok');
  if (!cfg) return null;

  const res = await fetch(cfg.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.1,
      messages,
    }),
  });

  if (!res.ok) {
    await handleApiError(res, 'grok');
    return null;
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGemini(messages: ChatMessage[]): Promise<string | null> {
  const cfg = resolveProviderConfig('gemini');
  if (!cfg) return null;

  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const user = messages
    .filter((m) => m.role !== 'system')
    .map((m) => m.content)
    .join('\n\n');

  const endpoint = `${cfg.apiUrl}/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.1 },
    }),
  });

  if (!res.ok) {
    await handleApiError(res, 'gemini');
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

export async function callAiProvider(
  provider: AiProvider,
  messages: ChatMessage[],
): Promise<string | null> {
  try {
    if (provider === 'openai') return await callOpenAi(messages);
    if (provider === 'gemini') return await callGemini(messages);
    return await callGrok(messages);
  } catch (error) {
    logger.error('AI_PROVIDER', `Unhandled ${provider} client error`, {
      provider,
      message: toErrorMessage(error),
    });
    return null;
  }
}
