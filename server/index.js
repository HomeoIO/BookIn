import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Vite dev server
  credentials: true,
}));

// Stripe webhook - needs raw body for signature verification
app.post('/api/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📬 Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // One-time purchase or subscription started
        const session = event.data.object;
        console.log('✅ Checkout completed:', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amount: session.amount_total,
        });

        // TODO: Save purchase/subscription to Firestore
        // const bookId = session.metadata?.bookId;
        // await savePurchase(bookId, session.customer_email);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Recurring payment succeeded
        const invoice = event.data.object;
        console.log('💰 Invoice payment succeeded:', {
          customerId: invoice.customer,
          amount: invoice.amount_paid,
        });

        // TODO: Update subscription status in Firestore
        break;
      }

      case 'invoice.payment_failed': {
        // Recurring payment failed
        const invoice = event.data.object;
        console.log('❌ Invoice payment failed:', {
          customerId: invoice.customer,
        });

        // TODO: Notify user, update subscription status
        break;
      }

      case 'customer.subscription.updated': {
        // Subscription status changed
        const subscription = event.data.object;
        console.log('📋 Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        // TODO: Update subscription in Firestore
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled/ended
        const subscription = event.data.object;
        console.log('🚫 Subscription deleted:', {
          subscriptionId: subscription.id,
        });

        // TODO: Remove access in Firestore
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// JSON parsing for other routes (after webhook route)
app.use(express.json());

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, bookId, customerEmail, successUrl, cancelUrl, isSubscription } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Determine mode based on whether it's a subscription or one-time payment
    const mode = isSubscription ? 'subscription' : 'payment';

    console.log(`Creating ${mode} checkout session for price: ${priceId}`);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        bookId: bookId || '',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify checkout session and get details
app.get('/api/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      bookId: session.metadata?.bookId,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      paymentStatus: session.payment_status,
      mode: session.mode,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BookIn API server is running',
    payment_provider: 'Stripe'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`💳 Stripe webhook: http://localhost:${PORT}/api/webhook/stripe`);
  console.log(`📝 Create checkout: POST http://localhost:${PORT}/api/create-checkout-session`);
});
