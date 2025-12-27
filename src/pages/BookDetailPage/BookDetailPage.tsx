import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, Container } from '@components/layout';
import { Button, CircularProgress } from '@components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useBooks, useQuestions } from '@features/books/hooks';
import { SummaryView } from '@features/books/components/SummaryView';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useCollectionStore } from '@stores/collection-store';
import { useProgressStore } from '@stores/progress-store';
import { StripeService } from '@services/stripe';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ReflectionHistory } from '@features/reflection/components/ReflectionHistory';
import { useRegion } from '@/hooks/useRegion';
import { getAmazonLink, getAudibleLink } from '@/utils/affiliate';
import type { Book } from '@core/domain';

function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { countryCode } = useRegion();
  const { books, loading: booksLoading } = useBooks();
  const { questions, loading: questionsLoading } = useQuestions(bookId);
  const [purchasing, setPurchasing] = useState(false);

  const purchases = usePurchaseStore((state) => state.purchases);
  const purchasesLoading = usePurchaseStore((state) => state.loading);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const subscriptionsLoading = useSubscriptionStore((state) => state.loading);
  const hasPurchasedCollection = useCollectionStore((state) => state.hasPurchasedCollection);

  const book = books.find((b) => b.id === bookId);
  const loading = booksLoading || questionsLoading || purchasesLoading || subscriptionsLoading;

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

  const hasCollectionAccess = (book?: Book) => {
    if (!book || !book.collection) return false;
    return book.collection.some((collectionId) => hasPurchasedCollection(collectionId));
  };

  const isPurchased = book ? (book.isFree || hasPurchaseAccess(book.id) || hasSubscriptionAccess(book.id) || hasCollectionAccess(book)) : false;
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
                  <span
                    className={`block text-2xl text-gray-700 mt-2 ${i18n.language?.startsWith('zh') ? '' : 'text-opacity-0'}`}
                  >
                    {book.titleZh}
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                By {book.author}
              </p>
              {/* Difficulty Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1)} Level
              </div>

              {/* Affiliate Buttons */}
              <AffiliateButtons book={book} regionCode={countryCode} />
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
                        US$9
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
                      variant="default"
                      size="lg"
                      className="w-full"
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
                        US$3<span className="text-lg text-gray-600">/3mo</span>
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
                      className="w-full"
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
              <Tabs defaultValue="training" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="summary">
                    {i18n.language === 'zh-HK' ? '概要' : 'Summary'}
                  </TabsTrigger>
                  <TabsTrigger value="training">
                    {i18n.language === 'zh-HK' ? '訓練' : 'Training'}
                  </TabsTrigger>
                  <TabsTrigger value="reflection">
                    {i18n.language === 'zh-HK' ? '心得記錄' : 'Reflections'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <SummaryView book={book} />
                </TabsContent>

                <TabsContent value="training">
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
                      variant="default"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate(`/books/${bookId}/train`)}
                    >
                      {questionsAnswered > 0 ? 'Continue Session' : 'Start Training'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled={true}
                      onClick={() => {}}
                    >
                      Review Mode (Coming Soon)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="reflection">
                  <ReflectionHistory
                    bookId={book.id}
                    userId={user?.uid}
                    hasAccess={isPurchased}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

export default BookDetailPage;

function AffiliateButtons({ book, regionCode }: { book: Book; regionCode: string | null | undefined }) {
  const { t } = useTranslation(['books']);
  const amazonLink = getAmazonLink(book, regionCode);
  const audibleLink = getAudibleLink(book, regionCode);

  if (!amazonLink && !audibleLink) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {amazonLink && (
        <a
          href={amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition"
        >
          {t('books:buy_book', 'Buy on Amazon')}
        </a>
      )}
      {audibleLink && (
        <a
          href={audibleLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition"
        >
          {t('books:listen_audible', 'Listen on Audible')}
        </a>
      )}
    </div>
  );
}
