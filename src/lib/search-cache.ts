/**
 * Système de cache pour les résultats de recherche Google
 * Économise les requêtes API en stockant les résultats temporairement
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 heures par défaut

  /**
   * Génère une clé de cache unique
   */
  private generateKey(keyword: string, location: string = "fr"): string {
    return `${keyword.toLowerCase()}_${location}`;
  }

  /**
   * Récupère une entrée du cache si elle existe et n'est pas expirée
   */
  get<T>(keyword: string, location: string = "fr"): T | null {
    const key = this.generateKey(keyword, location);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée est expirée
    if (Date.now() > entry.expiresAt) {
      console.log(`🗑️ Cache expiré pour "${keyword}"`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache hit pour "${keyword}" (expire dans ${Math.round((entry.expiresAt - Date.now()) / 1000 / 60)} min)`);
    return entry.data as T;
  }

  /**
   * Stocke une entrée dans le cache
   */
  set<T>(
    keyword: string,
    data: T,
    location: string = "fr",
    ttl: number = this.defaultTTL
  ): void {
    const key = this.generateKey(keyword, location);
    const timestamp = Date.now();

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
    });

    console.log(`💾 Cache stocké pour "${keyword}" (TTL: ${Math.round(ttl / 1000 / 60)} min)`);
  }

  /**
   * Supprime une entrée du cache
   */
  delete(keyword: string, location: string = "fr"): boolean {
    const key = this.generateKey(keyword, location);
    return this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
    console.log("🗑️ Cache complètement vidé");
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} entrée(s) expirée(s) nettoyée(s)`);
    }
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      validEntries: valid,
    };
  }
}

// Instance singleton du cache
const searchCache = new SearchCache();

// Nettoyer le cache toutes les heures
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    searchCache.cleanup();
  }, 60 * 60 * 1000);
}

export default searchCache;

