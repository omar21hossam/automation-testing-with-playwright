/**
 * Public types used to configure and extend the smart locator library.
 */
import type { Page } from '@playwright/test';

/** A Playwright selector and a human-readable description used for healing. */
export type SmartTarget = {
  /** Selector passed to `page.locator()`. */
  locator: string;
  /** Description that tells the healer which element to find. */
  prompt: string;
};

/** Context supplied to a custom or built-in healing provider. */
export type HealingContext = {
  /** Playwright page on which the selector failed. */
  page: Page;
  /** Human-readable target description. */
  prompt: string;
  /** Selector that did not resolve to a visible element. */
  failedSelector: string;
  /** Truncated accessibility tree or HTML excerpt. */
  domSummary: string;
};

/** Function that proposes a replacement selector after a locator fails. */
export type HealProvider = (context: HealingContext) => Promise<string | null>;

/** Logging contract accepted by `SmartLocator`. Every method is optional in options. */
export type SmartLocatorLogger = {
  debug: (category: string, message: string, details?: unknown) => void;
  info: (category: string, message: string, details?: unknown) => void;
  warn: (category: string, message: string, details?: unknown) => void;
  error: (category: string, message: string, details?: unknown) => void;
  action: (action: string, target: string, details?: unknown) => void;
  assertion: (assertion: string, expected: unknown, actual?: unknown) => void;
  locatorResolved: (primary: string, fallback: string, success: boolean) => void;
  locatorFailed: (selectors: string[]) => void;
};

/** Supported built-in LLM providers. */
export type AiProvider = 'openai' | 'gemini' | 'groq' | 'cursor';

/** Resolved credentials and endpoint for a built-in LLM provider. */
export type ProviderConfig = {
  provider: AiProvider;
  model: string;
  /** HTTP endpoint; omitted for the Cursor CLI provider. */
  apiUrl?: string;
  /** HTTP API key; omitted for the Cursor CLI provider. */
  apiKey?: string;
};

/** Values accepted in `smart-locator.config.json`. */
export type SmartLocatorFileJson = {
  heal?: boolean;
  useBuiltinAi?: boolean;
  persistToLocatorFiles?: boolean;
  locatorFilesDir?: string;
  resolveVisibleTimeoutMs?: number;
  maxDomChars?: number;
  healWaitTimeoutMs?: number;
  healMaxCandidates?: number;
  healRetryTimeoutMs?: number;
};

/** Runtime settings for `SmartLocator`. Explicit options override file and environment values. */
export type SmartLocatorOptions = {
  /** Enables healing after the original selector fails. */
  heal?: boolean;
  /** Uses the environment-configured LLM when no custom provider is supplied. */
  useBuiltinAi?: boolean;
  /** Custom selector healing function. */
  healProvider?: HealProvider;
  /** Optional structured logger. Missing methods become no-ops. */
  logger?: Partial<SmartLocatorLogger>;
  /** Writes successful healed selectors back to locator TypeScript files. */
  persistToLocatorFiles?: boolean;
  /** Directory containing locator TypeScript files. */
  locatorFilesDir?: string;
  /** Custom persistence hook. Return `true` to skip built-in file persistence. */
  persistHealedSelector?: (context: {
    failedSelector: string;
    prompt: string;
    healedSelector: string;
    target: SmartTarget;
    page: Page;
  }) => Promise<boolean | void>;
  /** Time allowed for the original selector to become visible. */
  resolveVisibleTimeoutMs?: number;
  /** Maximum DOM summary length sent to the healer. */
  maxDomChars?: number;
  /** Maximum time allowed for the healing provider to respond. */
  healWaitTimeoutMs?: number;
  /** Maximum number of healed selector candidates to try. */
  healMaxCandidates?: number;
  /** Visibility timeout for each healed candidate. */
  healRetryTimeoutMs?: number;
};

/** Chat message accepted by the built-in provider clients. */
export type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};
