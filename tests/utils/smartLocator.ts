import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';

type Candidate = string | { selector: string; description?: string };
type HealingLocator = { primary: string; fallbacks: string[] };

export class SmartLocator {
  constructor(private readonly page: Page) {}

  private async resolve(candidates: Candidate[] | HealingLocator): Promise<Locator> {
    let selectors: string[];
    let isHealingLocator = false;
    
    if (Array.isArray(candidates)) {
      selectors = candidates.map(c => typeof c === 'string' ? c : c.selector);
    } else {
      // Handle healing locator structure
      isHealingLocator = true;
      selectors = [candidates.primary, ...candidates.fallbacks];
    }

    logger.debug('LOCATOR', `Resolving locator with ${selectors.length} candidates`, { 
      isHealingLocator, 
      selectors: isHealingLocator ? { primary: selectors[0], fallbacks: selectors.slice(1) } : selectors 
    });

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const loc = this.page.locator(selector);
      
      try {
        logger.debug('LOCATOR', `Trying selector ${i + 1}/${selectors.length}`, { selector });
        await loc.first().waitFor({ state: 'visible', timeout: 2000 });
        
        if (i === 0) {
          logger.locatorResolved(selector, '', true);
        } else {
          logger.locatorResolved(selectors[0], selector, true);
        }
        
        return loc.first();
      } catch (error) {
        logger.debug('LOCATOR', `Selector ${i + 1} failed`, { selector, error: error.message });
        if (i === selectors.length - 1) {
          logger.locatorFailed(selectors);
        }
      }
    }
    
    // fallback to first candidate without wait to throw helpful error
    logger.warn('LOCATOR', `All selectors failed, using first as fallback`, { selectors });
    return this.page.locator(selectors[0]).first();
  }

  async click(candidates: Candidate[] | HealingLocator) {
    logger.action('CLICK', 'element', { candidates });
    const loc = await this.resolve(candidates);
    await loc.click();
    logger.action('CLICK', 'element', { status: 'success' });
  }

  async fill(candidates: Candidate[] | HealingLocator, value: string) {
    logger.action('FILL', 'input field', { candidates, value });
    const loc = await this.resolve(candidates);
    await loc.fill(value);
    logger.action('FILL', 'input field', { status: 'success', value });
  }

  async selectOption(candidates: Candidate[] | HealingLocator, value: string) {
    logger.action('SELECT', 'dropdown', { candidates, value });
    const loc = await this.resolve(candidates);
    await loc.selectOption(value);
    logger.action('SELECT', 'dropdown', { status: 'success', value });
  }

  async setInputFiles(candidates: Candidate[] | HealingLocator, filePath: string) {
    logger.action('UPLOAD', 'file input', { candidates, filePath });
    const loc = await this.resolve(candidates);
    await loc.setInputFiles(filePath);
    logger.action('UPLOAD', 'file input', { status: 'success', filePath });
  }

  async expectVisible(candidates: Candidate[] | HealingLocator) {
    logger.assertion('VISIBLE', 'element should be visible', { candidates });
    const loc = await this.resolve(candidates);
    await expect(loc).toBeVisible();
    logger.assertion('VISIBLE', 'element is visible', { status: 'success' });
  }

  async expectText(candidates: Candidate[] | HealingLocator, text: string) {
    logger.assertion('TEXT', `element should have text: "${text}"`, { candidates, expected: text });
    const loc = await this.resolve(candidates);
    await expect(loc).toHaveText(text);
    logger.assertion('TEXT', `element has correct text: "${text}"`, { status: 'success' });
  }

  async expectContainText(candidates: Candidate[] | HealingLocator, text: string) {
    logger.assertion('CONTAINS_TEXT', `element should contain text: "${text}"`, { candidates, expected: text });
    const loc = await this.resolve(candidates);
    await expect(loc).toContainText(text);
    logger.assertion('CONTAINS_TEXT', `element contains text: "${text}"`, { status: 'success' });
  }
}


