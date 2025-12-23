import { ReflectionEntry } from '@core/domain';
import { ReflectionRepository } from '@core/repositories/ReflectionRepository';

export class ReflectionService {
  static addReflection(entry: Omit<ReflectionEntry, 'id'>) {
    return ReflectionRepository.addReflection(entry);
  }

  static getReflections(userId: string, bookId: string) {
    return ReflectionRepository.getReflections(userId, bookId);
  }

  static getAllReflections(userId: string) {
    return ReflectionRepository.getAllReflections(userId);
  }

  static updateReflection(
    userId: string,
    reflectionId: string,
    updates: Partial<Pick<ReflectionEntry, 'content' | 'completed' | 'completedAt'>>
  ) {
    return ReflectionRepository.updateReflection(userId, reflectionId, updates);
  }
}
