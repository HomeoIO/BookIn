import { create } from 'zustand';
import { purchaseService } from '@services/firestore/purchase-service';
import type { Subscription } from '@services/firestore/purchase-service';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  lastFetched: number | null;
  hasActiveSubscription: (bookId: string) => boolean;
  fetchSubscriptions: (userId: string, forceRefresh?: boolean) => Promise<void>;
  getSubscription: (bookId: string) => Subscription | undefined;
  clearSubscriptions: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscriptions: [],
  loading: false,
  lastFetched: null,

  hasActiveSubscription: (bookId: string) => {
    const sub = get().subscriptions.find((s) => s.bookId === bookId);
    if (!sub) return false;

    const isActive = ACTIVE_STATUSES.has(sub.status);
    const notExpired = sub.currentPeriodEnd > Date.now();

    return isActive && notExpired;
  },

  getSubscription: (bookId: string) => {
    return get().subscriptions.find((s) => s.bookId === bookId);
  },

  fetchSubscriptions: async (userId: string, forceRefresh: boolean = false) => {
    const state = get();

    // Use cache if available and not expired (unless force refresh)
    if (!forceRefresh && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
      console.log('📦 Using cached subscriptions');
      return;
    }

    set({ loading: true });
    try {
      console.log('🔄 Fetching subscriptions from Firestore...');
      const subscriptions = await purchaseService.getUserSubscriptions(userId);
      set({
        subscriptions,
        loading: false,
        lastFetched: Date.now()
      });
      console.log(`✅ Fetched ${subscriptions.length} subscriptions`);
    } catch (error) {
      console.error('❌ Failed to fetch subscriptions:', error);
      set({ loading: false });
    }
  },

  clearSubscriptions: () => {
    set({ subscriptions: [], lastFetched: null });
  },
}));
