const fs = require("fs");
const path = require("path");

// Configuration sécurisée
const BACKUP_DIR = "backup-css-" + Date.now();
const CSS_FILES = [
  "src/app/globals.css",
  "src/styles/css-variables.css",
  "src/styles/about-page.css",
  "src/styles/contact-page.css",
  "src/styles/services-page.css",
];

// Duplications identifiées à éliminer
const DUPLICATIONS_TO_REMOVE = {
  // Animations communes
  fadeIn: {
    pattern: /@keyframes fadeIn\s*\{[\s\S]*?\}/g,
    replacement: "/* Animation fadeIn centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  fadeUp: {
    pattern: /@keyframes fadeUp\s*\{[\s\S]*?\}/g,
    replacement: "/* Animation fadeUp centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  fadeDown: {
    pattern: /@keyframes fadeDown\s*\{[\s\S]*?\}/g,
    replacement: "/* Animation fadeDown centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  fadeLeft: {
    pattern: /@keyframes fadeLeft\s*\{[\s\S]*?\}/g,
    replacement: "/* Animation fadeLeft centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  fadeRight: {
    pattern: /@keyframes fadeRight\s*\{[\s\S]*?\}/g,
    replacement: "/* Animation fadeRight centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  // Classes communes
  container: {
    pattern:
      /\.container\s*\{\s*max-width:\s*1200px;\s*margin:\s*0\s*auto;\s*padding:\s*0\s*2rem;\s*\}/g,
    replacement: "/* Classe container centralisée dans globals.css */",
    keepIn: "src/app/globals.css",
  },
  "loading-spinner": {
    pattern: /\.loading-spinner\s*\{[\s\S]*?\}/g,
    replacement: "/* Loading spinner centralisé dans globals.css */",
    keepIn: "src/app/globals.css",
  },
};

// Fonction pour créer une sauvegarde
function createBackup() {
  console.log("🔄 Création de la sauvegarde...");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  for (const filePath of CSS_FILES) {
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
      fs.copyFileSync(filePath, backupPath);
      console.log(`   ✅ Sauvegarde créée: ${backupPath}`);
    }
  }
}

// Fonction pour éliminer les duplications
function removeDuplications() {
  console.log("\n🔧 ÉLIMINATION DES DUPLICATIONS CSS\n");

  let totalRemoved = 0;

  for (const filePath of CSS_FILES) {
    if (!fs.existsSync(filePath)) continue;

    console.log(`📁 Traitement de: ${filePath}`);
    let content = fs.readFileSync(filePath, "utf8");
    let fileRemoved = 0;

    for (const [name, duplication] of Object.entries(DUPLICATIONS_TO_REMOVE)) {
      if (filePath !== duplication.keepIn) {
        const matches = content.match(duplication.pattern);
        if (matches) {
          content = content.replace(
            duplication.pattern,
            duplication.replacement
          );
          fileRemoved += matches.length;
          console.log(
            `   🗑️ Supprimé: ${name} (${matches.length} occurrence(s))`
          );
        }
      }
    }

    if (fileRemoved > 0) {
      fs.writeFileSync(filePath, content);
      totalRemoved += fileRemoved;
      console.log(`   ✅ ${fileRemoved} duplication(s) supprimée(s)`);
    } else {
      console.log(`   ✅ Aucune duplication à supprimer`);
    }
  }

  return totalRemoved;
}

// Fonction pour vérifier l'intégrité
function verifyIntegrity() {
  console.log("\n🔍 VÉRIFICATION DE L'INTÉGRITÉ\n");

  let allGood = true;

  for (const filePath of CSS_FILES) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Fichier manquant: ${filePath}`);
      allGood = false;
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Vérifier que les fichiers ne sont pas vides
    if (content.trim().length === 0) {
      console.log(`❌ Fichier vide: ${filePath}`);
      allGood = false;
    } else {
      console.log(`✅ ${filePath} - OK`);
    }
  }

  return allGood;
}

// Fonction pour restaurer la sauvegarde si nécessaire
function restoreBackup() {
  console.log("\n🔄 RESTAURATION DE LA SAUVEGARDE\n");

  for (const filePath of CSS_FILES) {
    const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`✅ Restauré: ${filePath}`);
    }
  }
}

// Fonction principale
function optimizeCSS() {
  console.log("🚀 OPTIMISATION CSS - ÉLIMINATION DES DUPLICATIONS\n");
  console.log("⚠️ ATTENTION: Cette opération va modifier les fichiers CSS");
  console.log("📁 Sauvegarde automatique créée dans:", BACKUP_DIR);
  console.log("🔄 Restauration possible en cas de problème\n");

  try {
    // Étape 1: Créer la sauvegarde
    createBackup();

    // Étape 2: Éliminer les duplications
    const removedCount = removeDuplications();

    // Étape 3: Vérifier l'intégrité
    const integrityOK = verifyIntegrity();

    if (integrityOK) {
      console.log(`\n🎉 OPTIMISATION TERMINÉE AVEC SUCCÈS !`);
      console.log(`📊 ${removedCount} duplication(s) supprimée(s)`);
      console.log(`📁 Sauvegarde conservée dans: ${BACKUP_DIR}`);
      console.log(`🔄 Pour restaurer: node scripts/restore-css-backup.js`);
    } else {
      console.log(`\n❌ PROBLÈME DÉTECTÉ - RESTAURATION AUTOMATIQUE`);
      restoreBackup();
      console.log(`✅ Restauration terminée`);
    }
  } catch (error) {
    console.log(`\n❌ ERREUR: ${error.message}`);
    console.log(`🔄 RESTAURATION AUTOMATIQUE...`);
    restoreBackup();
    console.log(`✅ Restauration terminée`);
  }
}

// Exécuter l'optimisation
optimizeCSS();
