import { create } from 'zustand';
import { ReflectionEntry } from '@core/domain';
import { ReflectionService } from '@core/services/ReflectionService';

interface ReflectionState {
  reflectionsByBook: Record<string, ReflectionEntry[]>;
  loading: boolean;
  fetchReflections: (userId: string, bookId: string) => Promise<void>;
  addReflection: (entry: Omit<ReflectionEntry, 'id'>) => Promise<void>;
  clear: () => void;
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  reflectionsByBook: {},
  loading: false,

  async fetchReflections(userId, bookId) {
    set({ loading: true });
    try {
      const entries = await ReflectionService.getReflections(userId, bookId);
      set((state) => ({
        reflectionsByBook: {
          ...state.reflectionsByBook,
          [bookId]: entries,
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load reflections', error);
      set({ loading: false });
    }
  },

  async addReflection(entry) {
    const saved = await ReflectionService.addReflection(entry);
    set((state) => {
      const current = state.reflectionsByBook[entry.bookId] || [];
      return {
        reflectionsByBook: {
          ...state.reflectionsByBook,
          [entry.bookId]: [saved, ...current],
        },
      };
    });
  },

  clear() {
    set({ reflectionsByBook: {}, loading: false });
  },
}));
