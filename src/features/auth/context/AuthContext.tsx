import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { authHelpers } from '@/firebase/auth';
import { usePurchaseStore } from '@stores/purchase-store';
import { useSubscriptionStore } from '@stores/subscription-store';
import { useProgressStore } from '@stores/progress-store';
import { useReflectionStore } from '@stores/reflection-store';
import { useTodoStore } from '@stores/todo-store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = usePurchaseStore((state) => state.fetchPurchases);
  const clearPurchases = usePurchaseStore((state) => state.clearPurchases);
  const fetchSubscriptions = useSubscriptionStore((state) => state.fetchSubscriptions);
  const clearSubscriptions = useSubscriptionStore((state) => state.clearSubscriptions);
  const fetchAllProgress = useProgressStore((state) => state.fetchAllProgress);
  const clearProgress = useProgressStore((state) => state.clearProgress);
  const clearReflections = useReflectionStore((state) => state.clear);
  const clearTodos = useTodoStore((state) => state.clear);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        console.log('✅ User signed in:', user.email);
        // Automatically fetch purchases, subscriptions, and progress from Firestore
        await Promise.all([
          fetchPurchases(user.uid),
          fetchSubscriptions(user.uid),
          fetchAllProgress(user.uid)
        ]);
      } else {
        console.log('👤 User signed out');
        // Clear purchases, subscriptions, and progress from store
        clearPurchases();
        clearSubscriptions();
        clearProgress();
        clearReflections();
        clearTodos();
      }
    });

    return () => unsubscribe();
  }, [fetchPurchases, clearPurchases, fetchSubscriptions, clearSubscriptions, fetchAllProgress, clearProgress, clearReflections, clearTodos]);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await authHelpers.signUp(email, password);
      console.log('✅ User signed up:', result.user.email);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authHelpers.signIn(email, password);
      console.log('✅ User signed in:', result.user.email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await authHelpers.signOut();
      // Clear purchases, subscriptions, and progress (also done in onAuthStateChanged, but belt-and-suspenders)
      clearPurchases();
      clearSubscriptions();
      clearProgress();
      clearReflections();
      clearTodos();
      console.log('✅ User signed out');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}
