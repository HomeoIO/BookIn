#!/usr/bin/env node

/**
 * Add collection field to all existing books
 * Marks all current books as part of the "2026-founding-collection"
 * Also migrates old "founding-collection" IDs to the new name
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_ID = '2026-founding-collection';

// Paths to book data files
const FREE_BOOKS_PATH = path.join(__dirname, '../public/data/books-free.json');
const PAID_BOOKS_PATH = path.join(__dirname, '../public/data/books-paid.json');

function addCollectionField(filePath, label) {
  try {
    console.log(`\nProcessing ${label}...`);

    // Read the file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Add collection field to each book
    let updatedCount = 0;
    data.forEach((book) => {
      if (!book.collection) {
        book.collection = [COLLECTION_ID];
        updatedCount++;
      } else if (typeof book.collection === 'string') {
        // Convert old string format to array and update old ID
        const oldId = book.collection === 'founding-collection' ? COLLECTION_ID : book.collection;
        book.collection = [oldId];
        updatedCount++;
      } else if (Array.isArray(book.collection)) {
        // Update old collection ID to new one
        book.collection = book.collection.map(id =>
          id === 'founding-collection' ? COLLECTION_ID : id
        );
        if (book.collection.includes(COLLECTION_ID)) {
          updatedCount++;
        }
      }
    });

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

    console.log(`✅ ${label}: ${updatedCount} books updated with collection field`);
    console.log(`   Total books: ${data.length}`);

    return data.length;
  } catch (error) {
    console.error(`❌ Error processing ${label}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🚀 Adding collection field to all existing books...\n');
  console.log(`Collection ID: "${COLLECTION_ID}"`);

  const freeCount = addCollectionField(FREE_BOOKS_PATH, 'Free Books');
  const paidCount = addCollectionField(PAID_BOOKS_PATH, 'Paid Books');

  console.log(`\n✨ Done! Total books in founding collection: ${freeCount + paidCount}`);
  console.log('\nNext steps:');
  console.log('1. Review the changes with: git diff public/data/');
  console.log('2. Test the app to ensure everything works');
  console.log('3. Commit the changes');
}

main();
