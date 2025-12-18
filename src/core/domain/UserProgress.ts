export interface UserProgress {
  id: string;
  userId: string;
  bookId: string;
  questionsCompleted: string[];
  questionsCorrect: string[];
  lastAccessed: number;
  masteryLevel: number; // 0-100
  syncedToCloud: boolean;
  syncedAt?: number;
}

export interface SessionProgress {
  bookId: string;
  startTime: number;
  endTime?: number;
  questionsAnswered: number;
  questionsCorrect: number;
  duration: number; // in seconds
}

// Helper functions for UserProgress domain logic
export const UserProgressHelpers = {
  calculateMasteryLevel(
    questionsCompleted: string[],
    questionsCorrect: string[],
    totalQuestions: number
  ): number {
    if (totalQuestions === 0) return 0;

    const completionRate = questionsCompleted.length / totalQuestions;
    const accuracyRate =
      questionsCompleted.length > 0
        ? questionsCorrect.length / questionsCompleted.length
        : 0;

    // Weighted: 70% accuracy, 30% completion
    return Math.round((accuracyRate * 0.7 + completionRate * 0.3) * 100);
  },

  calculateAccuracy(
    questionsCompleted: string[],
    questionsCorrect: string[]
  ): number {
    if (questionsCompleted.length === 0) return 0;
    return Math.round((questionsCorrect.length / questionsCompleted.length) * 100);
  },

  calculateCompletionRate(
    questionsCompleted: string[],
    totalQuestions: number
  ): number {
    if (totalQuestions === 0) return 0;
    return Math.round((questionsCompleted.length / totalQuestions) * 100);
  },

  isQuestionCompleted(
    progress: UserProgress,
    questionId: string
  ): boolean {
    return progress.questionsCompleted.includes(questionId);
  },

  isQuestionCorrect(
    progress: UserProgress,
    questionId: string
  ): boolean {
    return progress.questionsCorrect.includes(questionId);
  },

  needsSync(progress: UserProgress): boolean {
    if (!progress.syncedToCloud) return true;
    if (!progress.syncedAt) return true;

    // Sync if last sync was more than 5 minutes ago
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - progress.syncedAt > fiveMinutes;
  },

  getMasteryLevelLabel(masteryLevel: number): string {
    if (masteryLevel >= 80) return 'Expert';
    if (masteryLevel >= 60) return 'Proficient';
    if (masteryLevel >= 40) return 'Learning';
    if (masteryLevel >= 20) return 'Beginner';
    return 'Just Started';
  },

  getMasteryColor(masteryLevel: number): string {
    if (masteryLevel >= 80) return 'text-green-600';
    if (masteryLevel >= 60) return 'text-blue-600';
    if (masteryLevel >= 40) return 'text-yellow-600';
    if (masteryLevel >= 20) return 'text-orange-600';
    return 'text-gray-600';
  },
};
