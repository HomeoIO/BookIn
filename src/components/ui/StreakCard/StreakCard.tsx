import { useStreakStore } from '@stores/streak-store';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, Sparkles } from 'lucide-react';

interface StreakCardProps {
  compact?: boolean;
}

function StreakCard({ compact = false }: StreakCardProps) {
  const { currentStreak } = useStreakStore();
  const streakStatus = useStreakStore((state) => state.getStreakStatus());

  const { canRescue, daysUntilReset, nextMilestone } = streakStatus;

  // Get streak icon based on current streak
  const getStreakIcon = () => {
    if (currentStreak >= 3) {
      return <Flame className="w-12 h-12 text-orange-500" />;
    }
    return <Sparkles className="w-12 h-12 text-yellow-500" />;
  };

  // Get motivational message
  const getMessage = () => {
    if (canRescue) {
      return `Don't break the chain! Practice now to rescue your ${currentStreak}-day streak.`;
    }
    if (currentStreak === 0) {
      return 'Start your learning streak today!';
    }
    return 'Maintain your streak by completing a chapter today!';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-background rounded-lg border px-4 py-2">
        <div className="flex-shrink-0">{getStreakIcon()}</div>
        <div>
          <div className="text-lg font-bold">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">day streak</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white border-orange-200">
      <div className="p-6">
        {/* Header with streak icon and count */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">{getStreakIcon()}</div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight">
                {currentStreak} Day Streak!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{getMessage()}</p>
            </div>
          </div>

          {canRescue && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              At Risk
            </Badge>
          )}
        </div>

        {/* Progress to next milestone */}
        {currentStreak > 0 && currentStreak < nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentStreak} days</span>
              <span>Goal: {nextMilestone} days</span>
            </div>
            <Progress
              value={(currentStreak / nextMilestone) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Rescue warning */}
        {canRescue && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive font-medium">
              Complete a session within {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'} to save your streak!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default StreakCard;
