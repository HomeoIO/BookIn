import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Subscription {
  id: string;
  bookId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionState {
  subscriptions: Subscription[];
  hasActiveSubscription: (bookId: string) => boolean;
  addSubscription: (subscription: Subscription) => void;
  removeSubscription: (bookId: string) => void;
  getSubscription: (bookId: string) => Subscription | undefined;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      hasActiveSubscription: (bookId: string) => {
        const sub = get().subscriptions.find((s) => s.bookId === bookId);
        if (!sub) return false;

        // Check if subscription is active and not expired
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const notExpired = sub.currentPeriodEnd > Date.now();

        return isActive && notExpired;
      },

      getSubscription: (bookId: string) => {
        return get().subscriptions.find((s) => s.bookId === bookId);
      },

      addSubscription: (subscription: Subscription) => {
        set((state) => ({
          subscriptions: [...state.subscriptions.filter((s) => s.bookId !== subscription.bookId), subscription],
        }));
      },

      removeSubscription: (bookId: string) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.bookId !== bookId),
        }));
      },
    }),
    {
      name: 'bookin-subscription',
    }
  )
);
