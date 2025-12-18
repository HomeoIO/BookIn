import { create } from 'zustand';
import { purchaseService } from '@services/firestore/purchase-service';
import type { Purchase } from '@services/firestore/purchase-service';

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  lastFetched: number | null;
  hasPurchased: (bookId: string) => boolean;
  fetchPurchases: (userId: string, forceRefresh?: boolean) => Promise<void>;
  getPurchase: (bookId: string) => Purchase | undefined;
  clearPurchases: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const usePurchaseStore = create<PurchaseState>()((set, get) => ({
  purchases: [],
  loading: false,
  lastFetched: null,

  hasPurchased: (bookId: string) => {
    return get().purchases.some((p) => p.bookId === bookId);
  },

  getPurchase: (bookId: string) => {
    return get().purchases.find((p) => p.bookId === bookId);
  },

  fetchPurchases: async (userId: string, forceRefresh: boolean = false) => {
    const state = get();

    // Use cache if available and not expired (unless force refresh)
    if (!forceRefresh && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
      console.log('📦 Using cached purchases');
      return;
    }

    set({ loading: true });
    try {
      console.log('🔄 Fetching purchases from Firestore...');
      const purchases = await purchaseService.getUserPurchases(userId);
      set({
        purchases,
        loading: false,
        lastFetched: Date.now()
      });
      console.log(`✅ Fetched ${purchases.length} purchases`);
    } catch (error) {
      console.error('❌ Failed to fetch purchases:', error);
      set({ loading: false });
    }
  },

  clearPurchases: () => {
    set({ purchases: [], lastFetched: null });
  },
}));
