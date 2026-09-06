/**
 * Minimal HTTP and CLI clients for the supported LLM providers.
 */
import { spawn } from 'node:child_process';
import { handleApiError, resolveCursorCliInvocation, resolveProviderConfig, toErrorMessage } from './aiConfig';
import type { AiProvider, ChatMessage, SmartLocatorLogger } from '../types';

type AiLogger = Pick<SmartLocatorLogger, 'warn' | 'error'>;

/**
 * Joins system and user messages into a single CLI prompt.
 *
 * @param messages Chat messages sent to HTTP providers.
 * @returns Combined prompt text for `agent -p`.
 */
function messagesToPrompt(messages: ChatMessage[]): string {
  return messages.map((message) => `${message.role}:\n${message.content}`).join('\n\n');
}

/**
 * Runs a Cursor CLI binary once and captures stdout.
 *
 * @param command Executable name or path.
 * @param args CLI arguments including `-p`.
 * @returns Combined stdout, or `null` when the process cannot start or exits non-zero.
 */
function spawnCursorCli(
  command: string,
  args: string[],
  logger?: AiLogger,
): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string | null): void => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    let child;
    try {
      child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      logger?.warn('AI_PROVIDER', 'Cursor CLI could not be started', {
        command,
        message: toErrorMessage(error),
      });
      finish(null);
      return;
    }

    let stdout = '';
    let stderr = '';
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      logger?.warn('AI_PROVIDER', 'Cursor CLI spawn failed', {
        command,
        message: toErrorMessage(error),
      });
      finish(null);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        logger?.warn('AI_PROVIDER', 'Cursor CLI exited unsuccessfully', {
          command,
          code,
          stderr: stderr.slice(0, 500),
        });
        finish(null);
        return;
      }
      const text = stdout.trim();
      finish(text.length > 0 ? text : null);
    });
  });
}

/**
 * Calls the local Cursor CLI in print mode.
 *
 * Tries `CURSOR_CLI` (default `agent`). If that binary is missing and the
 * consumer did not set `CURSOR_CLI`, retries `cursor agent`.
 *
 * @param messages System and user messages sent to the healer.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when the CLI is missing, not logged in, or fails.
 */
async function callCursorCli(messages: ChatMessage[], logger?: AiLogger): Promise<string | null> {
  const cfg = resolveProviderConfig('cursor', logger);
  if (!cfg) return null;
  const prompt = messagesToPrompt(messages);
  const extraModel = cfg.model ? ['--model', cfg.model] : [];
  const customCli = Boolean(process.env.CURSOR_CLI?.trim());
  const { command, prefixArgs } = resolveCursorCliInvocation();
  const args = [...prefixArgs, '-p', prompt, '--output-format', 'text', ...extraModel];
  const first = await spawnCursorCli(command, args, logger);
  if (first !== null || customCli || command !== 'agent') return first;
  return spawnCursorCli('cursor', ['agent', '-p', prompt, '--output-format', 'text', ...extraModel], logger);
}

/**
 * Calls an OpenAI-compatible chat-completions endpoint.
 *
 * @param messages System and user messages sent to the model.
 * @param logger Optional diagnostic logger.
 * @returns Model text, or `null` when configuration or the request fails.
 */
async function callOpenAi(messages: ChatMessage[], logger?: AiLogger): Promise<string | null> {
  const cfg = resolveProviderConfig('openai', logger);
  if (!cfg?.apiUrl || !cfg.apiKey) return null;
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
  if (!cfg?.apiUrl || !cfg.apiKey) return null;
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
  if (!cfg?.apiUrl || !cfg.apiKey) return null;
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
    if (provider === 'cursor') return await callCursorCli(messages, logger);
    return await callGroq(messages, logger);
  } catch (error) {
    logger?.error('AI_PROVIDER', `Unhandled ${provider} client error`, {
      provider,
      message: toErrorMessage(error),
    });
    return null;
  }
}
