const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const admin = require('firebase-admin');

const STRIPE_SECRET = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

const stripeClientCache = {
  key: null,
  client: null,
};

const getSecretValue = (envName, secretParam) => {
  if (process.env[envName]) {
    return process.env[envName];
  }
  try {
    return secretParam.value();
  } catch (err) {
    return undefined;
  }
};

const getStripeSecret = () => getSecretValue('STRIPE_SECRET_KEY', STRIPE_SECRET);
const getStripeWebhookSecret = () => getSecretValue('STRIPE_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET);

const getStripeClient = () => {
  const secret = getStripeSecret();
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  if (!stripeClientCache.client || stripeClientCache.key !== secret) {
    stripeClientCache.client = new Stripe(secret);
    stripeClientCache.key = secret;
  }
  return stripeClientCache.client;
};

setGlobalOptions({ region: 'us-central1' });

admin.initializeApp();
const db = admin.firestore();

const app = express();

// CORS configuration for production
// Update these domains after deployment
const allowedOrigins = [
  'http://localhost:3001', // Development
  'http://localhost:5173', // Vite dev
  'https://bookingprod.web.app',
  'https://bookinprod.firebaseapp.com',
  'https://bookin.ink',
  'https://www.bookin.ink',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
  logger.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    contentType: req.headers['content-type']
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  const stripeConfigured = Boolean(getStripeSecret());
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: stripeConfigured ? 'configured' : 'missing-config'
  });
});

// Stripe webhook - RAW body needed for signature verification
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    const stripe = getStripeClient();
    const payload = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, bookId, paymentType, type, collectionId } = session.metadata || {};

        console.log('💰 Checkout completed:', { userId, bookId, paymentType, type, collectionId });

        if (!userId) {
          console.error('❌ Missing userId in checkout session');
          break;
        }

        // Handle collection purchase
        if (type === 'collection' && collectionId) {
          await db.collection('users').doc(userId).collection('collectionPurchases').doc(collectionId).set({
            collectionId,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            price: session.amount_total / 100,
            paymentMethod: 'stripe',
            transactionId: session.payment_intent,
            status: 'completed',
          });
          console.log('✅ Collection purchase recorded');
          break;
        }

        // Handle individual book purchases
        if (!bookId) {
          console.error('❌ Missing bookId in checkout session');
          break;
        }

        if (paymentType === 'lifetime') {
          await db.collection('users').doc(userId).collection('purchases').doc(bookId).set({
            bookId,
            purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
            price: session.amount_total / 100,
            paymentMethod: 'stripe',
            transactionId: session.payment_intent,
            status: 'completed',
          });
          console.log('✅ Purchase recorded:', { userId, bookId });
        } else if (paymentType === 'subscription') {
          console.log('📋 Subscription checkout - handled by customer.subscription.created');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (!invoice.subscription) {
          console.log('ℹ️ Invoice without subscription, skipping');
          break;
        }

        // For subscriptions, wait for customer.subscription.created event instead
        // invoice.payment_succeeded fires before subscription periods are finalized
        console.log('📋 Subscription invoice paid - waiting for subscription.created event');
        break;
      }

      case 'customer.subscription.created': {
        // This event fires when a new subscription is created with proper period data
        const subscription = event.data.object;
        const { userId, bookId } = subscription.metadata || {};

        if (!userId || !bookId) {
          console.error('❌ Missing metadata in subscription');
          break;
        }

        console.log('📋 Subscription created from Stripe:', {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        });

        if (!subscription.current_period_start || !subscription.current_period_end) {
          console.error('❌ Missing period start/end times');
          break;
        }

        await db.collection('users').doc(userId).collection('subscriptions').doc(subscription.id).set({
          bookId,
          userId,
          status: subscription.status,
          currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
          currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Subscription saved to Firestore:', { userId, bookId, status: subscription.status });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { userId, bookId } = subscription.metadata || {};

        if (!userId || !bookId) {
          console.error('❌ Missing metadata in subscription');
          break;
        }

        console.log('📋 Subscription update from Stripe:', {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        });

        if (!subscription.current_period_start || !subscription.current_period_end) {
          console.error('❌ Missing period start/end times in subscription update');
          break;
        }

        await db.collection('users').doc(userId).collection('subscriptions').doc(subscription.id).set({
          bookId,
          userId,
          status: subscription.status,
          currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
          currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log('✅ Subscription status updated');
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe checkout session creation
app.post('/create-checkout-session', express.json(), async (req, res) => {
  try {
    const { bookId, priceId, userId, paymentType, successUrl, cancelUrl, metadata } = req.body;
    const stripe = getStripeClient();

    // Handle collection purchases (new format with metadata)
    if (metadata && metadata.type === 'collection') {
      if (!priceId || !userId) {
        return res.status(400).json({ error: 'Missing priceId or userId for collection purchase' });
      }

      console.log('🛒 Creating collection checkout session:', { userId, collectionId: metadata.collectionId });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });

      console.log('✅ Collection checkout session created:', session.id);
      return res.json({ url: session.url });
    }

    // Handle individual book purchases (original format)
    if (!bookId || !priceId || !userId || !paymentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        received: { bookId, priceId, userId, paymentType }
      });
    }

    console.log('🛒 Creating checkout session:', { bookId, priceId, userId, paymentType });

    const origin = req.headers.origin || 'http://localhost:3001';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: paymentType === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/books/${bookId}`,
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

    console.log('✅ Checkout session created:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify session (optional - for post-purchase confirmation)
app.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      metadata: session.metadata
    });
  } catch (error) {
    console.error('❌ Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export as Cloud Function
// URL will be: https://us-central1-YOUR-PROJECT.cloudfunctions.net/api
exports.api = onRequest({
  secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET],
}, app);
