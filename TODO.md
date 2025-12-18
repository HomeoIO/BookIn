# BookIn - TODO List

## 🚨 Critical - Security Issues

### 1. Client-Side Purchase Verification (URGENT)
**Status**: ✅ **COMPLETED**
**Issue**: ~~Users can unlock all books by manipulating localStorage~~ → **FIXED**

**Solution Implemented**:
```javascript
// Before (INSECURE):
localStorage → Client checks purchases → Grant access ❌

// After (SECURE):
Stripe payment → Webhook → Firestore → Client queries → Server validates → Grant access ✅
```

**Implementation Completed**:
1. ✅ Firebase Authentication (email/password) implemented
2. ✅ Firestore collections created:
   - `users/{userId}/purchases/{bookId}`
   - `users/{userId}/subscriptions/{subscriptionId}`
3. ✅ Stripe webhook handler implemented:
   - `checkout.session.completed` → Saves to Firestore
   - `invoice.payment_succeeded` → Updates subscription status
   - Server-side purchase tracking via Firebase Admin SDK
4. ✅ Purchase/subscription stores updated:
   - Query Firestore instead of localStorage
   - Client-side caching (5-minute cache duration)
   - Auto-refresh on app load and after purchase
5. ✅ Firestore Security Rules deployed:
   - Users can only read their own purchases
   - Only server can write purchases (via Admin SDK)
6. ✅ Authentication guards implemented:
   - Purchase requires sign-in
   - userId passed to Stripe and Firestore
   - Auto-fetch purchases on sign-in
   - Clear purchases on sign-out

**Security Status**: 🔒 **SECURE** - Users can no longer manipulate localStorage to unlock paid content

**Next Steps**:
- ⏳ Enable Firebase Authentication in Firebase Console (user action required)
- ⏳ Deploy Storage Rules to protect book content files
- ⏳ Test complete purchase flow end-to-end

---

## 🎯 High Priority Features

### 2. Move Content to Firebase Storage and Remove from Repository
**Status**: 🟡 Medium Priority (Partially Ready)

**Current Problem**:
- All book summaries and training questions are in `public/data/` directory
- Content (including answers) is committed to Git repository
- Anyone can access JSON files directly via browser or Git history
- Public exposure of all question answers

**Progress**:
- ✅ Storage security rules written (`firebase/storage.rules`)
- ✅ Content format documented (`docs/CONTENT_FORMAT.md`)
- ✅ Storage structure designed:
  - `/content/covers/{bookId}` - Public book covers
  - `/content/free/{fileName}` - Free book content (public)
  - `/content/paid/{bookId}/{fileName}` - Paid content (requires purchase)
- ⏳ Storage rules ready to deploy (user needs to paste in Firebase Console)

**Remaining Implementation Steps**:
1. ⏳ Deploy storage rules to Firebase Storage
2. ⏳ Upload book covers to `/content/covers/`
3. ⏳ Upload free sample content to `/content/free/`
4. ⏳ Upload paid content to `/content/paid/{bookId}/questions.json`
5. ⏳ Update `ContentRepository` to fetch from Firebase Storage instead of `/public`
6. ⏳ Test content loading for free and paid books
7. ⏳ Remove `public/data/` and add to `.gitignore`

**Storage Security Rules** (Ready to Deploy):
See `firebase/storage.rules` for complete implementation with:
- Public read for book covers
- Public read for free content
- Protected access for paid content (requires Firestore purchase verification)
- Helper functions for purchase/subscription validation

**Documentation**:
See `docs/CONTENT_FORMAT.md` for:
- Complete content format specification
- Question types (multiple-choice, true-false, short-answer, fill-blank)
- Bilingual support (English + Chinese)
- Upload instructions
- Validation checklist

### 3. Stripe Webhook Signature Verification in Production
**Status**: 🟡 Medium Priority

**Current**: `STRIPE_WEBHOOK_SECRET` not set up for production

**Needed**:
1. Set up webhook endpoint in Stripe dashboard
2. Configure webhook secret in production environment
3. Test webhook delivery in production

---

## 📦 Product Features

### 4. Create Products in Stripe
**Status**: 🟢 Ready to Execute

Run the script to create all 214 products:
```bash
npm run stripe:create
```

This will create:
- 107 books × 2 payment options
- Lifetime: $9 one-time
- Subscription: $3 every 3 months

### 5. Add Book Content
**Status**: 🔵 Content Creation

**Needed**:
- Write summaries for all 107 books
- Create training questions (15-20 per book)
- Add Chinese translations for all content
- Create bilingual question sets

**Format**:
```json
{
  "id": "book-id",
  "title": "Book Title",
  "titleZh": "書名",
  "summary": "English summary...",
  "summaryZh": "中文摘要...",
  "questions": [...]
}
```

### 6. User Dashboard
**Status**: 🔵 Planned

**Features**:
- View all purchased books
- View active subscriptions
- Cancel/update subscriptions via Stripe portal
- Download purchase receipts
- View learning progress across all books

### 7. Progress Tracking Enhancement
**Status**: 🔵 Planned

**Current**: Basic progress tracking exists but not fully integrated

**Enhancements**:
- Save progress to Firestore (sync across devices)
- Spaced repetition algorithm for questions
- Track mastery level per concept
- Show learning analytics and insights
- Daily/weekly progress reports

### 8. Email Notifications
**Status**: 🔵 Planned

**Needed**:
- Purchase confirmation emails
- Subscription renewal reminders
- Payment failure notifications
- Weekly progress reports
- Streak milestone celebrations

**Implementation**: Firebase Functions + SendGrid/Resend

---

## 🎨 UI/UX Improvements

### 9. Purchase Flow Enhancement
**Status**: 🟢 Working but Can Improve

**Improvements**:
- Add loading states during checkout redirect
- Better error handling and user feedback
- Show preview of book content before purchase
- Add "Try sample questions" for paid books
- Implement "Buy as gift" functionality

### 10. Mobile Responsiveness
**Status**: 🟡 Partially Complete

**Needs Testing**:
- Test on various mobile devices
- Optimize Stripe checkout on mobile
- Improve training page layout on small screens
- Add PWA support for offline access

### 11. Dark Mode
**Status**: 🔵 Planned

Implement dark mode theme with system preference detection.

---

## 🔧 Technical Improvements

### 12. TypeScript Strict Mode
**Status**: 🔵 Nice to Have

Enable strict mode and fix all type errors:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### 13. Error Tracking
**Status**: 🔵 Planned

**Implementation**:
- Add Sentry or similar error tracking
- Track Stripe checkout errors
- Monitor webhook delivery failures
- Set up alerts for critical errors

### 14. Analytics
**Status**: 🔵 Planned

**Metrics to Track**:
- Book views and purchases (conversion rate)
- Training completion rates
- Streak retention
- Most popular books
- Revenue by book/category

**Implementation**: Google Analytics 4 or Mixpanel

### 15. Performance Optimization
**Status**: 🟡 Good but Can Improve

**Optimizations**:
- Lazy load book images
- Implement virtual scrolling for large book lists
- Code splitting by route
- Optimize bundle size (currently 278KB)
- Add service worker for caching

### 16. Testing
**Status**: 🔴 Missing

**Needed**:
- Unit tests for stores and services
- Integration tests for purchase flow
- E2E tests with Playwright (instructions exist in CLI_DOCS)
- Stripe webhook testing with Stripe CLI

---

## 🚀 Deployment

### 17. Production Deployment
**Status**: 🟡 Ready but Not Done

**Checklist**:
- [ ] Switch to Stripe live keys
- [ ] Create live products (run `npm run stripe:create`)
- [ ] Set up production Firestore
- [ ] Configure production webhooks
- [ ] Set up custom domain
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up environment variables in hosting platform
- [ ] Test full purchase flow in production
- [ ] Set up monitoring and alerts

**Suggested Hosting**:
- Frontend: Vercel or Netlify
- Backend API: Railway or Render
- Database: Firebase (already configured)

### 18. CI/CD Pipeline
**Status**: 🔵 Planned

**Setup**:
- GitHub Actions for automated testing
- Auto-deploy to staging on PR
- Auto-deploy to production on main branch merge
- Run linting and type checking
- Security scanning

---

## 📚 Documentation

### 19. API Documentation
**Status**: 🔵 Needed

Document all API endpoints:
- `/api/create-checkout-session`
- `/api/verify-session/:sessionId`
- `/api/webhook/stripe`

### 20. User Guide
**Status**: 🔵 Needed

Create user documentation:
- How to purchase books
- How to use training mode
- How to track progress
- How to manage subscriptions
- FAQ section

---

## 🔐 Compliance & Legal

### 21. Privacy Policy & Terms of Service
**Status**: 🔴 Required Before Launch

**Needed**:
- Privacy Policy (GDPR compliant)
- Terms of Service
- Cookie Policy
- Refund Policy
- Data retention policy

### 22. GDPR Compliance
**Status**: 🟡 Partial

**Needed**:
- Cookie consent banner
- User data export functionality
- Right to be forgotten (delete account)
- Data processing agreements

---

## Priority Order

### ✅ Completed
1. ✅ ~~**Fix client-side purchase verification**~~ → SECURE
   - Firebase Auth implemented
   - Server-side purchase tracking via Firestore
   - Firestore security rules deployed
   - Client-side caching with Firestore queries

### Immediate (Before Launch)
2. ⏳ **Enable Firebase Authentication** (User action required)
   - Go to Firebase Console → Authentication → Enable Email/Password
3. ⏳ **Deploy Storage Rules** (User action required)
   - Paste `firebase/storage.rules` into Firebase Console → Storage → Rules
4. 🚨 **Move content to Firebase Storage and remove from repo** (Answers exposed publicly)
   - Storage rules ready, need to upload content
5. 🚨 **Privacy Policy & Terms** (Legal requirement)
6. Create products in Stripe
7. Test complete purchase flow end-to-end
8. Set up production webhooks

### Short-term (First Month)
9. Add more book content (at least 20 books with full content)
10. User dashboard (view purchases, subscriptions, progress)
11. Email notifications (purchase confirmations, receipts)
12. Error tracking (Sentry or similar)
13. Testing suite (unit, integration, e2e)

### Medium-term (Months 2-3)
11. Progress tracking enhancements
12. Mobile app (React Native)
13. Analytics implementation
14. Performance optimizations
15. Dark mode

### Long-term (Months 3+)
16. AI-generated questions
17. Community features (discussions, reviews)
18. Gamification (badges, leaderboards)
19. Referral program
20. Enterprise/team accounts

---

## Notes

### Current Status
- **Build size**: 774KB (205KB gzipped) - acceptable for MVP, can optimize later
- **Free books**: 3 sample books available for testing
- **Total books**: 107 books in catalog (metadata only, content TBD)
- **Bilingual**: Full zh-HK (Cantonese) + English support
- **Payment**: Stripe test mode working end-to-end
- **Security**: ✅ Server-side purchase verification implemented
- **Auth**: Firebase Authentication implemented (needs console enablement)
- **Database**: Firestore for user data, purchases, subscriptions
- **Storage**: Firebase Storage rules ready for deployment

### Repository
- **Git**: https://github.com/Inrang-Limited/BookIn

### Documentation
- **PRD**: `docs/PRD.md`
- **Architecture Plan**: `~/.claude/plans/functional-sniffing-river.md`
- **Content Format**: `docs/CONTENT_FORMAT.md`
- **Storage Rules**: `firebase/storage.rules`
- **Firestore Rules**: `firebase/firestore.rules` (deployed ✅)

---

**Last Updated**: 2025-12-18
