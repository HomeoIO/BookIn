/**
 * LemonSqueezy Product Fetcher
 *
 * Since LemonSqueezy doesn't support creating products via API,
 * this script fetches existing products from your store and generates
 * the state file for the app to use.
 *
 * Usage:
 *   npm run lemonsqueezy:fetch
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const API_BASE = 'https://api.lemonsqueezy.com/v1';

/**
 * Make API request to LemonSqueezy
 */
async function apiRequest(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${API_KEY}`,
    },
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Fetch all products from store
 */
async function fetchProducts() {
  console.log('🍋 LemonSqueezy Product Fetcher\n');
  console.log(`Store ID: ${STORE_ID}`);
  console.log('Fetching products from your store...\n');

  try {
    // Fetch all products
    const response = await apiRequest(`/products?filter[store_id]=${STORE_ID}`);
    const products = response.data || [];

    console.log(`✅ Found ${products.length} products\n`);

    if (products.length === 0) {
      console.log('⚠️  No products found in your store.');
      console.log('\n💡 Next steps:');
      console.log('1. Go to https://app.lemonsqueezy.com/products');
      console.log('2. Click "New Product" to create products manually');
      console.log('3. Run this script again after creating products');
      return;
    }

    // Fetch variants for each product
    const productData = [];
    for (const product of products) {
      const productId = product.id;
      const productName = product.attributes.name;

      console.log(`📦 ${productName} (ID: ${productId})`);

      // Fetch variants
      const variantsResponse = await apiRequest(`/variants?filter[product_id]=${productId}`);
      const variants = variantsResponse.data || [];

      for (const variant of variants) {
        const checkoutUrl = variant.attributes.buy_now_url;
        console.log(`  ✓ Variant: ${variant.attributes.name}`);
        console.log(`    URL: ${checkoutUrl}`);

        // Try to match product name to book ID
        const bookId = extractBookId(productName);
        const type = extractType(productName);

        if (bookId && type) {
          productData.push({
            bookId,
            type,
            productId,
            variantId: variant.id,
            checkoutUrl,
            productName,
          });
        }
      }

      console.log('');
    }

    // Generate state file
    const config = {
      generatedAt: new Date().toISOString(),
      storeId: STORE_ID,
      products: productData,
      productUrls: productData.reduce((acc, item) => {
        acc[`${item.bookId}-${item.type}`] = item.checkoutUrl;
        return acc;
      }, {}),
    };

    const outputPath = join(__dirname, '../.lemonsqueezy-products.json');
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log(`✅ Successfully fetched ${productData.length} product URLs`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log(`\n📝 Product URL mapping created for ${Object.keys(config.productUrls).length} books`);

  } catch (error) {
    console.error('\n❌ Error fetching products:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Verify your API key is correct');
    console.error('- Verify your Store ID is correct');
    console.error('- Check your internet connection');
  }
}

/**
 * Extract book ID from product name
 * Expected format: "Book Title (中文) - Lifetime" or "Book Title (中文) - Subscription"
 */
function extractBookId(productName) {
  // Convert "Book Title (中文) - Lifetime" to "book-title"
  const match = productName.match(/^(.+?)\s*\([^)]+\)\s*-\s*(Lifetime|Subscription)/);
  if (match) {
    const title = match[1].trim();
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  return null;
}

/**
 * Extract type (lifetime or subscription) from product name
 */
function extractType(productName) {
  if (productName.includes('- Lifetime')) return 'lifetime';
  if (productName.includes('- Subscription')) return 'subscription';
  return null;
}

// Run the script
fetchProducts();
