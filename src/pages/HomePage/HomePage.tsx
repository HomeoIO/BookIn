import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, Container } from '@components/layout';
import { BookCard } from '@features/books/components';
import { useBooks } from '@features/books/hooks';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
// import type { Book } from '@core/domain'; // TODO: Use for type annotations
import { StreakCard } from '@components/ui/StreakCard';

function HomePage() {
  const { t } = useTranslation(['books', 'common']);
  const { books, loading, error } = useBooks();
  const purchasesLoading = usePurchaseStore((state) => state.loading);
  const subscriptionsLoading = useSubscriptionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');

  // Get unique categories from all books
  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach((book) => book.category.forEach((cat) => cats.add(cat)));
    return Array.from(cats).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((book) => book.category.includes(categoryFilter));
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter((book) => book.difficulty === difficultyFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'difficulty':
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return result;
  }, [books, searchQuery, categoryFilter, difficultyFilter, sortBy]);

  if (error) {
    return (
      <>
        <Header />
        <Container className="py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">{t('books:error_loading_books')}</h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-8">
        {/* Streak Card */}
        <div className="mb-8">
          <StreakCard />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('books:search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('books:category')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">{t('books:difficulty')}</option>
              <option value="beginner">{t('books:difficulty_beginner')}</option>
              <option value="intermediate">{t('books:difficulty_intermediate')}</option>
              <option value="advanced">{t('books:difficulty_advanced')}</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ml-auto"
            >
              <option value="title">{t('books:sort_by_title')}</option>
              <option value="author">{t('books:sort_by_author')}</option>
              <option value="difficulty">{t('books:sort_by_difficulty')}</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {(loading || purchasesLoading || subscriptionsLoading) && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('books:loading_books')}</p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !purchasesLoading && !subscriptionsLoading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} progress={0} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !purchasesLoading && !subscriptionsLoading && filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('books:no_books_found')}
            </h3>
            <p className="text-gray-600">
              {t('books:no_books_found_message')}
            </p>
          </div>
        )}
      </Container>
    </>
  );
}

export default HomePage;
