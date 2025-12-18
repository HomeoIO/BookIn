export type BookDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Book {
  id: string;
  title: string;
  titleZh?: string; // Chinese (Cantonese) title
  author: string;
  description: string;
  coverImage: string;
  category: string[];
  difficulty: BookDifficulty;
  totalQuestions: number;
  isFree: boolean;
  price?: number;
  summary: string;
  stripeProductId?: string;
  createdAt?: number;
}

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  summary: string;
  keyTakeaways: string[];
}

// Helper functions for Book domain logic
export const BookHelpers = {
  isFreeBook(book: Book): boolean {
    return book.isFree;
  },

  isPurchaseRequired(book: Book): boolean {
    return !book.isFree;
  },

  formatPrice(book: Book): string {
    if (book.isFree) return 'FREE';
    return book.price ? `$${book.price.toFixed(2)}` : 'N/A';
  },

  getDifficultyLabel(difficulty: BookDifficulty): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  },

  getCategoryTags(book: Book): string[] {
    return book.category;
  },
};
