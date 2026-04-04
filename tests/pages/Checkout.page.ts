import { Page, expect } from '@playwright/test';
import { CheckoutLocators } from '../locators/Checkout.locators';
import { SmartLocator, type SmartTarget } from '../utils/smartLocator';

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
    const orderComment: SmartTarget = {
      locator: this.loc.orderComment,
      prompt: 'Order comment textarea in #ordermsg on checkout.',
    };
    const placeOrder: SmartTarget = {
      locator: this.loc.placeOrder,
      prompt: 'Place Order link or button leading to payment.',
    };
    const paymentHeader: SmartTarget = {
      locator: this.loc.paymentHeader,
      prompt: 'Payment page heading "Payment".',
    };
    await this.smart.fill(orderComment, message);
    await this.smart.click(placeOrder);
    await this.smart.expectText(paymentHeader, 'Payment');
  }

  async pay(data: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expirationMonth: string;
    expirationYear: string;
  }) {
    const fields: SmartTarget[] = [
      {
        locator: this.loc.nameOnCard,
        prompt: 'Name on card input in payment form.',
      },
      {
        locator: this.loc.cardNumber,
        prompt: 'Card number input in payment form.',
      },
      {
        locator: this.loc.cvc,
        prompt: 'CVC input in payment form.',
      },
      {
        locator: this.loc.expiryMonth,
        prompt: 'Expiry month input in payment form.',
      },
      {
        locator: this.loc.expiryYear,
        prompt: 'Expiry year input in payment form.',
      },
    ];
    const values = [
      data.nameOnCard,
      data.cardNumber,
      data.cvc,
      data.expirationMonth,
      data.expirationYear,
    ];
    for (let i = 0; i < fields.length; i++) {
      await this.smart.fill(fields[i], values[i]);
    }
    await this.smart.click({
      locator: this.loc.payAndConfirm,
      prompt: 'Pay and Confirm Order submit button #submit.',
    });
    await this.smart.expectText(
      {
        locator: this.loc.orderPlaced,
        prompt: 'Order placed success heading "Order Placed!".',
      },
      'Order Placed!',
    );
    await this.smart.click({
      locator: this.loc.continueBtn,
      prompt: 'Continue button after order placed.',
    });
  }
}
