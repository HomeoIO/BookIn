import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPracticedDate: string | null; // ISO date string (YYYY-MM-DD)
  lastPracticedTimestamp: number | null;
  totalDaysPracticed: number;
  canRescue: boolean; // True if within 2-day grace period

  // Actions
  recordPractice: () => void;
  rescueStreak: () => void;
  getStreakStatus: () => {
    currentStreak: number;
    canRescue: boolean;
    daysUntilReset: number;
    isOnFire: boolean; // True if streak >= 3
    nextMilestone: number;
  };
}

// Helper: Get today's date as YYYY-MM-DD
const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper: Get date N days ago as YYYY-MM-DD
const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Helper: Calculate days between two dates
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticedDate: null,
      lastPracticedTimestamp: null,
      totalDaysPracticed: 0,
      canRescue: false,

      recordPractice: () => {
        const today = getTodayDate();
        const yesterday = getDateDaysAgo(1);
        const { lastPracticedDate, currentStreak, longestStreak, totalDaysPracticed } = get();

        // Don't record if already practiced today
        if (lastPracticedDate === today) {
          return;
        }

        let newStreak = currentStreak;
        let newTotalDays = totalDaysPracticed + 1;

        if (!lastPracticedDate) {
          // First time practicing
          newStreak = 1;
        } else if (lastPracticedDate === yesterday) {
          // Practiced yesterday - continue streak
          newStreak = currentStreak + 1;
        } else {
          const daysSinceLastPractice = daysBetween(lastPracticedDate, today);

          if (daysSinceLastPractice <= 2) {
            // Within 2-day grace period - rescue the streak!
            newStreak = currentStreak + 1;
          } else {
            // Too late, streak is broken - start over
            newStreak = 1;
          }
        }

        const newLongestStreak = Math.max(longestStreak, newStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastPracticedDate: today,
          lastPracticedTimestamp: Date.now(),
          totalDaysPracticed: newTotalDays,
          canRescue: false, // Reset rescue flag after practicing
        });
      },

      rescueStreak: () => {
        const { canRescue } = get().getStreakStatus();
        if (canRescue) {
          get().recordPractice();
        }
      },

      getStreakStatus: () => {
        const { currentStreak, lastPracticedDate } = get();
        const today = getTodayDate();

        if (!lastPracticedDate) {
          return {
            currentStreak: 0,
            canRescue: false,
            daysUntilReset: 0,
            isOnFire: false,
            nextMilestone: 3,
          };
        }

        const daysSinceLastPractice = daysBetween(lastPracticedDate, today);

        // Already practiced today
        if (lastPracticedDate === today) {
          return {
            currentStreak,
            canRescue: false,
            daysUntilReset: 0,
            isOnFire: currentStreak >= 3,
            nextMilestone: getNextMilestone(currentStreak),
          };
        }

        // Within grace period (1-2 days)
        if (daysSinceLastPractice <= 2) {
          return {
            currentStreak,
            canRescue: true,
            daysUntilReset: 3 - daysSinceLastPractice, // Days left to rescue
            isOnFire: currentStreak >= 3,
            nextMilestone: getNextMilestone(currentStreak),
          };
        }

        // Streak is broken
        return {
          currentStreak: 0,
          canRescue: false,
          daysUntilReset: 0,
          isOnFire: false,
          nextMilestone: 3,
        };
      },
    }),
    {
      name: 'bookin-streak',
    }
  )
);

// Helper: Get next milestone
function getNextMilestone(currentStreak: number): number {
  const milestones = [3, 7, 14, 20, 30, 50, 100];
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  return currentStreak + 10; // After 100, go by 10s
}
