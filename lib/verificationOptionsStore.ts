// lib/verificationOptionsStore.ts

/**
 * Simple in-memory store for verification options
 * In production, use a real database or Redis store
 */

interface VerificationOptions {
  minimumAge?: number;
  excludedCountries?: string[];
  ofac?: boolean;
  name?: boolean;
  nationality?: boolean;
  date_of_birth?: boolean;
  passport_number?: boolean;
  [key: string]: any;
}

interface OptionsRecord {
  options: VerificationOptions;
  createdAt: number;
}

class VerificationOptionsStore {
  private static instance: VerificationOptionsStore;
  private store: Map<string, OptionsRecord> = new Map();
  private ttlMs: number = 1000 * 60 * 30; // 30 minutes TTL

  private constructor() {
    // Initialize store and start cleanup timer
    this.startCleanupTimer();
  }

  public static getInstance(): VerificationOptionsStore {
    if (!VerificationOptionsStore.instance) {
      VerificationOptionsStore.instance = new VerificationOptionsStore();
    }
    return VerificationOptionsStore.instance;
  }

  /**
   * Store verification options associated with a userId
   */
  public setOptions(userId: string, options: VerificationOptions): void {
    console.log('Setting options for userId:', userId);
    this.store.set(userId, {
      options,
      createdAt: Date.now()
    });
  }

  /**
   * Retrieve verification options by userId
   */
  public getOptions(userId: string): VerificationOptions | null {
    const record = this.store.get(userId);
    if (!record) return null;

    // Check if options are expired
    if (Date.now() - record.createdAt > this.ttlMs) {
      this.store.delete(userId);
      return null;
    }

    return record.options;
  }

  /**
   * Delete options for a userId
   */
  public deleteOptions(userId: string): void {
    this.store.delete(userId);
  }

  /**
   * Start periodic cleanup of expired options
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, record] of this.store.entries()) {
        if (now - record.createdAt > this.ttlMs) {
          this.store.delete(userId);
        }
      }
    }, 1000 * 60 * 5); // Run cleanup every 5 minutes
  }
}

export default VerificationOptionsStore.getInstance();