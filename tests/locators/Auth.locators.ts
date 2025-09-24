export class AuthLocators {
  // Login section with fallbacks
  readonly loginHeader = {
    primary: '//*[@id="form"]/div/div/div[1]/div/h2',
    fallbacks: [
      'text=Login to your account',
      'h2:has-text("Login")',
      'form h2:has-text("Login")'
    ]
  };

  readonly loginEmail = {
    primary: '//*[@id="form"]/div/div/div[1]/div/form/input[2]',
    fallbacks: [
      'input[type="email"]:below(:text("Login to your account"))',
      'form input[type="email"]',
      'input[name="email"]'
    ]
  };

  readonly loginPassword = {
    primary: '//*[@id="form"]/div/div/div[1]/div/form/input[3]',
    fallbacks: [
      'input[type="password"]',
      'form input[type="password"]',
      'input[name="password"]'
    ]
  };

  readonly loginButton = {
    primary: '//*[@id="form"]/div/div/div[1]/div/form/button',
    fallbacks: [
      'form:has(input[type="password"]) >> text=Login',
      'button:has-text("Login")',
      'input[type="submit"]:has-text("Login")'
    ]
  };

  readonly loginError = {
    primary: '//*[@id="form"]/div/div/div[1]/div/form/p',
    fallbacks: [
      'text=Your email or password is incorrect!',
      'form p:has-text("incorrect")',
      '.error-message'
    ]
  };

  readonly loggedInAs = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a',
    fallbacks: [
      'xpath=//li/a[contains(.,"Logged in as ")]',
      'text=Logged in as',
      'header a:has-text("Logged in as")'
    ]
  };

  readonly deleteAccountLink = {
    primary: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a',
    fallbacks: [
      'a[href="/delete_account"]',
      'text=Delete Account',
      'header a:has-text("Delete")'
    ]
  };

  // Signup section with fallbacks
  readonly signupHeader = {
    primary: '//*[@id="form"]/div/div/div[3]/div/h2',
    fallbacks: [
      'text=New User Signup!',
      'h2:has-text("Signup")',
      'form h2:has-text("Signup")'
    ]
  };

  readonly signupName = {
    primary: '//*[@id="form"]/div/div/div[3]/div/form/input[2]',
    fallbacks: [
      'form >> input[name="name"]',
      'input[placeholder*="name"]',
      'input[type="text"]:below(:text("Signup"))'
    ]
  };

  readonly signupEmail = {
    primary: '//*[@id="form"]/div/div/div[3]/div/form/input[3]',
    fallbacks: [
      'form >> input[type="email"]',
      'input[placeholder*="email"]',
      'input[name="email"]:below(:text("Signup"))'
    ]
  };

  readonly signupButton = {
    primary: '//*[@id="form"]/div/div/div[3]/div/form/button',
    fallbacks: [
      'form >> text=Signup',
      'button:has-text("Signup")',
      'input[type="submit"]:has-text("Signup")'
    ]
  };

  readonly emailExists = {
    primary: '//*[@id="form"]/div/div/div[3]/div/form/p',
    fallbacks: [
      'text=Email Address already exist!',
      'form p:has-text("already exist")',
      '.error-message:has-text("exist")'
    ]
  };

  // Account creation form with fallbacks
  readonly accountInfoHeader = {
    primary: '//*[@id="form"]/div/div/div/div[1]/h2/b',
    fallbacks: [
      'text=Enter Account Information',
      'h2 b:has-text("Account")',
      'form h2:has-text("Account")'
    ]
  };

  readonly genderMale = {
    primary: '//*[@id="id_gender1"]',
    fallbacks: [
      'input#id_gender1',
      'input[value="Mr"]',
      'input[type="radio"][name="title"]'
    ]
  };

  readonly password = {
    primary: '//*[@id="password"]',
    fallbacks: [
      '#password',
      'input[name="password"]',
      'input[type="password"]:below(:text("Account"))'
    ]
  };

  readonly day = {
    primary: '//*[@id="days"]',
    fallbacks: [
      '#days',
      'select[name="days"]',
      'select:below(:text("Date of Birth"))'
    ]
  };

  readonly month = {
    primary: '//*[@id="months"]',
    fallbacks: [
      '#months',
      'select[name="months"]',
      'select:below(:text("Date of Birth"))'
    ]
  };

  readonly year = {
    primary: '//*[@id="years"]',
    fallbacks: [
      '#years',
      'select[name="years"]',
      'select:below(:text("Date of Birth"))'
    ]
  };

  readonly newsletter = {
    primary: '//*[@id="newsletter"]',
    fallbacks: [
      '#newsletter',
      'input[type="checkbox"][name="newsletter"]',
      'input[type="checkbox"]:below(:text("Sign up"))'
    ]
  };

  readonly offers = {
    primary: '//*[@id="optin"]',
    fallbacks: [
      '#optin',
      'input[type="checkbox"][name="optin"]',
      'input[type="checkbox"]:below(:text("Receive special offers"))'
    ]
  };

  readonly firstName = {
    primary: '//*[@id="first_name"]',
    fallbacks: [
      '#first_name',
      'input[name="first_name"]',
      'input[placeholder*="First Name"]'
    ]
  };

  readonly lastName = {
    primary: '//*[@id="last_name"]',
    fallbacks: [
      '#last_name',
      'input[name="last_name"]',
      'input[placeholder*="Last Name"]'
    ]
  };

  readonly company = {
    primary: '//*[@id="company"]',
    fallbacks: [
      '#company',
      'input[name="company"]',
      'input[placeholder*="Company"]'
    ]
  };

  readonly address1 = {
    primary: '//*[@id="address1"]',
    fallbacks: [
      '#address1',
      'input[name="address1"]',
      'input[placeholder*="Address"]'
    ]
  };

  readonly address2 = {
    primary: '//*[@id="address2"]',
    fallbacks: [
      '#address2',
      'input[name="address2"]',
      'input[placeholder*="Address 2"]'
    ]
  };

  readonly country = {
    primary: '//*[@id="country"]',
    fallbacks: [
      '#country',
      'select[name="country"]',
      'select:below(:text("Country"))'
    ]
  };

  readonly state = {
    primary: '//*[@id="state"]',
    fallbacks: [
      '#state',
      'input[name="state"]',
      'input[placeholder*="State"]'
    ]
  };

  readonly city = {
    primary: '//*[@id="city"]',
    fallbacks: [
      '#city',
      'input[name="city"]',
      'input[placeholder*="City"]'
    ]
  };

  readonly zipcode = {
    primary: '//*[@id="zipcode"]',
    fallbacks: [
      '#zipcode',
      'input[name="zipcode"]',
      'input[placeholder*="Zip"]'
    ]
  };

  readonly mobile = {
    primary: '//*[@id="mobile_number"]',
    fallbacks: [
      '#mobile_number',
      'input[name="mobile_number"]',
      'input[placeholder*="Mobile"]'
    ]
  };

  readonly createAccountBtn = {
    primary: '//*[@id="form"]/div/div/div/div[1]/form/button',
    fallbacks: [
      'form >> text=Create Account',
      'button:has-text("Create Account")',
      'input[type="submit"]:has-text("Create")'
    ]
  };

  readonly accountCreatedHeader = {
    primary: '//*[@id="form"]/div/div/div/h2/b',
    fallbacks: [
      'text=Account Created!',
      'h2 b:has-text("Account Created")',
      '.success-message:has-text("Created")'
    ]
  };

  readonly continueBtn = {
    primary: '//*[@id="form"]/div/div/div/div/a',
    fallbacks: [
      'text=Continue',
      'a:has-text("Continue")',
      'button:has-text("Continue")'
    ]
  };
}


