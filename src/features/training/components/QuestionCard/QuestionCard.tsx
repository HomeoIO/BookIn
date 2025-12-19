import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Question, QuestionHelpers } from '@core/domain';
import { Button } from '@components/ui';

export interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  showFeedback: boolean;
  userAnswer?: string;
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showFeedback,
  userAnswer,
}: QuestionCardProps) {
  const { i18n } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<string>(userAnswer || '');

  // Determine if we should show Chinese content
  const isChinese = i18n.language === 'zh-HK';

  // Get localized content
  const questionText = isChinese && question.questionZh ? question.questionZh : question.question;
  const options = isChinese && question.optionsZh ? question.optionsZh : question.options;
  const correctAnswer = isChinese && question.correctAnswerZh ? question.correctAnswerZh : question.correctAnswer;
  const explanation = isChinese && question.explanationZh ? question.explanationZh : question.explanation;

  const handleSubmit = () => {
    const isCorrect = QuestionHelpers.validateAnswer(question, selectedAnswer);
    onAnswer(selectedAnswer, isCorrect);
  };

  const isCorrect = userAnswer
    ? QuestionHelpers.validateAnswer(question, userAnswer)
    : false;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Question {questionNumber}/{totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <p className="text-lg font-medium text-gray-900 leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Answer Options */}
      {!showFeedback && (
        <div className="space-y-3 mb-8">
          {question.type === 'multiple-choice' &&
            options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                      selectedAnswer === option
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswer === option && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}

          {question.type === 'true-false' && (
            <>
              {['true', 'false'].map((option) => {
                // Map English values to display text based on language
                const displayText = isChinese
                  ? option === 'true'
                    ? '對'
                    : '錯'
                  : option.charAt(0).toUpperCase() + option.slice(1);

                return (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                          selectedAnswer === option
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAnswer === option && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700">{displayText}</span>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Feedback Panel */}
      {showFeedback && userAnswer && (
        <div
          className={`mb-8 p-6 rounded-lg ${
            isCorrect ? 'bg-primary-50 border-2 border-primary-200' : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          {/* Correct/Incorrect Header */}
          <div className="flex items-start mb-4">
            {isCorrect ? (
              <svg
                className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  isCorrect ? 'text-primary-900' : 'text-red-900'
                }`}
              >
                {isCorrect
                  ? isChinese
                    ? '正確！'
                    : 'Correct!'
                  : isChinese
                  ? '錯誤'
                  : 'Incorrect'}
              </h3>
              {!isCorrect && (
                <p className="text-sm text-red-800 mb-3">
                  {isChinese ? '正確答案是：' : 'The correct answer is: '}
                  <strong>{String(correctAnswer)}</strong>
                </p>
              )}
              <p className={isCorrect ? 'text-primary-800' : 'text-red-800'}>
                {explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedAnswer}
        >
          {isChinese ? '檢查答案' : 'Check Answer'}
        </Button>
      )}
    </div>
  );
}

export default QuestionCard;
