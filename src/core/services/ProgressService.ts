import { UserProgress, UserProgressHelpers, SessionProgress } from '@core/domain';
import { ProgressRepository } from '@core/repositories/ProgressRepository';

export class ProgressService {
  /**
   * Get or initialize progress for a book
   */
  static async getOrCreateProgress(
    userId: string,
    bookId: string
  ): Promise<UserProgress> {
    const existingProgress = await ProgressRepository.getProgress(userId, bookId);

    if (existingProgress) {
      return existingProgress;
    }

    // Create new progress record
    const newProgress: UserProgress = {
      id: bookId,
      userId,
      bookId,
      questionsCompleted: [],
      questionsCorrect: [],
      lastAccessed: Date.now(),
      masteryLevel: 0,
      syncedToCloud: false,
    };

    return newProgress;
  }

  /**
   * Record an answer and update progress
   */
  static async recordAnswer(
    userId: string,
    bookId: string,
    questionId: string,
    isCorrect: boolean,
    totalQuestions: number
  ): Promise<UserProgress> {
    // Record the answer in Firestore
    await ProgressRepository.recordAnswer(userId, bookId, questionId, isCorrect);

    // Get updated progress
    const progress = await ProgressRepository.getProgress(userId, bookId);

    if (!progress) {
      throw new Error('Failed to get progress after recording answer');
    }

    // Calculate and update mastery level
    const masteryLevel = UserProgressHelpers.calculateMasteryLevel(
      progress.questionsCompleted,
      progress.questionsCorrect,
      totalQuestions
    );

    await ProgressRepository.updateMasteryLevel(userId, bookId, masteryLevel);

    return {
      ...progress,
      masteryLevel,
    };
  }

  /**
   * Complete a training session and update progress
   */
  static async completeSession(
    userId: string,
    bookId: string,
    _session: SessionProgress,
    totalQuestions: number
  ): Promise<UserProgress> {
    // Get current progress
    let progress = await this.getOrCreateProgress(userId, bookId);

    // Update last accessed
    progress.lastAccessed = Date.now();

    // Calculate mastery level
    progress.masteryLevel = UserProgressHelpers.calculateMasteryLevel(
      progress.questionsCompleted,
      progress.questionsCorrect,
      totalQuestions
    );

    // Save to Firestore
    await ProgressRepository.saveProgress(progress);

    return progress;
  }

  /**
   * Get all progress for a user
   */
  static async getAllProgress(userId: string): Promise<UserProgress[]> {
    return ProgressRepository.getAllProgress(userId);
  }

  /**
   * Get progress statistics
   */
  static getProgressStats(progress: UserProgress, totalQuestions: number) {
    return {
      questionsAnswered: progress.questionsCompleted.length,
      questionsCorrect: progress.questionsCorrect.length,
      accuracy: UserProgressHelpers.calculateAccuracy(
        progress.questionsCompleted,
        progress.questionsCorrect
      ),
      completionRate: UserProgressHelpers.calculateCompletionRate(
        progress.questionsCompleted,
        totalQuestions
      ),
      masteryLevel: progress.masteryLevel,
      masteryLabel: UserProgressHelpers.getMasteryLevelLabel(progress.masteryLevel),
      masteryColor: UserProgressHelpers.getMasteryColor(progress.masteryLevel),
    };
  }

  /**
   * Check if user has started a book (has any progress)
   */
  static hasProgress(progress: UserProgress | null): boolean {
    return progress !== null && progress.questionsCompleted.length > 0;
  }

  /**
   * Get books user has started (for "My Library" filter)
   */
  static async getBooksWithProgress(userId: string): Promise<string[]> {
    return ProgressRepository.getBooksWithProgress(userId);
  }

  /**
   * Sync local progress to Firestore
   * Used when user has local progress that needs to be synced
   */
  static async syncProgress(progress: UserProgress): Promise<void> {
    await ProgressRepository.saveProgress({
      ...progress,
      syncedToCloud: true,
      syncedAt: Date.now(),
    });
  }

  /**
   * Check if progress needs syncing
   */
  static needsSync(progress: UserProgress): boolean {
    return UserProgressHelpers.needsSync(progress);
  }
}
