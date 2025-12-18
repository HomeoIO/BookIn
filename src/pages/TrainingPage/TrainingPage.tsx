import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Container } from '@components/layout';
import { Button } from '@components/ui';
import { useBooks, useQuestions } from '@features/books/hooks';
import { QuestionCard } from '@features/training/components';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useStreakStore } from '@stores/streak-store';

interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

function TrainingPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books } = useBooks();
  const { questions, loading } = useQuestions(bookId);
  const hasPurchased = usePurchaseStore((state) => state.hasPurchased);
  const hasActiveSubscription = useSubscriptionStore((state) => state.hasActiveSubscription);
  const recordPractice = useStreakStore((state) => state.recordPractice);
  const streakStatus = useStreakStore((state) => state.getStreakStatus());

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [_streakBeforeSession, _setStreakBeforeSession] = useState(0); // TODO: Implement streak tracking

  const book = books.find((b) => b.id === bookId);
  const currentQuestion = questions[currentQuestionIndex];

  // Check if user has access to this book (free, purchased this book, or has subscription for this book)
  const hasAccess = book ? (book.isFree || hasPurchased(book.id) || hasActiveSubscription(book.id)) : false;

  // Redirect to book detail if user doesn't have access
  useEffect(() => {
    if (book && !hasAccess) {
      navigate(`/books/${bookId}`);
    }
  }, [book, hasAccess, bookId, navigate]);

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

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect,
      },
    ]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
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
              No Questions Available
            </h2>
            <p className="text-gray-600 mb-4">
              There are no questions for this book yet.
            </p>
            <Button onClick={() => navigate(`/books/${bookId}`)}>
              Back to Book
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
    const masteryIncrease = Math.round(score / 20); // Simplified calculation
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
                  {newStreak}-Day Milestone!
                </h2>
                <p className="text-gray-700">
                  Amazing! You've practiced {newStreak} days in a row. You're building a powerful learning habit!
                </p>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Session Complete!
            </h1>
            <p className="text-lg text-gray-600 mb-8">Great Job!</p>

            {/* Results Box */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-center items-center gap-12 mb-6">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-1">
                    +{masteryIncrease}%
                  </div>
                  <div className="text-sm text-gray-600">Skill Mastery Increase</div>
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
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {newStreak === 1 && "Great start! Come back tomorrow to continue your streak."}
                {newStreak === 2 && "Two days in a row! Keep the momentum going!"}
                {newStreak >= 3 && newStreak < 7 && "You're on fire! Keep practicing daily!"}
                {newStreak >= 7 && newStreak < 20 && "Amazing consistency! You're building a strong habit!"}
                {newStreak >= 20 && "Incredible! You've mastered the habit of daily learning!"}
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
                Start New Session
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => navigate(`/books/${bookId}`)}
              >
                Review Mistakes
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
            if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
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
          Exit
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
                ? 'Next Question'
                : 'Complete Session'}
            </Button>
          </div>
        )}
      </Container>
    </>
  );
}

export default TrainingPage;
