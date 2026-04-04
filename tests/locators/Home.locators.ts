import type { SmartTarget } from '../utils/smartLocator';

export class HomeLocators {
  readonly logo: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[1]/div/a/img',
    prompt: 'Site logo image in the header (automation practice logo).',
  };

  readonly signupLoginLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a',
    prompt: 'Header link "Signup / Login" to /login.',
  };

  readonly logoutLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a',
    prompt: 'Header "Logout" link when logged in.',
  };

  readonly cartLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[3]/a',
    prompt: 'Header "Cart" link to view cart.',
  };

  readonly productsLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a',
    prompt: 'Header "Products" link to /products.',
  };

  readonly testCasesLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a',
    prompt: 'Header "Test Cases" link.',
  };

  readonly subscriptionTitle: SmartTarget = {
    locator: '//*[@id="footer"]/div[1]/div/div/div[2]/div/h2',
    prompt: 'Footer subscription section heading "Subscription".',
  };

  readonly subscribeEmail: SmartTarget = {
    locator: '//*[@id="susbscribe_email"]',
    prompt: 'Footer email input for newsletter (id susbscribe_email).',
  };

  readonly subscribeBtn: SmartTarget = {
    locator: '//*[@id="subscribe"]/i',
    prompt: 'Footer subscribe button icon next to subscription email.',
  };

  readonly subscribeSuccess: SmartTarget = {
    locator: '//*[@id="success-subscribe"]/div',
    prompt: 'Subscription success message container (successfully subscribed).',
  };
}
