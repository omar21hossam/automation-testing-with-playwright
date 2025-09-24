import { Page, expect } from '@playwright/test';
import { ContactLocators } from '../locators/Contact.locators';

export class ContactPage {
  constructor(private readonly page: Page, private readonly loc = new ContactLocators()) {}

  async expectLoaded() {
    await expect(this.page.locator(this.loc.pageHeader)).toHaveText('Contact Us');
    await expect(this.page.locator(this.loc.getInTouchHeader)).toHaveText('Get In Touch');
  }

  async submitForm(data: { name: string; email: string; subject: string; message: string; filePath?: string; }) {
    await this.page.locator(this.loc.name).fill(data.name);
    await this.page.locator(this.loc.email).fill(data.email);
    await this.page.locator(this.loc.subject).fill(data.subject);
    await this.page.locator(this.loc.message).fill(data.message);
    if (data.filePath) {
      await this.page.locator(this.loc.upload).setInputFiles(data.filePath);
    }
    const acceptAlert = this.page.waitForEvent('dialog').then(d => d.accept());
    await this.page.locator(this.loc.submit).click();
    await acceptAlert.catch(() => {});
    await expect(this.page.locator(this.loc.success)).toContainText('Success');
  }

  async backHome() {
    await this.page.locator(this.loc.homeBtn).click();
  }
}


