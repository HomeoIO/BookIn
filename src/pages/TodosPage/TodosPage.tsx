import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, Container } from '@components/layout';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTodoStore } from '@stores/todo-store';
import { useBooks } from '@features/books/hooks';

function TodosPage() {
  const { t } = useTranslation(['todos', 'common', 'books']);
  const { user, isAuthenticated } = useAuth();
  const { books } = useBooks();
  const { todos, loading, error, fetchTodos, toggleTodo, clear } = useTodoStore((state) => ({
    todos: state.todos,
    loading: state.loading,
    error: state.error,
    fetchTodos: state.fetchTodos,
    toggleTodo: state.toggleTodo,
    clear: state.clear,
  }));

  const bookMap = useMemo(() => {
    const map: Record<string, string> = {};
    books.forEach((book) => {
      map[book.id] = book.title;
    });
    return map;
  }, [books]);

  useEffect(() => {
    if (user) {
      fetchTodos(user.uid);
    } else {
      clear();
    }
    return () => clear();
  }, [user, fetchTodos, clear]);

  const handleToggle = (reflectionId: string) => {
    if (!user) return;
    toggleTodo(user.uid, reflectionId);
  };

  return (
    <>
      <Header />
      <Container className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('todos:title', 'Todos')}</h1>
              <p className="text-gray-600">{t('todos:subtitle', 'Turn reflections into daily actions.')}</p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-600">
              {t('todos:login_prompt', 'Sign in to view your todo list.')}
            </div>
          )}

          {isAuthenticated && (
            <div className="space-y-4">
              {loading && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg text-gray-600">
                  {t('common:loading', 'Loading...')}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {!loading && todos.length === 0 && (
                <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-600">
                  {t('todos:empty', 'No todos yet. Save a reflection during training to create one!')}
                </div>
              )}

              <ul className="space-y-3">
                {todos.map((todo) => (
                  <li key={todo.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleToggle(todo.id)}
                      className="w-full p-4 flex items-start space-x-4 text-left"
                    >
                      <span
                        className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                          todo.completed
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 text-transparent'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="h-3 w-3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 text-sm text-gray-500">
                          <span>{bookMap[todo.bookId] || t('todos:unknown_book', 'Unknown book')}</span>
                          <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p
                          className={`text-gray-900 ${
                            todo.completed ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {todo.content}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

export default TodosPage;
