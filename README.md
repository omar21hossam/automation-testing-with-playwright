# @omar21hossam/playwright-smart-locator

Self-healing locators for Playwright. When a selector does not find a visible
element, the library can ask a healer for a replacement, verify it, and write
it back to your locator source file.

The published package contains only this library (compiled `dist/`, this
README, and `docs/`).

## Install

This package is distributed from GitHub (no npmjs 2FA). After this repo is
pushed, in the consumer project:

```bash
npm install github:omar21hossam/playwright-smart-locator
npm install -D @playwright/test
```

Or install a local tarball from this repo (no registry):

```bash
npm run pack:lib
```

Then in the consumer project:

```bash
npm install /absolute/path/to/omar21hossam-playwright-smart-locator-1.0.0.tgz
npm install -D @playwright/test
```

```ts
import { createSmartLocator, type SmartTarget } from '@omar21hossam/playwright-smart-locator';

const loginButton: SmartTarget = {
  locator: '#old-login-button',
  prompt: 'The visible Log in submit button',
};

const smart = createSmartLocator(page);
await smart.click(loginButton);
```

Supported methods: `click`, `fill`, `selectOption`, `setInputFiles`,
`expectVisible`, `expectText`, `expectContainText`.

## Configure the healer from the consumer `.env`

This library **does not load `.env`**. It only reads `process.env`.

In the **consumer** project:

1. Add `.env` to that project's gitignore.
2. Load it before tests run (typical Playwright config):

```ts
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
```

3. Set provider variables in that `.env`. Leave values empty until you fill
   them locally. Do not commit secrets.

**OpenAI-compatible provider**

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_API_URL=
OPENAI_MODEL=
```

**Gemini**

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_API_URL=
GEMINI_MODEL=
```

**Groq**

```env
LLM_PROVIDER=groq
GROQ_API_KEY=
GROQ_API_URL=
GROQ_MODEL=
```

`LLM_PROVIDER` must be `openai`, `gemini`, or `groq`. For the selected
provider, **API key, API URL, and model are all required**. If any of them is
missing, built-in healing is skipped and the original Playwright error is
shown.

Optional library flags (consumer env or a local `smart-locator.config.json`):

```env
SMART_LOCATOR_HEAL=true
SMART_LOCATOR_USE_BUILTIN_AI=true
SMART_LOCATOR_PERSIST_FILES=true
SMART_LOCATOR_LOCATOR_FILES_DIR=tests/locators
SMART_LOCATOR_RESOLVE_VISIBLE_TIMEOUT_MS=2000
SMART_LOCATOR_HEAL_MAX_DOM_CHARS=14000
SMART_LOCATOR_HEAL_WAIT_TIMEOUT_MS=8000
SMART_LOCATOR_HEAL_MAX_CANDIDATES=3
SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS=3000
```

You can also pass a custom `healProvider` instead of the built-in agent:

```ts
const smart = createSmartLocator(page, {
  useBuiltinAi: false,
  healProvider: async ({ prompt, failedSelector, domSummary }) => {
    return mySelectorService({ prompt, failedSelector, domSummary });
  },
});
```

## Locator write-back

After a healed selector is verified visible, `target.locator` is updated in
memory. If `persistToLocatorFiles` is true, matching `locator` + `prompt`
entries in TypeScript files under `locatorFilesDir` are rewritten.

Turn write-back off in CI with `SMART_LOCATOR_PERSIST_FILES=false`.

## Documentation

See `docs/LIBRARY.md` for the API reference.
