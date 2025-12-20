import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Container } from '@components/layout';
import { Button, CircularProgress } from '@components/ui';
import { useBooks, useQuestions } from '@features/books/hooks';
import { SummaryView } from '@features/books/components/SummaryView';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useProgressStore } from '@stores/progress-store';
import { StripeService } from '@services/stripe';
import { useAuth } from '@/features/auth/hooks/useAuth';

type TabType = 'summary' | 'training';

function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { books, loading: booksLoading } = useBooks();
  const { questions, loading: questionsLoading } = useQuestions(bookId);
  const [activeTab, setActiveTab] = useState<TabType>('training');
  const [purchasing, setPurchasing] = useState(false);

  const hasPurchased = usePurchaseStore((state) => state.hasPurchased);
  const hasActiveSubscription = useSubscriptionStore((state) => state.hasActiveSubscription);
  const purchasesLoading = usePurchaseStore((state) => state.loading);
  const subscriptionsLoading = useSubscriptionStore((state) => state.loading);

  const book = books.find((b) => b.id === bookId);
  const loading = booksLoading || questionsLoading || purchasesLoading || subscriptionsLoading;

  // User has access if: free book, purchased this book, or has active subscription for this book
  const isPurchased = book ? (book.isFree || hasPurchased(book.id) || hasActiveSubscription(book.id)) : false;
  const needsPurchase = book && !book.isFree && !isPurchased;

  // Get real progress data from store
  const progress = bookId ? useProgressStore((state) => state.getProgress(bookId)) : null;
  const questionsAnswered = progress?.questionsCompleted.length || 0;
  const questionsCorrect = progress?.questionsCorrect.length || 0;
  const masteryLevel = progress?.masteryLevel || 0;

  const handlePurchaseBook = async () => {
    if (!book) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      alert('Please sign in to purchase this book.');
      navigate('/login', { state: { from: { pathname: `/books/${book.id}` } } });
      return;
    }

    const priceId = StripeService.getPriceId(`${book.id}-lifetime`);
    if (!priceId || !StripeService.isConfigured()) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setPurchasing(true);
    try {
      await StripeService.openCheckout({
        priceId,
        bookId: book.id,
        bookTitle: `${book.title} - Lifetime Access`,
        userEmail: user.email || undefined,
        userId: user.uid,  // Pass user ID for Firestore
        isSubscription: false,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to open checkout. Please try again.');
      setPurchasing(false);
    }
  };

  const handleSubscribeBook = async () => {
    if (!book) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      alert('Please sign in to subscribe to this book.');
      navigate('/login', { state: { from: { pathname: `/books/${book.id}` } } });
      return;
    }

    const priceId = StripeService.getPriceId(`${book.id}-subscription`);
    if (!priceId || !StripeService.isConfigured()) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setPurchasing(true);
    try {
      await StripeService.openCheckout({
        priceId,
        bookId: book.id,
        bookTitle: `${book.title} - Subscription`,
        userEmail: user.email || undefined,
        userId: user.uid,  // Pass user ID for Firestore
        isSubscription: true,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to open checkout. Please try again.');
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading book...</p>
          </div>
        </Container>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Not Found</h2>
            <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Book Detail Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
          {/* Book Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <img
                src={book.coverImage}
                alt={`${book.title} cover`}
                className="w-48 h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/300x400/f3f4f6/6b7280?text=${encodeURIComponent(book.title)}`;
                }}
              />
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {book.category.join(', ')}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
                {book.titleZh && (
                  <span className="block text-2xl text-gray-700 mt-2">
                    {book.titleZh}
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                By {book.author}
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {book.description}
              </p>

              {/* Difficulty Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1)} Level
              </div>
            </div>
          </div>

          {/* Content - Purchase Screen or Tabs */}
          <div className="border-t border-gray-200 pt-8">
            {needsPurchase ? (
              /* Purchase Required - Shown Prominently */
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-50 mb-4">
                    <svg
                      className="w-12 h-12 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Unlock This Book
                  </h3>
                  <p className="text-lg text-gray-600">
                    Choose how you'd like to access this content
                  </p>
                </div>

                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* One-Time Purchase */}
                  <div className="bg-white rounded-lg shadow-sm border-2 border-primary-500 p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Lifetime Access</h4>
                      <div className="text-4xl font-bold text-primary-600 mb-1">
                        $9
                      </div>
                      <p className="text-sm text-gray-500">One-time payment • Forever</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Full book summary</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{questions.length} training questions</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 font-medium">Lifetime access - no expiration</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 font-medium">No recurring charges</span>
                      </li>
                    </ul>

                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handlePurchaseBook}
                      disabled={purchasing}
                    >
                      {purchasing ? 'Processing...' : 'Get Lifetime Access'}
                    </Button>
                  </div>

                  {/* Subscription */}
                  <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Subscription</h4>
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        $3<span className="text-lg text-gray-600">/3mo</span>
                      </div>
                      <p className="text-sm text-gray-500">Billed quarterly • Cancel anytime</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Full book summary</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{questions.length} training questions</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Access while subscribed</span>
                      </li>
                      <li className="flex items-start text-sm">
                        <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Cancel anytime</span>
                      </li>
                    </ul>

                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={handleSubscribeBook}
                      disabled={purchasing}
                    >
                      {purchasing ? 'Processing...' : 'Subscribe'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Purchased or Free - Show Tabs */
              <>
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                      activeTab === 'summary'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('training')}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                      activeTab === 'training'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Training
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'summary' && (
                  <div>
                    <SummaryView book={book} />
                  </div>
                )}

                {activeTab === 'training' && (
                  <div>
                    {/* Progress Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                      {/* Circular Progress */}
                      <div className="flex-shrink-0">
                        <CircularProgress value={masteryLevel} size={140} strokeWidth={10} />
                      </div>

                      {/* Stats */}
                      <div className="flex-1 grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {questions.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Questions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {questionsAnswered}
                          </div>
                          <div className="text-sm text-gray-600">
                            Questions Answered
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            {questionsCorrect}
                          </div>
                          <div className="text-sm text-gray-600">
                            Correct Streak
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate(`/books/${bookId}/train`)}
                      >
                        {questionsAnswered > 0 ? 'Continue Session' : 'Start Training'}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        disabled={true}
                        onClick={() => {}}
                      >
                        Review Mode (Coming Soon)
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default BookDetailPage;
