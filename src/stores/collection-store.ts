import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Collection, FOUNDING_COLLECTION } from '@core/domain';
import { CollectionService } from '@/services/collection';

interface CollectionPurchase {
  collectionId: string;
  purchasedAt: number;
  userId: string;
  transactionId: string;
}

interface CollectionState {
  purchases: CollectionPurchase[];
  loading: boolean;
  lastFetched: number | null;
  hasPurchasedCollection: (collectionId: string) => boolean;
  addPurchase: (purchase: CollectionPurchase) => void;
  fetchPurchases: (userId: string) => Promise<void>;
  clear: () => void;
  getActiveCollections: () => Collection[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      purchases: [],
      loading: false,
      lastFetched: null,

      hasPurchasedCollection: (collectionId: string) => {
        return get().purchases.some((p) => p.collectionId === collectionId);
      },

      addPurchase: (purchase: CollectionPurchase) => {
        set((state) => ({
          purchases: [...state.purchases, purchase],
        }));
      },

      fetchPurchases: async (userId: string) => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (state.lastFetched && now - state.lastFetched < CACHE_DURATION) {
          return;
        }

        set({ loading: true });

        try {
          const firestorePurchases = await CollectionService.getUserCollectionPurchases(userId);

          const purchases: CollectionPurchase[] = firestorePurchases.map((p) => ({
            collectionId: p.collectionId,
            purchasedAt: p.purchasedAt.getTime(),
            userId,
            transactionId: p.transactionId,
          }));

          set({
            purchases,
            loading: false,
            lastFetched: now,
          });
        } catch (error) {
          console.error('Failed to fetch collection purchases:', error);
          set({ loading: false });
        }
      },

      clear: () => {
        set({ purchases: [], loading: false, lastFetched: null });
      },

      getActiveCollections: () => {
        // For now, just return the founding collection if it's active
        const collections: Collection[] = [];

        if (FOUNDING_COLLECTION.isActive) {
          collections.push(FOUNDING_COLLECTION);
        }

        return collections;
      },
    }),
    {
      name: 'collection-purchases',
    }
  )
);
