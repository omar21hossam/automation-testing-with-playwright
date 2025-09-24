export class ProductsLocators {
  readonly pageHeader = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/h2',
    fallbacks: [
      'text=All Products',
      'h2:has-text("All Products")',
      'section h2:has-text("Products")'
    ]
  };

  readonly searchInput = {
    primary: 'xpath=/html/body/section[1]/div/input',
    fallbacks: [
      'input#search_product',
      'input[placeholder*="search"]',
      'input[type="text"]:below(:text("Search"))'
    ]
  };

  readonly searchButton = {
    primary: 'xpath=/html/body/section[1]/div/button',
    fallbacks: [
      'button#submit_search',
      'button:has-text("Search")',
      'input[type="submit"]:below(:text("Search"))'
    ]
  };

  // Product cards with fallbacks
  readonly firstCard = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]',
    fallbacks: [
      '.productinfo:first-of-type',
      '.single-products:first-of-type',
      'div[class*="product"]:first-of-type'
    ]
  };

  readonly firstCardName = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[1]/p',
    fallbacks: [
      '.productinfo p:first-of-type',
      '.single-products p:first-of-type',
      'div[class*="product"] p:first-of-type'
    ]
  };

  readonly firstCardAddBtn = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[1]/div[2]/div/a',
    fallbacks: [
      'div.productinfo a.add-to-cart',
      'a:has-text("Add to cart")',
      '.single-products a:has-text("Add")'
    ]
  };

  readonly secondCard = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]',
    fallbacks: [
      '.productinfo:nth-of-type(2)',
      '.single-products:nth-of-type(2)',
      'div[class*="product"]:nth-of-type(2)'
    ]
  };

  readonly secondCardName = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[1]/p',
    fallbacks: [
      '.productinfo:nth-of-type(2) p',
      '.single-products:nth-of-type(2) p',
      'div[class*="product"]:nth-of-type(2) p'
    ]
  };

  readonly secondCardAddBtn = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[3]/div/div[1]/div[2]/div/a',
    fallbacks: [
      '.productinfo:nth-of-type(2) a.add-to-cart',
      'a:has-text("Add to cart")',
      '.single-products:nth-of-type(2) a:has-text("Add")'
    ]
  };

  // Product details with fallbacks
  readonly viewFirstDetails = {
    primary: 'xpath=/html/body/section[2]/div/div/div[2]/div/div[2]/div/div[2]/ul/li/a',
    fallbacks: [
      'a:has-text("View Product")',
      '.productinfo a:has-text("View")',
      'a[href*="product_details"]'
    ]
  };

  readonly detailsImage = {
    primary: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[1]/div/img',
    fallbacks: [
      '.product-image img',
      'img[src*="product"]',
      '.product-details img'
    ]
  };

  readonly detailsTitle = {
    primary: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/h2',
    fallbacks: [
      '.product-details h2',
      'h2:has-text("Blue Top")',
      '.product-information h2'
    ]
  };

  readonly detailsPrice = {
    primary: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/span/span',
    fallbacks: [
      '.product-details span span',
      'span:has-text("Rs.")',
      '.price'
    ]
  };

  readonly detailsQuantity = {
    primary: '//*[@id="quantity"]',
    fallbacks: [
      '#quantity',
      'input[name="quantity"]',
      'input[type="number"]:below(:text("Quantity"))'
    ]
  };

  readonly detailsAddToCart = {
    primary: 'xpath=/html/body/section/div/div/div[2]/div[2]/div[2]/div/span/button',
    fallbacks: [
      'button:has-text("Add to cart")',
      'input[type="submit"]:has-text("Add")',
      '.product-details button'
    ]
  };

  // Modal with fallbacks
  readonly cartModalContinue = {
    primary: 'xpath=//*[@id="cartModal"]/div/div/div[3]/button',
    fallbacks: [
      'div#cartModal button.close-modal',
      'text=Continue Shopping',
      '.modal button:has-text("Continue")'
    ]
  };

  readonly cartModalViewCart = {
    primary: 'xpath=//*[@id="cartModal"]/div/div/div[2]/p[2]/a/u',
    fallbacks: [
      'div#cartModal a:has-text("View Cart")',
      'a:has-text("View Cart")',
      '.modal a:has-text("View")'
    ]
  };
}


