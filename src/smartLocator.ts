/**
 * Smart Playwright locator facade, built-in LLM healer, and configuration loader.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';
import { callAiProvider } from './ai/aiClients';
import { resolveAiProvider } from './ai/aiConfig';
import { LocatorFilePersister } from './healer/locatorFilePersister';
import {
  buildCandidateChain,
  isLikelyValidSelector,
  normalizeSelector,
  parseSelectorFromModelText,
} from './healer/selectorOps';
import { createLogger } from './logger';
import type {
  HealProvider,
  HealingContext,
  SmartLocatorFileJson,
  SmartLocatorLogger,
  SmartLocatorOptions,
  SmartTarget,
} from './types';

const DEFAULT_CONFIG_FILE = 'smart-locator.config.json';

/**
 * Reads a positive integer while preserving a safe fallback for invalid input.
 *
 * @param raw Candidate integer text.
 * @param fallback Value returned when the candidate is absent or invalid.
 * @returns A positive integer.
 */
function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Reads a permissive boolean environment variable.
 *
 * @param name Environment variable name.
 * @param fallback Value used when the variable is absent.
 * @returns `false` for `false` or `0`; otherwise `true`.
 */
function envBool(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.toLowerCase();
  if (value === undefined) return fallback;
  return value !== 'false' && value !== '0';
}

/**
 * Determines the default healing state from `SMART_LOCATOR_HEAL`.
 *
 * @returns Whether healing is enabled.
 */
function envHealEnabled(): boolean {
  return envBool('SMART_LOCATOR_HEAL', true);
}

/**
 * Loads library settings from JSON and environment variables.
 *
 * Precedence is: explicit overrides, environment variables, config file,
 * defaults. `SMART_LOCATOR_CONFIG_PATH` selects a non-default JSON file.
 *
 * @param overrides Options supplied directly by the consumer.
 * @returns Fully resolved smart-locator options.
 */
export function loadSmartLocatorConfig(
  overrides?: Partial<SmartLocatorOptions>,
): SmartLocatorOptions {
  const configuredPath = process.env.SMART_LOCATOR_CONFIG_PATH?.trim();
  const configPath = path.resolve(process.cwd(), configuredPath || DEFAULT_CONFIG_FILE);
  let file: SmartLocatorFileJson = {};

  if (existsSync(configPath)) {
    try {
      file = JSON.parse(readFileSync(configPath, 'utf8')) as SmartLocatorFileJson;
    } catch (error) {
      console.warn(
        '[smart-locator] Unable to read config:',
        configPath,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const locatorFilesDir =
    process.env.SMART_LOCATOR_LOCATOR_FILES_DIR?.trim() ||
    file.locatorFilesDir ||
    'tests/locators';
  const options: SmartLocatorOptions = {
    heal:
      process.env.SMART_LOCATOR_HEAL === undefined
        ? file.heal ?? true
        : envBool('SMART_LOCATOR_HEAL', true),
    useBuiltinAi:
      process.env.SMART_LOCATOR_USE_BUILTIN_AI === undefined
        ? file.useBuiltinAi ?? true
        : envBool('SMART_LOCATOR_USE_BUILTIN_AI', true),
    persistToLocatorFiles:
      process.env.SMART_LOCATOR_PERSIST_FILES === undefined
        ? file.persistToLocatorFiles ?? true
        : envBool('SMART_LOCATOR_PERSIST_FILES', true),
    locatorFilesDir: path.isAbsolute(locatorFilesDir)
      ? locatorFilesDir
      : path.resolve(process.cwd(), locatorFilesDir),
    resolveVisibleTimeoutMs: readPositiveInt(
      process.env.SMART_LOCATOR_RESOLVE_VISIBLE_TIMEOUT_MS,
      file.resolveVisibleTimeoutMs ?? 2000,
    ),
    maxDomChars: readPositiveInt(
      process.env.SMART_LOCATOR_HEAL_MAX_DOM_CHARS,
      file.maxDomChars ?? 14000,
    ),
    healWaitTimeoutMs: readPositiveInt(
      process.env.SMART_LOCATOR_HEAL_WAIT_TIMEOUT_MS,
      file.healWaitTimeoutMs ?? 8000,
    ),
    healMaxCandidates: readPositiveInt(
      process.env.SMART_LOCATOR_HEAL_MAX_CANDIDATES,
      file.healMaxCandidates ?? 3,
    ),
    healRetryTimeoutMs: readPositiveInt(
      process.env.SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS,
      file.healRetryTimeoutMs ?? 3000,
    ),
  };
  return { ...options, ...overrides };
}

/**
 * Captures a compact accessibility tree, falling back to a body HTML excerpt.
 *
 * @param page Current Playwright page.
 * @param maxChars Maximum returned string length.
 * @returns Truncated page context suitable for an LLM prompt.
 */
async function captureDomSummary(page: Page, maxChars: number): Promise<string> {
  try {
    const accessibility = await page.accessibility.snapshot({ interestingOnly: true });
    const snapshot = accessibility ? JSON.stringify(accessibility, null, 2) : '';
    if (snapshot.length >= 200) {
      return snapshot.length > maxChars
        ? `${snapshot.slice(0, maxChars)}\n…[truncated]`
        : snapshot;
    }
  } catch {
    // Some browser/page states do not expose an accessibility snapshot.
  }

  const html = await page.evaluate(() => document.body?.innerHTML.slice(0, 8000) ?? '');
  const summary = `[${html ? 'body.innerHTML (excerpt)' : 'empty'}]\n${html}`;
  return summary.length > maxChars ? `${summary.slice(0, maxChars)}\n…[truncated]` : summary;
}

/**
 * Built-in healer that asks the environment-selected LLM for one selector.
 */
export class LlmHealAgent {
  /**
   * Creates an LLM healer.
   *
   * @param logger Optional structured logger.
   */
  constructor(private readonly logger: SmartLocatorLogger = createLogger()) {}

  /**
   * Requests, parses, and validates a replacement selector.
   *
   * @param context Failed selector plus current DOM context.
   * @returns Normalized selector, or `null` when healing fails.
   */
  async propose(context: HealingContext): Promise<string | null> {
    const provider = resolveAiProvider(this.logger);
    const system = [
      'You are a senior QA automation engineer using Playwright.',
      'Given the page accessibility/DOM excerpt and a failed selector, reply with ONLY:',
      '{"selector":"<one valid Playwright selector>"}',
      'Return a selector compatible with page.locator(selector).',
      'Do not return JavaScript, markdown, or commentary.',
      'The selector must uniquely identify the element described by the prompt.',
    ].join('\n');
    const user = [
      `Prompt: ${context.prompt}`,
      `Failed selector: ${context.failedSelector}`,
      'Page snapshot:',
      context.domSummary,
    ].join('\n\n');
    const content = await callAiProvider(
      provider,
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      this.logger,
    );
    if (!content) return null;
    const parsed = parseSelectorFromModelText(content);
    if (!parsed) return null;
    const normalized = normalizeSelector(parsed);
    if (!isLikelyValidSelector(normalized)) {
      this.logger.warn('LOCATOR', 'Healer returned non-locator syntax', {
        raw: parsed,
        normalized,
      });
      return null;
    }
    return normalized;
  }
}

/**
 * Wraps common Playwright actions with visibility checks and optional healing.
 */
export class SmartLocator {
  private readonly options: Required<
    Pick<
      SmartLocatorOptions,
      | 'maxDomChars'
      | 'healWaitTimeoutMs'
      | 'healMaxCandidates'
      | 'healRetryTimeoutMs'
      | 'resolveVisibleTimeoutMs'
      | 'locatorFilesDir'
      | 'useBuiltinAi'
      | 'persistToLocatorFiles'
    >
  > &
    SmartLocatorOptions;
  private readonly logger: SmartLocatorLogger;
  private readonly persister: LocatorFilePersister;
  private llmAgent: LlmHealAgent | null = null;

  /**
   * Creates a smart locator bound to one Playwright page.
   *
   * @param page Page on which actions will run.
   * @param options Resolved or direct library options.
   */
  constructor(
    private readonly page: Page,
    options: SmartLocatorOptions = {},
  ) {
    this.logger = createLogger(options.logger);
    this.options = {
      ...options,
      useBuiltinAi: options.useBuiltinAi ?? true,
      persistToLocatorFiles: options.persistToLocatorFiles ?? true,
      locatorFilesDir: options.locatorFilesDir ?? path.resolve(process.cwd(), 'tests/locators'),
      resolveVisibleTimeoutMs: options.resolveVisibleTimeoutMs ?? 2000,
      maxDomChars: options.maxDomChars ?? 14000,
      healWaitTimeoutMs: options.healWaitTimeoutMs ?? 8000,
      healMaxCandidates: options.healMaxCandidates ?? 3,
      healRetryTimeoutMs: options.healRetryTimeoutMs ?? 3000,
    };
    this.persister = new LocatorFilePersister(this.logger);
  }

  /**
   * Selects the custom provider or lazily creates the built-in LLM provider.
   *
   * @returns Effective healing provider, if configured.
   */
  private getHealProvider(): HealProvider | undefined {
    if (this.options.healProvider) return this.options.healProvider;
    if (!this.options.useBuiltinAi) return undefined;
    this.llmAgent ??= new LlmHealAgent(this.logger);
    return (context) => this.llmAgent!.propose(context);
  }

  /**
   * Determines whether this instance should heal failed selectors.
   *
   * @returns Effective healing state.
   */
  private healingEnabled(): boolean {
    if (this.options.heal !== undefined) return this.options.heal;
    if (this.options.healProvider) return true;
    return envHealEnabled();
  }

  /**
   * Runs a provider with the configured response timeout.
   *
   * @param provider Effective healing provider.
   * @param context Context sent to the provider.
   * @returns Proposed selector, or `null` after timeout.
   */
  private async requestHeal(
    provider: HealProvider,
    context: HealingContext,
  ): Promise<string | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        provider(context),
        new Promise<null>((resolve) => {
          timer = setTimeout(resolve, this.options.healWaitTimeoutMs, null);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Invokes healing and returns the first visible replacement candidate.
   *
   * @param failedSelector Selector that failed.
   * @param prompt Human-readable target description.
   * @returns Working locator and selector, or `null`.
   */
  private async healAndResolveLocator(
    failedSelector: string,
    prompt: string,
  ): Promise<{ locator: Locator; selector: string } | null> {
    if (!this.healingEnabled()) return null;
    const provider = this.getHealProvider();
    if (!provider) return null;
    const context: HealingContext = {
      page: this.page,
      prompt,
      failedSelector,
      domSummary: await captureDomSummary(this.page, this.options.maxDomChars),
    };

    let proposal: string | null;
    try {
      proposal = await this.requestHeal(provider, context);
    } catch (error) {
      this.logger.error('LOCATOR', 'Healing provider threw', {
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
    if (!proposal) return null;
    const normalized = normalizeSelector(proposal);
    if (!isLikelyValidSelector(normalized)) return null;

    const candidates = buildCandidateChain(normalized, prompt).slice(
      0,
      this.options.healMaxCandidates,
    );
    for (const selector of candidates) {
      const locator = this.page.locator(selector).first();
      try {
        await locator.waitFor({ state: 'visible', timeout: this.options.healRetryTimeoutMs });
        this.logger.locatorResolved(failedSelector, selector, true);
        return { locator, selector };
      } catch (error) {
        this.logger.warn('LOCATOR', 'Healed selector candidate failed', {
          selector,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return null;
  }

  /**
   * Resolves a visible locator and persists a successful replacement.
   *
   * @param target Mutable target whose locator may be updated after healing.
   * @returns Original or healed Playwright locator.
   */
  private async resolve(target: SmartTarget): Promise<Locator> {
    const original = this.page.locator(target.locator).first();
    try {
      await original.waitFor({
        state: 'visible',
        timeout: this.options.resolveVisibleTimeoutMs,
      });
      return original;
    } catch {
      this.logger.locatorFailed([target.locator]);
    }

    const failedSelector = target.locator;
    const healed = await this.healAndResolveLocator(failedSelector, target.prompt);
    if (!healed) return original;

    const customHandled = await this.options.persistHealedSelector?.({
      failedSelector,
      prompt: target.prompt,
      healedSelector: healed.selector,
      target,
      page: this.page,
    });
    if (!customHandled && this.options.persistToLocatorFiles) {
      await this.persister.persist(
        this.options.locatorFilesDir,
        failedSelector,
        target.prompt,
        healed.selector,
      );
    }
    target.locator = healed.selector;
    return healed.locator;
  }

  /**
   * Clicks a target after resolving or healing it.
   *
   * @param target Element selector and healing prompt.
   */
  async click(target: SmartTarget): Promise<void> {
    this.logger.action('CLICK', 'element', { target });
    await (await this.resolve(target)).click();
  }

  /**
   * Fills an input after resolving or healing it.
   *
   * @param target Input selector and healing prompt.
   * @param value Text to enter.
   */
  async fill(target: SmartTarget, value: string): Promise<void> {
    this.logger.action('FILL', 'input field', { target, value });
    await (await this.resolve(target)).fill(value);
  }

  /**
   * Selects an option after resolving or healing a select element.
   *
   * @param target Select selector and healing prompt.
   * @param value Option value or label accepted by Playwright.
   */
  async selectOption(target: SmartTarget, value: string): Promise<void> {
    this.logger.action('SELECT', 'dropdown', { target, value });
    await (await this.resolve(target)).selectOption(value);
  }

  /**
   * Uploads a file after resolving or healing a file input.
   *
   * @param target File-input selector and healing prompt.
   * @param filePath File path passed to Playwright.
   */
  async setInputFiles(target: SmartTarget, filePath: string): Promise<void> {
    this.logger.action('UPLOAD', 'file input', { target, filePath });
    await (await this.resolve(target)).setInputFiles(filePath);
  }

  /**
   * Asserts that a resolved or healed target is visible.
   *
   * @param target Element selector and healing prompt.
   */
  async expectVisible(target: SmartTarget): Promise<void> {
    await expect(await this.resolve(target)).toBeVisible();
  }

  /**
   * Asserts exact text on a resolved or healed target.
   *
   * @param target Element selector and healing prompt.
   * @param text Expected exact text.
   */
  async expectText(target: SmartTarget, text: string): Promise<void> {
    await expect(await this.resolve(target)).toHaveText(text);
  }

  /**
   * Asserts partial text on a resolved or healed target.
   *
   * @param target Element selector and healing prompt.
   * @param text Expected substring.
   */
  async expectContainText(target: SmartTarget, text: string): Promise<void> {
    await expect(await this.resolve(target)).toContainText(text);
  }
}

/**
 * Creates a page-bound smart locator using file, environment, and direct options.
 *
 * @param page Playwright page.
 * @param overrides Options that override environment and JSON configuration.
 * @returns Configured `SmartLocator` instance.
 */
export function createSmartLocator(
  page: Page,
  overrides?: Partial<SmartLocatorOptions>,
): SmartLocator {
  return new SmartLocator(page, loadSmartLocatorConfig(overrides));
}
