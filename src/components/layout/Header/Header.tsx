import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@components/ui/LanguageSwitcher';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@components/ui';

export interface HeaderProps {
  showDashboardLink?: boolean;
}

function Header(_props: HeaderProps) {
  const { t } = useTranslation('common');
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
    }`;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{t('app_name')}</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <NavLink to="/" className={navLinkClass} end>
                {t('nav_books', 'Books')}
              </NavLink>
              <NavLink to="/todos" className={navLinkClass}>
                {t('nav_todos', 'Todos')}
              </NavLink>
            </nav>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {/* Auth section */}
            {isAuthenticated ? (
              <>
                {/* User email */}
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user?.email}
                </span>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
