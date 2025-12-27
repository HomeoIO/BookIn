export interface Collection {
  id: string;
  translationKey: string; // Key prefix for i18n translations (e.g., "founding_2026")
  price: number;
  bookIds: string[];
  isActive: boolean;
  expiresAt?: number; // Unix timestamp for limited-time offers
  stripeProductId?: string;
  createdAt: number;
}

export const CollectionHelpers = {
  isExpired(collection: Collection): boolean {
    if (!collection.expiresAt) return false;
    return Date.now() > collection.expiresAt;
  },

  isActive(collection: Collection): boolean {
    return collection.isActive && !CollectionHelpers.isExpired(collection);
  },

  formatPrice(collection: Collection): string {
    return `US$${collection.price.toFixed(2)}`;
  },

  getTimeRemaining(collection: Collection): string | null {
    if (!collection.expiresAt) return null;

    const now = Date.now();
    const diff = collection.expiresAt - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  },
};

// 2026 Founding Collection - Limited time offer for all existing books
export const FOUNDING_COLLECTION_ID = '2026-founding-collection';

export const FOUNDING_COLLECTION: Collection = {
  id: FOUNDING_COLLECTION_ID,
  translationKey: 'founding_2026', // Uses collection:founding_2026_name, collection:founding_2026_description, etc.
  price: 9.99,
  bookIds: [], // Will be populated with all books that have collection: '2026-founding-collection'
  isActive: true,
  expiresAt: new Date('2026-01-31T23:59:59').getTime(), // Campaign ends January 31, 2026
  stripeProductId: import.meta.env.VITE_STRIPE_COLLECTION_PRICE_ID, // Loaded from .env
  createdAt: Date.now(),
};
