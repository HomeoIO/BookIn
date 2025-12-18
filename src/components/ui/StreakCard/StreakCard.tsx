import { useStreakStore } from '@stores/streak-store';

interface StreakCardProps {
  compact?: boolean;
}

function StreakCard({ compact = false }: StreakCardProps) {
  const { currentStreak, longestStreak, totalDaysPracticed } = useStreakStore();
  const streakStatus = useStreakStore((state) => state.getStreakStatus());
  // const rescueStreak = useStreakStore((state) => state.rescueStreak); // TODO: Implement rescue streak feature

  const { canRescue, daysUntilReset, isOnFire, nextMilestone } = streakStatus;

  // Get fire emoji intensity based on streak
  const getFireEmoji = () => {
    if (currentStreak >= 30) return '🔥🔥🔥';
    if (currentStreak >= 7) return '🔥🔥';
    if (currentStreak >= 3) return '🔥';
    return '✨';
  };

  // Get motivational message
  const getMessage = () => {
    if (canRescue) {
      return `Don't break the chain! Practice now to rescue your ${currentStreak}-day streak.`;
    }
    if (currentStreak === 0) {
      return 'Start your learning streak today!';
    }
    if (currentStreak >= 20) {
      return `Amazing! You've built a strong habit!`;
    }
    if (currentStreak >= 7) {
      return `Keep it up! You're on fire!`;
    }
    return `${nextMilestone - currentStreak} more days to ${nextMilestone}-day milestone!`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-4 py-2">
        <span className="text-2xl">{getFireEmoji()}</span>
        <div>
          <div className="text-lg font-bold text-gray-900">{currentStreak}</div>
          <div className="text-xs text-gray-600">day streak</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getFireEmoji()}</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentStreak}</h3>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>

        {isOnFire && (
          <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            ON FIRE!
          </div>
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 mb-4">{getMessage()}</p>

      {/* Progress to next milestone */}
      {currentStreak > 0 && currentStreak < nextMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{currentStreak} days</span>
            <span>{nextMilestone} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Rescue streak warning */}
      {canRescue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-900">Streak at risk!</p>
              <p className="text-xs text-red-700">
                Complete a training session within {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'} to
                save your streak.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-bold text-primary-600">{longestStreak}</div>
          <div className="text-xs text-gray-600">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary-600">{totalDaysPracticed}</div>
          <div className="text-xs text-gray-600">Total Days</div>
        </div>
      </div>
    </div>
  );
}

export default StreakCard;
