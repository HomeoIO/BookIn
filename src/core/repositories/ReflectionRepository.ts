import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ReflectionEntry } from '@core/domain';

const USERS = 'users';
const REFLECTIONS = 'reflections';

export class ReflectionRepository {
  static async addReflection(entry: Omit<ReflectionEntry, 'id'>): Promise<ReflectionEntry> {
    const ref = collection(db, USERS, entry.userId, REFLECTIONS);
    const payload = {
      ...entry,
      createdAt: entry.createdAt || Date.now(),
      completed: entry.completed ?? false,
      completedAt: entry.completedAt ?? null,
    };
    const docRef = await addDoc(ref, payload);
    return { ...payload, id: docRef.id };
  }

  static async getReflections(userId: string, bookId: string): Promise<ReflectionEntry[]> {
    const ref = collection(db, USERS, userId, REFLECTIONS);
    const q = query(ref, where('bookId', '==', bookId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...ReflectionRepository.mapData(doc.data()),
    }));
  }

  static async getAllReflections(userId: string): Promise<ReflectionEntry[]> {
    const ref = collection(db, USERS, userId, REFLECTIONS);
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...ReflectionRepository.mapData(doc.data()),
    }));
  }

  static async updateReflection(
    userId: string,
    reflectionId: string,
    updates: Partial<Pick<ReflectionEntry, 'content' | 'completed' | 'completedAt'>>
  ) {
    const docRef = doc(db, USERS, userId, REFLECTIONS, reflectionId);
    await updateDoc(docRef, updates);
  }

  private static mapData(data: Record<string, unknown>) {
    const entry = data as Omit<ReflectionEntry, 'id'>;
    return {
      ...entry,
      completed: entry.completed ?? false,
      completedAt: entry.completedAt ?? null,
    };
  }
}
