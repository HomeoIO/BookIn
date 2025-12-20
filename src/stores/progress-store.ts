import { create } from 'zustand';
import { UserProgress } from '@core/domain';
import { ProgressService } from '@core/services/ProgressService';

interface ProgressState {
  // State
  progressByBook: Record<string, UserProgress>; // bookId -> UserProgress
  loading: boolean;
  error: Error | null;
  lastFetch: number | null;

  // Actions
  fetchProgress: (userId: string, bookId: string) => Promise<void>;
  fetchAllProgress: (userId: string) => Promise<void>;
  recordAnswer: (
    userId: string,
    bookId: string,
    questionId: string,
    isCorrect: boolean,
    totalQuestions: number
  ) => Promise<void>;
  getProgress: (bookId: string) => UserProgress | null;
  clearProgress: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressByBook: {},
  loading: false,
  error: null,
  lastFetch: null,

  fetchProgress: async (userId: string, bookId: string) => {
    // Check cache
    const { progressByBook, lastFetch } = get();
    const cachedProgress = progressByBook[bookId];

    if (cachedProgress && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      return; // Use cached data
    }

    set({ loading: true, error: null });

    try {
      const progress = await ProgressService.getOrCreateProgress(userId, bookId);

      set((state) => ({
        progressByBook: {
          ...state.progressByBook,
          [bookId]: progress,
        },
        loading: false,
        lastFetch: Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch progress')
      });
    }
  },

  fetchAllProgress: async (userId: string) => {
    const { lastFetch } = get();

    // Check cache
    if (lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      return; // Use cached data
    }

    set({ loading: true, error: null });

    try {
      const allProgress = await ProgressService.getAllProgress(userId);

      const progressByBook = allProgress.reduce((acc, progress) => {
        acc[progress.bookId] = progress;
        return acc;
      }, {} as Record<string, UserProgress>);

      set({
        progressByBook,
        loading: false,
        lastFetch: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching all progress:', error);
      set({
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch progress')
      });
    }
  },

  recordAnswer: async (
    userId: string,
    bookId: string,
    questionId: string,
    isCorrect: boolean,
    totalQuestions: number
  ) => {
    try {
      const updatedProgress = await ProgressService.recordAnswer(
        userId,
        bookId,
        questionId,
        isCorrect,
        totalQuestions
      );

      set((state) => ({
        progressByBook: {
          ...state.progressByBook,
          [bookId]: updatedProgress,
        },
      }));
    } catch (error) {
      console.error('Error recording answer:', error);
      set({
        error: error instanceof Error ? error : new Error('Failed to record answer')
      });
    }
  },

  getProgress: (bookId: string) => {
    return get().progressByBook[bookId] || null;
  },

  clearProgress: () => {
    set({
      progressByBook: {},
      loading: false,
      error: null,
      lastFetch: null,
    });
  },
}));
