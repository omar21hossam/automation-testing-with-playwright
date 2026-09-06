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

`LLM_PROVIDER` must be `openai`, `gemini`, `groq`, or `cursor`. For OpenAI,
Gemini, and Groq, **API key, API URL, and model are all required**. For
Cursor CLI, see the next section. If a required HTTP field is missing,
built-in healing is skipped and the original Playwright error is shown.

## Using the Cursor CLI as the healer

The library can call the **Cursor CLI** on your machine instead of an HTTP
LLM. There is no API key and no endpoint URL. The CLI must be installed and
you must already be signed in.

### 1. Install and sign in

1. Install Cursor CLI so either `agent` or `cursor` is on your `PATH`.
2. Sign in from a terminal (`agent login`, or the login command your CLI
   build prints).
3. Confirm it works: `agent --help` or `cursor agent --help`.

This path is for **local** test runs. GitHub Actions and other CI must either
install and authenticate the CLI, or set `LLM_PROVIDER` to openai, gemini, or
groq.

### 2. Consumer `.env`

```env
LLM_PROVIDER=cursor
CURSOR_CLI=agent
CURSOR_MODEL=
```

| Variable | Required | Meaning |
| --- | --- | --- |
| `LLM_PROVIDER` | yes | Must be `cursor`. |
| `CURSOR_CLI` | no | Command to spawn. Default `agent`. Use `cursor agent` if that is how you invoke the CLI. |
| `CURSOR_MODEL` | no | CLI model id. Empty uses the CLI default. |

Load `.env` in Playwright config as shown above. This package does not load
`.env` itself.

A copy of these variables is in `.env.example`.

### 3. What happens on a failed locator

The healer runs a **non-interactive** print command and reads stdout:

```bash
agent -p "<heal prompt>" --output-format text
```

If `CURSOR_MODEL` is set, `--model` is added. If `CURSOR_CLI` is unset and
`agent` is missing, the library retries:

```bash
cursor agent -p "<heal prompt>" --output-format text
```

The CLI must reply with Playwright locator syntax (JSON
`{"selector":"..."}` is preferred). The library verifies the selector is
visible, then can write it back to your locator file.

If the CLI is not on `PATH`, is not logged in, or exits with an error,
healing is skipped and Playwright fails on the original locator.

### 4. Run tests

```bash
npx playwright test
```

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
