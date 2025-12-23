export interface ReflectionEntry {
  id: string;
  userId: string;
  bookId: string;
  questionId: string;
  content: string;
  createdAt: number;
  completed?: boolean;
  completedAt?: number | null;
}
