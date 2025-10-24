interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ContentCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes par défaut

  /**
   * Stocker des données dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.TTL);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  /**
   * Récupérer des données du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Vérifier si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Vérifier si une clé existe dans le cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) return false;

    // Vérifier si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalider une clé spécifique
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les clés qui correspondent à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtenir la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Obtenir toutes les clés du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Nettoyer les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instance singleton
export const contentCache = new ContentCache();

// Nettoyer automatiquement toutes les 10 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    contentCache.cleanup();
  }, 10 * 60 * 1000);
}
