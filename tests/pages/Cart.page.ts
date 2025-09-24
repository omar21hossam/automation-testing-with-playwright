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
    await this.smart.click([this.loc.product1Delete, 'tr[id^="product-"] a.cart_quantity_delete i']);
  }

  async proceedToCheckout() {
    await this.smart.click([
      this.loc.proceedToCheckout,
      'a:has-text("Proceed To Checkout")',
      'a[href="/login"]:below(:text("Proceed To Checkout"))',
    ]);
  }

  async proceedThenChooseSignup() {
    await this.proceedToCheckout();
    await this.smart.click([this.loc.checkoutModalSignupLink, '#checkoutModal a u']);
  }
}


