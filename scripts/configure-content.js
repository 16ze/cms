/**
 * 🔧 Script de Configuration du Contenu
 *
 * Ce script remplace automatiquement tous les placeholders
 * dans content.json avec les données de company.json
 */

const fs = require("fs");
const path = require("path");

// Couleurs pour le terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      colors.red + `❌ Erreur lors du chargement de ${filePath}:`,
      error.message + colors.reset
    );
    return null;
  }
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(colors.green + `✅ Sauvegardé: ${filePath}` + colors.reset);
  } catch (error) {
    console.error(
      colors.red + `❌ Erreur lors de la sauvegarde de ${filePath}:`,
      error.message + colors.reset
    );
  }
}

function replacePlaceholders(contentData, companyData) {
  const company = companyData.company;

  // Fonction récursive pour remplacer les placeholders
  function replaceInObject(obj) {
    if (typeof obj === "string") {
      return obj
        .replace(/\[NOM ENTREPRISE\]/g, company.name)
        .replace(/\[VILLE\]/g, company.contact.address.city)
        .replace(/\[REGION\]/g, company.contact.address.region)
        .replace(/\[TYPE ENTREPRISE\]/g, company.industry)
        .replace(/\[SERVICES PRINCIPAUX\]/g, company.description)
        .replace(/\[ANNEE\]/g, company.foundedYear.toString())
        .replace(/\[FONDATEUR\]/g, company.founder || "")
        .replace(
          /\[votre-domaine\]/g,
          company.seo.siteUrl
            .replace("https://www.", "")
            .replace("https://", "")
        )
        .replace(/\[VOTRE NUMERO\]/g, company.contact.phone)
        .replace(
          /\[VOTRE ADRESSE\]/g,
          `${company.contact.address.street}, ${company.contact.address.postalCode} ${company.contact.address.city}`
        )
        .replace(
          /\[VOTRE ADRESSE COMPLETE\]/g,
          `${company.contact.address.street}, ${company.contact.address.postalCode} ${company.contact.address.city}, ${company.contact.address.country}`
        )
        .replace(
          /\[VOTRE LATITUDE\]/g,
          company.contact.address.coordinates.latitude.toString()
        )
        .replace(
          /\[VOTRE LONGITUDE\]/g,
          company.contact.address.coordinates.longitude.toString()
        )
        .replace(
          /\[votre-page\]/g,
          extractSocialHandle(company.social.facebook)
        )
        .replace(
          /\[votre-compte\]/g,
          extractSocialHandle(company.social.instagram)
        )
        .replace(
          /\[votre-entreprise\]/g,
          extractSocialHandle(company.social.linkedin)
        )
        .replace(/\[votre-photo\]/g, "team-member") // Placeholder générique
        .replace(/\[DESCRIPTION METIER\]/g, company.description)
        .replace(/\[VOTRE DOMAINE\]/g, company.industry)
        .replace(
          /\[VOTRE POSTE\]/g,
          company.founder ? `Fondateur chez ${company.name}` : "Dirigeant"
        )
        .replace(/\[VOS COMPETENCES\]/g, company.description)
        .replace(
          /\[mots-clés spécifiques à votre activité et région\]/g,
          `${company.name.toLowerCase()}, ${company.industry.toLowerCase()}, ${company.contact.address.city.toLowerCase()}, ${company.contact.address.region.toLowerCase()}`
        )
        .replace(/\[DESCRIPTION DE VOTRE ENTREPRISE\]/g, company.description)
        .replace(/\[VOTRE VILLE\]/g, company.contact.address.city)
        .replace(/\[CODE POSTAL\]/g, company.contact.address.postalCode);
    } else if (Array.isArray(obj)) {
      return obj.map(replaceInObject);
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceInObject(value);
      }
      return newObj;
    }
    return obj;
  }

  return replaceInObject(contentData);
}

function extractSocialHandle(url) {
  if (!url) return "";
  const match = url.match(/\/([^\/]+)\/?$/);
  return match ? match[1] : "";
}

function main() {
  console.log(colors.bright + colors.blue);
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║                                                   ║");
  console.log("║       🔧 Configuration du Contenu JSON           ║");
  console.log("║                                                   ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log(colors.reset);

  // Chemins des fichiers
  const companyPath = path.join(__dirname, "../src/config/company.json");
  const contentPath = path.join(__dirname, "../src/config/content.json");
  const contentExamplePath = path.join(
    __dirname,
    "../src/config/content.example.json"
  );

  console.log(colors.cyan + "\n📖 Chargement des fichiers..." + colors.reset);

  // Charger les données
  const companyData = loadJSON(companyPath);
  if (!companyData) {
    console.log(
      colors.red + "❌ Impossible de charger company.json" + colors.reset
    );
    process.exit(1);
  }

  // Vérifier si content.json existe, sinon copier depuis l'exemple
  if (!fs.existsSync(contentPath)) {
    console.log(
      colors.yellow +
        "⚠️  content.json n'existe pas, copie depuis l'exemple..." +
        colors.reset
    );
    if (fs.existsSync(contentExamplePath)) {
      fs.copyFileSync(contentExamplePath, contentPath);
      console.log(
        colors.green + "✅ content.json créé depuis l'exemple" + colors.reset
      );
    } else {
      console.log(
        colors.red + "❌ content.example.json non trouvé" + colors.reset
      );
      process.exit(1);
    }
  }

  const contentData = loadJSON(contentPath);
  if (!contentData) {
    console.log(
      colors.red + "❌ Impossible de charger content.json" + colors.reset
    );
    process.exit(1);
  }

  console.log(colors.green + "✅ Fichiers chargés avec succès" + colors.reset);

  // Remplacer les placeholders
  console.log(
    colors.cyan + "\n🔄 Remplacement des placeholders..." + colors.reset
  );

  const updatedContent = replacePlaceholders(contentData, companyData);

  // Sauvegarder
  console.log(colors.cyan + "\n💾 Sauvegarde..." + colors.reset);
  saveJSON(contentPath, updatedContent);

  // Afficher un résumé
  console.log(colors.bright + "\n📋 Résumé des remplacements:" + colors.reset);
  console.log(colors.blue + "━".repeat(50) + colors.reset);
  console.log(
    `${colors.bright}Entreprise:${colors.reset} ${companyData.company.name}`
  );
  console.log(
    `${colors.bright}Ville:${colors.reset} ${companyData.company.contact.address.city}`
  );
  console.log(
    `${colors.bright}Région:${colors.reset} ${companyData.company.contact.address.region}`
  );
  console.log(
    `${colors.bright}Année:${colors.reset} ${companyData.company.foundedYear}`
  );
  console.log(
    `${colors.bright}Fondateur:${colors.reset} ${
      companyData.company.founder || "Non spécifié"
    }`
  );
  console.log(colors.blue + "━".repeat(50) + colors.reset);

  console.log(
    colors.green + "\n✨ Configuration terminée avec succès !" + colors.reset
  );
  console.log(
    colors.cyan +
      "🔄 Redémarrez votre serveur de développement pour voir les changements." +
      colors.reset
  );
}

// Exécution
main();
