import { test, expect } from '@playwright/test';
import { userData } from './userData';





test("test case 1 register user", async ({page})=>{


    await page.goto('https://www.automationexercise.com/');
    //await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[3]/div/h2')).toHaveText("New User Signup!");
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[2]').fill(userData.name);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[3]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/button').click();
    await page.locator('//*[@id="form"]/div/div/div/div[1]/h2/b').isVisible();
    await page.locator('//*[@id="id_gender1"]').click();
    await page.locator('//*[@id="password"]').fill(userData.password);
    await page.locator('//*[@id="days"]').selectOption(userData.day); // Selects day 1
    await page.locator('//*[@id="months"]').selectOption(userData.month); // Selects January
    await page.locator('//*[@id="years"]').selectOption(userData.year); // Selects 1999
    await page.locator('//*[@id="newsletter"]').click();
    await page.locator('//*[@id="optin"]').click();
    await page.locator('//*[@id="first_name"]').fill(userData.firstName);
    await page.locator('//*[@id="last_name"]').fill(userData.lastName);
    await page.locator('//*[@id="company"]').fill(userData.company);
    await page.locator('//*[@id="address1"]').fill(userData.address1);
    await page.locator('//*[@id="address2"]').fill(userData.address2);
    await page.locator('//*[@id="country"]').selectOption(userData.country); // Selects United States
    await page.locator('//*[@id="state"]').fill(userData.state);
    await page.locator('//*[@id="city"]').fill(userData.city);
    await page.locator('//*[@id="zipcode"]').fill(userData.zipcode);
    await page.locator('//*[@id="mobile_number"]').fill(userData.mobile);
    await page.locator('//*[@id="form"]/div/div/div/div[1]/form/button').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Created!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    //await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a').click();
    //await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Deleted!");
    //await page.locator('//*[@id="form"]/div/div/div/div/a').click();

})

test('test case 2 login user with correct email and password', async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/h2')).toHaveText("Login to your account");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[2]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[3]').fill(userData.password);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/button').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Deleted!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
    }
)

test('test case 3 login user with incorrect email and password', async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/h2')).toHaveText("Login to your account");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[2]').fill("omar21hosssam@gmail.com");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[3]').fill("12345");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/button').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/form/p')).toHaveText("Your email or password is incorrect!");

})

test('test case 4 logout user', async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/h2')).toHaveText("Login to your account");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[2]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[3]').fill(userData.password);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/button').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a')).toHaveText("Signup / Login");
})

test('test case 5  register with existing email', async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[2]').fill(userData.name);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[3]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/button').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[3]/div/form/p')).toHaveText("Email Address already exist!");

});

test('test case 6  contact us', async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[8]/a').click();
    await expect(page.locator('//*[@id="contact-page"]/div[1]/div/div/h2')).toHaveText("Contact Us");
    await expect(page.locator('//*[@id="contact-page"]/div[2]/div[1]/div/h2')).toHaveText("Get In Touch");
    await page.locator('//*[@id="contact-us-form"]/div[1]/input').fill(userData.name);
    await page.locator('//*[@id="contact-us-form"]/div[2]/input').fill(userData.email);
    await page.locator('//*[@id="contact-us-form"]/div[3]/input').fill("Testing");
    await page.locator('//*[@id="message"]').fill("hello this is a test message");
    await page.locator('//*[@id="contact-us-form"]/div[5]/input').setInputFiles('E:\\QA\\playwright\\Screenshot (250).png');
    await page.locator('//*[@id="contact-us-form"]/div[6]/input').click();
    await expect(page.locator('//*[@id="contact-page"]/div[2]/div[1]/div/div[2]')).toHaveText("Success! Your details have been submitted successfully.");
    await page.locator('//*[@id="contact-page"]/div[2]/div[1]/div/div[3]/a').click();
});


test("test case 7 verify test case page", async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div[1]/div/h2/b')).toHaveText("Test Cases");
    await expect(page.locator('//*[@id="form"]/div/div[2]/div/div[1]/h4/a/u')).toHaveText("Test Case 1: Register User");
    await expect(page.locator('//*[@id="form"]/div/div[27]/div/div[1]/h4/a/u')).toHaveText("Test Case 26: Verify Scroll Up without 'Arrow' button and Scroll Down functionality");
})

test("test case 8 verify products page", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p')).toHaveText("Blue Top");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[1]/p')).toHaveText("Men Tshirt");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[2]/ul/li/a').click();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[1]/div/img').isVisible();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/h2').isVisible();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/p[1]').isVisible();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/span/span').isVisible();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/p[2]/b').isVisible();
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/span/button').isVisible();
});

test("test case 9 verify search product", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p')).toHaveText("Blue Top");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[1]/p')).toHaveText("Men Tshirt");
    await page.locator('xpath=/html/body/section[1]/div/input').fill("Blue Top");
    await page.locator('xpath=/html/body/section[1]/div/button').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p')).toHaveText("Blue Top");

})

test("test case 10 subscription home page", async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await expect(page.locator('//*[@id="footer"]/div[1]/div/div/div[2]/div/h2')).toHaveText("Subscription");
    await page.locator('//*[@id="susbscribe_email"]').fill(userData.email);
    await page.locator('//*[@id="subscribe"]/i').click();
    await expect(page.locator('//*[@id="success-subscribe"]/div')).toHaveText("You have been successfully subscribed!");
});

test("test case 11 subscription cart page", async ({page})=>{

    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[3]/a').click();
    await expect(page.locator('//*[@id="footer"]/div[1]/div/div/div[2]/div/h2')).toHaveText("Subscription");
    await page.locator('//*[@id="susbscribe_email"]').fill(userData.email);
    await page.locator('//*[@id="subscribe"]/i').click();
    await expect(page.locator('//*[@id="success-subscribe"]/div')).toHaveText("You have been successfully subscribed!");
});

test("test case 12 add product to cart", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[3]/button').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[3]/p')).toHaveText("Rs. 400");
    await expect(page.locator('//*[@id="product-2"]/td[4]/button')).toHaveText("1");
});

test("test case 13 verify product quantity in cart", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[2]/ul/li/a').click();
    await page.locator('//*[@id="quantity"]').fill("4");
    await page.locator('xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/span/button').click();
    await page.locator('//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("4");
});

test("test case 14 Place Order: Register while Checkout", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[3]/button').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[3]/p')).toHaveText("Rs. 400");
    await expect(page.locator('//*[@id="product-2"]/td[4]/button')).toHaveText("1");
    await page.locator('//*[@id="do_action"]/div[1]/div/div/a').click();
    await page.locator('//*[@id="checkoutModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[3]/div/h2')).toHaveText("New User Signup!");
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[2]').fill(userData.name);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[3]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/button').click();
    await page.locator('//*[@id="form"]/div/div/div/div[1]/h2/b').isVisible();
    await page.locator('//*[@id="id_gender1"]').click();
    await page.locator('//*[@id="password"]').fill(userData.password);
    await page.locator('//*[@id="days"]').selectOption(userData.day); // Selects day 1
    await page.locator('//*[@id="months"]').selectOption(userData.month); // Selects January
    await page.locator('//*[@id="years"]').selectOption(userData.year); // Selects 1999
    await page.locator('//*[@id="newsletter"]').click();
    await page.locator('//*[@id="optin"]').click();
    await page.locator('//*[@id="first_name"]').fill(userData.firstName);
    await page.locator('//*[@id="last_name"]').fill(userData.lastName);
    await page.locator('//*[@id="company"]').fill(userData.company);
    await page.locator('//*[@id="address1"]').fill(userData.address1);
    await page.locator('//*[@id="address2"]').fill(userData.address2);
    await page.locator('//*[@id="country"]').selectOption(userData.country); // Selects United States
    await page.locator('//*[@id="state"]').fill(userData.state);
    await page.locator('//*[@id="city"]').fill(userData.city);
    await page.locator('//*[@id="zipcode"]').fill(userData.zipcode);
    await page.locator('//*[@id="mobile_number"]').fill(userData.mobile);
    await page.locator('//*[@id="form"]/div/div/div/div[1]/form/button').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Created!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[3]/a').click();
    await page.locator('//*[@id="do_action"]/div[1]/div/div/a').click();
    await page.pause();
    await expect(page.locator('//*[@id="address_delivery"]/li[4]')).toHaveText(userData.address1);
    await expect(page.locator('//*[@id="address_delivery"]/li[5]')).toHaveText(userData.address2);
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[5]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[5]/p')).toHaveText("Rs. 400");
    await page.locator('//*[@id="ordermsg"]/textarea').fill("this is a test message");
    await page.locator('//*[@id="cart_items"]/div/div[7]/a').click();
    await expect(page.locator('//*[@id="cart_items"]/div/div[2]/h2')).toHaveText("Payment");
    await page.locator('//*[@id="payment-form"]/div[1]/div/input').fill(userData.nameOnCard);
    await page.locator('//*[@id="payment-form"]/div[2]/div/input').fill(userData.cardNumber);
    await page.locator('//*[@id="payment-form"]/div[3]/div[1]/input').fill(userData.cvc);
    await page.locator('//*[@id="payment-form"]/div[3]/div[2]/input').fill(userData.expirationMonth); // Selects January
    await page.locator('//*[@id="payment-form"]/div[3]/div[3]/input').fill(userData.expirationYear); // Selects 2026
    await page.locator('//*[@id="submit"]').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Order Placed!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
});


test("test case 15 Place Order: Register before Checkout", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    //await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[3]/div/h2')).toHaveText("New User Signup!");
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[2]').fill(userData.name);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/input[3]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[3]/div/form/button').click();
    await page.locator('//*[@id="form"]/div/div/div/div[1]/h2/b').isVisible();
    await page.locator('//*[@id="id_gender1"]').click();
    await page.locator('//*[@id="password"]').fill(userData.password);
    await page.locator('//*[@id="days"]').selectOption(userData.day); // Selects day 1
    await page.locator('//*[@id="months"]').selectOption(userData.month); // Selects January
    await page.locator('//*[@id="years"]').selectOption(userData.year); // Selects 1999
    await page.locator('//*[@id="newsletter"]').click();
    await page.locator('//*[@id="optin"]').click();
    await page.locator('//*[@id="first_name"]').fill(userData.firstName);
    await page.locator('//*[@id="last_name"]').fill(userData.lastName);
    await page.locator('//*[@id="company"]').fill(userData.company);
    await page.locator('//*[@id="address1"]').fill(userData.address1);
    await page.locator('//*[@id="address2"]').fill(userData.address2);
    await page.locator('//*[@id="country"]').selectOption(userData.country); // Selects United States
    await page.locator('//*[@id="state"]').fill(userData.state);
    await page.locator('//*[@id="city"]').fill(userData.city);
    await page.locator('//*[@id="zipcode"]').fill(userData.zipcode);
    await page.locator('//*[@id="mobile_number"]').fill(userData.mobile);
    await page.locator('//*[@id="form"]/div/div/div/div[1]/form/button').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Created!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[3]/button').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[3]/p')).toHaveText("Rs. 400");
    await expect(page.locator('//*[@id="product-2"]/td[4]/button')).toHaveText("1");
    await page.locator('//*[@id="do_action"]/div[1]/div/div/a').click();
    await page.pause();
    await expect(page.locator('//*[@id="address_delivery"]/li[4]')).toHaveText(userData.address1);
    await expect(page.locator('//*[@id="address_delivery"]/li[5]')).toHaveText(userData.address2);
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[5]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[5]/p')).toHaveText("Rs. 400");
    await page.locator('//*[@id="ordermsg"]/textarea').fill("this is a test message");
    await page.locator('//*[@id="cart_items"]/div/div[7]/a').click();
    await expect(page.locator('//*[@id="cart_items"]/div/div[2]/h2')).toHaveText("Payment");
    await page.locator('//*[@id="payment-form"]/div[1]/div/input').fill(userData.nameOnCard);
    await page.locator('//*[@id="payment-form"]/div[2]/div/input').fill(userData.cardNumber);
    await page.locator('//*[@id="payment-form"]/div[3]/div[1]/input').fill(userData.cvc);
    await page.locator('//*[@id="payment-form"]/div[3]/div[2]/input').fill(userData.expirationMonth); // Selects January
    await page.locator('//*[@id="payment-form"]/div[3]/div[3]/input').fill(userData.expirationYear); // Selects 2026
    await page.locator('//*[@id="submit"]').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Order Placed!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
});

test("test case 16 Place Order: Login before Checkout", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await page.pause();
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/h2')).toHaveText("Login to your account");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[2]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[3]').fill(userData.password);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/button').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[3]/button').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[3]/p')).toHaveText("Rs. 400");
    await expect(page.locator('//*[@id="product-2"]/td[4]/button')).toHaveText("1");
    await page.locator('//*[@id="do_action"]/div[1]/div/div/a').click();
    await expect(page.locator('//*[@id="address_delivery"]/li[4]')).toHaveText(userData.address1);
    await expect(page.locator('//*[@id="address_delivery"]/li[5]')).toHaveText(userData.address2);
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[5]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[5]/p')).toHaveText("Rs. 400");
    await page.locator('//*[@id="ordermsg"]/textarea').fill("this is a test message");
    await page.locator('//*[@id="cart_items"]/div/div[7]/a').click();
    await expect(page.locator('//*[@id="cart_items"]/div/div[2]/h2')).toHaveText("Payment");
    await page.locator('//*[@id="payment-form"]/div[1]/div/input').fill(userData.nameOnCard);
    await page.locator('//*[@id="payment-form"]/div[2]/div/input').fill(userData.cardNumber);
    await page.locator('//*[@id="payment-form"]/div[3]/div[1]/input').fill(userData.cvc);
    await page.locator('//*[@id="payment-form"]/div[3]/div[2]/input').fill(userData.expirationMonth); // Selects January
    await page.locator('//*[@id="payment-form"]/div[3]/div[3]/input').fill(userData.expirationYear); // Selects 2026
    await page.locator('//*[@id="submit"]').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Order Placed!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();

});

test("test case 17 Remove item from cart", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[3]/button').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await expect(page.locator('//*[@id="product-2"]/td[2]/h4/a')).toHaveText("Men Tshirt");
    await expect(page.locator('//*[@id="product-2"]/td[3]/p')).toHaveText("Rs. 400");
    await expect(page.locator('//*[@id="product-2"]/td[4]/button')).toHaveText("1");
    await page.pause();
    await page.locator('//*[@id="product-1"]/td[6]/a/i').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).not.toBeVisible();

});

test("test case 18 View Category Products", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[1]/div/h2')).toHaveText("Category");
    await page.locator('xpath=//*[@id="accordian"]/div[1]/div[1]/h4/a').click(); // click on women category
    await page.locator('xpath=//*[@id="Women"]/div/ul/li[1]/a').click(); // click on dress
    await expect(page.locator('xpath=/html/body/section/div/div[2]/div[2]/div/h2')).toHaveText("Women - Dress Products")
});

test("test case 19 Verify Terms and Conditions", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await page.pause();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[1]/div/div[3]/h2')).toHaveText("Brands");
    // choose polo brand
    await page.locator('body > section > div > div.row > div.col-sm-3 > div.left-sidebar > div.brands_products > div > ul > li:nth-child(1) > a').click(); 
    await expect(page.locator('xpath=/html/body/section/div/div[2]/div[2]/div/h2')).toHaveText("Brand - Polo Products");

});

test("test case 20 Search Products and Verify Cart After Login", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/h2')).toHaveText("All Products");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p')).toHaveText("Blue Top");
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[1]/p')).toHaveText("Men Tshirt");
    await page.locator('xpath=/html/body/section[1]/div/input').fill("Blue Top");
    await page.locator('xpath=/html/body/section[1]/div/button').click();
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p')).toHaveText("Blue Top");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[4]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div[1]/div/h2')).toHaveText("Login to your account");
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[2]').fill(userData.email);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/input[3]').fill(userData.password);
    await page.locator('//*[@id="form"]/div/div/div[1]/div/form/button').click();
    await expect(page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[10]/a')).toHaveText("Logged in as omar");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[3]/a').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[5]/a').click();
    await expect(page.locator('//*[@id="form"]/div/div/div/h2/b')).toHaveText("Account Deleted!");
    await page.locator('//*[@id="form"]/div/div/div/div/a').click();
});

test("test case 21  Add review on product", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    // Asseration
    await page.locator('//*[@id="header"]/div/div/div/div[1]/div/a/img').isVisible();
    await page.locator('//*[@id="header"]/div/div/div/div[2]/div/ul/li[2]/a').click();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[2]/ul/li/a').click();
    await page.pause();
    await page.locator('//*[@id="name"]').fill(userData.name);
    await page.locator('//*[@id="email"]').fill(userData.email);
    await page.locator('//*[@id="review"]').fill("This is a test review");
    await page.locator('//*[@id="button-review"]').click();
    await expect(page.locator('//*[@id="review-section"]/div/div/span')).toHaveText("Thank you for your review.");
});

test("test case 22 Add to cart from Recommended items", async ({page})=>{
    await page.goto('https://www.automationexercise.com/');
    await expect(page.locator('xpath=/html/body/section[2]/div/div/div[2]/div[1]/h2')).toHaveText("Features Items");
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]').hover();
    await page.locator('xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a').click();
    await page.locator('xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u').click();
    await expect(page.locator('//*[@id="product-1"]/td[2]/h4/a')).toHaveText("Blue Top");
    await expect(page.locator('//*[@id="product-1"]/td[3]/p')).toHaveText("Rs. 500");
    await expect(page.locator('//*[@id="product-1"]/td[4]/button')).toHaveText("1");
});
