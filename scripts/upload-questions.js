#!/usr/bin/env node

/**
 * Upload question files to Firebase Storage
 *
 * Usage:
 *   node scripts/upload-questions.js
 *
 * This script uploads question JSON files to Firebase Storage at:
 *   content/books/{bookId}/questions.json
 */

import admin from 'firebase-admin';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

const DATA_DIR = join(__dirname, '..', 'public', 'data');
const QUESTIONS_DIR = join(DATA_DIR, 'questions');

function loadBooksMetadata(fileName) {
  const filePath = join(DATA_DIR, fileName);
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

const booksMetadata = [
  ...loadBooksMetadata('books-paid.json'),
  ...loadBooksMetadata('books-free.json'),
];
const bookTitleById = new Map(booksMetadata.map((book) => [book.id, book.title]));

// Books to upload – derived from every JSON file in public/data/questions
const BOOKS = readdirSync(QUESTIONS_DIR)
  .filter((fileName) => fileName.endsWith('.json'))
  .map((fileName) => {
    const id = fileName.replace(/\.json$/, '');
    return {
      id,
      title: bookTitleById.get(id) ?? id,
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const missingTitleIds = BOOKS.filter((book) => bookTitleById.get(book.id) == null);
if (missingTitleIds.length > 0) {
  console.warn(
    `⚠️  Missing title metadata for: ${missingTitleIds.map((book) => book.id).join(', ')}`
  );
}

async function uploadQuestionFile(bookId, bookTitle) {
  const localPath = join(__dirname, '..', 'public', 'data', 'questions', `${bookId}.json`);
  const storagePath = `content/books/${bookId}/questions.json`;

  console.log(`\n📚 ${bookTitle}`);
  console.log(`   Local:   ${localPath}`);
  console.log(`   Storage: ${storagePath}`);

  try {
    // Read the file
    const fileContent = readFileSync(localPath, 'utf8');

    // Validate JSON
    JSON.parse(fileContent);

    // Upload to Firebase Storage
    const file = bucket.file(storagePath);

    await file.save(fileContent, {
      metadata: {
        contentType: 'application/json',
        metadata: {
          bookId,
          uploadedAt: new Date().toISOString(),
          source: 'upload-questions.js script',
        },
      },
    });

    console.log(`   ✅ Uploaded successfully`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔥 Firebase Storage Upload - Question Files\n');
  console.log(`Project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`Bucket:  ${process.env.VITE_FIREBASE_STORAGE_BUCKET}`);
  console.log(`\nUploading ${BOOKS.length} question files...\n`);
  console.log('─'.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const book of BOOKS) {
    const success = await uploadQuestionFile(book.id, book.title);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Upload complete: ${successCount} succeeded, ${failCount} failed\n`);

  if (failCount === 0) {
    console.log('All files uploaded successfully! 🎉');
    console.log('\nNext steps:');
    console.log('1. Verify uploads in Firebase Console → Storage');
    console.log('2. Check Storage Rules allow authenticated downloads');
    console.log('3. Test downloading content from the app\n');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
