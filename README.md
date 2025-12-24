# BookIn

> Learn books by doing - Interactive Q&A training for book mastery

BookIn is a client-side focused React web application that helps users learn and retain book knowledge through interactive question-and-answer exercises. The platform combines free sample content with a Firebase-powered payment and content delivery system.

## Project Status

**Current Phase**: Production-Ready MVP 🚀

### Recent Updates (December 2024)

- ✅ **Design System Migration**: Migrated from custom Tailwind components to shadcn/ui
- ✅ **Icon System**: Replaced all emoji icons with professional Lucide React icons
- ✅ **HomePage Redesign**: Implemented sidebar layout with enhanced filters (category dropdown, multi-select difficulty checkboxes)
- ✅ **BookDetailPage Redesign**: Added shadcn Tabs component for cleaner navigation between Summary/Training/Reflections
- ✅ **TrainingPage Enhancement**: Updated quiz interface with shadcn Card and Progress components
- ✅ **Accessibility**: All components now follow shadcn/ui accessibility standards

### Completed Features

**Foundation:**
- ✅ Vite + React 18 + TypeScript 5 project initialization
- ✅ Complete folder structure following feature-driven architecture
- ✅ Core dependencies installed (React Router, Zustand, React Query, Firebase, Tailwind CSS, Stripe)
- ✅ Tailwind CSS configuration with shadcn/ui design system
- ✅ TypeScript configuration with path aliases
- ✅ Core domain models (Book, Question, UserProgress, Purchase, Subscription)
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ shadcn/ui components (Button, Card, Input, Tabs, Progress, Badge, Checkbox, Select, Separator)
- ✅ Lucide icons for consistent iconography
- ✅ Build system configured and optimized

**Content & Data:**
- ✅ 107 books in catalog (3 with full content, 104 with metadata)
- ✅ Full bilingual support (English + Cantonese zh-HK)
  - Book titles, descriptions, summaries
  - Question text, options, answers, explanations
- ✅ 30 questions across 3 free books:
  - Atomic Habits by James Clear (10 questions)
  - Sapiens by Yuval Noah Harari (10 questions)
  - Thinking, Fast and Slow by Daniel Kahneman (10 questions)
- ✅ Questions uploaded to Firebase Storage
- ✅ Random question selection (10 per session from full pool)
- ✅ Question files excluded from Git repository

**UI/UX Features:**
- ✅ HomePage with sidebar filters (category dropdown, multi-select difficulty checkboxes) and responsive grid layout
- ✅ BookCard component with lock/unlock states and hover effects
- ✅ BookDetailPage with shadcn Tabs (Summary/Training/Reflections) and improved progress display
- ✅ TrainingPage with simplified quiz interface using shadcn Card and Progress components
- ✅ QuestionCard supporting multiple question types (multiple-choice, true-false)
- ✅ Real-time answer feedback with bilingual explanations
- ✅ Session complete page with score, mastery tracking, and streak celebration
- ✅ StreakCard with Lucide icons (Flame for active streaks, Sparkles for new streaks)
- ✅ Language switcher (English ⇄ 繁體中文)
- ✅ Loading states during data fetching
- ✅ Full routing setup with React Router
- ✅ Reflection experience: random "reflection moment" prompts during training and a history tab per book
- ✅ Todos workspace that turns reflections into a crossable daily checklist, accessible from the global nav
- ✅ Region-aware affiliate buttons on book pages that surface Amazon + Audible links with the right storefront/tag per locale

**Authentication & Security:**
- ✅ Firebase Authentication (Email/Password)
- ✅ Login/Signup pages with validation
- ✅ Authentication guards for protected routes
- ✅ Server-side purchase verification (Firestore)
- ✅ Firestore security rules deployed
- ✅ Firebase Storage security rules ready
- ✅ Purchase/subscription state persisted across page reloads

**Payment Integration:**
- ✅ Stripe integration (test mode)
- ✅ Two payment options per book:
  - Lifetime access: $9 one-time payment
  - Subscription: $3 every 3 months
- ✅ Stripe webhook handler for payment events
- ✅ Purchase tracking in Firestore
- ✅ Subscription management
- ✅ Lock/unlock state based on purchases and subscriptions
- ✅ Express API server for webhooks (port 3002)
- ✅ Makefile for easy development workflow
- ✅ Affiliate infrastructure with geo-detected Amazon/Audible referral links for each book

**Progress Tracking:**
- ✅ Per-book progress tracking (questions completed, correct answers)
- ✅ Mastery level calculation (0-100 scale)
- ✅ Progress persistence to Firestore with auto-sync
- ✅ Progress repository and service layer
- ✅ Progress store with 5-minute caching
- ✅ Real-time progress updates during training
- ✅ "My Library" filter (books with progress)
- ✅ "Purchased" filter (books user owns)
- ✅ Reflections saved to Firestore with completion state so they double as todos

**Developer Experience:**
- ✅ Upload script for questions (`npm run questions:upload`)
- ✅ Stripe product creation script (`npm run stripe:create`)
- ✅ Makefile commands (`make dev`, `make questions-upload`, etc.)
- ✅ Comprehensive documentation (TODO.md, scripts/README.md, CONTENT_FORMAT.md)
- ✅ Development server with hot reload

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: Zustand (client state) + React Query (server state)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend (Firebase)

- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Functions**: Cloud Functions (planned)

## Project Structure

```
bookin/
├── src/
│   ├── components/        # Shared UI components
│   │   ├── ui/           # shadcn/ui components (button, card, input, tabs, etc.)
│   │   └── layout/       # Layout components (Header, Container, Footer)
│   ├── features/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── books/       # Book collection
│   │   ├── training/    # Q&A training
│   │   ├── progress/    # Progress tracking
│   │   └── reflection/  # Reflections and todos
│   ├── pages/           # Route pages
│   ├── core/            # Business logic (platform-agnostic)
│   │   ├── domain/      # Domain models
│   │   ├── services/    # Business services
│   │   ├── repositories/# Data access layer
│   │   ├── storage/     # Storage strategies
│   │   └── utils/       # Utilities
│   ├── stores/          # Zustand stores
│   ├── shared/          # Shared utilities
│   ├── firebase/        # Firebase configuration
│   ├── lib/             # Utility functions (cn helper)
│   └── styles/          # Global styles (Tailwind + shadcn)
├── public/
│   ├── data/            # Free sample content (JSON)
│   └── images/          # Static images
├── components.json      # shadcn/ui configuration
└── docs/
    ├── PRD.md          # Product Requirements Document
    └── ARCHITECTURE.md  # (planned)
```

## Key Architectural Decisions

### 1. Hybrid Content Delivery

- **Free Books**: Static JSON files bundled with the app (no server needed)
- **Paid Books**: Firebase Storage with download-after-purchase model
- **User purchases tracked in Firestore**

### 2. Platform-Agnostic Core

All business logic in `src/core/` is designed to be reusable for future React Native migration:

- Domain models define data structures and validation
- Services contain business logic
- Repositories abstract data access
- No React/DOM dependencies in core layer

### 3. Feature-Driven Structure

Features are organized by domain (books, training, progress, auth) with:

- Components (UI)
- Hooks (logic)
- Types (interfaces)
- Services (business logic)

## Domain Models

### Book

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  isFree: boolean;
  price?: number;
}
```

### Question

```typescript
interface Question {
  id: string;
  bookId: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
}
```

### UserProgress

```typescript
interface UserProgress {
  id: string;
  userId: string;
  bookId: string;
  questionsCompleted: string[];
  questionsCorrect: string[];
  lastAccessed: number;
  masteryLevel: number; // 0-100
  syncedToCloud: boolean;
}
```

### Purchase

```typescript
interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  purchasedAt: number;
  price: number;
  paymentMethod: 'stripe' | 'paypal' | 'mock';
  transactionId: string;
  contentDownloaded: boolean;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Firebase account (for backend)
- Stripe account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Add your Firebase configuration to .env.local
```

### Development

```bash
# Start all services (client + server + Stripe webhook)
make dev
# or individually:
npm run dev              # Client only (port 3001)
cd server && npm run dev # Server only (port 3002)

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

### Scripts

```bash
# Upload questions to Firebase Storage
npm run questions:upload
# or
make questions-upload

# Create Stripe products (107 books × 2 payment options = 214 products)
npm run stripe:create
# or
make stripe-products

# Generate book metadata
npm run books:generate

# Check service status
make check
```

## Environment Variables

### Development (.env.local)

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook signing secret (get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Server
VITE_API_URL=http://localhost:3002
```

### Production (.env.production)

See `.env.production.example` for production configuration template.

## Production Deployment

### Quick Start

See [QUICKSTART_DEPLOYMENT.md](./QUICKSTART_DEPLOYMENT.md) for a step-by-step deployment guide (~30 minutes).

### Full Guide

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for comprehensive deployment documentation including:
- Firebase Cloud Functions setup
- Environment configuration
- Security best practices
- Stripe webhook configuration
- Custom domain setup
- Monitoring and maintenance

### Deployment Scripts

```bash
# Deploy everything to Firebase
./scripts/deploy-production.sh

# Set up Firebase Functions config (Stripe keys)
./scripts/setup-firebase-config.sh

# Or deploy manually
npm run build
firebase deploy
```

## User Flow (Fully Working!)

1. **Browse Books** → HomePage displays all available books with search/filter
2. **View Book Details** → Click any book to see circular progress, stats, and description
3. **Start Training** → Begin interactive Q&A session
4. **Answer Questions** → Choose from multiple-choice, true/false, or short answer
5. **Get Immediate Feedback** → See explanations after each answer
6. **Capture Reflection** → A randomized prompt lets you jot down how you'll apply a lesson; entries save to Firestore
7. **Manage Todos** → Use the top-nav Todos page to review every reflection as a checkable to-do list

## Next Steps

### Remaining Core Features

- [ ] Create progress dashboard page (ProgressPage with detailed analytics)
- [ ] Add remaining paid book content (104 books need questions)
- [ ] Create admin interface for content management
- [ ] Email notifications (purchase confirmations, progress reports)

### Completed ✅

- ✅ **Comprehensive progress tracking** (questions completed, mastery levels per book)
- ✅ **User progress persisted to Firestore** (UserProgress model with auto-sync)
- ✅ **"My Library" filter** on HomePage (shows books with progress)
- ✅ **Real-time progress display** (BookCard, BookDetailPage, TrainingPage)
- ✅ Local storage for streak tracking (implemented via streak-store.ts)
- ✅ AuthContext and useAuth hook
- ✅ Login/Signup pages with Firebase Auth
- ✅ Authentication guards
- ✅ Payment flow with Stripe integration (test mode)
- ✅ Content download infrastructure (Firebase Storage)
- ✅ Server-side purchase verification (Firestore)

### Future Enhancements

- [ ] Spaced repetition algorithm
- [ ] React Native mobile app
- [ ] Social features (sharing, leaderboards)
- [ ] AI-generated questions
- [ ] Analytics dashboard
- [ ] Email notifications (purchase confirmations, progress reports)

## Design System

Based on **shadcn/ui** (New York style) with Tailwind CSS.

### Colors

- **Primary**: Neutral-based with CSS variables for theming
- **Semantic Colors**: Defined via HSL CSS variables (background, foreground, primary, secondary, muted, accent, destructive)
- **Status Colors**: Destructive (red), Primary (green), Muted (gray)

### Components (shadcn/ui)

**Button**

- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Accessible with keyboard navigation

**Card**

- Simple, composable Card component
- Used with className for custom styling
- Supports gradients and borders

**Input**

- Integrated with form libraries (React Hook Form)
- Focus states with ring utility
- Error handling via form validation

**Tabs**

- Horizontal tab navigation (TabsList, TabsTrigger, TabsContent)
- Used for multi-section layouts (Book Detail page)

**Progress**

- Horizontal progress bar with customizable height
- Used for question progress and mastery levels

**Select, Checkbox, Badge, Separator**

- Accessible form components
- Consistent styling with design system

### Icons (Lucide React)

- **BookOpen**: App logo and branding
- **Flame**: Active streaks (≥3 days), high scores
- **Sparkles**: New streaks, celebrations
- **BookX**: 404 page
- **AlertTriangle**: Warnings and at-risk streaks
- **Search**: Search inputs

## Firebase Security Rules

### Firestore Rules (Planned)

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Books metadata is public read
match /books/{bookId} {
  allow read: if true;
  allow write: if false;
}
```

### Storage Rules (Planned)

```javascript
// Public read for cover images
match /content/covers/{bookId} {
  allow read: if true;
}

// Content accessible only to purchasers via signed URLs
match /content/books/{bookId}/{file} {
  allow read: if false; // Accessed via Cloud Functions
}
```

## Contributing

This is currently a personal project. Contribution guidelines will be added in the future.

## License

TBD

## Contact

TBD
