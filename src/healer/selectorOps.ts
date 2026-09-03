/**
 * Internal parsing and fallback operations for model-generated selectors.
 */

/**
 * Extracts a selector from JSON, a fenced JSON object, or plain model text.
 *
 * @param text Raw model response.
 * @returns Extracted selector, or `null` when parsing fails.
 */
export function parseSelectorFromModelText(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();

  /** Attempts to parse a JSON object containing a non-empty selector. */
  const tryParse = (value: string): string | null => {
    try {
      const parsed = JSON.parse(value) as { selector?: string };
      return typeof parsed.selector === 'string' && parsed.selector.trim()
        ? parsed.selector.trim()
        : null;
    } catch {
      return null;
    }
  };

  const direct = tryParse(raw);
  if (direct) return direct;
  const object = raw.match(/\{[\s\S]*"selector"[\s\S]*\}/);
  if (object) return tryParse(object[0]);
  return raw && !raw.includes('{') && !raw.includes('}') ? raw : null;
}

/**
 * Converts common Playwright expression text to `page.locator()` selector syntax.
 *
 * @param selector Raw selector proposed by a provider.
 * @returns Normalized selector.
 */
export function normalizeSelector(selector: string): string {
  let normalized = selector.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }
  const locator = normalized.match(/^(?:page\.)?locator\((['"])([\s\S]+)\1\)$/);
  if (locator) normalized = locator[2].trim();
  const role = normalized.match(
    /^(?:page\.)?getByRole\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*name\s*:\s*['"]([^'"]+)['"]\s*\}\s*\)$/,
  );
  if (role) return `role=${role[1]}[name="${role[2].replace(/"/g, '\\"')}"]`;
  const text = normalized.match(/^(?:page\.)?getByText\(\s*['"]([\s\S]+)['"]\s*\)$/);
  return text ? `text=${text[1]}` : normalized;
}

/**
 * Performs inexpensive checks that reject code instead of selector syntax.
 *
 * @param selector Normalized selector.
 * @returns Whether the value is a plausible `page.locator()` selector.
 */
export function isLikelyValidSelector(selector: string): boolean {
  if (/[{};]/.test(selector) && !selector.startsWith('xpath=')) return false;
  if (selector.startsWith('getBy') || selector.startsWith('page.')) return false;
  return selector.length > 0;
}

/**
 * Escapes a literal value before inserting it into a regular expression.
 *
 * @param input Literal text.
 * @returns Regex-safe text.
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the accessible name from Playwright role selector syntax.
 *
 * @param selector Role selector.
 * @returns Accessible name when present.
 */
function accessibleName(selector: string): string | null {
  return selector.match(/\[name="([^"]+)"\]/)?.[1] ?? null;
}

/**
 * Builds ordered selector fallbacks from the model proposal and target prompt.
 *
 * @param primary Normalized model selector.
 * @param prompt Human-readable target description.
 * @returns Unique selectors in retry order.
 */
export function buildCandidateChain(primary: string, prompt: string): string[] {
  const candidates: string[] = [];

  /** Adds a non-empty selector unless it is already in the chain. */
  const add = (selector: string | null | undefined): void => {
    const value = selector?.trim();
    if (value && !candidates.includes(value)) candidates.push(value);
  };

  add(primary);
  const roleName = accessibleName(primary);
  if (roleName) add(`text=${roleName}`);
  add(prompt.match(/"([^"]{3,80})"/)?.[1]
    ? `text=${prompt.match(/"([^"]{3,80})"/)?.[1]}`
    : null);
  return candidates;
}
