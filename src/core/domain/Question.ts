export type QuestionType = 'multiple-choice' | 'true-false';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  bookId: string;
  question: string;
  questionZh?: string;
  type: QuestionType;
  options?: string[];
  optionsZh?: string[];
  correctAnswer: string | string[];
  correctAnswerZh?: string | string[];
  explanation: string;
  explanationZh?: string;
  difficulty: QuestionDifficulty;
  concepts: string[];
}

export interface QuestionAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timestamp: number;
}

// Helper functions for Question domain logic
export const QuestionHelpers = {
  isMultipleChoice(question: Question): boolean {
    return question.type === 'multiple-choice';
  },

  isTrueFalse(question: Question): boolean {
    return question.type === 'true-false';
  },

  validateAnswer(question: Question, userAnswer: string | string[]): boolean {
    const correctAnswer = question.correctAnswer;
    const correctAnswerZh = question.correctAnswerZh;

    // Handle array answers (multiple correct answers)
    if (Array.isArray(userAnswer)) {
      // Check against English correct answer
      if (Array.isArray(correctAnswer)) {
        const isCorrectEn =
          correctAnswer.length === userAnswer.length &&
          correctAnswer.every((ans) => userAnswer.includes(ans));
        if (isCorrectEn) return true;
      }

      // Check against Chinese correct answer
      if (Array.isArray(correctAnswerZh)) {
        const isCorrectZh =
          correctAnswerZh.length === userAnswer.length &&
          correctAnswerZh.every((ans) => userAnswer.includes(ans));
        if (isCorrectZh) return true;
      }

      return false;
    }

    // Handle string answers (case-insensitive comparison)
    if (typeof userAnswer === 'string') {
      const userAnswerNormalized = userAnswer.toLowerCase().trim();

      // Check against English correct answer
      if (typeof correctAnswer === 'string') {
        if (correctAnswer.toLowerCase().trim() === userAnswerNormalized) {
          return true;
        }
      }

      // Check against Chinese correct answer
      if (typeof correctAnswerZh === 'string') {
        if (correctAnswerZh.toLowerCase().trim() === userAnswerNormalized) {
          return true;
        }
      }
    }

    return false;
  },

  getDifficultyColor(difficulty: QuestionDifficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },

  getTypeLabel(type: QuestionType): string {
    switch (type) {
      case 'multiple-choice':
        return 'Multiple Choice';
      case 'true-false':
        return 'True/False';
      default:
        return 'Unknown';
    }
  },
};
