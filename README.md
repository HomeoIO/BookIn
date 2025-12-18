# BookIn

> Learn books by doing - Interactive Q&A training for book mastery

BookIn is a client-side focused React web application that helps users learn and retain book knowledge through interactive question-and-answer exercises. The platform combines free sample content with a Firebase-powered payment and content delivery system.

## Project Status

**Current Phase**: Week 2 - Complete MVP ✅

### Completed

**Week 1 - Foundation:**
- ✅ Vite + React 18 + TypeScript 5 project initialization
- ✅ Complete folder structure following feature-driven architecture
- ✅ Core dependencies installed (React Router, Zustand, React Query, Firebase, Tailwind CSS)
- ✅ Tailwind CSS configuration with green primary theme
- ✅ TypeScript configuration with path aliases
- ✅ Core domain models (Book, Question, UserProgress, Purchase)
- ✅ Firebase integration setup (Auth, Firestore, Storage)
- ✅ Design system components (Button, Card, Input, CircularProgress)
- ✅ Build system configured and working

**Week 2 - Core Features:**
- ✅ Sample book data with questions (3 books, 30 questions total)
  - Atomic Habits by James Clear
  - Sapiens by Yuval Noah Harari
  - Thinking, Fast and Slow by Daniel Kahneman
- ✅ HomePage with search, filters, and book grid
- ✅ BookCard component with progress tracking
- ✅ BookDetailPage with circular progress and stats
- ✅ TrainingPage with interactive Q&A interface
- ✅ QuestionCard supporting multiple question types
- ✅ Real-time answer feedback with explanations
- ✅ Session complete page with score and mastery tracking
- ✅ Full routing setup with React Router

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **State Management**: Zustand (client state) + React Query (server state)
- **Styling**: Tailwind CSS
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
│   │   ├── ui/           # Design system (Button, Card, Input)
│   │   └── layout/       # Layout components
│   ├── features/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── books/       # Book collection
│   │   ├── training/    # Q&A training
│   │   └── progress/    # Progress tracking
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
│   └── styles/          # Global styles
├── public/
│   ├── data/            # Free sample content (JSON)
│   └── images/          # Static images
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

- Node.js 18+ and npm

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
# Start dev server (http://localhost:3000)
npm run dev

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

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## User Flow (Fully Working!)

1. **Browse Books** → HomePage displays all available books with search/filter
2. **View Book Details** → Click any book to see circular progress, stats, and description
3. **Start Training** → Begin interactive Q&A session
4. **Answer Questions** → Choose from multiple-choice, true/false, or short answer
5. **Get Immediate Feedback** → See explanations after each answer
6. **Complete Session** → View score and mastery improvement

## Next Steps

### Week 3: Progress Persistence & Authentication

- [ ] Implement local storage for progress tracking
- [ ] Create progress dashboard page
- [ ] Implement AuthContext and useAuth hook
- [ ] Build Login/Signup pages with Firebase Auth
- [ ] Create authentication guards
- [ ] Save user progress to Firestore

### Week 4: Payment & Content Delivery

- [ ] Implement mock payment flow
- [ ] Build LibraryPage for purchased books
- [ ] Implement content download from Firebase Storage
- [ ] Add paid book content
- [ ] Create admin interface for content management

### Future Enhancements

- [ ] Spaced repetition algorithm
- [ ] React Native mobile app
- [ ] Social features (sharing, leaderboards)
- [ ] AI-generated questions
- [ ] Analytics dashboard

## Design System

### Colors

- **Primary**: Blue (from Tailwind's blue palette)
- **Gray Scale**: Tailwind's gray palette
- **Status Colors**: Green (success), Red (error), Yellow (warning)

### Components

**Button**

- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Loading state support

**Card**

- Variants: default, outlined, elevated
- Composable: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Input**

- Label support
- Error and helper text
- Full width option

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
