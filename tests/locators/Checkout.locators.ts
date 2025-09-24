export class CheckoutLocators {
  readonly address1 = '//*[@id="address_delivery"]/li[4]';
  readonly address2 = '//*[@id="address_delivery"]/li[5]';
  readonly orderComment = '//*[@id="ordermsg"]/textarea';
  readonly placeOrder = '//*[@id="cart_items"]/div/div[7]/a';
  readonly paymentHeader = '//*[@id="cart_items"]/div/div[2]/h2';
  readonly nameOnCard = '//*[@id="payment-form"]/div[1]/div/input';
  readonly cardNumber = '//*[@id="payment-form"]/div[2]/div/input';
  readonly cvc = '//*[@id="payment-form"]/div[3]/div[1]/input';
  readonly expiryMonth = '//*[@id="payment-form"]/div[3]/div[2]/input';
  readonly expiryYear = '//*[@id="payment-form"]/div[3]/div[3]/input';
  readonly payAndConfirm = '//*[@id="submit"]';
  readonly orderPlaced = '//*[@id="form"]/div/div/div/h2/b';
  readonly continueBtn = '//*[@id="form"]/div/div/div/div/a';
}


