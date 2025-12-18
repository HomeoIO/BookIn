/**
 * LemonSqueezy Product Creation Script
 *
 * This script automatically creates all 10 products (5 books × 2 payment options)
 * in your LemonSqueezy store using their API.
 *
 * Prerequisites:
 * 1. LemonSqueezy account created
 * 2. Store created
 * 3. API key and Store ID added to .env file
 *
 * Usage:
 *   npm run lemonsqueezy:create
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '../.env') });

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const API_BASE = 'https://api.lemonsqueezy.com/v1';

// Import book data
import { BOOKS, getProductDescription } from './books-data.js';

// Pricing options
const PRICING = {
  lifetime: {
    price: 900, // $9.00 in cents
    interval: null,
    description: 'One-time payment for lifetime access',
  },
  subscription: {
    price: 300, // $3.00 in cents
    interval: 'month',
    intervalCount: 3, // Every 3 months (quarterly)
    description: 'Quarterly subscription - billed every 3 months',
  },
};

/**
 * Make API request to LemonSqueezy
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${API_KEY}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Create a product in LemonSqueezy
 */
async function createProduct(book, type) {
  const isLifetime = type === 'lifetime';
  const pricing = PRICING[type];

  const productName = `${book.title} (${book.titleZh}) - ${isLifetime ? 'Lifetime' : 'Subscription'}`;
  const productDescription = getProductDescription(book, type);

  console.log(`Creating: ${productName}...`);

  // Create product
  const productData = {
    data: {
      type: 'products',
      attributes: {
        store_id: parseInt(STORE_ID),
        name: productName,
        description: productDescription,
        status: 'draft', // Start as draft, you can publish manually
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: STORE_ID,
          },
        },
      },
    },
  };

  const product = await apiRequest('/products', 'POST', productData);
  const productId = product.data.id;

  console.log(`  ✓ Product created (ID: ${productId})`);

  // Create variant (pricing)
  const variantData = {
    data: {
      type: 'variants',
      attributes: {
        product_id: parseInt(productId),
        name: isLifetime ? 'Lifetime' : 'Quarterly',
        description: pricing.description,
        price: pricing.price,
        is_subscription: !isLifetime,
        interval: pricing.interval,
        interval_count: pricing.intervalCount,
        status: 'draft',
      },
      relationships: {
        product: {
          data: {
            type: 'products',
            id: productId,
          },
        },
      },
    },
  };

  const variant = await apiRequest('/variants', 'POST', variantData);
  const variantId = variant.data.id;

  console.log(`  ✓ Variant created (ID: ${variantId})`);

  // Get checkout URL
  const checkoutUrl = variant.data.attributes.buy_now_url;

  console.log(`  ✓ Checkout URL: ${checkoutUrl}`);
  console.log('');

  return {
    bookId: book.id,
    type,
    productId,
    variantId,
    checkoutUrl,
    productName,
  };
}

/**
 * Main execution
 */
async function main() {
  // Validate environment variables
  if (!API_KEY) {
    console.error('❌ Error: LEMONSQUEEZY_API_KEY environment variable not set');
    console.error('Usage: LEMONSQUEEZY_API_KEY=your_key LEMONSQUEEZY_STORE_ID=your_id node scripts/create-lemonsqueezy-products.js');
    process.exit(1);
  }

  if (!STORE_ID) {
    console.error('❌ Error: LEMONSQUEEZY_STORE_ID environment variable not set');
    console.error('Usage: LEMONSQUEEZY_API_KEY=your_key LEMONSQUEEZY_STORE_ID=your_id node scripts/create-lemonsqueezy-products.js');
    process.exit(1);
  }

  console.log('🍋 LemonSqueezy Product Creator\n');
  console.log(`Store ID: ${STORE_ID}`);
  console.log(`Creating ${BOOKS.length * 2} products (${BOOKS.length} books × 2 payment options)`);
  console.log(`This will take approximately ${Math.ceil(BOOKS.length / 10)} minutes...\n`);

  const results = [];

  try {
    // Create products for each book
    for (let i = 0; i < BOOKS.length; i++) {
      const book = BOOKS[i];
      const progress = `[${i + 1}/${BOOKS.length}]`;

      console.log(`${progress} 📚 ${book.title} (${book.titleZh})`);
      console.log(`         Category: ${book.category}`);

      // Create lifetime access product
      const lifetime = await createProduct(book, 'lifetime');
      results.push(lifetime);

      // Create subscription product
      const subscription = await createProduct(book, 'subscription');
      results.push(subscription);

      // Small delay to avoid rate limiting
      if (i < BOOKS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('✅ All products created successfully!\n');

    // Generate configuration for lemonsqueezy.ts
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Copy this to src/services/lemonsqueezy.ts:\n');
    console.log('export const PRODUCT_URLS: Record<string, string> = {');

    for (const result of results) {
      const key = `${result.bookId}-${result.type}`;
      console.log(`  '${key}': '${result.checkoutUrl}',`);
    }

    console.log('};\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Save to file
    const config = {
      generatedAt: new Date().toISOString(),
      storeId: STORE_ID,
      products: results,
      productUrls: results.reduce((acc, result) => {
        acc[`${result.bookId}-${result.type}`] = result.checkoutUrl;
        return acc;
      }, {}),
    };

    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const outputPath = path.join(__dirname, '../.lemonsqueezy-products.json');

    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log(`\n💾 Configuration saved to: ${outputPath}`);
    console.log(`📝 This file is gitignored and contains your LemonSqueezy product URLs`);

    console.log('\n🎉 Next steps:');
    console.log('1. Go to LemonSqueezy dashboard and publish the draft products');
    console.log('2. Copy the PRODUCT_URLS configuration above to src/services/lemonsqueezy.ts');
    console.log('3. Test checkout flow with test mode enabled');

  } catch (error) {
    console.error('\n❌ Error creating products:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Verify your API key is correct');
    console.error('- Verify your Store ID is correct');
    console.error('- Check you have permission to create products');
    console.error('- Ensure you are in test mode if testing');
    process.exit(1);
  }
}

// Run the script
main();
