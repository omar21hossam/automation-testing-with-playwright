import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';
import { callAiProvider } from './aiClients';
import { resolveAiProvider } from './aiConfig';

/** Single Playwright selector plus an LLM prompt used if that selector fails */
export type SmartTarget = {
  locator: string;
  /** Describes the element for the DOM healer when `locator` does not match */
  prompt: string;
};

export type HealProvider = (ctx: HealingContext) => Promise<string | null>;

export type HealingContext = {
  page: Page;
  prompt: string;
  failedSelector: string;
  domSummary: string;
};

export type SmartLocatorOptions = {
  heal?: boolean;
  healProvider?: HealProvider;
  maxDomChars?: number;
  healWaitTimeoutMs?: number;
  healMaxCandidates?: number;
  healRetryTimeoutMs?: number;
};

function envHealEnabled(): boolean {
  const v = process.env.SMART_LOCATOR_HEAL?.toLowerCase();
  if (v === 'false' || v === '0') return false;
  return true;
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

async function captureDomSummary(page: Page, maxChars: number): Promise<string> {
  try {
    const ax = await page.accessibility.snapshot({ interestingOnly: true });
    const s = ax ? JSON.stringify(ax, null, 2) : '';
    if (s.length >= 200) {
      return s.length > maxChars ? `${s.slice(0, maxChars)}\n…[truncated]` : s;
    }
  } catch {
    // fall through to HTML excerpt
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

function parseSelectorFromModelText(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  const tryParse = (s: string): string | null => {
    try {
      const o = JSON.parse(s) as { selector?: string };
      if (typeof o.selector === 'string' && o.selector.trim()) {
        return o.selector.trim();
      }
    } catch {
      /* ignore */
    }
    return null;
  };
  const direct = tryParse(raw);
  if (direct) return direct;
  const objMatch = raw.match(/\{[\s\S]*"selector"[\s\S]*\}/);
  if (objMatch) return tryParse(objMatch[0]);
  // Fallback: if model returned a plain selector string.
  if (raw && !raw.includes('{') && !raw.includes('}')) {
    return raw.trim();
  }
  return null;
}

function normalizeSelector(selector: string): string {
  let s = selector.trim();
  // Strip wrapping quotes if model returns '"text=foo"'
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  // Unwrap locator('...') / page.locator('...')
  const locatorWrap = s.match(/^(?:page\.)?locator\((['"])([\s\S]+)\1\)$/);
  if (locatorWrap) {
    s = locatorWrap[2].trim();
  }
  // Convert getByRole('button', { name: 'Login' }) to role=button[name="Login"]
  const getByRole = s.match(
    /^(?:page\.)?getByRole\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*name\s*:\s*['"]([^'"]+)['"]\s*\}\s*\)$/,
  );
  if (getByRole) {
    const role = getByRole[1];
    const name = getByRole[2].replace(/"/g, '\\"');
    return `role=${role}[name="${name}"]`;
  }
  // Convert getByText('Signup / Login') to text=Signup / Login
  const getByText = s.match(/^(?:page\.)?getByText\(\s*['"]([\s\S]+)['"]\s*\)$/);
  if (getByText) {
    return `text=${getByText[1]}`;
  }
  return s;
}

function isSelectorSyntaxLikelyValid(selector: string): boolean {
  // Reject obvious code snippets instead of locator strings.
  if (/[{};]/.test(selector) && !selector.startsWith('xpath=')) return false;
  if (selector.startsWith('getBy') || selector.startsWith('page.')) return false;
  return selector.length > 0;
}

function extractAccessibleName(selector: string): string | null {
  const m = selector.match(/\[name="([^"]+)"\]/);
  return m?.[1] ?? null;
}

function buildHealedCandidates(selector: string, prompt: string): string[] {
  const out: string[] = [];
  const add = (s: string | null | undefined) => {
    const v = s?.trim();
    if (!v) return;
    if (!out.includes(v)) out.push(v);
  };

  add(selector);

  // If model guessed an invalid role like role=text[name="..."], try text-based fallback.
  if (selector.startsWith('role=text')) {
    const name = extractAccessibleName(selector);
    if (name) add(`text=${name}`);
  }

  // If selector contains a named role, text can still be a pragmatic backup.
  const roleName = extractAccessibleName(selector);
  if (roleName) add(`text=${roleName}`);

  // Use prompt as a weak fallback: quoted text usually contains human-visible anchor.
  const quotedPrompt = prompt.match(/"([^"]{3,80})"/)?.[1];
  if (quotedPrompt) add(`text=${quotedPrompt}`);

  return out;
}

async function defaultProviderHeal(ctx: HealingContext): Promise<string | null> {
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
    logger.warn('LOCATOR', `Healing API returned no content (${provider})`);
    return null;
  }
  const parsed = parseSelectorFromModelText(content);
  if (!parsed) return null;
  const normalized = normalizeSelector(parsed);
  if (!isSelectorSyntaxLikelyValid(normalized)) {
    logger.warn('LOCATOR', 'Healer returned non-locator syntax', {
      raw: parsed,
      normalized,
    });
    return null;
  }
  return normalized;
}

export class SmartLocator {
  private readonly opts: Required<
    Pick<
      SmartLocatorOptions,
      'maxDomChars' | 'healWaitTimeoutMs' | 'healMaxCandidates' | 'healRetryTimeoutMs'
    >
  > &
    SmartLocatorOptions;

  constructor(
    private readonly page: Page,
    options: SmartLocatorOptions = {},
  ) {
    this.opts = {
      heal: options.heal,
      healProvider: options.healProvider,
      maxDomChars: options.maxDomChars ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_DOM_CHARS', 14000),
      healWaitTimeoutMs: options.healWaitTimeoutMs ?? 8000,
      healMaxCandidates:
        options.healMaxCandidates ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_MAX_CANDIDATES', 3),
      healRetryTimeoutMs:
        options.healRetryTimeoutMs ?? readPositiveIntEnv('SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS', 3000),
    };
  }

  private healingEnabled(): boolean {
    if (this.opts.heal === false) return false;
    if (this.opts.heal === true) return true;
    if (this.opts.healProvider) return true;
    return envHealEnabled();
  }

  private async healAndResolveLocator(failedSelector: string, prompt: string): Promise<Locator | null> {
    if (!this.healingEnabled()) return null;

    const maxChars = this.opts.maxDomChars ?? 14000;
    const domSummary = await captureDomSummary(this.page, maxChars);
    const ctx: HealingContext = {
      page: this.page,
      prompt,
      failedSelector,
      domSummary,
    };

    logger.info('LOCATOR', 'Invoking DOM healer after locator failed', {
      prompt: prompt.slice(0, 200),
      failedSelector,
    });

    const provider = this.opts.healProvider ?? defaultProviderHeal;
    let selector: string | null = null;
    try {
      selector = await provider(ctx);
    } catch (e) {
      logger.error('LOCATOR', 'Healing provider threw', {
        message: e instanceof Error ? e.message : String(e),
      });
      return null;
    }

    if (!selector) {
      logger.warn('LOCATOR', 'Healer returned no selector');
      return null;
    }

    const allCandidates = buildHealedCandidates(selector, prompt);
    const candidates = allCandidates.slice(0, this.opts.healMaxCandidates);
    logger.info('LOCATOR', 'Healer proposed selector candidates', {
      primary: selector,
      candidates,
      truncated: allCandidates.length > candidates.length,
    });

    for (const candidate of candidates) {
      const loc = this.page.locator(candidate).first();
      try {
        await loc.waitFor({
          state: 'visible',
          timeout: this.opts.healRetryTimeoutMs,
        });
        logger.locatorResolved(failedSelector, candidate, true);
        return loc;
      } catch (error) {
        logger.warn('LOCATOR', 'Healed selector candidate failed', {
          selector: candidate,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return null;
  }

  private async resolve(target: SmartTarget): Promise<Locator> {
    const { locator, prompt } = target;
    logger.debug('LOCATOR', 'Resolving locator', { locator });

    const loc = this.page.locator(locator).first();
    try {
      await loc.waitFor({ state: 'visible', timeout: 2000 });
      logger.locatorResolved(locator, '', true);
      return loc;
    } catch (error) {
      logger.debug('LOCATOR', 'Locator failed', {
        locator,
        message: error instanceof Error ? error.message : String(error),
      });
      logger.locatorFailed([locator]);

      const healed = await this.healAndResolveLocator(locator, prompt);
      if (healed) {
        return healed;
      }

      logger.warn('LOCATOR', 'Healing unavailable or failed; surfacing original locator error', {
        locator,
      });
      return this.page.locator(locator).first();
    }
  }

  async click(target: SmartTarget) {
    logger.action('CLICK', 'element', { target });
    const loc = await this.resolve(target);
    await loc.click();
    logger.action('CLICK', 'element', { status: 'success' });
  }

  async fill(target: SmartTarget, value: string) {
    logger.action('FILL', 'input field', { target, value });
    const loc = await this.resolve(target);
    await loc.fill(value);
    logger.action('FILL', 'input field', { status: 'success', value });
  }

  async selectOption(target: SmartTarget, value: string) {
    logger.action('SELECT', 'dropdown', { target, value });
    const loc = await this.resolve(target);
    await loc.selectOption(value);
    logger.action('SELECT', 'dropdown', { status: 'success', value });
  }

  async setInputFiles(target: SmartTarget, filePath: string) {
    logger.action('UPLOAD', 'file input', { target, filePath });
    const loc = await this.resolve(target);
    await loc.setInputFiles(filePath);
    logger.action('UPLOAD', 'file input', { status: 'success', filePath });
  }

  async expectVisible(target: SmartTarget) {
    logger.assertion('VISIBLE', 'element should be visible', { target });
    const loc = await this.resolve(target);
    await expect(loc).toBeVisible();
    logger.assertion('VISIBLE', 'element is visible', { status: 'success' });
  }

  async expectText(target: SmartTarget, text: string) {
    logger.assertion('TEXT', `element should have text: "${text}"`, { target, expected: text });
    const loc = await this.resolve(target);
    await expect(loc).toHaveText(text);
    logger.assertion('TEXT', `element has correct text: "${text}"`, { status: 'success' });
  }

  async expectContainText(target: SmartTarget, text: string) {
    logger.assertion('CONTAINS_TEXT', `element should contain text: "${text}"`, { target, expected: text });
    const loc = await this.resolve(target);
    await expect(loc).toContainText(text);
    logger.assertion('CONTAINS_TEXT', `element contains text: "${text}"`, { status: 'success' });
  }
}
