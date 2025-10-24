import fs from "fs";
import path from "path";

// Interface pour le contenu du site
export interface SiteContent {
  header?: any;
  footer?: any;
  home?: any;
  about?: any;
  services?: any;
  contact?: any;
  consultation?: any;
  freelance?: any;
  methodes?: any;
  admin?: any;
  stickyCTA?: any;
  notFound?: any;
  [key: string]: any;
}

// Classe pour gérer le stockage et la modification du contenu
export class ContentStore {
  private static contentPath = path.join(
    process.cwd(),
    "src",
    "config",
    "content.json"
  );
  private static backupPath = path.join(
    process.cwd(),
    "backups",
    "content-backup.json"
  );

  // ⚡ Cache en mémoire pour éviter les rebuilds Fast Refresh
  private static contentCache: SiteContent | null = null;
  private static cacheTime: number = 0;
  private static readonly CACHE_DURATION = 60000; // 60 secondes

  // Charger le contenu depuis le fichier JSON
  // ⚡ Utilise le cache pour éviter les rebuilds Fast Refresh
  static load(): SiteContent {
    try {
      const now = Date.now();

      // Retourner le cache si valide
      if (this.contentCache && now - this.cacheTime < this.CACHE_DURATION) {
        return this.contentCache;
      }

      if (!fs.existsSync(this.contentPath)) {
        console.warn(
          "⚠️ Fichier content.json non trouvé, utilisation du contenu par défaut"
        );
        return this.getDefaultContent();
      }

      const contentData = fs.readFileSync(this.contentPath, "utf8");
      const content = JSON.parse(contentData);

      // Mettre à jour le cache
      this.contentCache = content;
      this.cacheTime = now;

      console.log("✅ Contenu chargé depuis content.json");
      return content;
    } catch (error) {
      console.error("❌ Erreur lors du chargement du contenu:", error);
      return this.getDefaultContent();
    }
  }

  // Sauvegarder le contenu dans le fichier JSON
  // ⚡ Invalide le cache après sauvegarde
  static save(content: SiteContent): boolean {
    try {
      // Créer un backup avant de sauvegarder
      this.createBackup();

      // Sauvegarder le nouveau contenu
      fs.writeFileSync(
        this.contentPath,
        JSON.stringify(content, null, 2),
        "utf8"
      );

      // Invalider le cache pour forcer le rechargement
      this.contentCache = null;
      this.cacheTime = 0;

      console.log("✅ Contenu sauvegardé dans content.json et cache invalidé");
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du contenu:", error);
      return false;
    }
  }

  // Mettre à jour une section spécifique du contenu
  static updateSection(sectionKey: string, sectionData: any): boolean {
    try {
      const currentContent = this.load();
      currentContent[sectionKey] = sectionData;

      return this.save(currentContent);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la mise à jour de la section ${sectionKey}:`,
        error
      );
      return false;
    }
  }

  // Récupérer une section spécifique
  static getSection(sectionKey: string): any {
    try {
      const content = this.load();
      return content[sectionKey] || null;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération de la section ${sectionKey}:`,
        error
      );
      return null;
    }
  }

  // Créer un backup du contenu actuel
  static createBackup(): boolean {
    try {
      if (!fs.existsSync(this.contentPath)) {
        return false;
      }

      const backupDir = path.dirname(this.backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const timestampedBackupPath = this.backupPath.replace(
        ".json",
        `-${timestamp}.json`
      );

      fs.copyFileSync(this.contentPath, timestampedBackupPath);
      console.log(`✅ Backup créé: ${timestampedBackupPath}`);

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la création du backup:", error);
      return false;
    }
  }

  // Restaurer depuis un backup
  static restoreFromBackup(backupPath?: string): boolean {
    try {
      const sourcePath = backupPath || this.backupPath;

      if (!fs.existsSync(sourcePath)) {
        console.error("❌ Fichier de backup non trouvé");
        return false;
      }

      fs.copyFileSync(sourcePath, this.contentPath);
      console.log(`✅ Contenu restauré depuis ${sourcePath}`);

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la restauration:", error);
      return false;
    }
  }

  // Obtenir la liste des backups disponibles
  static getAvailableBackups(): string[] {
    try {
      const backupDir = path.dirname(this.backupPath);

      if (!fs.existsSync(backupDir)) {
        return [];
      }

      const files = fs.readdirSync(backupDir);
      return files
        .filter(
          (file) => file.startsWith("content-backup-") && file.endsWith(".json")
        )
        .sort()
        .reverse(); // Plus récent en premier
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des backups:", error);
      return [];
    }
  }

  // Contenu par défaut en cas d'erreur
  private static getDefaultContent(): SiteContent {
    return {
      header: {
        companyName: "KAIRO Digital",
        navigation: [],
        buttons: {},
      },
      footer: {
        companyName: "KAIRO Digital",
        sections: [],
      },
      home: {
        hero: {
          title: "Bienvenue sur KAIRO Digital",
          subtitle: "Votre partenaire digital de confiance",
        },
      },
      admin: {
        navigation: {},
        roles: {},
        messages: {},
      },
    };
  }

  // Valider la structure du contenu
  static validateContent(content: SiteContent): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Vérifications de base
    if (!content || typeof content !== "object") {
      errors.push("Le contenu doit être un objet");
      return { isValid: false, errors };
    }

    // Vérifier les sections essentielles
    const requiredSections = ["header", "footer", "home"];
    for (const section of requiredSections) {
      if (!content[section]) {
        errors.push(`Section manquante: ${section}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Obtenir les statistiques du contenu
  static getContentStats(): object {
    try {
      const content = this.load();
      const sections = Object.keys(content);

      return {
        totalSections: sections.length,
        sections: sections,
        lastModified: fs.existsSync(this.contentPath)
          ? fs.statSync(this.contentPath).mtime.toISOString()
          : null,
        size: fs.existsSync(this.contentPath)
          ? fs.statSync(this.contentPath).size
          : 0,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
      return {
        totalSections: 0,
        sections: [],
        lastModified: null,
        size: 0,
      };
    }
  }
}
