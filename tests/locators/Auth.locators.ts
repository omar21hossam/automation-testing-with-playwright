import type { SmartTarget } from '../utils/smartLocator';

export class AuthLocators {
  readonly loginHeader: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[1]/div/h2',
    prompt: 'Login section heading (h2) with text "Login to your account".',
  };

  readonly loginEmail: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[1]/div/form/input[2]',
    prompt: 'Email input on the login form, type email, near the login heading.',
  };

  readonly loginPassword: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[1]/div/form/input[3]',
    prompt: 'Password input on the login form.',
  };

  readonly loginButton: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[1]/div/form/button',
    prompt: 'Login submit button on the login form (e.g. text "Login").',
  };

  readonly loginError: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[1]/div/form/p',
    prompt: 'Error message paragraph under the login form when credentials are wrong.',
  };

  readonly loggedInAs: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a',
    prompt: 'Header link showing logged-in user text starting with "Logged in as".',
  };

  readonly deleteAccountLink: SmartTarget = {
    locator: '//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a',
    prompt: 'Header link to delete account (href "/delete_account" or text "Delete Account").',
  };

  readonly signupHeader: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[3]/div/h2',
    prompt: 'Signup section heading (h2) "New User Signup!".',
  };

  readonly signupName: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[3]/div/form/input[2]',
    prompt: 'Name input on the signup form.',
  };

  readonly signupEmail: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[3]/div/form/input[3]',
    prompt: 'Email input on the signup form.',
  };

  readonly signupButton: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[3]/div/form/button',
    prompt: 'Signup submit button on the signup form.',
  };

  readonly emailExists: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div[3]/div/form/p',
    prompt: 'Error message when email already exists on signup form.',
  };

  readonly accountInfoHeader: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div/div[1]/h2/b',
    prompt: 'Heading "Enter Account Information" on account details form.',
  };

  readonly genderMale: SmartTarget = {
    locator: '//*[@id="id_gender1"]',
    prompt: 'Radio "Mr" / male gender on account form.',
  };

  readonly password: SmartTarget = {
    locator: '//*[@id="password"]',
    prompt: 'Account password field #password.',
  };

  readonly day: SmartTarget = {
    locator: '//*[@id="days"]',
    prompt: 'Day dropdown for date of birth.',
  };

  readonly month: SmartTarget = {
    locator: '//*[@id="months"]',
    prompt: 'Month dropdown for date of birth.',
  };

  readonly year: SmartTarget = {
    locator: '//*[@id="years"]',
    prompt: 'Year dropdown for date of birth.',
  };

  readonly newsletter: SmartTarget = {
    locator: '//*[@id="newsletter"]',
    prompt: 'Newsletter signup checkbox.',
  };

  readonly offers: SmartTarget = {
    locator: '//*[@id="optin"]',
    prompt: 'Special offers opt-in checkbox.',
  };

  readonly firstName: SmartTarget = {
    locator: '//*[@id="first_name"]',
    prompt: 'First name input on account form.',
  };

  readonly lastName: SmartTarget = {
    locator: '//*[@id="last_name"]',
    prompt: 'Last name input on account form.',
  };

  readonly company: SmartTarget = {
    locator: '//*[@id="company"]',
    prompt: 'Company name input.',
  };

  readonly address1: SmartTarget = {
    locator: '//*[@id="address1"]',
    prompt: 'Address line 1 input.',
  };

  readonly address2: SmartTarget = {
    locator: '//*[@id="address2"]',
    prompt: 'Address line 2 input.',
  };

  readonly country: SmartTarget = {
    locator: '//*[@id="country"]',
    prompt: 'Country dropdown.',
  };

  readonly state: SmartTarget = {
    locator: '//*[@id="state"]',
    prompt: 'State input field.',
  };

  readonly city: SmartTarget = {
    locator: '//*[@id="city"]',
    prompt: 'City input field.',
  };

  readonly zipcode: SmartTarget = {
    locator: '//*[@id="zipcode"]',
    prompt: 'Zipcode input field.',
  };

  readonly mobile: SmartTarget = {
    locator: '//*[@id="mobile_number"]',
    prompt: 'Mobile number input.',
  };

  readonly createAccountBtn: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div/div[1]/form/button',
    prompt: 'Create Account submit button.',
  };

  readonly accountCreatedHeader: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div/h2/b',
    prompt: 'Success heading "Account Created!".',
  };

  readonly continueBtn: SmartTarget = {
    locator: '//*[@id="form"]/div/div/div/div/a',
    prompt: 'Continue link or button after account created.',
  };
}
