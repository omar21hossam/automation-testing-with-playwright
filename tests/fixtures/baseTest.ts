import { test as base } from '@playwright/test';
import { HomePage } from '../pages/Home.page';
import { AuthPage } from '../pages/Auth.page';
import { ProductsPage } from '../pages/Products.page';
import { CartPage } from '../pages/Cart.page';
import { CheckoutPage } from '../pages/Checkout.page';
import { ContactPage } from '../pages/Contact.page';

type Pages = {
  home: HomePage;
  auth: AuthPage;
  products: ProductsPage;
  cart: CartPage;
  checkout: CheckoutPage;
  contact: ContactPage;
};

export const test = base.extend<Pages & { adBlock: void }>({
  adBlock: [async ({ page }, use) => {
    await page.route('**/*', route => {
      const url = route.request().url();
      if (/(doubleclick|googlesyndication|adservice|adnxs|adsystem|taboola)\./i.test(url)) {
        return route.abort();
      }
      return route.continue();
    });
    await page.addInitScript(() => {
      const hide = () => {
        document.querySelectorAll('iframe[id^="aswift_"], ins.adsbygoogle, .adsbygoogle').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      };
      hide();
      const observer = new MutationObserver(hide);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    await use();
  }, { auto: true }],
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  auth: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  products: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  contact: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});

export { expect } from '@playwright/test';


