# E-commerce Test Automation with Playwright

A professional-grade test automation framework for e-commerce websites using Playwright, featuring Page Object Model (POM) architecture, smart locator healing, and comprehensive test coverage.

## 🚀 Features

- **Page Object Model (POM)**: Clean separation of locators, page objects, and test logic
- **Smart Locator Healing**: One Playwright selector per element; if it fails, an optional LLM-backed “healer” uses your prompt plus a DOM snapshot to propose a new selector
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
│   ├── smartLocator.ts      # Smart locator + optional DOM healing (LLM)
│   └── logger.ts            # Structured test logging
├── auth.spec.ts             # Authentication tests
├── contact.spec.ts          # Contact form tests
└── products_cart.spec.ts    # Product and cart tests
```

Project root also includes `.env` (gitignored) for API keys used by healing—see [Smart Locator System](#smart-locator-system).

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
   Copy or create a `.env` file in the project root and set your OpenAI-compatible API key:
   ```bash
   OPENAI_API_KEY=sk-...
   ```
   Healing is skipped if the key is missing or `SMART_LOCATOR_HEAL=false`. See the Smart Locator section below for other variables.

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

Loaded via `dotenv` in `playwright.config.ts` and `tests/utils/smartLocator.ts`.

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for built-in healing (OpenAI-compatible Chat Completions API). |
| `OPENAI_API_URL` | Optional. Default: `https://api.openai.com/v1/chat/completions` (use for Azure or other bases). |
| `OPENAI_MODEL` | Optional. Default: `gpt-4o-mini`. |
| `SMART_LOCATOR_HEAL` | Set to `false` to disable healing while keeping a key in the environment. |

## 🧠 Smart Locator System

Locators used through `SmartLocator` are **`SmartTarget`** objects: a single Playwright **`locator`** string and a **`prompt`** that describes the element for the healer if the locator times out.

**Flow:** wait for the locator to be visible (short timeout) → on failure, optionally call the model with the prompt, the failed selector, and an accessibility snapshot (with HTML fallback) → if the model returns `{"selector":"..."}`, wait for that locator instead.

**Define locators** (see `tests/locators/*.locators.ts`):

```typescript
import type { SmartTarget } from '../utils/smartLocator';

readonly loginButton: SmartTarget = {
  locator: '//*[@id="form"]/div/div/div[1]/div/form/button',
  prompt: 'Login submit button on the login form (e.g. text "Login").',
};
```

**Use in page objects:**

```typescript
await this.smart.click(this.loc.loginButton);
await this.smart.fill(this.loc.loginEmail, email);
```

**Inline target** (e.g. one-off actions):

```typescript
await this.smart.click({
  locator: '//*[@id="header"]/.../a',
  prompt: 'Header "Contact us" link to /contact_us.',
});
```

You can inject a custom `healProvider` via `new SmartLocator(page, { healProvider })` if you need a non-OpenAI backend. Without `OPENAI_API_KEY` and without a custom provider, healing is skipped and the test fails with the usual Playwright error.

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
