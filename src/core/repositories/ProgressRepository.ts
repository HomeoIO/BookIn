import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { UserProgress } from '@core/domain';

export class ProgressRepository {
  private static COLLECTION = 'users';
  private static PROGRESS_SUBCOLLECTION = 'progress';

  /**
   * Get user's progress for a specific book
   * Path: users/{userId}/progress/{bookId}
   */
  static async getProgress(userId: string, bookId: string): Promise<UserProgress | null> {
    try {
      const progressRef = doc(
        db,
        this.COLLECTION,
        userId,
        this.PROGRESS_SUBCOLLECTION,
        bookId
      );

      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        return null;
      }

      const data = progressDoc.data();

      return {
        id: progressDoc.id,
        userId,
        bookId,
        questionsCompleted: data.questionsCompleted || [],
        questionsCorrect: data.questionsCorrect || [],
        lastAccessed: data.lastAccessed || Date.now(),
        masteryLevel: data.masteryLevel || 0,
        syncedToCloud: true,
        syncedAt: data.syncedAt instanceof Timestamp ? data.syncedAt.toMillis() : Date.now(),
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }

  /**
   * Get all progress records for a user
   * Path: users/{userId}/progress/*
   */
  static async getAllProgress(userId: string): Promise<UserProgress[]> {
    try {
      const progressQuery = query(
        collection(db, this.COLLECTION, userId, this.PROGRESS_SUBCOLLECTION)
      );

      const snapshot = await getDocs(progressQuery);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId,
          bookId: doc.id,
          questionsCompleted: data.questionsCompleted || [],
          questionsCorrect: data.questionsCorrect || [],
          lastAccessed: data.lastAccessed || Date.now(),
          masteryLevel: data.masteryLevel || 0,
          syncedToCloud: true,
          syncedAt: data.syncedAt instanceof Timestamp ? data.syncedAt.toMillis() : Date.now(),
        };
      });
    } catch (error) {
      console.error('Error getting all progress:', error);
      throw error;
    }
  }

  /**
   * Save or update user's progress for a book
   * Creates new progress record or updates existing one
   */
  static async saveProgress(progress: UserProgress): Promise<void> {
    try {
      const progressRef = doc(
        db,
        this.COLLECTION,
        progress.userId,
        this.PROGRESS_SUBCOLLECTION,
        progress.bookId
      );

      await setDoc(progressRef, {
        questionsCompleted: progress.questionsCompleted,
        questionsCorrect: progress.questionsCorrect,
        lastAccessed: progress.lastAccessed,
        masteryLevel: progress.masteryLevel,
        syncedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  /**
   * Update specific fields of progress record
   */
  static async updateProgress(
    userId: string,
    bookId: string,
    updates: Partial<Omit<UserProgress, 'id' | 'userId' | 'bookId'>>
  ): Promise<void> {
    try {
      const progressRef = doc(
        db,
        this.COLLECTION,
        userId,
        this.PROGRESS_SUBCOLLECTION,
        bookId
      );

      await updateDoc(progressRef, {
        ...updates,
        syncedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Record that a question was answered
   * Adds questionId to questionsCompleted and optionally questionsCorrect
   */
  static async recordAnswer(
    userId: string,
    bookId: string,
    questionId: string,
    isCorrect: boolean
  ): Promise<void> {
    try {
      const progressRef = doc(
        db,
        this.COLLECTION,
        userId,
        this.PROGRESS_SUBCOLLECTION,
        bookId
      );

      // Get current progress or create new
      const progressDoc = await getDoc(progressRef);
      const currentData = progressDoc.exists() ? progressDoc.data() : {};

      const questionsCompleted = new Set<string>(currentData.questionsCompleted || []);
      const questionsCorrect = new Set<string>(currentData.questionsCorrect || []);

      // Add to completed
      questionsCompleted.add(questionId);

      // Add to correct if answer was correct
      if (isCorrect) {
        questionsCorrect.add(questionId);
      } else {
        // Remove from correct if previously correct but now wrong
        questionsCorrect.delete(questionId);
      }

      await setDoc(progressRef, {
        questionsCompleted: Array.from(questionsCompleted),
        questionsCorrect: Array.from(questionsCorrect),
        lastAccessed: Date.now(),
        syncedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error recording answer:', error);
      throw error;
    }
  }

  /**
   * Update mastery level for a book
   */
  static async updateMasteryLevel(
    userId: string,
    bookId: string,
    masteryLevel: number
  ): Promise<void> {
    try {
      await this.updateProgress(userId, bookId, { masteryLevel });
    } catch (error) {
      console.error('Error updating mastery level:', error);
      throw error;
    }
  }

  /**
   * Get books with progress (for "My Library" filter)
   */
  static async getBooksWithProgress(userId: string): Promise<string[]> {
    try {
      const allProgress = await this.getAllProgress(userId);
      return allProgress
        .filter(p => p.questionsCompleted.length > 0)
        .map(p => p.bookId);
    } catch (error) {
      console.error('Error getting books with progress:', error);
      throw error;
    }
  }
}
