/**
 * Generate books metadata for the app (public/data/books-paid.json)
 *
 * This script takes the book list from books-data.js and generates
 * the app's book metadata file with placeholder values for fields
 * that will be filled in later (author, summary, etc.)
 */

import { BOOKS } from './books-data.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a placeholder cover image URL
function getCoverImageUrl(bookId, category) {
  // Color scheme based on category
  const categoryColors = {
    'Business & Marketing': 'dbeafe/1e40af',
    'Finance & Investing': 'fce7f3/9d174d',
    'Personal Development': 'fee2e2/b91c1c',
    'Productivity': 'ecfccb/4d7c0f',
    'Psychology': 'f3e8ff/7e22ce',
    'Philosophy': 'e0e7ff/4338ca',
    'Career': 'fef3c7/a16207',
    'Relationships': 'ffe4e6/e11d48',
    'Success': 'fef9c3/ca8a04',
    'Health': 'd1fae5/059669',
    'Biography': 'fce7f3/be185d',
    'Leadership': 'dbeafe/2563eb',
    'Thinking': 'f3e8ff/9333ea',
    'Lifestyle': 'ffedd5/ea580c'
  };

  const colors = categoryColors[category] || 'f3f4f6/6b7280';
  const titleParam = bookId.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('+');

  return `https://placehold.co/300x400/${colors}?text=${titleParam}`;
}

// Assign difficulty based on category (can be customized later)
function getDifficulty(category) {
  const advancedCategories = ['Philosophy', 'Finance & Investing', 'Psychology'];
  const intermediateCategories = ['Business & Marketing', 'Leadership', 'Thinking', 'Career'];

  if (advancedCategories.includes(category)) return 'advanced';
  if (intermediateCategories.includes(category)) return 'intermediate';
  return 'beginner';
}

// Generate placeholder summary
function getPlaceholderSummary(book) {
  return `${book.title} (${book.titleZh}) is a ${book.category} book that provides valuable insights and practical knowledge.

This book covers key concepts and strategies in ${book.category.toLowerCase()}, offering readers actionable advice and proven frameworks for personal and professional growth.

📚 **Key Topics:**
- Core principles and foundational concepts
- Practical strategies and actionable advice
- Real-world examples and case studies
- Proven frameworks for implementation

**Learning Outcomes:**
Through interactive questions and summaries, you'll master the essential ideas from this book and be able to apply them in your daily life and work.

*Note: Detailed summary and full content available after purchase.*`;
}

// Convert books to app format
const appBooks = BOOKS.map(book => ({
  id: book.id,
  title: book.title,
  titleZh: book.titleZh, // NEW: Add Chinese title
  author: 'TBD', // Placeholder - to be filled in later
  description: book.titleZh,
  coverImage: getCoverImageUrl(book.id, book.category),
  category: [book.category], // Convert string to array
  difficulty: getDifficulty(book.category),
  totalQuestions: 15, // Default, can be customized later
  isFree: false,
  price: 9.00, // $9 lifetime per book
  summary: getPlaceholderSummary(book)
}));

// Write to public/data/books-paid.json
const outputPath = path.join(__dirname, '../public/data/books-paid.json');
fs.writeFileSync(outputPath, JSON.stringify(appBooks, null, 2));

console.log(`✅ Generated books metadata for ${appBooks.length} books`);
console.log(`📝 Saved to: ${outputPath}`);
console.log(`\n📋 Book Categories:`);

// Count books by category
const categoryCounts = {};
BOOKS.forEach(book => {
  categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
});

Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    console.log(`   ${category}: ${count} books`);
  });

console.log(`\n💡 Next steps:`);
console.log(`1. Review the generated file: public/data/books-paid.json`);
console.log(`2. Update author names and detailed summaries as needed`);
console.log(`3. Replace placeholder cover images with actual book covers`);
console.log(`4. Customize totalQuestions per book if needed`);
