/**
 * Stripe Product Creation Script
 *
 * This script automatically creates all 214 products (107 books × 2 payment options)
 * in your Stripe account using their API.
 *
 * Prerequisites:
 * 1. Stripe account created
 * 2. API key generated (Dashboard → Developers → API keys)
 *
 * Usage:
 *   npm run stripe:create
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '../.env') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Import book data
import { BOOKS, getProductDescription } from './books-data.js';

// Pricing options
const PRICING = {
  lifetime: {
    amount: 900, // $9.00 in cents
    type: 'one_time',
    description: 'One-time payment for lifetime access',
  },
  subscription: {
    amount: 300, // $3.00 in cents
    type: 'recurring',
    interval: 'month',
    intervalCount: 3, // Every 3 months (quarterly)
    description: 'Quarterly subscription - billed every 3 months',
  },
};

/**
 * Create a product and price in Stripe
 */
async function createProduct(book, type) {
  const isLifetime = type === 'lifetime';
  const pricing = PRICING[type];

  const productName = `${book.title} (${book.titleZh}) - ${isLifetime ? 'Lifetime' : 'Subscription'}`;
  const productDescription = getProductDescription(book, type);

  console.log(`Creating: ${productName}...`);

  try {
    // Create product
    const product = await stripe.products.create({
      name: productName,
      description: productDescription,
      metadata: {
        bookId: book.id,
        type: type,
        category: book.category,
      },
    });

    console.log(`  ✓ Product created (ID: ${product.id})`);

    // Create price
    const priceData = {
      product: product.id,
      unit_amount: pricing.amount,
      currency: 'usd',
      metadata: {
        bookId: book.id,
        type: type,
      },
    };

    // Add recurring details if subscription
    if (!isLifetime) {
      priceData.recurring = {
        interval: pricing.interval,
        interval_count: pricing.intervalCount,
      };
    }

    const price = await stripe.prices.create(priceData);

    console.log(`  ✓ Price created (ID: ${price.id})`);
    console.log('');

    return {
      bookId: book.id,
      type,
      productId: product.id,
      priceId: price.id,
      productName,
    };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  // Validate environment variables
  if (!STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable not set');
    console.error('Usage: Add STRIPE_SECRET_KEY to .env file or run:');
    console.error('  STRIPE_SECRET_KEY=sk_test_xxx npm run stripe:create');
    process.exit(1);
  }

  // Detect if using test or live keys
  const isTestMode = STRIPE_SECRET_KEY.startsWith('sk_test_');
  const mode = isTestMode ? 'test' : 'production';

  console.log('💳 Stripe Product Creator\n');
  console.log(`Mode: ${mode.toUpperCase()} (${isTestMode ? 'Test' : 'Live'} API key detected)`);
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

      // Small delay to avoid rate limiting (Stripe is generous, but still good practice)
      if (i < BOOKS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log('✅ All products created successfully!\n');

    // Save to file
    const config = {
      generatedAt: new Date().toISOString(),
      products: results,
      priceIds: results.reduce((acc, result) => {
        acc[`${result.bookId}-${result.type}`] = result.priceId;
        return acc;
      }, {}),
    };

    const outputPath = join(__dirname, `../public/stripe-products.${mode}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

    console.log(`💾 Configuration saved to: ${outputPath}`);
    console.log(`📝 This file contains your Stripe ${mode} price IDs`);

    console.log('\n🎉 Next steps:');
    console.log('1. Products are live in Stripe (you can view them in the dashboard)');
    console.log(`2. Price IDs are saved to stripe-products.${mode}.json`);
    console.log(`3. Ensure .env has VITE_STRIPE_MODE=${mode}`);
    console.log('4. Run `npm run dev` to test checkout flow');
    if (isTestMode) {
      console.log('5. Use test card: 4242 4242 4242 4242 to test payments');
    }

  } catch (error) {
    console.error('\n❌ Error creating products:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Verify your Stripe API key is correct');
    console.error('- Ensure you have permission to create products');
    console.error('- Check you are using a test key (sk_test_...) for testing');
    console.error('- Check the Stripe API status: https://status.stripe.com');
    process.exit(1);
  }
}

// Run the script
main();
