import { Page, Locator, expect } from '@playwright/test';
import { existsSync, readFileSync, promises as fs } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { callAiProvider } from './aiClients';
import { resolveAiProvider } from './aiConfig';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

// ——— Types ————————————————————————————————————————————————————————————————

/** Single Playwright selector plus an LLM prompt used if that selector fails */
export type SmartTarget = {
  locator: string;
  /** Describes the element for the DOM healer when `locator` does not match */
  prompt: string;
};

export type HealProvider = (ctx: HealingContext) => Promise<string | null>;

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

export type HealingContext = {
  page: Page;
  prompt: string;
  failedSelector: string;
  domSummary: string;
};

/** Shape of `smart-locator.config.json` (optional file at project root). */
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

export type SmartLocatorOptions = {
  heal?: boolean;
  /** When true (default), uses LLM from env if `healProvider` is not set. */
  useBuiltinAi?: boolean;
  healProvider?: HealProvider;
  logger?: Partial<SmartLocatorLogger>;
  persistToLocatorFiles?: boolean;
  locatorFilesDir?: string;
  persistHealedSelector?: (ctx: {
    failedSelector: string;
    prompt: string;
    healedSelector: string;
    target: SmartTarget;
    page: Page;
  }) => Promise<boolean | void>;
  resolveVisibleTimeoutMs?: number;
  maxDomChars?: number;
  healWaitTimeoutMs?: number;
  healMaxCandidates?: number;
  healRetryTimeoutMs?: number;
};

// ——— Selector parsing (used by resolver + LLM output) ——————————————————————

namespace SelectorOps {
  export function parseFromModelText(text: string): string | null {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1].trim() : text.trim();
    const tryParse = (s: string): string | null => {
      try {
        const o = JSON.parse(s) as { selector?: string };
        if (typeof o.selector === 'string' && o.selector.trim()) return o.selector.trim();
      } catch {
        /* ignore */
      }
      return null;
    };
    const direct = tryParse(raw);
    if (direct) return direct;
    const objMatch = raw.match(/\{[\s\S]*"selector"[\s\S]*\}/);
    if (objMatch) return tryParse(objMatch[0]);
    if (raw && !raw.includes('{') && !raw.includes('}')) return raw.trim();
    return null;
  }

  export function normalize(selector: string): string {
    let s = selector.trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    const locatorWrap = s.match(/^(?:page\.)?locator\((['"])([\s\S]+)\1\)$/);
    if (locatorWrap) s = locatorWrap[2].trim();
    const getByRole = s.match(
      /^(?:page\.)?getByRole\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*name\s*:\s*['"]([^'"]+)['"]\s*\}\s*\)$/,
    );
    if (getByRole) {
      const role = getByRole[1];
      const name = getByRole[2].replace(/"/g, '\\"');
      return `role=${role}[name="${name}"]`;
    }
    const getByText = s.match(/^(?:page\.)?getByText\(\s*['"]([\s\S]+)['"]\s*\)$/);
    if (getByText) return `text=${getByText[1]}`;
    return s;
  }

  export function isLikelyValid(selector: string): boolean {
    if (/[{};]/.test(selector) && !selector.startsWith('xpath=')) return false;
    if (selector.startsWith('getBy') || selector.startsWith('page.')) return false;
    return selector.length > 0;
  }

  export function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function accessibleName(selector: string): string | null {
    const m = selector.match(/\[name="([^"]+)"\]/);
    return m?.[1] ?? null;
  }

  export function buildCandidateChain(primary: string, prompt: string): string[] {
    const out: string[] = [];
    const add = (s: string | null | undefined) => {
      const v = s?.trim();
      if (!v || out.includes(v)) return;
      out.push(v);
    };

    add(primary);
    if (primary.startsWith('role=text')) {
      const name = accessibleName(primary);
      if (name) add(`text=${name}`);
    }
    const roleName = accessibleName(primary);
    if (roleName) add(`text=${roleName}`);
    const quotedPrompt = prompt.match(/"([^"]{3,80})"/)?.[1];
    if (quotedPrompt) add(`text=${quotedPrompt}`);

    return out;
  }
}

// ——— LLM heal agent (strategy: one proposal → candidate chain → first match) —

class LlmHealAgent {
  constructor(private readonly log: SmartLocatorLogger) {}

  async propose(ctx: HealingContext): Promise<string | null> {
    const provider = resolveAiProvider();
    const system = [
      'You are a senior QA automation engineer using Playwright.',
      'Given the page accessibility/DOM excerpt and a failed selector, reply with ONLY a JSON object:',
      '{"selector":"<one valid Playwright selector>"}',
      'Rules:',
      '- Return a selector STRING compatible with page.locator(selector).',
      '- Valid styles include: text=..., role=button[name="..."], css=..., xpath=..., #id, .class.',
      '- DO NOT return Playwright code expressions (no getByRole(...), no page.locator(...), no JS).',
      '- The selector must match exactly one element that satisfies the user prompt.',
      '- No markdown, no commentary outside the JSON.',
    ].join('\n');

    const user = [
      `Prompt: ${ctx.prompt}`,
      `Failed selector: ${ctx.failedSelector}`,
      'Page snapshot:',
      ctx.domSummary,
    ].join('\n\n');

    const content = await callAiProvider(provider, [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);
    if (!content) {
      this.log.warn('LOCATOR', `Healing API returned no content (${provider})`);
      return null;
    }
    const parsed = SelectorOps.parseFromModelText(content);
    if (!parsed) return null;
    const normalized = SelectorOps.normalize(parsed);
    if (!SelectorOps.isLikelyValid(normalized)) {
      this.log.warn('LOCATOR', 'Healer returned non-locator syntax', { raw: parsed, normalized });
      return null;
    }
    return normalized;
  }
}

// ——— File persistence for healed locators ————————————————————————————————————

class LocatorFilePersister {
  constructor(private readonly log: SmartLocatorLogger) {}

  async persist(
    locatorsDir: string,
    failedSelector: string,
    prompt: string,
    healedSelector: string,
  ): Promise<void> {
    if (!failedSelector || !prompt || !healedSelector || failedSelector === healedSelector) return;

    let files: string[] = [];
    try {
      files = await fs.readdir(locatorsDir);
    } catch (error) {
      this.log.warn('LOCATOR', 'Unable to read locator directory for persistence', {
        directory: locatorsDir,
        message: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    const tsFiles = files.filter((f) => f.endsWith('.ts'));
    const escapedFailed = SelectorOps.escapeRegExp(failedSelector);
    const escapedPrompt = SelectorOps.escapeRegExp(prompt);
    const pattern = new RegExp(
      `(locator\\s*:\\s*['"])${escapedFailed}(['"]\\s*,\\s*[\\r\\n]+\\s*prompt\\s*:\\s*['"])${escapedPrompt}(['"])`,
      'm',
    );

    for (const file of tsFiles) {
      const filePath = path.join(locatorsDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (!pattern.test(content)) continue;
        const updated = content.replace(
          pattern,
          (_m, a: string, b: string, c: string) => `${a}${healedSelector}${b}${prompt}${c}`,
        );
        if (updated === content) continue;
        await fs.writeFile(filePath, updated, 'utf8');
        this.log.info('LOCATOR', 'Persisted healed locator in locator file', {
          file: filePath,
          from: failedSelector,
          to: healedSelector,
        });
        return;
      } catch (error) {
        this.log.warn('LOCATOR', 'Failed persisting healed locator in file', {
          file: filePath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.log.warn('LOCATOR', 'No matching locator entry found to persist healed selector', {
      failedSelector,
      prompt: prompt.slice(0, 200),
    });
  }
}

// ——— Config: JSON + env —————————————————————————————————————————————————————

const DEFAULT_JSON = 'smart-locator.config.json';

function readPositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const v = process.env[name]?.toLowerCase();
  if (v === undefined) return fallback;
  if (v === 'false' || v === '0') return false;
  return true;
}

function envHealEnabled(): boolean {
  const v = process.env.SMART_LOCATOR_HEAL?.toLowerCase();
  if (v === 'false' || v === '0') return false;
  return true;
}

function readPositiveIntEnv(name: string, fallback: number): number {
  return readPositiveInt(process.env[name], fallback);
}

/**
 * Load options from `smart-locator.config.json` + env.
 * Env wins. `SMART_LOCATOR_CONFIG_PATH` overrides JSON path.
 */
export function loadSmartLocatorConfig(overrides?: Partial<SmartLocatorOptions>): SmartLocatorOptions {
  const configPath = process.env.SMART_LOCATOR_CONFIG_PATH?.trim()
    ? path.resolve(process.cwd(), process.env.SMART_LOCATOR_CONFIG_PATH!.trim())
    : path.resolve(process.cwd(), DEFAULT_JSON);

  let file: SmartLocatorFileJson | null = null;
  if (existsSync(configPath)) {
    try {
      file = JSON.parse(readFileSync(configPath, 'utf8')) as SmartLocatorFileJson;
    } catch (e) {
      console.warn(
        '[smart-locator] Failed to read config JSON:',
        configPath,
        e instanceof Error ? e.message : e,
      );
    }
  }

  const f = file ?? {};
  const heal =
    process.env.SMART_LOCATOR_HEAL !== undefined ? envBool('SMART_LOCATOR_HEAL', true) : f.heal ?? true;

  const useBuiltinAi =
    process.env.SMART_LOCATOR_USE_BUILTIN_AI !== undefined
      ? envBool('SMART_LOCATOR_USE_BUILTIN_AI', true)
      : f.useBuiltinAi ?? true;

  const persistToLocatorFiles =
    process.env.SMART_LOCATOR_PERSIST_FILES !== undefined
      ? envBool('SMART_LOCATOR_PERSIST_FILES', true)
      : f.persistToLocatorFiles ?? true;

  let locatorFilesDir = f.locatorFilesDir ?? 'tests/locators';
  if (process.env.SMART_LOCATOR_LOCATOR_FILES_DIR?.trim()) {
    locatorFilesDir = process.env.SMART_LOCATOR_LOCATOR_FILES_DIR.trim();
  }

  const base: SmartLocatorOptions = {
    heal,
    useBuiltinAi,
    persistToLocatorFiles,
    locatorFilesDir: path.isAbsolute(locatorFilesDir)
      ? locatorFilesDir
      : path.resolve(process.cwd(), locatorFilesDir),
    resolveVisibleTimeoutMs: readPositiveInt(
      process.env.SMART_LOCATOR_RESOLVE_VISIBLE_TIMEOUT_MS,
      f.resolveVisibleTimeoutMs ?? 2000,
    ),
    maxDomChars: readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_DOM_CHARS', f.maxDomChars ?? 14000),
    healWaitTimeoutMs: readPositiveInt(
      process.env.SMART_LOCATOR_HEAL_WAIT_TIMEOUT_MS,
      f.healWaitTimeoutMs ?? 8000,
    ),
    healMaxCandidates: readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_CANDIDATES', f.healMaxCandidates ?? 3),
    healRetryTimeoutMs: readPositiveIntEnv(
      'SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS',
      f.healRetryTimeoutMs ?? 3000,
    ),
  };

  return { ...base, ...overrides };
}

/** One-liner: config file + env + optional overrides. */
export function createSmartLocator(page: Page, overrides?: Partial<SmartLocatorOptions>): SmartLocator {
  return new SmartLocator(page, loadSmartLocatorConfig(overrides));
}

// ——— Main facade —————————————————————————————————————————————————————————————

const noopLogger: SmartLocatorLogger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  action: () => undefined,
  assertion: () => undefined,
  locatorResolved: () => undefined,
  locatorFailed: () => undefined,
};

async function captureDomSummary(page: Page, maxChars: number): Promise<string> {
  try {
    const ax = await page.accessibility.snapshot({ interestingOnly: true });
    const s = ax ? JSON.stringify(ax, null, 2) : '';
    if (s.length >= 200) {
      return s.length > maxChars ? `${s.slice(0, maxChars)}\n…[truncated]` : s;
    }
  } catch {
    /* HTML fallback */
  }
  const excerpt = await page.evaluate(() => {
    const root = document.body;
    if (!root) return '';
    return root.innerHTML.slice(0, 8000);
  });
  const label = excerpt ? 'body.innerHTML (excerpt)' : 'empty';
  const combined = `[${label}]\n${excerpt}`;
  return combined.length > maxChars ? `${combined.slice(0, maxChars)}\n…[truncated]` : combined;
}

export class SmartLocator {
  private readonly opts: Required<
    Pick<
      SmartLocatorOptions,
      | 'maxDomChars'
      | 'healWaitTimeoutMs'
      | 'healMaxCandidates'
      | 'healRetryTimeoutMs'
      | 'resolveVisibleTimeoutMs'
      | 'locatorFilesDir'
      | 'useBuiltinAi'
    >
  > &
    SmartLocatorOptions;

  private readonly logger: SmartLocatorLogger;
  private readonly persister: LocatorFilePersister;
  private llmAgent: LlmHealAgent | null = null;

  constructor(
    private readonly page: Page,
    options: SmartLocatorOptions = {},
  ) {
    const resolveVisibleTimeoutMs =
      options.resolveVisibleTimeoutMs ?? readPositiveIntEnv('SMART_LOCATOR_RESOLVE_VISIBLE_TIMEOUT_MS', 2000);

    this.opts = {
      heal: options.heal,
      useBuiltinAi: options.useBuiltinAi ?? true,
      healProvider: options.healProvider,
      logger: options.logger,
      persistToLocatorFiles: options.persistToLocatorFiles ?? true,
      locatorFilesDir: options.locatorFilesDir ?? path.resolve(process.cwd(), 'tests', 'locators'),
      persistHealedSelector: options.persistHealedSelector,
      resolveVisibleTimeoutMs,
      maxDomChars: options.maxDomChars ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_DOM_CHARS', 14000),
      healWaitTimeoutMs: options.healWaitTimeoutMs ?? 8000,
      healMaxCandidates:
        options.healMaxCandidates ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_CANDIDATES', 3),
      healRetryTimeoutMs:
        options.healRetryTimeoutMs ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS', 3000),
    };
    this.logger = { ...noopLogger, ...options.logger };
    this.persister = new LocatorFilePersister(this.logger);
  }

  /** Effective heal provider: explicit `healProvider`, else built-in LLM when `useBuiltinAi`. */
  private getHealProvider(): HealProvider | undefined {
    if (this.opts.healProvider) return this.opts.healProvider;
    if (this.opts.useBuiltinAi === false) return undefined;
    this.llmAgent ??= new LlmHealAgent(this.logger);
    return (ctx) => this.llmAgent!.propose(ctx);
  }

  private healingEnabled(): boolean {
    if (this.opts.heal === false) return false;
    if (this.opts.heal === true) return true;
    if (this.opts.healProvider) return true;
    return envHealEnabled();
  }

  private async healAndResolveLocator(
    failedSelector: string,
    prompt: string,
  ): Promise<{ locator: Locator; selector: string } | null> {
    if (!this.healingEnabled()) return null;

    const provider = this.getHealProvider();
    if (!provider) {
      this.logger.warn('LOCATOR', 'Healing enabled but no heal provider (set healProvider or useBuiltinAi)');
      return null;
    }

    const maxChars = this.opts.maxDomChars;
    const domSummary = await captureDomSummary(this.page, maxChars);
    const ctx: HealingContext = {
      page: this.page,
      prompt,
      failedSelector,
      domSummary,
    };

    this.logger.info('LOCATOR', 'Invoking DOM healer after locator failed', {
      prompt: prompt.slice(0, 200),
      failedSelector,
    });

    let primary: string | null = null;
    try {
      primary = await provider(ctx);
    } catch (e) {
      this.logger.error('LOCATOR', 'Healing provider threw', {
        message: e instanceof Error ? e.message : String(e),
      });
      return null;
    }

    if (!primary) {
      this.logger.warn('LOCATOR', 'Healer returned no selector');
      return null;
    }

    const normalized = SelectorOps.normalize(primary);
    if (!SelectorOps.isLikelyValid(normalized)) {
      this.logger.warn('LOCATOR', 'Healer returned non-locator syntax', { raw: primary, normalized });
      return null;
    }

    const chain = SelectorOps.buildCandidateChain(normalized, prompt);
    const candidates = chain.slice(0, this.opts.healMaxCandidates);
    this.logger.info('LOCATOR', 'Healer proposed selector candidates', {
      primary: normalized,
      candidates,
      truncated: chain.length > candidates.length,
    });

    for (const candidate of candidates) {
      const loc = this.page.locator(candidate).first();
      try {
        await loc.waitFor({ state: 'visible', timeout: this.opts.healRetryTimeoutMs });
        this.logger.locatorResolved(failedSelector, candidate, true);
        return { locator: loc, selector: candidate };
      } catch (error) {
        this.logger.warn('LOCATOR', 'Healed selector candidate failed', {
          selector: candidate,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return null;
  }

  private async resolve(target: SmartTarget): Promise<Locator> {
    const { locator, prompt } = target;
    this.logger.debug('LOCATOR', 'Resolving locator', { locator });

    const loc = this.page.locator(locator).first();
    try {
      await loc.waitFor({ state: 'visible', timeout: this.opts.resolveVisibleTimeoutMs });
      this.logger.locatorResolved(locator, '', true);
      return loc;
    } catch {
      this.logger.debug('LOCATOR', 'Locator failed', { locator });
      this.logger.locatorFailed([locator]);

      const healed = await this.healAndResolveLocator(locator, prompt);
      if (healed) {
        if (target.locator !== healed.selector) {
          this.logger.info('LOCATOR', 'Replacing failed locator with healed locator', {
            from: target.locator,
            to: healed.selector,
          });
          const fromSelector = target.locator;
          const persistedByCustom = await this.opts.persistHealedSelector?.({
            failedSelector: fromSelector,
            prompt: target.prompt,
            healedSelector: healed.selector,
            target,
            page: this.page,
          });
          if (!persistedByCustom && this.opts.persistToLocatorFiles) {
            await this.persister.persist(this.opts.locatorFilesDir, fromSelector, target.prompt, healed.selector);
          }
          target.locator = healed.selector;
        }
        return healed.locator;
      }

      this.logger.warn('LOCATOR', 'Healing unavailable or failed; surfacing original locator error', {
        locator,
      });
      return this.page.locator(locator).first();
    }
  }

  async click(target: SmartTarget) {
    this.logger.action('CLICK', 'element', { target });
    const loc = await this.resolve(target);
    await loc.click();
    this.logger.action('CLICK', 'element', { status: 'success' });
  }

  async fill(target: SmartTarget, value: string) {
    this.logger.action('FILL', 'input field', { target, value });
    const loc = await this.resolve(target);
    await loc.fill(value);
    this.logger.action('FILL', 'input field', { status: 'success', value });
  }

  async selectOption(target: SmartTarget, value: string) {
    this.logger.action('SELECT', 'dropdown', { target, value });
    const loc = await this.resolve(target);
    await loc.selectOption(value);
    this.logger.action('SELECT', 'dropdown', { status: 'success', value });
  }

  async setInputFiles(target: SmartTarget, filePath: string) {
    this.logger.action('UPLOAD', 'file input', { target, filePath });
    const loc = await this.resolve(target);
    await loc.setInputFiles(filePath);
    this.logger.action('UPLOAD', 'file input', { status: 'success', filePath });
  }

  async expectVisible(target: SmartTarget) {
    this.logger.assertion('VISIBLE', 'element should be visible', { target });
    const loc = await this.resolve(target);
    await expect(loc).toBeVisible();
    this.logger.assertion('VISIBLE', 'element is visible', { status: 'success' });
  }

  async expectText(target: SmartTarget, text: string) {
    this.logger.assertion('TEXT', `element should have text: "${text}"`, { target, expected: text });
    const loc = await this.resolve(target);
    await expect(loc).toHaveText(text);
    this.logger.assertion('TEXT', `element has correct text: "${text}"`, { status: 'success' });
  }

  async expectContainText(target: SmartTarget, text: string) {
    this.logger.assertion('CONTAINS_TEXT', `element should contain text: "${text}"`, { target, expected: text });
    const loc = await this.resolve(target);
    await expect(loc).toContainText(text);
    this.logger.assertion('CONTAINS_TEXT', `element contains text: "${text}"`, { status: 'success' });
  }
}
