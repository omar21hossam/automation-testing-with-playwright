# E-commerce Test Automation with Playwright

A professional-grade test automation framework for e-commerce websites using Playwright, featuring Page Object Model (POM) architecture, smart locator healing, and comprehensive test coverage.

## 🚀 Features

- **Page Object Model (POM)**: Clean separation of locators, page objects, and test logic
- **Smart Locator Healing**: AI-like fallback selectors for improved test reliability
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
│   └── smartLocator.ts      # Smart locator utility with fallbacks
├── auth.spec.ts             # Authentication tests
├── contact.spec.ts          # Contact form tests
├── products_cart.spec.ts    # Product and cart tests
└── automation_ex.spec.ts    # Original test suite (legacy)
```

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

## 🧠 Smart Locator System

The framework includes a smart locator utility that provides fallback selectors for improved reliability:

```typescript
// Example usage in page objects
await this.smart.click([
  this.loc.primaryButton,
  'button:has-text("Submit")',
  'input[type="submit"]'
]);
```

This approach ensures tests continue to work even when UI elements change, providing "AI-like" locator healing.

## 🚫 Ad Blocking

Built-in ad blocking reduces test flakiness by:
- Blocking ad network requests
- Hiding ad elements from the DOM
- Preventing ad overlays from interfering with interactions

## 📝 Writing New Tests

1. **Create locators** in `tests/locators/`
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
2. **Element not found**: Check if selectors need updating or add fallback selectors
3. **Flaky tests**: Enable ad blocking and increase wait times
4. **Browser crashes**: Ensure browsers are properly installed with `npx playwright install`

### Getting Help

- Check the [Playwright documentation](https://playwright.dev/)
- Review test traces for detailed failure information
- Use the interactive UI mode for debugging

---

**Happy Testing! 🎉**
