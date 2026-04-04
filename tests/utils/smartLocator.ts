import path from 'path';
import dotenv from 'dotenv';
import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

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
};

function envHealEnabled(): boolean {
  const v = process.env.SMART_LOCATOR_HEAL?.toLowerCase();
  if (v === 'false' || v === '0') return false;
  return true;
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
  return null;
}

async function defaultOpenAiHeal(ctx: HealingContext): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    logger.warn('LOCATOR', 'Healing skipped: OPENAI_API_KEY is not set');
    return null;
  }
  const url = process.env.OPENAI_API_URL ?? 'https://api.openai.com/v1/chat/completions';
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const system = [
    'You are a senior QA automation engineer using Playwright.',
    'Given the page accessibility/DOM excerpt and a failed selector, reply with ONLY a JSON object:',
    '{"selector":"<one valid Playwright selector>"}',
    'Rules:',
    '- Prefer role+name, text=, getByRole, css, or xpath= when needed.',
    '- The selector must match exactly one element that satisfies the user prompt.',
    '- No markdown, no commentary outside the JSON.',
  ].join('\n');

  const user = [
    `Prompt: ${ctx.prompt}`,
    `Failed selector: ${ctx.failedSelector}`,
    'Page snapshot:',
    ctx.domSummary,
  ].join('\n\n');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.error('LOCATOR', `Healing API error: ${res.status}`, { body: errText.slice(0, 500) });
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    logger.warn('LOCATOR', 'Healing API returned no content');
    return null;
  }
  return parseSelectorFromModelText(content);
}

export class SmartLocator {
  private readonly opts: Required<Pick<SmartLocatorOptions, 'maxDomChars' | 'healWaitTimeoutMs'>> &
    SmartLocatorOptions;

  constructor(
    private readonly page: Page,
    options: SmartLocatorOptions = {},
  ) {
    this.opts = {
      heal: options.heal,
      healProvider: options.healProvider,
      maxDomChars: options.maxDomChars ?? 14000,
      healWaitTimeoutMs: options.healWaitTimeoutMs ?? 8000,
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

    const usingBuiltin = !this.opts.healProvider;
    if (usingBuiltin && !process.env.OPENAI_API_KEY) {
      logger.debug('LOCATOR', 'Healing skipped: set OPENAI_API_KEY or pass healProvider');
      return null;
    }

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

    const provider = this.opts.healProvider ?? defaultOpenAiHeal;
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

    logger.info('LOCATOR', 'Healer proposed selector', { selector });

    const loc = this.page.locator(selector).first();
    try {
      await loc.waitFor({
        state: 'visible',
        timeout: this.opts.healWaitTimeoutMs ?? 8000,
      });
      logger.locatorResolved(failedSelector, selector, true);
      return loc;
    } catch (error) {
      logger.warn('LOCATOR', 'Healed selector did not become visible in time', {
        selector,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
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
