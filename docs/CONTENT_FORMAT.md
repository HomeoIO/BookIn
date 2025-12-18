# BookIn Content Format Guide

This document describes the JSON format for book content and the Firebase Storage structure.

## Table of Contents
- [Storage Structure](#storage-structure)
- [Book Metadata Format](#book-metadata-format)
- [Question Format](#question-format)
- [Complete Example](#complete-example)
- [Adding New Content](#adding-new-content)

---

## Storage Structure

Content is organized in Firebase Storage with the following structure:

```
content/
├── covers/                         # Book cover images (public)
│   ├── book-1.jpg
│   ├── book-2.jpg
│   └── ...
│
├── free/                           # Free book content (public)
│   ├── sample-book-1.json
│   ├── sample-book-2.json
│   └── sample-book-3.json
│
└── paid/                           # Paid book content (requires purchase)
    ├── book-1/
    │   └── questions.json
    ├── book-2/
    │   └── questions.json
    └── ...
```

### Access Control

- **`/content/covers/{bookId}`** - Public (anyone can read)
- **`/content/free/{fileName}`** - Public (anyone can read)
- **`/content/paid/{bookId}/{fileName}`** - Protected (requires authentication + purchase/subscription)

---

## Book Metadata Format

Book metadata is stored in the application code (`src/data/books.ts`):

```typescript
interface Book {
  id: string;                    // Unique identifier (e.g., "book-1")
  title: string;                 // English title
  titleZh: string;               // Chinese title (繁體中文)
  author: string;                // Author name
  category: string;              // Category (e.g., "business", "psychology")
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;           // English description
  descriptionZh: string;         // Chinese description
  coverImage: string;            // Cover image URL or path
  totalQuestions: number;        // Total number of questions
  isFree: boolean;               // Whether the book is free
  price?: number;                // Price for lifetime access (USD)
  subscriptionPrice?: number;    // Subscription price per 3 months (USD)
}
```

### Example:
```json
{
  "id": "atomic-habits",
  "title": "Atomic Habits",
  "titleZh": "原子習慣",
  "author": "James Clear",
  "category": "self-improvement",
  "difficulty": "beginner",
  "description": "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
  "descriptionZh": "細微改變帶來巨大成就的實證法則",
  "coverImage": "/content/covers/atomic-habits.jpg",
  "totalQuestions": 20,
  "isFree": false,
  "price": 9.00,
  "subscriptionPrice": 3.00
}
```

---

## Question Format

Questions are stored in JSON files with the following structure:

### File Structure

**Location:** `/content/paid/{bookId}/questions.json` or `/content/free/{fileName}`

```json
{
  "bookId": "atomic-habits",
  "title": "Atomic Habits",
  "titleZh": "原子習慣",
  "summary": "English summary of the book...",
  "summaryZh": "中文摘要...",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "What is the main premise of Atomic Habits?",
      "questionZh": "《原子習慣》的主要前提是什麼？",
      "options": [
        "Big changes require big actions",
        "Small changes compound into remarkable results",
        "Habits don't matter for success",
        "Only willpower determines success"
      ],
      "optionsZh": [
        "大改變需要大行動",
        "微小的改變會累積成顯著的結果",
        "習慣對成功不重要",
        "只有意志力決定成功"
      ],
      "correctAnswer": "Small changes compound into remarkable results",
      "correctAnswerZh": "微小的改變會累積成顯著的結果",
      "explanation": "The book emphasizes that tiny changes lead to remarkable results over time.",
      "explanationZh": "這本書強調，微小的改變隨著時間會帶來顯著的結果。",
      "difficulty": "easy",
      "concepts": ["habit formation", "compound effect"]
    }
  ]
}
```

### Question Types

#### 1. Multiple Choice
```json
{
  "id": "q1",
  "type": "multiple-choice",
  "question": "Question text in English?",
  "questionZh": "中文問題？",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "optionsZh": ["選項 1", "選項 2", "選項 3", "選項 4"],
  "correctAnswer": "Option 2",
  "correctAnswerZh": "選項 2",
  "explanation": "Why this is correct...",
  "explanationZh": "為什麼這是正確的...",
  "difficulty": "medium",
  "concepts": ["concept1", "concept2"]
}
```

#### 2. True/False
```json
{
  "id": "q2",
  "type": "true-false",
  "question": "Statement to evaluate",
  "questionZh": "要評估的陳述",
  "correctAnswer": "true",
  "correctAnswerZh": "正確",
  "explanation": "Explanation...",
  "explanationZh": "解釋...",
  "difficulty": "easy",
  "concepts": ["concept1"]
}
```

#### 3. Short Answer
```json
{
  "id": "q3",
  "type": "short-answer",
  "question": "What is...?",
  "questionZh": "什麼是...？",
  "correctAnswer": "The answer",
  "correctAnswerZh": "答案",
  "acceptableAnswers": ["answer", "the answer", "an answer"],
  "explanation": "Explanation...",
  "explanationZh": "解釋...",
  "difficulty": "hard",
  "concepts": ["concept1"]
}
```

#### 4. Fill in the Blank
```json
{
  "id": "q4",
  "type": "fill-blank",
  "question": "The key to success is ____ and ____.",
  "questionZh": "成功的關鍵是____和____。",
  "correctAnswer": ["consistency", "patience"],
  "correctAnswerZh": ["一致性", "耐心"],
  "explanation": "Explanation...",
  "explanationZh": "解釋...",
  "difficulty": "medium",
  "concepts": ["success principles"]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique question identifier within the book |
| `type` | string | Yes | Question type: `multiple-choice`, `true-false`, `short-answer`, `fill-blank` |
| `question` | string | Yes | Question text in English |
| `questionZh` | string | Yes | Question text in Chinese (繁體中文) |
| `options` | string[] | For multiple-choice | Array of answer options |
| `optionsZh` | string[] | For multiple-choice | Array of answer options in Chinese |
| `correctAnswer` | string/string[] | Yes | The correct answer(s) |
| `correctAnswerZh` | string/string[] | Yes | The correct answer(s) in Chinese |
| `acceptableAnswers` | string[] | Optional | Alternative acceptable answers for short-answer questions |
| `explanation` | string | Yes | Explanation of the correct answer |
| `explanationZh` | string | Yes | Explanation in Chinese |
| `difficulty` | string | Yes | Question difficulty: `easy`, `medium`, `hard` |
| `concepts` | string[] | Yes | Key concepts being tested |

---

## Complete Example

Here's a complete example file for a book:

**File:** `/content/paid/atomic-habits/questions.json`

```json
{
  "bookId": "atomic-habits",
  "title": "Atomic Habits",
  "titleZh": "原子習慣",
  "summary": "Atomic Habits provides a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
  "summaryZh": "《原子習慣》提供了一個經過驗證的框架來改善每一天。詹姆斯·克利爾揭示了實用的策略，教你如何養成好習慣、戒除壞習慣，並掌握帶來顯著結果的微小行為。",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "According to the book, what percentage better do you get if you improve by 1% every day for a year?",
      "questionZh": "根據這本書，如果你每天進步 1%，一年後會進步多少？",
      "options": [
        "365% better",
        "37 times better",
        "100% better",
        "10 times better"
      ],
      "optionsZh": [
        "進步 365%",
        "進步 37 倍",
        "進步 100%",
        "進步 10 倍"
      ],
      "correctAnswer": "37 times better",
      "correctAnswerZh": "進步 37 倍",
      "explanation": "The compound effect of 1% daily improvement over a year equals 1.01^365 = 37.78, or approximately 37 times better.",
      "explanationZh": "每天進步 1% 的複利效應在一年後等於 1.01^365 = 37.78，約為 37 倍的進步。",
      "difficulty": "medium",
      "concepts": ["compound effect", "1% improvement", "consistency"]
    },
    {
      "id": "q2",
      "type": "true-false",
      "question": "The book states that motivation is the key to building lasting habits.",
      "questionZh": "這本書指出動機是建立持久習慣的關鍵。",
      "correctAnswer": "false",
      "correctAnswerZh": "錯誤",
      "explanation": "The book emphasizes that systems and environment design are more important than motivation. Motivation is fleeting, but good systems last.",
      "explanationZh": "這本書強調系統和環境設計比動機更重要。動機是短暫的，但好的系統是持久的。",
      "difficulty": "easy",
      "concepts": ["systems vs goals", "motivation", "environment design"]
    },
    {
      "id": "q3",
      "type": "short-answer",
      "question": "What are the four laws of behavior change mentioned in Atomic Habits?",
      "questionZh": "《原子習慣》中提到的行為改變四法則是什麼？",
      "correctAnswer": "Make it obvious, make it attractive, make it easy, make it satisfying",
      "correctAnswerZh": "讓提示顯而易見、讓習慣有吸引力、讓行動輕而易舉、讓獎賞令人滿足",
      "acceptableAnswers": [
        "obvious, attractive, easy, satisfying",
        "cue, craving, response, reward",
        "make it obvious, attractive, easy, and satisfying"
      ],
      "explanation": "The four laws are: 1) Make it obvious (cue), 2) Make it attractive (craving), 3) Make it easy (response), 4) Make it satisfying (reward).",
      "explanationZh": "四個法則是：1) 讓提示顯而易見，2) 讓習慣有吸引力，3) 讓行動輕而易舉，4) 讓獎賞令人滿足。",
      "difficulty": "hard",
      "concepts": ["four laws", "behavior change", "habit formation"]
    }
  ]
}
```

---

## Adding New Content

### For Free Books

1. Create a JSON file following the format above
2. Upload to Firebase Storage: `/content/free/{filename}.json`
3. Add book metadata to `src/data/books.ts` with `isFree: true`

### For Paid Books

1. Create a folder in Firebase Storage: `/content/paid/{bookId}/`
2. Create `questions.json` following the format above
3. Upload to: `/content/paid/{bookId}/questions.json`
4. Add book metadata to `src/data/books.ts` with pricing information
5. Create Stripe products using: `npm run stripe:create`

### Upload to Firebase Storage

Using Firebase Console:
1. Go to Firebase Console → Storage
2. Navigate to the appropriate folder (`free/` or `paid/{bookId}/`)
3. Click "Upload file"
4. Select your `questions.json` file

Using Firebase CLI:
```bash
# Upload free content
firebase storage:upload local-file.json content/free/book-name.json

# Upload paid content
firebase storage:upload questions.json content/paid/book-id/questions.json
```

---

## Notes

- All text fields should have both English and Chinese (繁體中文) versions
- Each book should have 15-20 questions minimum for a good learning experience
- Mix question types and difficulties for better engagement
- Use clear, concise language in both English and Chinese
- Test questions thoroughly before publishing
- Book IDs should be kebab-case (lowercase with hyphens): `atomic-habits`, `thinking-fast-slow`

---

## Validation Checklist

Before uploading content, verify:

- [ ] JSON is valid (use a JSON validator)
- [ ] All required fields are present
- [ ] English and Chinese versions match in structure
- [ ] Question IDs are unique within the book
- [ ] Correct answers are accurate
- [ ] File is uploaded to the correct path in Storage
- [ ] Book metadata is added to `src/data/books.ts`
- [ ] Cover image is uploaded to `/content/covers/`
