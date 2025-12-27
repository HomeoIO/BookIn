import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { useCollectionStore } from '@stores/collection-store';
import { useAuth } from '@features/auth/hooks/useAuth';
import { FOUNDING_COLLECTION, CollectionHelpers } from '@core/domain';
import { Sparkles, Clock, BookOpen } from 'lucide-react';

function FoundingCollectionBanner() {
  const { t } = useTranslation(['collection']);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasPurchased = useCollectionStore((state) =>
    state.hasPurchasedCollection(FOUNDING_COLLECTION.id)
  );
  const [purchasing, setPurchasing] = useState(false);

  // Don't show if user already purchased
  if (hasPurchased) return null;

  // Don't show if collection is not active
  if (!CollectionHelpers.isActive(FOUNDING_COLLECTION)) return null;

  const timeRemaining = CollectionHelpers.getTimeRemaining(FOUNDING_COLLECTION);
  const name = t(`collection:${FOUNDING_COLLECTION.translationKey}_name`);
  const description = t(`collection:${FOUNDING_COLLECTION.translationKey}_description`);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/founding-collection');
      return;
    }

    setPurchasing(true);
    // TODO: Implement actual purchase flow
    navigate('/founding-collection');
  };

  return (
    <Card className="bg-gradient-to-br from-primary-50 via-primary-100 to-white border-primary-300 shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeRemaining || 'Limited Time'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('collection:banner_title')}
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/60 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-900">
                {t('collection:banner_books')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t('collection:banner_books_desc')}
            </p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-gray-900">
                {t('collection:banner_lifetime')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {t('collection:banner_lifetime_desc')}
            </p>
          </div>

          <div className="bg-white/60 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-gray-900">
                {t('collection:banner_limited')}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {timeRemaining || t('collection:banner_ending_soon')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg text-gray-400 line-through">US$107</span>
              <span className="text-3xl font-bold text-primary">
                US${FOUNDING_COLLECTION.price.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('collection:banner_one_time_payment')}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handlePurchase}
            disabled={purchasing}
            className="px-8"
          >
            {purchasing
              ? t('collection:banner_cta_processing')
              : t('collection:banner_cta')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default FoundingCollectionBanner;
