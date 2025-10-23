import fs from "fs";
import path from "path";

/**
 * 🎯 Service SIMPLIFIÉ de gestion de contenu
 * Charge UNIQUEMENT depuis les fichiers JSON
 * Plus de base de données, plus de conflits !
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

  /**
   * Charger tout le contenu depuis content.json
   */
  static async loadAll(): Promise<Record<string, any>> {
    try {
      console.log("📦 [JSONContentService] Chargement depuis content.json");
      const fileContent = await fs.promises.readFile(
        this.CONTENT_PATH,
        "utf-8"
      );
      const content = JSON.parse(fileContent);
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
   */
  static async loadCompany(): Promise<any> {
    try {
      console.log("🏢 [JSONContentService] Chargement company.json");
      const fileContent = await fs.promises.readFile(
        this.COMPANY_PATH,
        "utf-8"
      );
      const company = JSON.parse(fileContent);
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
   */
  static async save(content: Record<string, any>): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.CONTENT_PATH,
        JSON.stringify(content, null, 2),
        "utf-8"
      );
      console.log("💾 [JSONContentService] Contenu sauvegardé");
    } catch (error) {
      console.error("❌ [JSONContentService] Erreur sauvegarde:", error);
      throw error;
    }
  }
}










