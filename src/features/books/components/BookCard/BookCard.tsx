import { Link } from 'react-router-dom';
import { Book } from '@core/domain';
import { Card } from '@components/ui';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';

export interface BookCardProps {
  book: Book;
  progress?: number;
}

function BookCard({ book, progress = 0 }: BookCardProps) {
  const hasPurchased = usePurchaseStore((state) => state.hasPurchased);
  const hasActiveSubscription = useSubscriptionStore((state) => state.hasActiveSubscription);

  // Check if user has access via free, purchase, or active subscription
  const hasAccess = book.isFree || hasPurchased(book.id) || hasActiveSubscription(book.id);
  const isLocked = !hasAccess;

  return (
    <Link to={`/books/${book.id}`}>
      <Card
        hoverable
        padding="none"
        className="overflow-hidden h-full"
      >
        {/* Book Cover */}
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
          <img
            src={book.coverImage}
            alt={`${book.title} cover`}
            className={`w-full h-full object-cover ${isLocked ? 'opacity-60' : ''}`}
            onError={(e) => {
              // Fallback to colored placeholder if image fails to load
              e.currentTarget.src = `https://placehold.co/300x400/f3f4f6/6b7280?text=${encodeURIComponent(book.title)}`;
            }}
          />

          {/* Price Badge */}
          <div className="absolute top-2 right-2">
            {book.isFree ? (
              <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded">
                FREE
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
                ${book.price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Lock Icon for Unpurchased Paid Books */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900 bg-opacity-80 rounded-full p-4">
                <svg
                  className="w-8 h-8 text-white"
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
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
            {book.title}
            {book.titleZh && (
              <span className="block text-sm text-gray-700 mt-1">
                {book.titleZh}
              </span>
            )}
          </h3>

          {/* Author */}
          <p className="text-sm text-gray-600 mb-3">
            By {book.author}
          </p>

          {/* Progress */}
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>{progress}% Mastered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Category Tags */}
          <div className="flex flex-wrap gap-2">
            {book.category.slice(0, 2).map((cat, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default BookCard;
