#!/usr/bin/env node

/**
 * Create Stripe product and price for the Founding Collection
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const COLLECTION_ID = '2026-founding-collection';
const COLLECTION_NAME = '2026 Founding Collection - Lifetime Access';
const COLLECTION_PRICE = 9.99; // $9.99

async function createCollectionProduct() {
  try {
    console.log('🚀 Creating Stripe product for Founding Collection...\n');

    // Create product
    const product = await stripe.products.create({
      name: COLLECTION_NAME,
      description: 'Lifetime access to all 107 books in the founding collection. Limited time offer for early supporters!',
      metadata: {
        type: 'collection',
        collectionId: COLLECTION_ID,
      },
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`   Name: ${product.name}`);

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(COLLECTION_PRICE * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        type: 'collection',
        collectionId: COLLECTION_ID,
      },
    });

    console.log(`\n✅ Price created: ${price.id}`);
    console.log(`   Amount: $${COLLECTION_PRICE.toFixed(2)}`);

    console.log('\n📋 Next Steps:');
    console.log('1. Update src/core/domain/Collection.ts with the price ID:');
    console.log(`   stripeProductId: '${price.id}',`);
    console.log('\n2. Test the purchase flow');
    console.log('3. Monitor webhook events in Stripe dashboard');

    return { product, price };
  } catch (error) {
    console.error('❌ Error creating Stripe product:', error.message);
    throw error;
  }
}

createCollectionProduct();
