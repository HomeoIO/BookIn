# BookIn Production Deployment Guide

## Overview

This guide covers deploying BookIn to production with:
- Frontend: Firebase Hosting (static React app)
- Backend: Firebase Cloud Functions (Express webhook server)
- Database: Firestore
- Storage: Firebase Storage
- Payments: Stripe (production mode)

## Architecture

```
User Browser
    ↓
Firebase Hosting (React SPA)
    ↓
Firebase Auth, Firestore, Storage
    ↓
Stripe Checkout → Stripe Webhook → Firebase Cloud Function
```

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project created with Blaze (pay-as-you-go) plan
3. Stripe account with production API keys
4. Domain name (optional but recommended)

---

## Step 1: Firebase Setup

### 1.1 Login to Firebase
```bash
firebase login
```

### 1.2 Initialize Firebase Project
```bash
firebase init
```

Select:
- [x] Firestore
- [x] Functions
- [x] Hosting
- [x] Storage

Configuration:
- **Firestore**: Use existing rules at `firebase/firestore.rules`
- **Functions**: Use existing code at `server/` (we'll migrate)
- **Hosting**: Set public directory to `dist`
- **Storage**: Use existing rules at `firebase/storage.rules`

### 1.3 Enable Firebase Authentication
1. Go to Firebase Console → Authentication
2. Enable **Email/Password** sign-in method
3. Configure authorized domains (add your production domain)

---

## Step 2: Migrate Express Server to Cloud Functions

### 2.1 Create Cloud Functions Structure

The webhook server needs to be migrated from standalone Express to Firebase Cloud Functions.

**File**: `functions/index.js`

```javascript
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-domain.web.app',
  'https://your-domain.firebaseapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Webhook route - RAW body needed for signature verification
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, bookId, paymentType } = session.metadata;

        if (paymentType === 'lifetime') {
          // Create purchase record
          await db.collection('users').doc(userId).collection('purchases').doc(bookId).set({
            bookId,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            price: session.amount_total / 100,
            paymentMethod: 'stripe',
            transactionId: session.payment_intent,
            status: 'completed'
          });
          console.log('✅ Purchase recorded:', { userId, bookId });
        } else if (paymentType === 'subscription') {
          // Handle in invoice.payment_succeeded
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const { userId, bookId } = subscription.metadata;

        // Create/update subscription record
        await db.collection('users').doc(userId).collection('subscriptions').doc(subscription.id).set({
          bookId,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start * 1000,
          currentPeriodEnd: subscription.current_period_end * 1000,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Subscription updated:', { userId, bookId });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { userId, bookId } = subscription.metadata;

        await db.collection('users').doc(userId).collection('subscriptions').doc(subscription.id).set({
          bookId,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start * 1000,
          currentPeriodEnd: subscription.current_period_end * 1000,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('✅ Subscription status updated:', { userId, bookId, status: subscription.status });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe checkout route
app.post('/api/create-checkout-session', express.json(), async (req, res) => {
  const { bookId, priceId, userId, paymentType } = req.body;

  if (!bookId || !priceId || !userId || !paymentType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: paymentType === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${req.headers.origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/books/${bookId}`,
      metadata: {
        userId,
        bookId,
        paymentType
      },
      ...(paymentType === 'subscription' && {
        subscription_data: {
          metadata: { userId, bookId }
        }
      })
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export as Cloud Function
exports.api = functions.https.onRequest(app);
```

### 2.2 Install Functions Dependencies

```bash
cd functions
npm init -y
npm install express cors stripe firebase-admin firebase-functions
```

**File**: `functions/package.json`
```json
{
  "name": "functions",
  "version": "1.0.0",
  "main": "index.js",
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "stripe": "^14.10.0",
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0"
  }
}
```

---

## Step 3: Environment Variables

### 3.1 Set Firebase Functions Config

```bash
# Stripe keys (production)
firebase functions:config:set stripe.secret_key="sk_live_YOUR_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"

# API URL (will be your Cloud Function URL)
firebase functions:config:set api.url="https://us-central1-your-project.cloudfunctions.net/api"
```

### 3.2 Frontend Environment Variables

**File**: `.env.production`

```bash
# Firebase Production Config
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Production Config
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY

# API URL (Cloud Function)
VITE_API_URL=https://us-central1-your-project.cloudfunctions.net/api
```

**⚠️ SECURITY**: Never commit `.env.production` to git!

Add to `.gitignore`:
```
.env.production
```

---

## Step 4: Security Configuration

### 4.1 Update Firestore Rules

Already done! Your rules at `firebase/firestore.rules` are production-ready:
- Users can only read/write their own data
- Only server (via Admin SDK) can write purchases
- Books metadata is public read

Deploy with:
```bash
firebase deploy --only firestore:rules
```

### 4.2 Update Storage Rules

Already done! Your rules at `firebase/storage.rules` are production-ready:
- Public read for book covers
- Public read for free content
- Protected access for paid content

Deploy with:
```bash
firebase deploy --only storage:rules
```

### 4.3 Update CORS in Frontend

**File**: `vite.config.ts`

Add for production:
```typescript
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api': {
        target: 'https://us-central1-your-project.cloudfunctions.net',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

---

## Step 5: Deploy to Production

### 5.1 Build Frontend

```bash
# Use production environment
npm run build

# This creates dist/ folder with optimized production build
```

### 5.2 Deploy Everything

```bash
# Deploy all Firebase services
firebase deploy

# Or deploy individually:
firebase deploy --only functions    # Cloud Functions
firebase deploy --only hosting      # Frontend
firebase deploy --only firestore    # Firestore rules
firebase deploy --only storage      # Storage rules
```

### 5.3 Get Cloud Function URL

After deployment, Firebase will output your function URL:
```
✔  functions[api(us-central1)]: Successful create operation.
Function URL: https://us-central1-your-project.cloudfunctions.net/api
```

---

## Step 6: Configure Stripe Production Webhooks

### 6.1 Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://us-central1-your-project.cloudfunctions.net/api/webhook/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**

### 6.2 Get Webhook Signing Secret

1. Click on your newly created webhook
2. Reveal **Signing secret** (starts with `whsec_`)
3. Update Firebase config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_PRODUCTION_SECRET"
firebase deploy --only functions
```

### 6.3 Test Webhook

Stripe Dashboard → Webhooks → Your endpoint → Send test webhook

---

## Step 7: Create Stripe Products (Production)

### 7.1 Update Script for Production

**File**: `scripts/create-stripe-products.js`

Add environment check:
```javascript
// At the top
const isProduction = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
console.log(`🔑 Environment: ${isProduction ? 'PRODUCTION' : 'TEST'}`);

if (isProduction) {
  console.log('⚠️  WARNING: Creating products in PRODUCTION mode!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### 7.2 Run Product Creation

```bash
# Set production key temporarily
STRIPE_SECRET_KEY=sk_live_YOUR_KEY npm run stripe:create
```

This creates all 214 products (107 books × 2 payment options).

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain to Firebase Hosting

1. Firebase Console → Hosting
2. Click **Add custom domain**
3. Enter your domain (e.g., `bookin.app`)
4. Follow DNS configuration steps
5. Firebase will provision SSL certificate automatically

### 8.2 Update Environment Variables

Update all references from `firebaseapp.com` to your custom domain.

---

## Step 9: Post-Deployment Checklist

### Security
- [ ] Enable Firebase App Check (anti-abuse)
- [ ] Review Firestore security rules
- [ ] Review Storage security rules
- [ ] Verify webhook signature verification is working
- [ ] Ensure all API keys are in environment variables (not in code)
- [ ] Add rate limiting to Cloud Functions (if needed)

### Monitoring
- [ ] Set up Firebase Performance Monitoring
- [ ] Enable Cloud Functions logging
- [ ] Set up error alerting (Firebase Crashlytics or Sentry)
- [ ] Monitor Stripe webhook delivery

### Testing
- [ ] Test complete purchase flow with real card (Stripe provides test cards)
- [ ] Test subscription flow
- [ ] Test progress tracking across devices
- [ ] Test authentication flows
- [ ] Verify all 3 free books are accessible
- [ ] Test Chinese language support

### Content
- [ ] Upload all book covers to Firebase Storage (`/content/covers/`)
- [ ] Upload questions for paid books
- [ ] Verify random question selection works

### Legal
- [ ] Add Privacy Policy page
- [ ] Add Terms of Service page
- [ ] Add Cookie Policy (if using analytics)
- [ ] Add Refund Policy

---

## Step 10: Continuous Deployment (Optional)

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Costs Estimate (Firebase Blaze Plan)

### Monthly Estimates (assuming 1000 users)

**Firestore**:
- Reads: 100,000 reads/month = ~$0.36
- Writes: 50,000 writes/month = ~$0.18
- Storage: 1GB = $0.18

**Cloud Functions**:
- Invocations: 200,000/month = $0.40
- Compute time: ~$5

**Hosting**:
- Storage: 1GB = $0.026
- Data transfer: 10GB = $0.15

**Storage (Firebase)**:
- Storage: 5GB = $0.025
- Downloads: 10GB = $0.12

**Total**: ~$6-7/month for 1000 users

---

## Troubleshooting

### Webhook Not Receiving Events
1. Check Cloud Function logs: `firebase functions:log`
2. Verify webhook URL is correct in Stripe Dashboard
3. Test with Stripe CLI: `stripe listen --forward-to http://localhost:3002/webhook/stripe`

### CORS Errors
1. Verify allowed origins in Cloud Function
2. Check VITE_API_URL matches Cloud Function URL
3. Ensure credentials are included in requests

### Build Fails
1. Check environment variables are set
2. Run `npm run typecheck` locally first
3. Verify all imports are correct

### Purchase Not Recorded
1. Check Cloud Function logs for errors
2. Verify webhook signature validation
3. Check Firestore security rules allow writes from Admin SDK

---

## Production Readiness Checklist

Before going live:

- [ ] Firebase Blaze plan enabled
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend deployed to Firebase Hosting
- [ ] Stripe production keys configured
- [ ] Stripe webhook configured and tested
- [ ] All 214 Stripe products created
- [ ] SSL certificate active (automatic with Firebase Hosting)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up
- [ ] Privacy Policy and Terms of Service added
- [ ] Test complete user flow end-to-end
- [ ] Backup strategy in place (Firestore automatic backups)

---

## Support & Maintenance

### Regular Tasks
- Monitor Cloud Functions logs weekly
- Review Stripe webhook delivery success rate
- Check Firestore usage and costs
- Update dependencies monthly (`npm update`)
- Review security rules quarterly

### Scaling Considerations
- Cloud Functions auto-scale up to 1000 instances
- Firestore handles millions of operations/day
- Consider CDN for static assets if traffic grows significantly
- Add caching layer (Redis) if needed

---

## Next Steps

1. Follow steps 1-9 in order
2. Test thoroughly in staging environment first (use separate Firebase project)
3. Deploy to production
4. Monitor for 24-48 hours
5. Announce launch! 🚀
