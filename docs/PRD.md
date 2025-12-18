# Product Requirements Document: BookIn

## Overview
BookIn is an interactive learning platform that helps users master the core concepts of books through guided Q&A exercises. The platform enables users to learn by doing, reinforcing key ideas through structured question-and-answer scenarios.

## Product Vision
Transform passive reading into active learning by providing users with interactive exercises that test and reinforce their understanding of essential book concepts.

## Target Users
- Students and lifelong learners who want to retain book knowledge
- Book club members looking to deepen their understanding
- Professionals seeking to master non-fiction business/self-help books
- Anyone who wants to move beyond passive reading to active learning

## Core Features

### 1. Book Collection View
**Description**: Main landing page displaying all available books

**Requirements**:
- Display books in a grid/card layout
- Each book card shows:
  - Book cover image
  - Title
  - Author
  - Brief description (1-2 sentences)
  - Progress indicator (e.g., "5/20 questions completed")
  - Category/genre tags
- Search and filter functionality
  - Search by title, author, or keyword
  - Filter by category, completion status, difficulty level
- Sorting options (alphabetical, recently added, progress, difficulty)

### 2. Book Detail & Q&A Training
**Description**: Individual book page with interactive Q&A exercises

**Requirements**:
- Book overview section
  - Full book details (cover, title, author, description)
  - Key concepts/themes covered
  - Total number of questions available
  - User's progress (X/Y completed, % mastery)

- Q&A Exercise Interface
  - Question display with clear typography
  - Answer input/selection mechanism (varies by question type)
  - Immediate feedback on answer submission
  - Explanation/learning moment after each answer
  - Progress tracking within session

- Question Types (MVP):
  - Multiple choice
  - True/False
  - Short answer (text input)
  - Fill in the blank

- Session Management
  - Start new learning session
  - Resume previous session
  - Review mode (revisit answered questions)
  - Practice mode (focus on missed questions)

### 3. Progress Tracking
**Requirements**:
- Per-book progress metrics
- Overall learning statistics
- Streak tracking (daily/weekly engagement)
- Mastery levels (beginner, intermediate, advanced)

### 4. User Profile (Future Enhancement)
- Learning history
- Favorite books
- Personal notes on books
- Achievement badges

## Technical Requirements

### Platform
- **Phase 1**: React web application (responsive design)
- **Phase 2**: React Native mobile app (iOS & Android)

### Architecture Considerations
- Component-based architecture for code reuse between web and mobile
- Shared business logic layer
- API-first design for backend flexibility
- Responsive design patterns for seamless mobile web experience

### Data Structure (Initial)

```javascript
// Book
{
  id: string,
  title: string,
  author: string,
  description: string,
  coverImage: string,
  category: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  totalQuestions: number
}

// Question
{
  id: string,
  bookId: string,
  question: string,
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-blank',
  options?: string[], // for multiple choice
  correctAnswer: string | string[],
  explanation: string,
  difficulty: 'easy' | 'medium' | 'hard',
  concepts: string[] // key concepts this question tests
}

// UserProgress
{
  userId: string,
  bookId: string,
  questionsCompleted: string[], // question IDs
  questionsCorrect: string[],
  lastAccessed: timestamp,
  masteryLevel: number // 0-100
}
```

### Tech Stack Recommendations
**Frontend**:
- React 18+ with TypeScript
- State management: React Context / Zustand / Redux Toolkit
- Routing: React Router
- UI Components: Tailwind CSS or Material-UI
- Forms: React Hook Form

**Backend** (Future):
- Node.js/Express or Next.js API routes
- Database: PostgreSQL or Firebase
- Authentication: Auth0 or Firebase Auth

**Mobile** (Phase 2):
- React Native with shared component library
- Expo for faster development

## User Flows

### Primary Flow: Learning Session
1. User lands on book collection page
2. User selects a book to study
3. Book detail page shows progress and "Start Learning" CTA
4. User clicks "Start Learning" or "Continue Session"
5. Q&A interface presents first/next question
6. User answers question
7. System provides immediate feedback + explanation
8. User clicks "Next Question"
9. Repeat steps 6-8 until session complete or user exits
10. Show session summary (correct/incorrect, time spent, progress)

### Secondary Flow: Review
1. User navigates to completed book
2. Selects "Review Mode"
3. Can browse all questions and answers
4. Can retry specific questions
5. Can filter to review only missed questions

## Success Metrics
- User engagement: Daily/weekly active users
- Learning completion: % of users completing books
- Question accuracy: Average correct answer rate
- Retention: User return rate week-over-week
- Time on platform: Average session duration

## MVP Scope (Phase 1)
**In Scope**:
- Book collection view with 5-10 sample books
- Q&A training interface with multiple choice and true/false questions
- Basic progress tracking (local storage)
- Responsive web design
- Sample content for 3-5 books with 15-20 questions each

**Out of Scope** (Future Phases):
- User authentication and accounts
- Backend/database integration
- Advanced question types (essay, matching, ordering)
- Social features (sharing, leaderboards)
- Content creation tools for adding new books
- Spaced repetition algorithm
- Mobile app

## Design Principles
- **Clarity**: Questions and feedback should be crystal clear
- **Encouragement**: Positive reinforcement for progress
- **Focus**: Minimize distractions during learning sessions
- **Progress visibility**: Always show where user stands
- **Mobile-first**: Design for smallest screen, enhance for larger

## Future Enhancements
- AI-generated questions from any book
- Spaced repetition for optimal retention
- Community-contributed questions
- Discussion forums per book
- Integration with reading apps (Kindle, Goodreads)
- Audio questions for accessibility
- Collaborative learning (study groups)
- Expert annotations and insights

## Open Questions
- Should we gamify with points/levels/leaderboards?
- How many questions per book is optimal for retention?
- Should questions be presented in order or randomized?
- Do we need different modes (timed, practice, exam)?
- Should we include page/chapter references with questions?
