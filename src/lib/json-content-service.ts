import fs from "fs";
import path from "path";

/**
 * 🎯 Service SIMPLIFIÉ de gestion de contenu
 * Charge UNIQUEMENT depuis les fichiers JSON
 * Plus de base de données, plus de conflits !
 *
 * ⚡ OPTIMISATION: Cache en mémoire pour éviter les rebuilds Fast Refresh
 */
export class JSONContentService {
  private static CONTENT_PATH = path.join(
    process.cwd(),
    "src",
    "config",
    "content.json"
  );

  private static COMPANY_PATH = path.join(
    process.cwd(),
    "src",
    "config",
    "company.json"
  );

  // Cache en mémoire pour éviter les rebuilds
  private static contentCache: Record<string, any> | null = null;
  private static companyCache: any | null = null;
  private static contentCacheTime: number = 0;
  private static companyCacheTime: number = 0;
  private static readonly CACHE_DURATION = 60000; // 60 secondes

  /**
   * Charger tout le contenu depuis content.json
   * ⚡ Utilise le cache pour éviter les rebuilds Fast Refresh
   */
  static async loadAll(): Promise<Record<string, any>> {
    try {
      const now = Date.now();

      // Retourner le cache si valide
      if (
        this.contentCache &&
        now - this.contentCacheTime < this.CACHE_DURATION
      ) {
        return this.contentCache;
      }

      console.log("📦 [JSONContentService] Chargement depuis content.json");
      const fileContent = await fs.promises.readFile(
        this.CONTENT_PATH,
        "utf-8"
      );
      const content = JSON.parse(fileContent);

      // Mettre à jour le cache
      this.contentCache = content;
      this.contentCacheTime = now;

      console.log("✅ [JSONContentService] Contenu chargé avec succès");
      return content;
    } catch (error) {
      console.error(
        "❌ [JSONContentService] Erreur lors du chargement:",
        error
      );
      throw error;
    }
  }

  /**
   * Charger le contenu d'une page spécifique
   */
  static async loadPage(slug: string): Promise<any> {
    try {
      console.log(`📄 [JSONContentService] Chargement de la page "${slug}"`);
      const allContent = await this.loadAll();
      const pageContent = allContent[slug];

      if (!pageContent) {
        console.warn(`⚠️  [JSONContentService] Page "${slug}" non trouvée`);
        return null;
      }

      console.log(`✅ [JSONContentService] Page "${slug}" chargée`);
      return pageContent;
    } catch (error) {
      console.error(
        `❌ [JSONContentService] Erreur chargement page "${slug}":`,
        error
      );
      return null;
    }
  }

  /**
   * Charger les données de l'entreprise
   * ⚡ Utilise le cache pour éviter les rebuilds Fast Refresh
   */
  static async loadCompany(): Promise<any> {
    try {
      const now = Date.now();

      // Retourner le cache si valide
      if (
        this.companyCache &&
        now - this.companyCacheTime < this.CACHE_DURATION
      ) {
        return this.companyCache;
      }

      console.log("🏢 [JSONContentService] Chargement company.json");
      const fileContent = await fs.promises.readFile(
        this.COMPANY_PATH,
        "utf-8"
      );
      const company = JSON.parse(fileContent);

      // Mettre à jour le cache
      this.companyCache = company;
      this.companyCacheTime = now;

      console.log("✅ [JSONContentService] Company chargé");
      return company;
    } catch (error) {
      console.error(
        "❌ [JSONContentService] Erreur chargement company:",
        error
      );
      throw error;
    }
  }

  /**
   * Sauvegarder le contenu
   * ⚡ Invalide le cache après sauvegarde
   */
  static async save(content: Record<string, any>): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.CONTENT_PATH,
        JSON.stringify(content, null, 2),
        "utf-8"
      );

      // Invalider le cache pour forcer le rechargement
      this.contentCache = null;
      this.contentCacheTime = 0;

      console.log(
        "💾 [JSONContentService] Contenu sauvegardé et cache invalidé"
      );
    } catch (error) {
      console.error("❌ [JSONContentService] Erreur sauvegarde:", error);
      throw error;
    }
  }

  /**
   * Invalider le cache manuellement
   */
  static invalidateCache(): void {
    this.contentCache = null;
    this.companyCache = null;
    this.contentCacheTime = 0;
    this.companyCacheTime = 0;
    console.log("🔄 [JSONContentService] Cache invalidé");
  }
}
