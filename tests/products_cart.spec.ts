import { test } from './fixtures/baseTest';
import { users, products } from './data/testData';

test('add two products to cart and verify', async ({ home, products: prod, cart }) => {
  await home.goto();
  await home.openProducts();
  await prod.expectLoaded();
  await prod.addFirstTwoToCart();
  await prod.viewCartFromModal();
  await cart.expectProduct1(products.blueTop.name, products.blueTop.price, '1');
  await cart.expectProduct2(products.menTshirt.name, products.menTshirt.price, '1');
});

test('set quantity from details and verify in cart', async ({ home, products: prod }) => {
  await home.goto();
  await home.openProducts();
  await prod.expectLoaded();
  await prod.openFirstDetailsAndSetQuantity(4);
  await prod.viewCartFromModal();
});

test('place order after adding products (login first)', async ({ home, products: prod, cart, auth, checkout }) => {
  // Login first
  await home.goto();
  await home.openSignupLogin();
  await auth.expectLoginPage();
  await auth.login(users.valid.email, users.valid.password);
  await auth.expectLoggedInAs(users.valid.name);
  
  // Add products to cart
  await home.openProducts();
  await prod.expectLoaded();
  await prod.addFirstTwoToCart();
  await prod.viewCartFromModal();
  await cart.expectProduct1(products.blueTop.name, products.blueTop.price, '1');
  await cart.expectProduct2(products.menTshirt.name, products.menTshirt.price, '1');
  
  // Proceed to checkout
  await cart.proceedToCheckout();
  await checkout.expectAddresses(users.valid.address1, users.valid.address2);
  await checkout.placeOrderWithMessage('this is a test message');
  await checkout.pay(users.valid);
});

test('remove item from cart', async ({ home, products: prod, cart }) => {
  await home.goto();
  await home.openProducts();
  await prod.expectLoaded();
  await prod.addFirstTwoToCart();
  await prod.viewCartFromModal();
  await cart.removeFirstItem();
});


