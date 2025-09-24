import { test } from './fixtures/baseTest';
import { users } from './data/testData';

test('contact us form submits successfully', async ({ home, contact }) => {
  await home.goto();
  await home.expectLogoVisible();
  await home.openContact();
  await contact.expectLoaded();
  await contact.submitForm({
    name: users.valid.name,
    email: users.valid.email,
    subject: 'Testing',
    message: 'hello this is a test message',
    filePath: 'E:/QA/playwright/Screenshot (250).png',
  });
  await contact.backHome();
});


