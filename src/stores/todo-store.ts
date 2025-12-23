import { create } from 'zustand';
import { ReflectionEntry } from '@core/domain';
import { ReflectionService } from '@core/services/ReflectionService';

interface TodoState {
  todos: ReflectionEntry[];
  loading: boolean;
  error?: string;
  fetchTodos: (userId: string) => Promise<void>;
  toggleTodo: (userId: string, reflectionId: string) => Promise<void>;
  clear: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  error: undefined,

  async fetchTodos(userId) {
    set({ loading: true, error: undefined });
    try {
      const entries = await ReflectionService.getAllReflections(userId);
      set({ todos: entries, loading: false });
    } catch (error) {
      console.error('Failed to fetch todos', error);
      set({ loading: false, error: 'Failed to load todos' });
    }
  },

  async toggleTodo(userId, reflectionId) {
    const todo = get().todos.find((entry) => entry.id === reflectionId);
    if (!todo) return;

    const completed = !todo.completed;
    const completedAt = completed ? Date.now() : null;
    const previous = get().todos.map((entry) => ({ ...entry }));

    set((state) => ({
      todos: state.todos.map((entry) =>
        entry.id === reflectionId ? { ...entry, completed, completedAt } : entry
      ),
    }));

    try {
      await ReflectionService.updateReflection(userId, reflectionId, { completed, completedAt });
    } catch (error) {
      console.error('Failed to update todo', error);
      set({ todos: previous, error: 'Failed to update todo' });
    }
  },

  clear() {
    set({ todos: [], loading: false, error: undefined });
  },
}));
