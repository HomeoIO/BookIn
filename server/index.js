import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import admin from 'firebase-admin';

dotenv.config();

const PORT = process.env.PORT || 3002;

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set. Stripe endpoints will fail.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}
const db = admin.firestore();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]).map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: stripe ? 'configured' : 'missing-config',
  });
});

// Create API router (mounted at /api to match Cloud Function structure)
const apiRouter = express.Router();

apiRouter.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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
          console.log('✅ Collection purchase recorded:', { userId, collectionId });
          break;
        }

        // Handle individual book purchase
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
          console.log('📋 Subscription checkout - handled by invoice.payment_succeeded');
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
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

apiRouter.post('/create-checkout-session', express.json(), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const { bookId, priceId, userId, paymentType, successUrl, cancelUrl, metadata } = req.body;

    // Handle collection purchases (new format with metadata)
    if (metadata && metadata.type === 'collection') {
      if (!priceId || !userId) {
        return res.status(400).json({
          error: 'Missing required fields for collection purchase',
          received: { priceId, userId, metadata },
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });

      console.log('✅ Collection checkout session created:', { userId, collectionId: metadata.collectionId });
      return res.json({ url: session.url });
    }

    // Handle individual book purchases (legacy format)
    if (!bookId || !priceId || !userId || !paymentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        received: { bookId, priceId, userId, paymentType },
      });
    }

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
        paymentType,
      },
      ...(paymentType === 'subscription' && {
        subscription_data: {
          metadata: { userId, bookId },
        },
      }),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/verify-session/:sessionId', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('❌ Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mount API router at /api (matches Cloud Function export name)
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Dev server listening on port ${PORT}`);
});
