export class HomeLocators {
  // Logo with fallbacks
  readonly logo = {
    primary: '//*[@id="header"]/div/div/div/div[1]/div/a/img',
    fallbacks: [
      'img[alt="Website for automation practice"]',
      'img[src*="logo"]',
      'header img'
    ]
  };

  // Signup/Login link with fallbacks
  readonly signupLoginLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a',
    fallbacks: [
      'a[href="/login"]',
      'text=Signup / Login',
      'text=Login',
      'header a:has-text("Login")'
    ]
  };

  // Logout link with fallbacks
  readonly logoutLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a',
    fallbacks: [
      'a[href="/logout"]',
      'text=Logout',
      'header a:has-text("Logout")'
    ]
  };

  // Cart link with fallbacks
  readonly cartLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[3]/a',
    fallbacks: [
      'a[href="/view_cart"]',
      'text=Cart',
      'header a:has-text("Cart")'
    ]
  };

  // Products link with fallbacks
  readonly productsLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a',
    fallbacks: [
      'a[href="/products"]',
      'text=Products',
      'header a:has-text("Products")'
    ]
  };

  // Test cases link with fallbacks
  readonly testCasesLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a',
    fallbacks: [
      'a[href="/test_cases"]',
      'text=Test Cases',
      'header a:has-text("Test Cases")'
    ]
  };

  // Subscription section with fallbacks
  readonly subscriptionTitle = {
    primary: '//*[@id="footer"]/div[1]/div/div/div[2]/div/h2',
    fallbacks: [
      'text=Subscription',
      'footer h2:has-text("Subscription")',
      'h2:has-text("Subscription")'
    ]
  };

  readonly subscribeEmail = {
    primary: '//*[@id="susbscribe_email"]',
    fallbacks: [
      '#susbscribe_email',
      'input[placeholder*="email"]',
      'input[type="email"]:below(:text("Subscription"))'
    ]
  };

  readonly subscribeBtn = {
    primary: '//*[@id="subscribe"]/i',
    fallbacks: [
      '#subscribe i',
      'button:has-text("Subscribe")',
      'input[type="submit"]:below(:text("Subscription"))'
    ]
  };

  readonly subscribeSuccess = {
    primary: '//*[@id="success-subscribe"]/div',
    fallbacks: [
      '#success-subscribe div',
      'text=successfully subscribed',
      '.alert-success:has-text("subscribed")'
    ]
  };
}


