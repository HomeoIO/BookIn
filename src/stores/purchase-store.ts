import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Purchase {
  bookId: string;
  purchasedAt: number;
  price: number;
}

interface PurchaseState {
  purchases: Purchase[];
  hasPurchased: (bookId: string) => boolean;
  purchaseBook: (bookId: string, price: number) => Promise<void>;
  addPurchase: (bookId: string, price?: number) => void;
  getPurchase: (bookId: string) => Purchase | undefined;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      purchases: [],

      hasPurchased: (bookId: string) => {
        return get().purchases.some((p) => p.bookId === bookId);
      },

      getPurchase: (bookId: string) => {
        return get().purchases.find((p) => p.bookId === bookId);
      },

      addPurchase: (bookId: string, price: number = 9.0) => {
        // Check if already purchased
        if (get().hasPurchased(bookId)) {
          console.log(`Book ${bookId} already purchased`);
          return;
        }

        const purchase: Purchase = {
          bookId,
          purchasedAt: Date.now(),
          price,
        };

        set((state) => ({
          purchases: [...state.purchases, purchase],
        }));

        console.log(`✅ Purchase added: ${bookId}`);
      },

      purchaseBook: async (bookId: string, price: number) => {
        // Mock payment - in production this would call Firebase/Stripe
        return new Promise((resolve) => {
          setTimeout(() => {
            const purchase: Purchase = {
              bookId,
              purchasedAt: Date.now(),
              price,
            };

            set((state) => ({
              purchases: [...state.purchases, purchase],
            }));

            resolve();
          }, 1000); // Simulate network delay
        });
      },
    }),
    {
      name: 'bookin-purchases', // localStorage key
    }
  )
);
