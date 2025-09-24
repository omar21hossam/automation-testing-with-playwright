import { Page, expect } from '@playwright/test';
import { CheckoutLocators } from '../locators/Checkout.locators';
import { SmartLocator } from '../utils/smartLocator';

export class CheckoutPage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page, private readonly loc = new CheckoutLocators()) {
    this.smart = new SmartLocator(page);
  }

  async expectAddresses(address1: string, address2: string) {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator(this.loc.address1)).toHaveText(address1);
    await expect(this.page.locator(this.loc.address2)).toHaveText(address2);
  }

  async placeOrderWithMessage(message: string) {
    await this.smart.fill([this.loc.orderComment, '#ordermsg textarea'], message);
    await this.smart.click([this.loc.placeOrder, 'a:has-text("Place Order")']);
    await this.smart.expectText([this.loc.paymentHeader, 'text=Payment'], 'Payment');
  }

  async pay(data: { nameOnCard: string; cardNumber: string; cvc: string; expirationMonth: string; expirationYear: string; }) {
    await this.smart.fill([this.loc.nameOnCard, '#payment-form input[name="name_on_card"]'], data.nameOnCard);
    await this.smart.fill([this.loc.cardNumber, '#payment-form input[name="card_number"]'], data.cardNumber);
    await this.smart.fill([this.loc.cvc, '#payment-form input[name="cvc"]'], data.cvc);
    await this.smart.fill([this.loc.expiryMonth, '#payment-form input[name="expiry_month"]'], data.expirationMonth);
    await this.smart.fill([this.loc.expiryYear, '#payment-form input[name="expiry_year"]'], data.expirationYear);
    await this.smart.click([this.loc.payAndConfirm, '#submit']);
    await this.smart.expectText([this.loc.orderPlaced, 'text=Order Placed!'], 'Order Placed!');
    await this.smart.click([this.loc.continueBtn, 'text=Continue']);
  }
}


