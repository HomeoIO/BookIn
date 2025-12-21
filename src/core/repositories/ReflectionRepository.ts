import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ReflectionEntry } from '@core/domain';

const USERS = 'users';
const REFLECTIONS = 'reflections';

export class ReflectionRepository {
  static async addReflection(entry: Omit<ReflectionEntry, 'id'>): Promise<ReflectionEntry> {
    const ref = collection(db, USERS, entry.userId, REFLECTIONS);
    const docRef = await addDoc(ref, {
      ...entry,
      createdAt: entry.createdAt || Date.now(),
    });
    return { ...entry, id: docRef.id };
  }

  static async getReflections(userId: string, bookId: string): Promise<ReflectionEntry[]> {
    const ref = collection(db, USERS, userId, REFLECTIONS);
    const q = query(ref, where('bookId', '==', bookId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ReflectionEntry, 'id'>),
    }));
  }
}
