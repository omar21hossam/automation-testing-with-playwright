/**
 * Source-file persistence for selectors that were successfully healed.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createLogger } from '../logger';
import type { SmartLocatorLogger } from '../types';
import { escapeRegExp } from './selectorOps';

/**
 * Writes working LLM-generated selectors back to matching locator definitions.
 *
 * Locator files must contain adjacent `locator` and `prompt` string properties.
 * This class intentionally performs a narrow replacement instead of rewriting
 * the consumer's full TypeScript source.
 */
export class LocatorFilePersister {
  private readonly logger: SmartLocatorLogger;

  /**
   * Creates a source-file persister.
   *
   * @param logger Optional logger for write-back diagnostics.
   */
  constructor(logger?: Partial<SmartLocatorLogger>) {
    this.logger = createLogger(logger);
  }

  /**
   * Replaces a failed selector in the first matching TypeScript locator file.
   *
   * This method has a filesystem side effect: it writes a consumer source file.
   *
   * @param locatorsDir Directory containing locator `.ts` files.
   * @param failedSelector Existing selector to replace.
   * @param prompt Prompt paired with the existing selector.
   * @param healedSelector Verified replacement selector returned by the healer.
   * @returns `true` when a file was changed; otherwise `false`.
   */
  async persist(
    locatorsDir: string,
    failedSelector: string,
    prompt: string,
    healedSelector: string,
  ): Promise<boolean> {
    if (!failedSelector || !prompt || !healedSelector || failedSelector === healedSelector) {
      return false;
    }

    let files: string[];
    try {
      files = await fs.readdir(locatorsDir);
    } catch (error) {
      this.logger.warn('LOCATOR', 'Unable to read locator directory for persistence', {
        directory: locatorsDir,
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }

    const pattern = new RegExp(
      `(locator\\s*:\\s*)(['"])${escapeRegExp(failedSelector)}\\2(\\s*,\\s*[\\r\\n]+\\s*prompt\\s*:\\s*['"])${escapeRegExp(prompt)}(['"])`,
      'm',
    );

    for (const file of files.filter((name) => name.endsWith('.ts'))) {
      const filePath = path.join(locatorsDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (!pattern.test(content)) continue;
        const updated = content.replace(pattern, (_match, prefix: string, quote: string, middle: string, end: string) => {
          const escaped = healedSelector
            .replace(/\\/g, '\\\\')
            .replace(new RegExp(escapeRegExp(quote), 'g'), `\\${quote}`);
          return `${prefix}${quote}${escaped}${quote}${middle}${prompt}${end}`;
        });
        await fs.writeFile(filePath, updated, 'utf8');
        this.logger.info('LOCATOR', 'Persisted healed locator in locator file', {
          file: filePath,
          from: failedSelector,
          to: healedSelector,
        });
        return true;
      } catch (error) {
        this.logger.warn('LOCATOR', 'Failed persisting healed locator in file', {
          file: filePath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.warn('LOCATOR', 'No matching locator entry found to persist healed selector', {
      failedSelector,
      prompt: prompt.slice(0, 200),
    });
    return false;
  }
}
