import { useState, useEffect } from 'react';
import { Question } from '@core/domain';

export function useQuestions(bookId: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    async function loadQuestions() {
      try {
        setLoading(true);
        const response = await fetch(`/data/questions/${bookId}.json`);

        if (!response.ok) {
          throw new Error('Failed to load questions');
        }

        const data = await response.json();
        setQuestions(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [bookId]);

  return { questions, loading, error };
}
