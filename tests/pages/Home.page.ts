import { Page, expect } from '@playwright/test';
import { HomeLocators } from '../locators/Home.locators';
import { SmartLocator } from '../utils/smartLocator';
import { logger } from '../utils/logger';

export class HomePage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page, private readonly loc = new HomeLocators()) {
    this.smart = new SmartLocator(page);
  }

  async goto() {
    logger.pageAction('HomePage', 'goto');
    logger.navigation('/');
    await this.page.goto('/');
    logger.pageAction('HomePage', 'goto', { status: 'success' });
  }

  async expectLogoVisible() {
    logger.pageAction('HomePage', 'expectLogoVisible');
    await this.smart.expectVisible(this.loc.logo);
    logger.pageAction('HomePage', 'expectLogoVisible', { status: 'success' });
  }

  async openSignupLogin() {
    logger.pageAction('HomePage', 'openSignupLogin');
    await this.smart.click(this.loc.signupLoginLink);
    logger.pageAction('HomePage', 'openSignupLogin', { status: 'success' });
  }

  async openProducts() {
    logger.pageAction('HomePage', 'openProducts');
    await this.smart.click(this.loc.productsLink);
    logger.pageAction('HomePage', 'openProducts', { status: 'success' });
  }

  async openCart() {
    logger.pageAction('HomePage', 'openCart');
    await this.smart.click(this.loc.cartLink);
    logger.pageAction('HomePage', 'openCart', { status: 'success' });
  }

  async logout() {
    logger.pageAction('HomePage', 'logout');
    await this.smart.click(this.loc.logoutLink);
    await this.smart.expectText(this.loc.signupLoginLink, 'Signup / Login');
    logger.pageAction('HomePage', 'logout', { status: 'success' });
  }

  async openContact() {
    logger.pageAction('HomePage', 'openContact');
    await this.smart.click({
      primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[8]/a',
      fallbacks: [
        'a[href="/contact_us"]',
        'text=Contact us',
        'header a:has-text("Contact")'
      ]
    });
    logger.pageAction('HomePage', 'openContact', { status: 'success' });
  }

  async subscribe(email: string) {
    logger.pageAction('HomePage', 'subscribe', { email });
    logger.formFill('Subscription', 'email', email);
    await this.smart.expectText(this.loc.subscriptionTitle, 'Subscription');
    await this.smart.fill(this.loc.subscribeEmail, email);
    await this.smart.click(this.loc.subscribeBtn);
    await this.smart.expectContainText(this.loc.subscribeSuccess, 'successfully subscribed');
    logger.pageAction('HomePage', 'subscribe', { status: 'success', email });
  }
}


