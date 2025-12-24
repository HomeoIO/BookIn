import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, Container } from '@components/layout';
import { BookCard } from '@features/books/components';
import { useBooks } from '@features/books/hooks';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useProgressStore } from '@stores/progress-store';
import { StreakCard } from '@components/ui/StreakCard';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Checkbox } from '@components/ui/checkbox';
import { Separator } from '@components/ui/separator';
import { Search } from 'lucide-react';

function HomePage() {
  const { t } = useTranslation(['books', 'common']);
  const { books, loading, error } = useBooks();
  const purchases = usePurchaseStore((state) => state.purchases);
  const purchasesLoading = usePurchaseStore((state) => state.loading);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const subscriptionsLoading = useSubscriptionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilters, setDifficultyFilters] = useState<string[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<string>('all'); // 'all' | 'library' | 'purchased'
  const [sortBy, setSortBy] = useState<string>('title');

  const getProgress = useProgressStore((state) => state.getProgress);

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

    // Difficulty filter (supports multiple selections)
    if (difficultyFilters.length > 0) {
      result = result.filter((book) => difficultyFilters.includes(book.difficulty));
    }

    // Library filter
    const hasBookAccess = (bookId: string, isFree: boolean) => {
      if (isFree) return true;
      const purchased = purchases.some((p) => p.bookId === bookId);
      const activeSub = subscriptions.some((sub) =>
        sub.bookId === bookId &&
        (sub.status === 'active' || sub.status === 'trialing') &&
        sub.currentPeriodEnd > Date.now()
      );
      return purchased || activeSub;
    };

    if (libraryFilter === 'library') {
      // Show books the user owns (via purchase/subscription) or has started
      result = result.filter((book) => {
        const progress = getProgress(book.id);
        const hasProgress = Boolean(progress && progress.questionsCompleted.length > 0);
        const hasAccess = hasBookAccess(book.id, book.isFree);
        return hasProgress || hasAccess;
      });
    } else if (libraryFilter === 'purchased') {
      // Show only purchased books
      result = result.filter((book) =>
        book.isFree || purchases.some((p) => p.bookId === book.id)
      );
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
  }, [books, searchQuery, categoryFilter, difficultyFilters, libraryFilter, sortBy, getProgress, purchases, subscriptions]);

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

  const toggleDifficulty = (difficulty: string) => {
    setDifficultyFilters(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  return (
    <>
      <Header />
      <Container className="py-8">
        {/* Streak Card */}
        <div className="mb-8">
          <StreakCard />
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-background border rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('books:search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Library Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Library</label>
                <Select value={libraryFilter} onValueChange={setLibraryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('books:all_books', 'All Books')}</SelectItem>
                    <SelectItem value="library">{t('books:my_library', 'My Library')}</SelectItem>
                    <SelectItem value="purchased">{t('books:purchased', 'Purchased')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">{t('books:category')}</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('books:category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter (Checkboxes) */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">{t('books:difficulty')}</label>
                <div className="space-y-2">
                  {[
                    { value: 'beginner', label: t('books:difficulty_beginner') },
                    { value: 'intermediate', label: t('books:difficulty_intermediate') },
                    { value: 'advanced', label: t('books:difficulty_advanced') }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${value}`}
                        checked={difficultyFilters.includes(value)}
                        onCheckedChange={() => toggleDifficulty(value)}
                      />
                      <label
                        htmlFor={`difficulty-${value}`}
                        className="text-sm cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">{t('books:sort_by_title')}</SelectItem>
                    <SelectItem value="author">{t('books:sort_by_author')}</SelectItem>
                    <SelectItem value="difficulty">{t('books:sort_by_difficulty')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* Loading State */}
            {(loading || purchasesLoading || subscriptionsLoading) && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">{t('books:loading_books')}</p>
              </div>
            )}

            {/* Books Grid */}
            {!loading && !purchasesLoading && !subscriptionsLoading && filteredBooks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      </Container>
    </>
  );
}

export default HomePage;
