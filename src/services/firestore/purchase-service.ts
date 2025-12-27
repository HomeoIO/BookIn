import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface Purchase {
  id: string;
  bookId: string;
  userId: string;
  purchasedAt: number;
  price: number;
  paymentMethod: 'stripe';
  transactionId: string;  // Stripe session ID
  stripeCustomerId?: string;
}

export interface Subscription {
  id: string;  // Stripe subscription ID
  bookId: string;
  userId: string;
  status: 'active' | 'trialing' | 'past_due' | 'incomplete' | 'canceled';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: number;
}

export const purchaseService = {
  /**
   * Get all purchases for a user
   */
  async getUserPurchases(userId: string): Promise<Purchase[]> {
    try {
      const purchasesRef = collection(db, 'users', userId, 'purchases');
      const querySnapshot = await getDocs(purchasesRef);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bookId: data.bookId,
          userId: data.userId,
          purchasedAt: data.purchasedAt?.toMillis ? data.purchasedAt.toMillis() : data.purchasedAt,
          price: data.price,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          stripeCustomerId: data.stripeCustomerId,
        } as Purchase;
      });
    } catch (error) {
      console.error('Error getting user purchases:', error);
      return [];
    }
  },

  /**
   * Get a specific purchase
   */
  async getPurchase(userId: string, purchaseId: string): Promise<Purchase | null> {
    try {
      const purchaseRef = doc(db, 'users', userId, 'purchases', purchaseId);
      const purchaseDoc = await getDoc(purchaseRef);

      if (purchaseDoc.exists()) {
        const data = purchaseDoc.data();
        return {
          id: purchaseDoc.id,
          bookId: data.bookId,
          userId: data.userId,
          purchasedAt: data.purchasedAt?.toMillis ? data.purchasedAt.toMillis() : data.purchasedAt,
          price: data.price,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          stripeCustomerId: data.stripeCustomerId,
        } as Purchase;
      }

      return null;
    } catch (error) {
      console.error('Error getting purchase:', error);
      return null;
    }
  },

  /**
   * Check if user has purchased a specific book
   */
  async hasPurchased(userId: string, bookId: string): Promise<boolean> {
    try {
      const purchases = await this.getUserPurchases(userId);
      return purchases.some(p => p.bookId === bookId);
    } catch (error) {
      console.error('Error checking purchase:', error);
      return false;
    }
  },

  /**
   * Create a new purchase record
   * Note: This is called from the server/webhook, not directly from client
   */
  async createPurchase(purchase: Omit<Purchase, 'id'>): Promise<string> {
    try {
      const purchaseRef = doc(collection(db, 'users', purchase.userId, 'purchases'));
      await setDoc(purchaseRef, {
        ...purchase,
        purchasedAt: purchase.purchasedAt || Date.now(),
      });

      console.log(`✅ Purchase created: ${purchaseRef.id} for user ${purchase.userId}, book ${purchase.bookId}`);
      return purchaseRef.id;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const subscriptionsRef = collection(db, 'users', userId, 'subscriptions');
      const querySnapshot = await getDocs(subscriptionsRef);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();

        // Debug log raw Firestore data
        console.log('[Purchase Service] Raw subscription data from Firestore:', {
          id: doc.id,
          currentPeriodEndRaw: data.currentPeriodEnd,
          currentPeriodEndType: typeof data.currentPeriodEnd,
          hasToMillis: data.currentPeriodEnd?.toMillis !== undefined,
        });

        const converted = {
          id: doc.id,
          bookId: data.bookId,
          userId: data.userId,
          status: data.status,
          currentPeriodStart: data.currentPeriodStart?.toMillis ? data.currentPeriodStart.toMillis() : data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd?.toMillis ? data.currentPeriodEnd.toMillis() : data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripeCustomerId: data.stripeCustomerId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
        } as Subscription;

        console.log('[Purchase Service] Converted subscription:', {
          id: converted.id,
          currentPeriodEnd: converted.currentPeriodEnd,
          currentPeriodEndType: typeof converted.currentPeriodEnd,
        });

        return converted;
      });
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  },

  /**
   * Get a specific subscription
   */
  async getSubscription(userId: string, subscriptionId: string): Promise<Subscription | null> {
    try {
      const subscriptionRef = doc(db, 'users', userId, 'subscriptions', subscriptionId);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        return {
          id: subscriptionDoc.id,
          bookId: data.bookId,
          userId: data.userId,
          status: data.status,
          currentPeriodStart: data.currentPeriodStart?.toMillis ? data.currentPeriodStart.toMillis() : data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd?.toMillis ? data.currentPeriodEnd.toMillis() : data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          stripeSubscriptionId: data.stripeSubscriptionId,
          stripeCustomerId: data.stripeCustomerId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
        } as Subscription;
      }

      return null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  },

  /**
   * Check if user has active subscription for a book
   */
  async hasActiveSubscription(userId: string, bookId: string): Promise<boolean> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      const now = Date.now();

      return subscriptions.some(sub =>
        sub.bookId === bookId &&
        sub.status === 'active' &&
        sub.currentPeriodEnd > now
      );
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  /**
   * Create or update a subscription
   * Note: This is called from the server/webhook, not directly from client
   */
  async upsertSubscription(subscription: Subscription): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'users', subscription.userId, 'subscriptions', subscription.id);
      await setDoc(subscriptionRef, subscription, { merge: true });

      console.log(`✅ Subscription upserted: ${subscription.id} for user ${subscription.userId}, book ${subscription.bookId}`);
    } catch (error) {
      console.error('Error upserting subscription:', error);
      throw error;
    }
  },

  /**
   * Check if user has access to a book (either purchased or active subscription)
   */
  async hasAccess(userId: string, bookId: string): Promise<boolean> {
    try {
      const [hasPurchased, hasSubscription] = await Promise.all([
        this.hasPurchased(userId, bookId),
        this.hasActiveSubscription(userId, bookId),
      ]);

      return hasPurchased || hasSubscription;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  },
};

export default purchaseService;
