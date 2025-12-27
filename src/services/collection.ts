import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface CollectionPurchaseData {
  collectionId: string;
  purchasedAt: Date;
  price: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
}

export const CollectionService = {
  /**
   * Fetch all collection purchases for a user from Firestore
   */
  async getUserCollectionPurchases(userId: string): Promise<CollectionPurchaseData[]> {
    try {
      const purchasesRef = collection(db, `users/${userId}/collectionPurchases`);
      const snapshot = await getDocs(purchasesRef);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          collectionId: doc.id,
          purchasedAt: data.purchasedAt?.toDate() || new Date(),
          price: data.price || 0,
          paymentMethod: data.paymentMethod || 'stripe',
          transactionId: data.transactionId || '',
          status: data.status || 'completed',
        };
      });
    } catch (error) {
      console.error('Error fetching collection purchases:', error);
      throw error;
    }
  },

  /**
   * Check if a user has purchased a specific collection
   */
  async hasUserPurchasedCollection(userId: string, collectionId: string): Promise<boolean> {
    try {
      const purchases = await this.getUserCollectionPurchases(userId);
      return purchases.some((p) => p.collectionId === collectionId && p.status === 'completed');
    } catch (error) {
      console.error('Error checking collection purchase:', error);
      return false;
    }
  },
};
