import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from 'firebase/storage';
import { storage } from './config';

export const storageHelpers = {
  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    path: string,
    file: File | Blob
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Get download URL for a file
   */
  async getFileURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  },

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  /**
   * Get a storage reference
   */
  getStorageRef(path: string): StorageReference {
    return ref(storage, path);
  },

  /**
   * Get content path for a book
   */
  getBookContentPath(bookId: string): string {
    return `content/books/${bookId}/questions.json`;
  },

  /**
   * Get cover image path for a book
   */
  getBookCoverPath(bookId: string): string {
    return `content/covers/${bookId}.jpg`;
  },
};

export default storageHelpers;
