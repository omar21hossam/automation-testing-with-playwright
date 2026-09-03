import { expect, test } from '@playwright/test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  LocatorFilePersister,
  createSmartLocator,
  type SmartTarget,
} from '@omar21hossam/playwright-smart-locator';

const PAGE_HTML = `
  <h1>Welcome</h1>
  <label>Email <input id="email" /></label>
  <p id="error">Your email or password is incorrect!</p>
  <button id="login">Login</button>
`;

test.describe('playwright-smart-locator library', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(PAGE_HTML);
  });

  test('uses a working locator without healing', async ({ page }) => {
    const smart = createSmartLocator(page, {
      heal: false,
      persistToLocatorFiles: false,
    });
    const login: SmartTarget = {
      locator: '#login',
      prompt: 'Login submit button',
    };

    await smart.expectVisible(login);
    await smart.click(login);
    await expect(page.locator('#login')).toBeVisible();
  });

  test('heals a broken locator via a custom provider and updates the target', async ({
    page,
  }) => {
    let healCalls = 0;
    const smart = createSmartLocator(page, {
      persistToLocatorFiles: false,
      heal: true,
      useBuiltinAi: false,
      healProvider: async () => {
        healCalls += 1;
        return '#login';
      },
    });
    const login: SmartTarget = {
      locator: '#missing-login',
      prompt: 'Login submit button with text "Login"',
    };

    await smart.click(login);

    expect(healCalls).toBe(1);
    expect(login.locator).toBe('#login');
  });

  test('writes the healed selector back to a locator TypeScript file', async ({
    page,
  }) => {
    const locatorsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'smart-locators-'));
    const filePath = path.join(locatorsDir, 'Login.locators.ts');
    await fs.writeFile(
      filePath,
      `export const loginButton = {
  locator: '#missing-login',
  prompt: 'Login submit button with text "Login"',
};
`,
      'utf8',
    );

    const smart = createSmartLocator(page, {
      heal: true,
      useBuiltinAi: false,
      persistToLocatorFiles: true,
      locatorFilesDir: locatorsDir,
      healProvider: async () => '#login',
    });
    const login: SmartTarget = {
      locator: '#missing-login',
      prompt: 'Login submit button with text "Login"',
    };

    await smart.expectVisible(login);

    const persisted = await fs.readFile(filePath, 'utf8');
    expect(persisted).toContain("locator: '#login'");
    expect(persisted).toContain('Login submit button with text "Login"');
    expect(login.locator).toBe('#login');
  });

  test('LocatorFilePersister can persist independently of SmartLocator', async () => {
    const locatorsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'smart-locators-'));
    const filePath = path.join(locatorsDir, 'Auth.locators.ts');
    await fs.writeFile(
      filePath,
      `readonly loginError: SmartTarget = {
  locator: '//broken/xpath',
  prompt: 'Error message paragraph under the login form',
};
`,
      'utf8',
    );

    const persister = new LocatorFilePersister();
    const changed = await persister.persist(
      locatorsDir,
      '//broken/xpath',
      'Error message paragraph under the login form',
      'text=Your email or password is incorrect!',
    );

    expect(changed).toBe(true);
    expect(await fs.readFile(filePath, 'utf8')).toContain(
      "locator: 'text=Your email or password is incorrect!'",
    );
  });

  test('fills a healed input', async ({ page }) => {
    const smart = createSmartLocator(page, {
      persistToLocatorFiles: false,
      heal: true,
      useBuiltinAi: false,
      healProvider: async () => '#email',
    });
    const email: SmartTarget = {
      locator: '#missing-email',
      prompt: 'Email address input',
    };

    await smart.fill(email, 'user@example.com');

    await expect(page.locator('#email')).toHaveValue('user@example.com');
    expect(email.locator).toBe('#email');
  });
});
