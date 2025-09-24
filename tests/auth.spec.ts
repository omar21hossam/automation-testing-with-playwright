import { test, expect } from './fixtures/baseTest';
import { users } from './data/testData';
import { logger, LogLevel } from './utils/logger';

test.describe.serial('auth flow', () => {
  test.beforeEach(async () => {
    logger.setLogLevel(LogLevel.INFO);
  });

  test('register user', async ({ home, auth }) => {
    logger.step('Navigate to home page and verify logo');
    await home.goto();
    await home.expectLogoVisible();

    logger.step('Open signup/login page and start registration');
    await home.openSignupLogin();
    await auth.expectSignupPage();
    await auth.startSignup(users.valid.name, users.valid.email);
    
    logger.step('Fill account information form');
    await auth.fillAccountForm(users.valid);
    
    logger.step('Create account and verify login');
    await auth.createAccountAndContinue();
    await auth.expectLoggedInAs(users.valid.name);
    
    logger.step('Logout to complete registration flow');
    await home.logout();
    
    logger.step('Registration completed successfully');
  });

  test('login with correct credentials', async ({ home, auth }) => {
    logger.step('Navigate to home page');
    await home.goto();
    
    logger.step('Open login page and authenticate');
    await home.openSignupLogin();
    await auth.expectLoginPage();
    await auth.login(users.valid.email, users.valid.password);
    await auth.expectLoggedInAs(users.valid.name);
    
    logger.step('Login completed successfully');
  });

  test('login with incorrect credentials shows error', async ({ home, auth }) => {
    logger.step('Navigate to home page');
    await home.goto();
    
    logger.step('Open login page and attempt invalid login');
    await home.openSignupLogin();
    await auth.expectLoginPage();
    await auth.login(users.invalid.email, users.invalid.password);
    await auth.expectLoginError('Your email or password is incorrect!');
    
    logger.step('Error handling verified successfully');
  });
});


