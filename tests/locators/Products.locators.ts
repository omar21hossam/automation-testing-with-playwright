import type { SmartTarget } from '../utils/smartLocator';

export class ProductsLocators {
  readonly pageHeader: SmartTarget = {
    locator: 'text=All Products',
    prompt: 'Products page heading "All Products".',
  };

  readonly searchInput: SmartTarget = {
    locator: 'xpath=/html/body/section[1]/div/inputdfgj',
    prompt: 'Product search text input above the product list.',
  };

  readonly searchButton: SmartTarget = {
    locator: 'xpath=/html/body/section[1]/div/buttondfgd',
    prompt: 'Search submit button next to search input.',
  };

  readonly firstCard: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/dfgddiv/div[1]',
    prompt: 'First product card container in the products grid.',
  };

  readonly firstCardName: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/ddfgdfgiv/div[1]/div[1]/p',
    prompt: 'Product name text on the first product card.',
  };

  readonly firstCardAddBtn: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/didfgdgv/div[1]/div[2]/div/a',
    prompt: 'Add to cart link on the first product card.',
  };

  readonly secondCard: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/dfgdfgdiv/div[1]',
    prompt: 'Second product card container in the grid.',
  };

  readonly secondCardName: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/ddgfdgiv/div[1]/div[1]/p',
    prompt: 'Product name on the second product card.',
  };

  readonly secondCardAddBtn: SmartTarget = {
    locator: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/didfgv/div[1]/div[2]/div/a',
    prompt: 'Add to cart link on the second product card.',
  };

  readonly viewFirstDetails: SmartTarget = {
    locator: 'text=View Product',
    prompt: 'View Product link on the first product card.',
  };

  readonly detailsImage: SmartTarget = {
    locator: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[1]/didfgv/img',
    prompt: 'Main product image on product details page.',
  };

  readonly detailsTitle: SmartTarget = {
    locator: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/dfgdiv/h2',
    prompt: 'Product title heading on details page.',
  };

  readonly detailsPrice: SmartTarget = {
    locator: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/divdfg/span/span',
    prompt: 'Product price (Rs.) on details page.',
  };

  readonly detailsQuantity: SmartTarget = {
    locator: '//*[@id="quantity"]',
    prompt: 'Quantity input on product details.',
  };

  readonly detailsAddToCart: SmartTarget = {
    locator: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/ddfgiv/span/button',
    prompt: 'Add to cart button on product details page.',
  };

  readonly cartModalContinue: SmartTarget = {
    locator: 'xpath=//*[@id="cartModal"]/div/div/div[3]/button',
    prompt: 'Cart modal "Continue Shopping" close button.',
  };

  readonly cartModalViewCart: SmartTarget = {
    locator: 'xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u',
    prompt: 'Cart modal "View Cart" link.',
  };
}
