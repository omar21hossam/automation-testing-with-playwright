# Library API

Install with `github:omar21hossam/playwright-smart-locator` or a
tarball from `npm run pack:lib`. See the README.

`@omar21hossam/playwright-smart-locator` wraps common Playwright locator
actions. It first checks the configured selector, then optionally asks a
healing provider for a replacement, verifies candidates, and can persist the
winner.

## Configure the healer (consumer `.env`)

The package never ships API keys or endpoint URLs. The consumer supplies them.

1. Create `.env` in the **consumer** repo (not in this package). Gitignore it.
2. Load it into `process.env` before tests (for example `dotenv.config()` in
   the consumer Playwright config). This library does not call `dotenv`.
3. Fill the variables for one provider. Empty values disable built-in healing.

OpenAI-compatible:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_API_URL=
OPENAI_MODEL=
```

Gemini: `GEMINI_API_KEY`, `GEMINI_API_URL`, `GEMINI_MODEL` with
`LLM_PROVIDER=gemini`.

Groq: `GROQ_API_KEY`, `GROQ_API_URL`, `GROQ_MODEL` with `LLM_PROVIDER=groq`.

All three of key, URL, and model must be non-empty for the selected provider.

Optional `SMART_LOCATOR_*` variables are listed in the README.

## Healing flow

1. Wait for `target.locator` to become visible.
2. Capture a compact accessibility tree or HTML excerpt.
3. Ask the configured healer for a selector.
4. Normalize and validate the returned selector.
5. Try up to `healMaxCandidates` visible candidates.
6. Update the `SmartTarget` in memory.
7. Run custom persistence, or write the selector to a matching locator file.
8. Perform the requested Playwright action or assertion.

If healing is disabled or unsuccessful, Playwright uses the original locator.

## Public API

### `createSmartLocator(page, overrides?)`

Loads JSON and environment configuration, applies overrides, returns a
`SmartLocator`.

### `SmartLocator`

Methods: `click`, `fill`, `selectOption`, `setInputFiles`, `expectVisible`,
`expectText`, `expectContainText`.

### `loadSmartLocatorConfig(overrides?)`

Merges `smart-locator.config.json` (if present in the consumer cwd), env, and
overrides.

### `SmartTarget`

```ts
type SmartTarget = {
  locator: string;
  prompt: string;
};
```

### `LocatorFilePersister`

```ts
const persister = new LocatorFilePersister();
await persister.persist(locatorsDir, failedSelector, prompt, healedSelector);
```

Writes consumer TypeScript locator files. Disable in read-only CI.

### `LlmHealAgent`

Built-in `HealProvider`. Uses the consumer environment via
`resolveProviderConfig()`.

### Other exports

`resolveAiProvider`, `resolveProviderConfig`, `callAiProvider`,
`handleApiError`, `toErrorMessage`.
