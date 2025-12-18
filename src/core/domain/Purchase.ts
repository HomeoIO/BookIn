export type PaymentMethod = 'stripe' | 'paypal' | 'mock';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  purchasedAt: number;
  price: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  contentDownloaded: boolean;
  downloadedAt?: number;
  status: PurchaseStatus;
}

export interface PurchaseReceipt {
  purchaseId: string;
  bookTitle: string;
  price: number;
  purchasedAt: number;
  transactionId: string;
}

// Helper functions for Purchase domain logic
export const PurchaseHelpers = {
  isPurchaseCompleted(purchase: Purchase): boolean {
    return purchase.status === 'completed';
  },

  isContentDownloaded(purchase: Purchase): boolean {
    return purchase.contentDownloaded;
  },

  canDownloadContent(purchase: Purchase): boolean {
    return this.isPurchaseCompleted(purchase) && !this.isContentDownloaded(purchase);
  },

  formatPurchaseDate(purchasedAt: number): string {
    return new Date(purchasedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  },

  getStatusLabel(status: PurchaseStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  },

  getStatusColor(status: PurchaseStatus): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'refunded':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  },

  createMockPurchase(userId: string, bookId: string, price: number): Purchase {
    return {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bookId,
      purchasedAt: Date.now(),
      price,
      paymentMethod: 'mock',
      transactionId: `mock_txn_${Date.now()}`,
      contentDownloaded: false,
      status: 'completed',
    };
  },
};
