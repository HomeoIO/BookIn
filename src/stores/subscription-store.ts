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
    if (!sub) {
      console.log(`[Subscription Check] No subscription found for bookId: ${bookId}`);
      console.log(`[Subscription Check] Available subscriptions:`, get().subscriptions.map(s => ({ bookId: s.bookId, status: s.status })));
      return false;
    }

    const isActive = ACTIVE_STATUSES.has(sub.status);
    const notExpired = sub.currentPeriodEnd > Date.now();

    console.log(`[Subscription Check] bookId: ${bookId}`, {
      found: true,
      status: sub.status,
      isActive,
      currentPeriodEnd: sub.currentPeriodEnd,
      currentPeriodEndDate: new Date(sub.currentPeriodEnd).toISOString(),
      now: Date.now(),
      nowDate: new Date().toISOString(),
      notExpired,
      hasAccess: isActive && notExpired
    });

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
      console.log(`✅ Fetched ${subscriptions.length} subscriptions`, subscriptions.map(s => ({
        bookId: s.bookId,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        currentPeriodEndType: typeof s.currentPeriodEnd,
        currentPeriodEndDate: s.currentPeriodEnd && !isNaN(s.currentPeriodEnd) ? new Date(s.currentPeriodEnd).toISOString() : 'Invalid',
        isExpired: s.currentPeriodEnd && !isNaN(s.currentPeriodEnd) ? s.currentPeriodEnd < Date.now() : 'Unknown'
      })));
    } catch (error) {
      console.error('❌ Failed to fetch subscriptions:', error);
      set({ loading: false });
    }
  },

  clearSubscriptions: () => {
    set({ subscriptions: [], lastFetched: null });
  },
}));
