import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header, Container } from '@components/layout';
import { Button } from '@components/ui';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';

function PurchaseSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [processing, setProcessing] = useState(true);
  const [bookId, setBookId] = useState<string | null>(null);

  const addPurchase = usePurchaseStore((state) => state.addPurchase);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);

  useEffect(() => {
    async function verifyPurchase() {
      if (!sessionId) {
        setProcessing(false);
        return;
      }

      try {
        // Verify session with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify-session/${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to verify session');
        }

        const data = await response.json();

        if (data.success && data.bookId) {
          // Grant access based on payment type
          if (data.mode === 'subscription') {
            // Add to subscriptions
            addSubscription({
              id: sessionId, // Use Stripe session ID as subscription ID
              bookId: data.bookId,
              status: 'active',
              currentPeriodEnd: Date.now() + (90 * 24 * 60 * 60 * 1000), // 3 months from now
              cancelAtPeriodEnd: false,
            });
          } else {
            // Add to one-time purchases
            addPurchase(data.bookId, data.amountTotal ? data.amountTotal / 100 : 9.0);
          }

          setBookId(data.bookId);
          console.log(`✅ Access granted for book: ${data.bookId} (mode: ${data.mode})`);
        }

        setProcessing(false);
      } catch (error) {
        console.error('Error verifying purchase:', error);
        setProcessing(false);
      }
    }

    verifyPurchase();
  }, [sessionId, addPurchase, addSubscription]);

  if (processing) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your purchase...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. You now have access to your book's content.
          </p>

          {/* Session Info (for debugging) */}
          {sessionId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Session ID:</span>{' '}
                <code className="text-xs bg-white px-2 py-1 rounded">{sessionId}</code>
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What's next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your access has been granted</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You can now read the book summary and answer training questions</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your progress will be automatically saved</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Check your email for a receipt</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {bookId && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/books/${bookId}`)}
              >
                Start Reading Now
              </Button>
            )}
            <Button
              variant={bookId ? 'outline' : 'primary'}
              size="lg"
              onClick={() => navigate('/')}
            >
              Browse All Books
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

export default PurchaseSuccessPage;
