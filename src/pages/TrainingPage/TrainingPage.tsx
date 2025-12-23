import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, Container } from '@components/layout';
import { Button } from '@components/ui';
import { useBooks, useQuestions } from '@features/books/hooks';
import { QuestionCard } from '@features/training/components';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useStreakStore } from '@stores/streak-store';
import { useProgressStore } from '@stores/progress-store';
import { useReflectionStore } from '@stores/reflection-store';
import { useAuth } from '@features/auth/hooks/useAuth';

interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

function TrainingPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['books']);
  const { books } = useBooks();
  const { questions, loading } = useQuestions(bookId);
  const { user } = useAuth();
  const purchases = usePurchaseStore((state) => state.purchases);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const recordPractice = useStreakStore((state) => state.recordPractice);
  const streakStatus = useStreakStore((state) => state.getStreakStatus());
  const { recordAnswer, getProgress, fetchProgress } = useProgressStore();
  const addReflection = useReflectionStore((state) => state.addReflection);

  const isChinese = i18n.language === 'zh-HK';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [_streakBeforeSession, _setStreakBeforeSession] = useState(0); // TODO: Implement streak tracking
  const [reflectionIndex, setReflectionIndex] = useState<number | null>(null);
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [reflectionSaving, setReflectionSaving] = useState(false);

  const book = books.find((b) => b.id === bookId);
  const currentQuestion = questions[currentQuestionIndex];

  const hasSubscriptionAccess = (bookId?: string) => {
    if (!bookId) return false;
    return subscriptions.some((sub) =>
      sub.bookId === bookId &&
      (sub.status === 'active' || sub.status === 'trialing') &&
      sub.currentPeriodEnd > Date.now()
    );
  };

  const hasPurchaseAccess = (bookId?: string) => {
    if (!bookId) return false;
    return purchases.some((purchase) => purchase.bookId === bookId);
  };

  const hasAccess = book ? (book.isFree || hasPurchaseAccess(book.id) || hasSubscriptionAccess(book.id)) : false;

  // Redirect to book detail if user doesn't have access
  useEffect(() => {
    if (book && !hasAccess) {
      navigate(`/books/${bookId}`);
    }
  }, [book, hasAccess, bookId, navigate]);

  // Fetch progress when component mounts
  useEffect(() => {
    if (user && bookId) {
      fetchProgress(user.uid, bookId);
    }
  }, [user, bookId, fetchProgress]);

  useEffect(() => {
    if (questions.length > 0) {
      setReflectionIndex(Math.floor(Math.random() * questions.length));
      setReflectionDraft('');
      setReflectionSubmitted(false);
    }
  }, [questions.length]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Record streak before showing completion
      // _setStreakBeforeSession(streakStatus.currentStreak); // TODO: Implement streak tracking
      recordPractice();

      // Check if this is a milestone
      const newStreak = streakStatus.currentStreak + 1;
      const milestones = [3, 7, 14, 20, 30];
      if (milestones.includes(newStreak)) {
        setShowStreakCelebration(true);
      }

      setSessionComplete(true);
    }
  }, [currentQuestionIndex, questions.length, recordPractice, streakStatus.currentStreak]);

  const handleAnswer = async (answer: string, isCorrect: boolean) => {
    // Save answer to local state
    const newAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect,
    };
    setAnswers([...answers, newAnswer]);
    setShowFeedback(true);

    // Record progress to Firestore (if user is authenticated)
    if (user && bookId && book) {
      try {
        await recordAnswer(
          user.uid,
          bookId,
          currentQuestion.id,
          isCorrect,
          book.totalQuestions
        );
      } catch (error) {
        console.error('Failed to save progress:', error);
        // Continue anyway - don't block user experience
      }
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleReflectionSave = async () => {
    if (!user || !book || !bookId || !currentQuestion) {
      alert(isChinese ? '請登入以儲存心得' : 'Please sign in to save reflections.');
      return;
    }
    if (!reflectionDraft.trim()) {
      return;
    }
    try {
      setReflectionSaving(true);
      await addReflection({
        userId: user.uid,
        bookId,
        questionId: currentQuestion.id,
        content: reflectionDraft.trim(),
        createdAt: Date.now(),
        completed: false,
        completedAt: null,
      });
      setReflectionDraft('');
      setReflectionSubmitted(true);
    } catch (error) {
      console.error('Failed to save reflection:', error);
      alert(isChinese ? '無法儲存心得' : 'Failed to save reflection');
    } finally {
      setReflectionSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">
              {isChinese ? '載入問題中...' : 'Loading questions...'}
            </p>
          </div>
        </Container>
      </>
    );
  }

  if (!book || questions.length === 0) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isChinese ? '沒有可用的問題' : 'No Questions Available'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isChinese ? '此書目前沒有問題。' : 'There are no questions for this book yet.'}
            </p>
            <Button onClick={() => navigate(`/books/${bookId}`)}>
              {isChinese ? '返回書籍' : 'Back to Book'}
            </Button>
          </div>
        </Container>
      </>
    );
  }

  // Session Complete View
  if (sessionComplete) {
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = answers.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Get real progress data if available
    const currentProgress = bookId ? getProgress(bookId) : null;
    const masteryLevel = currentProgress?.masteryLevel || 0;
    const masteryIncrease = currentProgress?.masteryLevel
      ? Math.max(0, currentProgress.masteryLevel - masteryLevel)
      : Math.round(score / 20); // Fallback to simplified calculation

    const newStreak = useStreakStore.getState().currentStreak;

    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto text-center">
            {/* Milestone Celebration */}
            {showStreakCelebration && (
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isChinese ? `${newStreak} 天里程碑！` : `${newStreak}-Day Milestone!`}
                </h2>
                <p className="text-gray-700">
                  {isChinese
                    ? `太棒了！您已經連續練習了 ${newStreak} 天。您正在養成強大的學習習慣！`
                    : `Amazing! You've practiced ${newStreak} days in a row. You're building a powerful learning habit!`}
                </p>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isChinese ? '課程完成！' : 'Session Complete!'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {isChinese ? '做得好！' : 'Great Job!'}
            </p>

            {/* Results Box */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-center items-center gap-12 mb-6">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isChinese ? '正確' : 'Correct'}
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-1">
                    +{masteryIncrease}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {isChinese ? '技能掌握度提升' : 'Skill Mastery Increase'}
                  </div>
                </div>
              </div>

              {/* Fire Icon for celebration */}
              {score >= 80 && (
                <div className="flex justify-center mb-4">
                  <span className="text-6xl">🔥</span>
                </div>
              )}
            </div>

            {/* Streak Info */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg border-2 border-primary-200 p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl">
                  {newStreak >= 3 ? '🔥' : '✨'}
                </span>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{newStreak}</div>
                  <div className="text-sm text-gray-600">
                    {isChinese ? '天連續' : 'Day Streak'}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {newStreak === 1 && (isChinese
                  ? "很好的開始！明天再來繼續您的連續紀錄。"
                  : "Great start! Come back tomorrow to continue your streak.")}
                {newStreak === 2 && (isChinese
                  ? "連續兩天！保持勢頭！"
                  : "Two days in a row! Keep the momentum going!")}
                {newStreak >= 3 && newStreak < 7 && (isChinese
                  ? "您真棒！繼續每天練習！"
                  : "You're on fire! Keep practicing daily!")}
                {newStreak >= 7 && newStreak < 20 && (isChinese
                  ? "驚人的一致性！您正在培養強大的習慣！"
                  : "Amazing consistency! You're building a strong habit!")}
                {newStreak >= 20 && (isChinese
                  ? "難以置信！您已經掌握了每日學習的習慣！"
                  : "Incredible! You've mastered the habit of daily learning!")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers([]);
                  setShowFeedback(false);
                  setSessionComplete(false);
                }}
              >
                {isChinese ? '開始新課程' : 'Start New Session'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate(`/books/${bookId}`)}
              >
                {isChinese ? '查看錯誤' : 'Review Mistakes'}
              </Button>
            </div>
          </div>
        </Container>
      </>
    );
  }

  // Safety check: if no current question, don't render training view
  if (!currentQuestion) {
    return null;
  }

  // Training View
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  return (
    <>
      <Header />
      <Container className="py-8">
        {/* Back Button */}
        <button
          onClick={() => {
            const message = isChinese
              ? '您確定要退出嗎？您的進度將會丟失。'
              : 'Are you sure you want to exit? Your progress will be lost.';
            if (confirm(message)) {
              navigate(`/books/${bookId}`);
            }
          }}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {isChinese ? '退出' : 'Exit'}
        </button>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={showFeedback}
          userAnswer={currentAnswer?.userAnswer}
        />

        {showFeedback &&
          reflectionIndex !== null &&
          currentQuestionIndex === reflectionIndex &&
          !reflectionSubmitted && (
            <div className="max-w-3xl mx-auto mt-6 border border-primary-100 bg-primary-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('books:reflection_prompt_title', 'Reflection Moment')}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {t('books:reflection_prompt_description', 'Capture how you will apply this lesson today.')}
              </p>
              <textarea
                rows={3}
                value={reflectionDraft}
                onChange={(e) => setReflectionDraft(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                placeholder={t('books:reflection_prompt_placeholder', 'Example: I will discuss this framework with my mentor tonight.')}
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleReflectionSave}
                  disabled={reflectionSaving}
                >
                  {reflectionSaving
                    ? t('books:reflection_prompt_saving', 'Saving...')
                    : t('books:reflection_prompt_save', 'Save Reflection')}
                </Button>
              </div>
            </div>
          )}

        {showFeedback && reflectionIndex !== null && currentQuestionIndex === reflectionIndex && reflectionSubmitted && (
          <div className="max-w-3xl mx-auto mt-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
            {t('books:reflection_prompt_saved', 'Reflection saved!')}
          </div>
        )}

        {/* Next Button */}
        {showFeedback && (
          <div className="max-w-3xl mx-auto mt-6">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1
                ? isChinese
                  ? '下一題'
                  : 'Next Question'
                : isChinese
                ? '完成課程'
                : 'Complete Session'}
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}

export default TrainingPage;
