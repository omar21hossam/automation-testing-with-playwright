import { Page, expect } from '@playwright/test';
import { ProductsLocators } from '../locators/Products.locators';
import { SmartLocator } from '../utils/smartLocator';

export class ProductsPage {
  private readonly smart: SmartLocator;
  constructor(private readonly page: Page, private readonly loc = new ProductsLocators()) {
    this.smart = new SmartLocator(page);
  }

  async expectLoaded() {
    await this.smart.expectText(this.loc.pageHeader, 'All Products');
  }

  async search(term: string) {
    await this.smart.fill(this.loc.searchInput, term);
    await this.smart.click(this.loc.searchButton);
  }

  async addFirstTwoToCart() {
    await this.page.locator(this.loc.firstCard.primary).scrollIntoViewIfNeeded();
    await this.page.locator(this.loc.firstCard.primary).hover({ force: true });
    await this.smart.click(this.loc.firstCardAddBtn);
    await this.smart.click(this.loc.cartModalContinue);
    await this.page.locator(this.loc.secondCard.primary).scrollIntoViewIfNeeded();
    await this.page.locator(this.loc.secondCard.primary).hover({ force: true });
    await this.smart.click(this.loc.secondCardAddBtn);
  }

  async viewCartFromModal() {
    await this.smart.click(this.loc.cartModalViewCart);
  }

  async openFirstDetailsAndSetQuantity(quantity: number) {
    await this.smart.click(this.loc.viewFirstDetails);
    await expect(this.page.locator(this.loc.detailsImage.primary)).toBeVisible();
    await this.smart.fill(this.loc.detailsQuantity, String(quantity));
    await this.smart.click(this.loc.detailsAddToCart);
  }
}


