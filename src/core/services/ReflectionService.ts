import { ReflectionEntry } from '@core/domain';
import { ReflectionRepository } from '@core/repositories/ReflectionRepository';

export class ReflectionService {
  static addReflection(entry: Omit<ReflectionEntry, 'id'>) {
    return ReflectionRepository.addReflection(entry);
  }

  static getReflections(userId: string, bookId: string) {
    return ReflectionRepository.getReflections(userId, bookId);
  }
}
