import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@components/ui/button';

interface LanguageSwitcherProps {
  className?: string;
}

function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-HK' ? 'en' : 'zh-HK';
    i18n.changeLanguage(newLang);
  };

  const isEnglish = i18n.language === 'en' || !i18n.language.startsWith('zh');

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`flex items-center gap-2 ${className}`}
      aria-label={`Switch to ${isEnglish ? 'Chinese' : 'English'}`}
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{isEnglish ? 'EN' : '中'}</span>
    </Button>
  );
}

export default LanguageSwitcher;
