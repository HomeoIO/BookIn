import { useState, useEffect } from 'react';
import { Question } from '@core/domain';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Number of questions to select per session
const QUESTIONS_PER_SESSION = 10;

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

        const allQuestions: Question[] = await response.json();

        // Shuffle all questions
        const shuffled = shuffleArray(allQuestions);

        // Select first N questions (or all if less than N)
        const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length));

        setQuestions(selected);
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
