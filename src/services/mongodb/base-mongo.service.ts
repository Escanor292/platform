import { Db, Collection, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';

export abstract class BaseMongoService {
  protected abstract collectionName: string;
  protected abstract featureFlag: string;

  private static errorCount = 0;
  private static lastErrorLog = 0;

  /**
   * Check if the module is enabled via feature flag
   */
  protected isEnabled(): boolean {
    const flag = process.env[this.featureFlag];
    return flag === 'true'; // FIX: Phải tường minh bật flag mới chạy, an toàn hơn
  }

  /**
   * Get the MongoDB collection safely
   */
  protected async getCollection<T extends Document>(): Promise<Collection<T> | null> {
    if (!this.isEnabled()) return null;
    
    try {
      const db = await getDb();
      return db.collection<T>(this.collectionName);
    } catch (error) {
      this.handleMongoError(error, 'getCollection');
      return null;
    }
  }

  /**
   * Run an operation asynchronously without blocking the main thread (fire-and-forget)
   */
  protected runAsync(operation: () => Promise<any>): void {
    if (!this.isEnabled()) return;

    // Fire and forget
    operation().catch((error) => {
      this.handleMongoError(error, 'runAsync');
    });
  }

  /**
   * Centralized error handling for monitoring
   */
  private handleMongoError(error: any, context: string) {
    BaseMongoService.errorCount++;
    const now = Date.now();
    
    // Throttled logging to avoid console spamming
    if (now - BaseMongoService.lastErrorLog > 5000) { 
      console.warn(`[MONGODB MONITOR] ${context} in ${this.collectionName} failed. Total errors: ${BaseMongoService.errorCount}`);
      console.warn(`[MONGODB ERROR]`, error?.message || error);
      BaseMongoService.lastErrorLog = now;
    }
  }

  /**
   * Ensure indexes are created for the collection.
   * Override this in sub-services.
   */
  public abstract ensureIndexes(): Promise<void>;
}
