import { useState, useEffect } from 'react';
import { Book } from '@core/domain';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);

        // Load both free and paid books
        const [freeResponse, paidResponse] = await Promise.all([
          fetch('/data/books-free.json'),
          fetch('/data/books-paid.json'),
        ]);

        if (!freeResponse.ok || !paidResponse.ok) {
          throw new Error('Failed to load books');
        }

        const [freeBooks, paidBooks] = await Promise.all([
          freeResponse.json(),
          paidResponse.json(),
        ]);

        // Combine free and paid books
        const allBooks = [...freeBooks, ...paidBooks];
        setBooks(allBooks);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  return { books, loading, error };
}
