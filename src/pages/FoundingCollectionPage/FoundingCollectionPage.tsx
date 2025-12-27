import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, Container } from '@components/layout';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { useCollectionStore } from '@stores/collection-store';
import { useAuth } from '@features/auth/hooks/useAuth';
import { FOUNDING_COLLECTION, CollectionHelpers } from '@core/domain';
import { StripeService } from '@services/stripe';
import { Sparkles, Clock, BookOpen, Check, Shield, Zap } from 'lucide-react';

function FoundingCollectionPage() {
  const { t } = useTranslation(['collection']);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const hasPurchased = useCollectionStore((state) =>
    state.hasPurchasedCollection(FOUNDING_COLLECTION.id)
  );
  const [purchasing, setPurchasing] = useState(false);

  // Redirect if already purchased
  if (hasPurchased) {
    navigate('/');
    return null;
  }

  // Redirect if collection is not active
  if (!CollectionHelpers.isActive(FOUNDING_COLLECTION)) {
    navigate('/');
    return null;
  }

  const timeRemaining = CollectionHelpers.getTimeRemaining(FOUNDING_COLLECTION);
  const name = t(`collection:${FOUNDING_COLLECTION.translationKey}_name`);
  const description = t(`collection:${FOUNDING_COLLECTION.translationKey}_description`);

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login?redirect=/founding-collection');
      return;
    }

    setPurchasing(true);

    try {
      // Create Stripe checkout session for collection
      const session = await StripeService.createCheckoutSession({
        priceId: FOUNDING_COLLECTION.stripeProductId || '',
        userId: user.uid,
        userEmail: user.email || '',
        successUrl: `${window.location.origin}/purchase-success?collection=${FOUNDING_COLLECTION.id}`,
        cancelUrl: `${window.location.origin}/founding-collection`,
        metadata: {
          type: 'collection',
          collectionId: FOUNDING_COLLECTION.id,
          userId: user.uid,
        },
      });

      // Redirect to Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(t('collection:page_error_payment'));
      setPurchasing(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: t('collection:features_books_title'),
      description: t('collection:features_books_description'),
    },
    {
      icon: Zap,
      title: t('collection:features_interactive_title'),
      description: t('collection:features_interactive_description'),
    },
    {
      icon: Check,
      title: t('collection:features_progress_title'),
      description: t('collection:features_progress_description'),
    },
    {
      icon: Shield,
      title: t('collection:features_lifetime_title'),
      description: t('collection:features_lifetime_description'),
    },
  ];

  const benefits = [
    t('collection:page_benefit_immediate_access'),
    t('collection:page_benefit_unlimited_questions'),
    t('collection:page_benefit_bilingual'),
    t('collection:page_benefit_lifetime_updates'),
    t('collection:page_benefit_no_recurring'),
    t('collection:page_benefit_learn_anywhere'),
  ];

  return (
    <>
      <Header />
      <Container className="py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <Badge variant="destructive" className="mb-4 text-base px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {timeRemaining || t('collection:banner_limited')}
            </Badge>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {name}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Pricing Card */}
          <Card className="bg-gradient-to-br from-primary-50 via-primary-100 to-white border-primary-300 shadow-xl">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-2xl text-gray-500 line-through">US$107</span>
                  <span className="text-6xl font-bold text-primary">
                    US${FOUNDING_COLLECTION.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {t('collection:price_one_time')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('collection:page_save_percent')}
                </p>
              </div>

              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing
                  ? t('collection:cta_processing')
                  : t('collection:banner_cta')}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('collection:page_secure_checkout')}
              </p>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t('collection:page_whats_included')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits List */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('collection:page_all_benefits')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white border-orange-200 p-8">
            <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              {t('collection:page_final_cta_title')}
            </h3>
            <p className="text-gray-700 mb-6">
              {t('collection:page_final_cta_description')}
            </p>
            <Button
              size="lg"
              className="w-full text-lg py-6"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing
                ? t('collection:cta_processing')
                : t('collection:page_final_cta_button', { price: FOUNDING_COLLECTION.price.toFixed(2) })}
            </Button>
          </Card>
        </div>
      </Container>
    </>
  );
}

export default FoundingCollectionPage;
