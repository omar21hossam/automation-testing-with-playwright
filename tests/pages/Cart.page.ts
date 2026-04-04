import { Page, expect } from '@playwright/test';
import { CartLocators } from '../locators/Cart.locators';
import { SmartLocator } from '../utils/smartLocator';

export class CartPage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page, private readonly loc = new CartLocators()) {
    this.smart = new SmartLocator(page);
  }

  async expectProduct1(name: string, price: string, qty: string) {
    await expect(this.page.locator(this.loc.product1Name)).toHaveText(name);
    await expect(this.page.locator(this.loc.product1Price)).toHaveText(price);
    await expect(this.page.locator(this.loc.product1Qty)).toHaveText(qty);
  }

  async expectProduct2(name: string, price: string, qty: string) {
    await expect(this.page.locator(this.loc.product2Name)).toHaveText(name);
    await expect(this.page.locator(this.loc.product2Price)).toHaveText(price);
    await expect(this.page.locator(this.loc.product2Qty)).toHaveText(qty);
  }

  async removeFirstItem() {
    await this.smart.click({
      locator: this.loc.product1Delete,
      prompt: 'Delete/remove icon for first cart row (cart quantity delete).',
    });
  }

  async proceedToCheckout() {
    await this.smart.click({
      locator: this.loc.proceedToCheckout,
      prompt: 'Proceed To Checkout button or link in cart (#do_action area).',
    });
  }

  async proceedThenChooseSignup() {
    await this.proceedToCheckout();
    await this.smart.click({
      locator: this.loc.checkoutModalSignupLink,
      prompt: 'Signup link in checkout modal (#checkoutModal) when not logged in.',
    });
  }
}
