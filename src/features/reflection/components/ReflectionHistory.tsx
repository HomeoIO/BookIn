import { useEffect } from 'react';
import { useReflectionStore } from '@stores/reflection-store';
import { useTranslation } from 'react-i18next';

interface ReflectionHistoryProps {
  userId?: string;
  bookId: string;
  hasAccess: boolean;
}

export function ReflectionHistory({ userId, bookId, hasAccess }: ReflectionHistoryProps) {
  const { t } = useTranslation(['books']);
  const reflections = useReflectionStore((state) => state.reflectionsByBook[bookId] || []);
  const loading = useReflectionStore((state) => state.loading);
  const fetchReflections = useReflectionStore((state) => state.fetchReflections);

  useEffect(() => {
    if (userId && hasAccess) {
      fetchReflections(userId, bookId);
    }
  }, [userId, bookId, hasAccess, fetchReflections]);

  if (!hasAccess) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-600">
        {t('books:reflection_locked', 'Unlock this book to access reflections.')}
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-600">
        {t('books:reflection_login', 'Sign in to record reflections.')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-gray-500">{t('books:reflection_loading', 'Loading reflections...')}</p>
      )}

      {!loading && reflections.length === 0 && (
        <p className="text-gray-500">{t('books:reflection_empty', 'No reflections yet.')}</p>
      )}

      {reflections.map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="text-xs text-gray-500 mb-2">
            {new Date(entry.createdAt).toLocaleString()}
          </div>
          <p className="text-gray-800 whitespace-pre-line">{entry.content}</p>
        </div>
      ))}
    </div>
  );
}
