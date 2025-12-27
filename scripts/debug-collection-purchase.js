#!/usr/bin/env node

/**
 * Debug script to check collection purchases in Firestore
 * Usage: node scripts/debug-collection-purchase.js YOUR_USER_ID
 */

import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function debugCollectionPurchase(userId) {
  if (!userId) {
    console.error('❌ Usage: node scripts/debug-collection-purchase.js YOUR_USER_ID');
    process.exit(1);
  }

  console.log(`🔍 Checking collection purchases for user: ${userId}\n`);

  try {
    // Check collectionPurchases subcollection
    const collectionPurchasesRef = db.collection('users').doc(userId).collection('collectionPurchases');
    const snapshot = await collectionPurchasesRef.get();

    console.log(`📦 Collection Purchases found: ${snapshot.size}\n`);

    if (snapshot.empty) {
      console.log('⚠️  No collection purchases found for this user.');
      console.log('\nPossible reasons:');
      console.log('1. Webhook did not fire or failed');
      console.log('2. User ID mismatch between auth and webhook');
      console.log('3. Purchase is still processing\n');

      console.log('💡 Check:');
      console.log('- Server logs for webhook events');
      console.log('- Stripe dashboard for successful payment');
      console.log('- Firebase console: users/{userId}/collectionPurchases/');
    } else {
      snapshot.forEach((doc) => {
        console.log(`✅ Collection Purchase: ${doc.id}`);
        console.log('   Data:', JSON.stringify(doc.data(), null, 2));
        console.log('');
      });

      console.log('✅ Expected collection ID: "2026-founding-collection"');
      console.log('   Match:', snapshot.docs.some(doc => doc.id === '2026-founding-collection') ? '✅ YES' : '❌ NO');
    }

    // Also check regular purchases for comparison
    const purchasesRef = db.collection('users').doc(userId).collection('purchases');
    const purchasesSnapshot = await purchasesRef.get();
    console.log(`\n📚 Regular book purchases found: ${purchasesSnapshot.size}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

const userId = process.argv[2];
debugCollectionPurchase(userId);
