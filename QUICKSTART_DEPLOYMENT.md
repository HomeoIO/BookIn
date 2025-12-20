# Quick Start: Deploy BookIn to Production

This is a condensed deployment guide. For full details, see `docs/DEPLOYMENT.md`.

## Prerequisites

- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase project created with **Blaze plan** (pay-as-you-go)
- [ ] Stripe account with production keys
- [ ] ~30 minutes of time

## Step-by-Step Deployment

### 1. Firebase Setup (5 min)

```bash
# Login
firebase login

# Update project ID in .firebaserc
# Replace "your-project-id" with your actual Firebase project ID
```

### 2. Firebase Console Setup (5 min)

Go to [Firebase Console](https://console.firebase.google.com):

1. **Authentication** → Enable Email/Password
2. **Firestore** → Create database (production mode)
3. **Storage** → Get started
4. **Upgrade** to Blaze plan if not already

### 3. Configure Environment Variables (5 min)

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit .env.production with your Firebase production config
# Get these from: Firebase Console → Project Settings → Your apps
```

### 4. Configure Firebase Functions (2 min)

```bash
# Run the setup script
./scripts/setup-firebase-config.sh

# It will ask for:
# - Stripe secret key (sk_live_... or sk_test_...)
# - Stripe webhook secret (get this after step 6)
```

### 5. Install Functions Dependencies (2 min)

```bash
cd functions
npm install
cd ..
```

### 6. Deploy to Firebase (5 min)

```bash
# Option A: Use the automated script
./scripts/deploy-production.sh

# Option B: Manual deployment
npm run build
firebase deploy
```

After deployment, you'll get:
- **Hosting URL**: https://your-project.web.app
- **Functions URL**: https://us-central1-your-project.cloudfunctions.net/api

### 7. Configure Stripe Webhook (3 min)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. **Endpoint URL**: `https://us-central1-your-project.cloudfunctions.net/api/webhook/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update Firebase Functions config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
   firebase deploy --only functions
   ```

### 8. Create Stripe Products (3 min)

```bash
# Use production Stripe key
STRIPE_SECRET_KEY=sk_live_YOUR_KEY npm run stripe:create
```

This creates 214 products (107 books × 2 payment options).

### 9. Update Cloud Function CORS (2 min)

Edit `functions/index.js`:

```javascript
const allowedOrigins = [
  'https://your-project.web.app',        // Add your actual domain
  'https://your-project.firebaseapp.com',
  'https://your-custom-domain.com',      // If using custom domain
];
```

Redeploy:
```bash
firebase deploy --only functions
```

### 10. Test Everything (5 min)

1. Visit your hosting URL
2. Sign up for an account
3. Try purchasing a book (use Stripe test card: `4242 4242 4242 4242`)
4. Verify purchase is recorded
5. Test training session
6. Check progress is saved

## Verification Checklist

- [ ] Frontend loads at hosting URL
- [ ] Can sign up and log in
- [ ] Can view free books
- [ ] Stripe checkout works
- [ ] Webhook receives events (check Firebase Functions logs)
- [ ] Purchase unlocks book
- [ ] Training session works
- [ ] Progress is saved to Firestore
- [ ] "My Library" filter shows books with progress

## Monitor Logs

```bash
# View Cloud Functions logs
firebase functions:log

# Real-time logs
firebase functions:log --only api

# Check Stripe webhook delivery
# Go to: https://dashboard.stripe.com/webhooks → Your endpoint → View events
```

## Common Issues

### "Functions config not set"
```bash
firebase functions:config:get
# If empty, run: ./scripts/setup-firebase-config.sh
```

### "CORS error"
- Update `allowedOrigins` in `functions/index.js`
- Redeploy functions

### "Webhook signature verification failed"
- Get correct webhook secret from Stripe Dashboard
- Update: `firebase functions:config:set stripe.webhook_secret="whsec_..."`
- Redeploy functions

### "Build fails"
- Check `.env.production` has all required variables
- Run `npm run typecheck` locally first

## Costs Estimate

For 1000 users/month:
- Firebase: ~$6-7/month
- Stripe: 2.9% + $0.30 per transaction

## Next Steps

1. Add custom domain (optional)
2. Set up monitoring/alerting
3. Add Privacy Policy and Terms of Service
4. Announce launch! 🚀

## Need Help?

- Full guide: `docs/DEPLOYMENT.md`
- Firebase docs: https://firebase.google.com/docs
- Stripe docs: https://stripe.com/docs
