import { Page, expect } from '@playwright/test';
import { AuthLocators } from '../locators/Auth.locators';
import { SmartLocator } from '../utils/smartLocator';
import { logger } from '../utils/logger';

export class AuthPage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page, private readonly loc = new AuthLocators()) {
    this.smart = new SmartLocator(page);
  }

  async expectLoginPage() {
    logger.pageAction('AuthPage', 'expectLoginPage');
    await this.smart.expectText(this.loc.loginHeader, 'Login to your account');
    logger.pageAction('AuthPage', 'expectLoginPage', { status: 'success' });
  }

  async login(email: string, password: string) {
    logger.pageAction('AuthPage', 'login', { email });
    logger.formFill('Login', 'email', email);
    logger.formFill('Login', 'password', '***');
    await this.smart.fill(this.loc.loginEmail, email);
    await this.smart.fill(this.loc.loginPassword, password);
    await this.smart.click(this.loc.loginButton);
    logger.pageAction('AuthPage', 'login', { status: 'success', email });
  }

  async expectLoggedInAs(name: string) {
    logger.pageAction('AuthPage', 'expectLoggedInAs', { name });
    await this.smart.expectText(this.loc.loggedInAs, `Logged in as ${name}`);
    logger.pageAction('AuthPage', 'expectLoggedInAs', { status: 'success', name });
  }

  async expectLoginError(message: string) {
    logger.pageAction('AuthPage', 'expectLoginError', { message });
    await this.smart.expectText(this.loc.loginError, message);
    logger.pageAction('AuthPage', 'expectLoginError', { status: 'success', message });
  }

  async expectSignupPage() {
    logger.pageAction('AuthPage', 'expectSignupPage');
    await this.smart.expectText(this.loc.signupHeader, 'New User Signup!');
    logger.pageAction('AuthPage', 'expectSignupPage', { status: 'success' });
  }

  async startSignup(name: string, email: string) {
    logger.pageAction('AuthPage', 'startSignup', { name, email });
    logger.formFill('Signup', 'name', name);
    logger.formFill('Signup', 'email', email);
    await this.smart.fill(this.loc.signupName, name);
    await this.smart.fill(this.loc.signupEmail, email);
    await this.smart.click(this.loc.signupButton);
    logger.pageAction('AuthPage', 'startSignup', { status: 'success', name, email });
  }

  async fillAccountForm(data: {
    password: string;
    day: string;
    month: string;
    year: string;
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobile: string;
  }) {
    await expect(this.page.locator(this.loc.accountInfoHeader.primary)).toBeVisible();
    await this.smart.click(this.loc.genderMale);
    await this.smart.fill(this.loc.password, data.password);
    await this.smart.selectOption(this.loc.day, data.day);
    await this.smart.selectOption(this.loc.month, data.month);
    await this.smart.selectOption(this.loc.year, data.year);
    await this.smart.click(this.loc.newsletter);
    await this.smart.click(this.loc.offers);
    await this.smart.fill(this.loc.firstName, data.firstName);
    await this.smart.fill(this.loc.lastName, data.lastName);
    await this.smart.fill(this.loc.company, data.company);
    await this.smart.fill(this.loc.address1, data.address1);
    await this.smart.fill(this.loc.address2, data.address2);
    await this.smart.selectOption(this.loc.country, data.country);
    await this.smart.fill(this.loc.state, data.state);
    await this.smart.fill(this.loc.city, data.city);
    await this.smart.fill(this.loc.zipcode, data.zipcode);
    await this.smart.fill(this.loc.mobile, data.mobile);
  }

  async createAccountAndContinue() {
    await this.smart.click(this.loc.createAccountBtn);
    await this.smart.expectText(this.loc.accountCreatedHeader, 'Account Created!');
    await this.smart.click(this.loc.continueBtn);
  }
}


