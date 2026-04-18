# E-commerce Test Automation with Playwright

A professional-grade test automation framework for e-commerce websites using Playwright, featuring Page Object Model (POM) architecture, smart locator healing, and comprehensive test coverage.

## 🚀 Features

- **Page Object Model (POM)**: Clean separation of locators, page objects, and test logic
- **Smart Locator Healing**: One Playwright selector per element; if it fails, an optional LLM-backed healer uses your prompt + DOM snapshot and retries multiple healed candidates
- **Multi-Provider AI Support**: OpenRouter/OpenAI-compatible, Gemini, and Groq/Grok routing via env-based provider config
- **Parallel Test Execution**: Tests run in parallel across multiple browsers
- **Comprehensive Test Coverage**: Authentication, product management, cart operations, checkout flows
- **Ad Blocking**: Built-in ad blocking to reduce test flakiness
- **Rich Reporting**: HTML reports, screenshots, videos, and traces on failure
- **TypeScript Support**: Full type safety and IntelliSense support

## 📁 Project Structure

```
tests/
├── fixtures/
│   └── baseTest.ts          # Base test fixture with page objects
├── locators/
│   ├── Auth.locators.ts     # Authentication page selectors
│   ├── Cart.locators.ts     # Shopping cart selectors
│   ├── Checkout.locators.ts # Checkout process selectors
│   ├── Contact.locators.ts  # Contact form selectors
│   ├── Home.locators.ts     # Home page selectors
│   └── Products.locators.ts # Product listing selectors
├── pages/
│   ├── Auth.page.ts         # Authentication page actions
│   ├── Cart.page.ts         # Shopping cart operations
│   ├── Checkout.page.ts     # Checkout process actions
│   ├── Contact.page.ts      # Contact form handling
│   ├── Home.page.ts         # Home page interactions
│   └── Products.page.ts     # Product management actions
├── data/
│   └── testData.ts          # Centralized test data
├── utils/
│   ├── smartLocator.ts      # Smart locator, config loader, LLM healer, file persistence (single module)
│   ├── aiConfig.ts          # LLM provider + model + API key resolution (used by healer)
│   ├── aiClients.ts         # HTTP calls to OpenAI-compatible, Gemini, Groq APIs
│   └── logger.ts            # Structured test logging
├── auth.spec.ts             # Authentication tests
├── contact.spec.ts          # Contact form tests
└── products_cart.spec.ts    # Product and cart tests

# Project root (same level as tests/)
smart-locator.config.json    # Non-secret SmartLocator settings
```

Project root also includes `.env` (gitignored) for API keys used by healing—see [Smart Locator and healer agent](#smart-locator-and-healer-agent).

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playwright-ecommerce-tests
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Environment (optional, for smart locator healing)**  
   Copy or create a `.env` file in the project root:
   ```bash
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   ```
   Healing is skipped if required provider keys are missing or `SMART_LOCATOR_HEAL=false`.

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx playwright test tests/auth.spec.ts
npx playwright test tests/products_cart.spec.ts
npx playwright test tests/contact.spec.ts
```

### Run with UI Mode
```bash
npm run test:ui
```

### Run in Headed Mode
```bash
npm run test:headed
```

### Run Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npm run report
```

If port `9323` is already in use, run on a custom port:
```bash
npx playwright show-report --port 9324
```

The report includes:
- Test execution summary
- Screenshots on failure
- Video recordings
- Interactive traces
- Performance metrics

## 🎯 Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ User registration with complete profile setup
- ✅ Login with valid credentials
- ✅ Login with invalid credentials (error handling)
- ✅ User logout functionality

### Product & Cart Tests (`products_cart.spec.ts`)
- ✅ Add multiple products to cart
- ✅ Set product quantity from product details
- ✅ Place order with logged-in user
- ✅ Remove items from cart
- ✅ Cart verification and validation

### Contact Form Tests (`contact.spec.ts`)
- ✅ Contact form submission with file upload
- ✅ Success message validation
- ✅ Form field validation

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)
- **Base URL**: `https://www.automationexercise.com`
- **Parallel Execution**: Enabled across all browsers
- **Retry Strategy**: 2 retries on CI, 0 locally
- **Timeout Settings**: 15s action timeout, 20s navigation timeout
- **Artifacts**: Screenshots, videos, and traces on failure

### Test Data (`tests/data/testData.ts`)
Centralized test data including:
- User credentials and profile information
- Product information
- Payment details
- Address information

### Environment variables (`.env`)

Loaded via `dotenv` in `playwright.config.ts` and `tests/utils/aiConfig.ts`.

#### Provider selection

| Variable | Purpose |
|----------|---------|
| `LLM_PROVIDER` | Active healer backend: `openai`, `gemini`, or `groq`. |
| `SMART_LOCATOR_HEAL` | Set to `false` to disable healing. |

#### OpenAI/OpenRouter (OpenAI-compatible)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | API key for OpenAI-compatible chat completions. |
| `OPENAI_API_URL` | Endpoint (for OpenRouter/custom base URL). |
| `OPENAI_MODEL` | Model identifier (for OpenRouter, e.g. `openai/gpt-4o-mini`). |

#### Gemini

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key. |
| `GEMINI_API_URL` | Base URL for Gemini models API. |
| `GEMINI_MODEL` | Gemini model id (e.g. `gemini-1.5-flash`). |

#### Groq

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Key used by the configured Groq endpoint. |
| `GROQ_API_URL` | Chat completions URL for Groq-compatible endpoint. |
| `GROQ_MODEL` | Model id served by Groq (e.g. `llama-3.3-70b-versatile`). |

#### Smart locator / healer tuning

| Variable | Purpose |
|----------|---------|
| `SMART_LOCATOR_CONFIG_PATH` | Path to JSON config (default: `./smart-locator.config.json`). |
| `SMART_LOCATOR_HEAL` | `false` / `0` disables the healing path entirely. |
| `SMART_LOCATOR_USE_BUILTIN_AI` | `false` turns off the built-in LLM healer (use a custom `healProvider` instead). |
| `SMART_LOCATOR_PERSIST_FILES` | `false` skips writing healed selectors back to `tests/locators/*.ts`. |
| `SMART_LOCATOR_LOCATOR_FILES_DIR` | Directory scanned for locator files to update (overrides JSON). |
| `SMART_LOCATOR_RESOLVE_VISIBLE_TIMEOUT_MS` | Initial wait for the primary locator before healing (default `2000`). |
| `SMART_LOCATOR_HEAL_MAX_DOM_CHARS` | Max chars of a11y/HTML snapshot sent to the model (default `14000`). |
| `SMART_LOCATOR_HEAL_MAX_CANDIDATES` | Max healed selector variants to try (default `3`). |
| `SMART_LOCATOR_HEAL_RETRY_TIMEOUT_MS` | Per-candidate visibility timeout (default `3000`). |

## Smart Locator and healer agent

The **smart locator** layer wraps Playwright actions so a single string selector can fail once, then an optional **healer** proposes a better selector from the live page and your human-readable **prompt**.

### Related files

| File | Role |
|------|------|
| `tests/utils/smartLocator.ts` | **`SmartLocator` facade**, `createSmartLocator`, `loadSmartLocatorConfig`, `SmartTarget` types, **`SelectorOps`** (parse, normalize, candidate chain), **`LlmHealAgent`** (LLM call + strict `{"selector":"..."}` response), **`LocatorFilePersister`** (rewrites matching entries in `tests/locators/*.ts` after a successful heal). |
| `tests/utils/aiConfig.ts` | Resolves **`LLM_PROVIDER`**, model, URL, and API key from `.env`. |
| `tests/utils/aiClients.ts` | **`callAiProvider`** — HTTP to OpenAI-compatible chat, Gemini, or Groq. |
| `smart-locator.config.json` | Non-secret defaults: healing, built-in AI, persistence, timeouts, locator folder. Environment variables override this file when set. |

API keys stay in **`.env`** only, not in the JSON file.

### How it works (pipeline)

1. **`SmartLocator`** waits up to **`resolveVisibleTimeoutMs`** for `page.locator(target.locator)` to become visible.
2. If that fails and **healing is allowed**, it builds a **`domSummary`**: accessibility snapshot when useful, otherwise a truncated `body.innerHTML` excerpt (capped by **`maxDomChars`**).
3. **`LlmHealAgent`** sends the failed selector, your **`prompt`**, and the snapshot to the configured LLM. The model must answer with a single Playwright selector string (wrapped in JSON as instructed).
4. **`SelectorOps`** parses the reply (JSON, fenced block, or plain string), **normalizes** common mistakes (quotes, `getByRole` / `getByText`-style snippets → `role=...` / `text=...`), and rejects obvious non-selectors.
5. A **candidate chain** is built (primary plus fallbacks such as `text=` from accessible names or quoted text in the prompt). Up to **`healMaxCandidates`** are tried, each with **`healRetryTimeoutMs`** visibility wait.
6. On success, **`target.locator`** is updated **in memory**. If **`persistToLocatorFiles`** is true, **`LocatorFilePersister`** finds the matching `locator` + `prompt` pair in `tests/locators/*.ts` and updates the file.

If the LLM is not configured or healing is disabled, failures behave like a normal Playwright run on the original selector.

### Configuration (`smart-locator.config.json`)

| Field | Meaning |
|-------|---------|
| `heal` | Whether to attempt healing after the primary locator times out (overridable by `SMART_LOCATOR_HEAL`). |
| `useBuiltinAi` | When `true`, uses **`LlmHealAgent`** unless you pass a custom **`healProvider`** in code. |
| `persistToLocatorFiles` | Write successful heals back into locator source files under **`locatorFilesDir`**. |
| `locatorFilesDir` | Folder of `*.ts` locator modules (relative to project root unless absolute). |
| `resolveVisibleTimeoutMs` | First wait before invoking the healer. |
| `maxDomChars` | Max snapshot size sent to the model. |
| `healMaxCandidates` / `healRetryTimeoutMs` | Candidate retry limits. |

Use **`loadSmartLocatorConfig({ ... })`** or **`createSmartLocator(page, { ... })`** to merge options in code without editing the JSON.

### Usage

**Page objects** (recommended — loads JSON + env automatically):

```typescript
import { createSmartLocator, type SmartLocator } from '../utils/smartLocator';

export class AuthPage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page) {
    this.smart = createSmartLocator(page);
  }
}
```

**Locators** are **`SmartTarget`** objects (`locator` + `prompt`), e.g. in `tests/locators/*.locators.ts`:

```typescript
import type { SmartTarget } from '../utils/smartLocator';

readonly loginButton: SmartTarget = {
  locator: '//*[@id="form"]/div/div/div[1]/div/form/button',
  prompt: 'Login submit button on the login form (e.g. text "Login").',
};
```

**Actions:**

```typescript
await this.smart.click(this.loc.loginButton);
await this.smart.fill(this.loc.loginEmail, email);
await this.smart.expectText(this.loc.loginHeader, 'Login to your account');
```

**Inline `SmartTarget`:**

```typescript
await this.smart.click({
  locator: '//*[@id="header"]/.../a',
  prompt: 'Header "Contact us" link to /contact_us.',
});
```

**Advanced:**

```typescript
// Manual options only (merge with JSON yourself if needed)
new SmartLocator(page, { heal: false });

// JSON + env, plus overrides
createSmartLocator(page, {
  logger: myLogger,
  healProvider: async (ctx) => 'text=Submit',
});
```

Without valid credentials for **`LLM_PROVIDER`**, the built-in healer cannot call the API; healing then does not recover the step and Playwright surfaces the original failure.

## 🚫 Ad Blocking

Built-in ad blocking reduces test flakiness by:
- Blocking ad network requests
- Hiding ad elements from the DOM
- Preventing ad overlays from interfering with interactions

## 📝 Writing New Tests

1. **Create locators** in `tests/locators/` as `SmartTarget` (`locator` + `prompt`) where you use `SmartLocator`
2. **Implement page actions** in `tests/pages/`
3. **Write test cases** using the base fixture
4. **Add test data** to `tests/data/testData.ts`

Example:
```typescript
import { test } from './fixtures/baseTest';

test('my new test', async ({ home, auth }) => {
  await home.goto();
  await home.openSignupLogin();
  await auth.expectLoginPage();
  // ... test steps
});
```

## 🔍 Debugging

### View Test Traces
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Specific Test in Debug Mode
```bash
npx playwright test tests/auth.spec.ts --debug
```

### Run Auth Healer Scenario (single test)
```bash
npx playwright test tests/auth.spec.ts --project=chromium --workers=1 -g "login with incorrect credentials shows error"
```

## 🚀 CI/CD Integration

The framework is ready for CI/CD integration with:
- Parallel test execution
- Artifact collection on failure
- Configurable retry strategies
- Browser-specific test runs

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📋 Available Scripts

- `npm test` - Run all tests
- `npm run test:ui` - Run tests with UI mode
- `npm run test:headed` - Run tests in headed mode
- `npm run report` - Show last test report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests following the POM pattern
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values in `playwright.config.ts`
2. **Element not found**: Update the `locator` string, improve the `prompt` for healing, or run with `OPENAI_API_KEY` set so the healer can suggest a new selector
3. **Flaky tests**: Enable ad blocking and increase wait times
4. **Browser crashes**: Ensure browsers are properly installed with `npx playwright install`

### Getting Help

- Check the [Playwright documentation](https://playwright.dev/)
- Review test traces for detailed failure information
- Use the interactive UI mode for debugging

---

**Happy Testing! 🎉**
