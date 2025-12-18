import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './config';

export const firestoreHelpers = {
  /**
   * Get a document by ID
   */
  async getDocument<T = DocumentData>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  /**
   * Get all documents from a collection
   */
  async getCollection<T = DocumentData>(
    collectionName: string
  ): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as T)
      );
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  },

  /**
   * Query documents with conditions
   */
  async queryDocuments<T = DocumentData>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as T)
      );
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },

  /**
   * Set a document (create or overwrite)
   */
  async setDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: T
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data);
    } catch (error) {
      console.error('Error setting document:', error);
      throw error;
    }
  },

  /**
   * Update a document (merge with existing data)
   */
  async updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Get a collection reference
   */
  getCollectionRef(collectionName: string): CollectionReference {
    return collection(db, collectionName);
  },

  /**
   * Get a document reference
   */
  getDocRef(collectionName: string, docId: string): DocumentReference {
    return doc(db, collectionName, docId);
  },
};

export default firestoreHelpers;
