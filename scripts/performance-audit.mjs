#!/usr/bin/env node

/**
 * 🚀 AUDIT DE PERFORMANCE - KAIRO WEBSITE
 * Script d'audit pour valider les optimisations de performance
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

console.log("🔍 AUDIT DE PERFORMANCE - KAIRO WEBSITE");
console.log("=====================================\n");

// 1. Vérification des optimisations Google Analytics
console.log("📊 1. VÉRIFICATION GOOGLE ANALYTICS");
console.log("-----------------------------------");

const layoutPath = path.join(projectRoot, "src/app/layout.tsx");
const layoutContent = fs.readFileSync(layoutPath, "utf8");

const hasNextScript = layoutContent.includes("next/script");
const hasAfterInteractive = layoutContent.includes("afterInteractive");
const hasGtmOptimized =
  layoutContent.includes("GoogleTagManager") && hasNextScript;

console.log(`✅ next/script utilisé: ${hasNextScript ? "OUI" : "NON"}`);
console.log(
  `✅ stratégie afterInteractive: ${hasAfterInteractive ? "OUI" : "NON"}`
);
console.log(`✅ GTM optimisé: ${hasGtmOptimized ? "OUI" : "NON"}`);

// 2. Vérification des images optimisées
console.log("\n🖼️  2. VÉRIFICATION OPTIMISATION IMAGES");
console.log("-------------------------------------");

const modernHomePath = path.join(
  projectRoot,
  "src/components/pages/modern-home-page.tsx"
);
const modernHomeContent = fs.readFileSync(modernHomePath, "utf8");

const hasImageImport = modernHomeContent.includes(
  'import Image from "next/image"'
);
const hasImgTags = (modernHomeContent.match(/<img/g) || []).length;
const hasImageComponents = (modernHomeContent.match(/<Image/g) || []).length;

console.log(`✅ Import Image de Next.js: ${hasImageImport ? "OUI" : "NON"}`);
console.log(`📊 Balises <img> restantes: ${hasImgTags}`);
console.log(`📊 Composants <Image> utilisés: ${hasImageComponents}`);

// 3. Vérification TypeScript strict
console.log("\n🔧 3. VÉRIFICATION TYPESCRIPT STRICT");
console.log("-----------------------------------");

const adminDir = path.join(projectRoot, "src/components/admin");
const adminFiles = fs
  .readdirSync(adminDir)
  .filter((file) => file.endsWith(".tsx"));

let totalAnyTypes = 0;
let totalConsoleLogs = 0;

adminFiles.forEach((file) => {
  const filePath = path.join(adminDir, file);
  const content = fs.readFileSync(filePath, "utf8");

  const anyTypes = (content.match(/: any/g) || []).length;
  const consoleLogs = (content.match(/console\./g) || []).length;

  totalAnyTypes += anyTypes;
  totalConsoleLogs += consoleLogs;
});

console.log(`📊 Types 'any' dans admin: ${totalAnyTypes}`);
console.log(`📊 console.log dans admin: ${totalConsoleLogs}`);

// 4. Vérification centralisation CSS
console.log("\n🎨 4. VÉRIFICATION CENTRALISATION CSS");
console.log("-----------------------------------");

const sharedComponentsPath = path.join(
  projectRoot,
  "src/styles/shared-components.css"
);
const globalsPath = path.join(projectRoot, "src/app/globals.css");

const hasSharedComponents = fs.existsSync(sharedComponentsPath);
const globalsContent = fs.readFileSync(globalsPath, "utf8");
const importsSharedComponents = globalsContent.includes(
  "shared-components.css"
);

console.log(
  `✅ Fichier shared-components.css: ${
    hasSharedComponents ? "EXISTE" : "MANQUANT"
  }`
);
console.log(
  `✅ Import dans globals.css: ${importsSharedComponents ? "OUI" : "NON"}`
);

// 5. Vérification des métadonnées SEO
console.log("\n🔍 5. VÉRIFICATION MÉTADONNÉES SEO");
console.log("---------------------------------");

const hasMetadata = layoutContent.includes("export const metadata");
const hasOpenGraph = layoutContent.includes("openGraph");
const hasTwitterCard = layoutContent.includes("twitter");
const hasCanonical = layoutContent.includes("canonical");
const hasStructuredData = layoutContent.includes("application/ld+json");

console.log(`✅ Métadonnées Next.js 15: ${hasMetadata ? "OUI" : "NON"}`);
console.log(`✅ Open Graph: ${hasOpenGraph ? "OUI" : "NON"}`);
console.log(`✅ Twitter Cards: ${hasTwitterCard ? "OUI" : "NON"}`);
console.log(`✅ Canonical URL: ${hasCanonical ? "OUI" : "NON"}`);
console.log(`✅ Données structurées: ${hasStructuredData ? "OUI" : "NON"}`);

// 6. Vérification des variables CSS
console.log("\n🎯 6. VÉRIFICATION VARIABLES CSS");
console.log("------------------------------");

const cssVariablesPath = path.join(projectRoot, "src/styles/css-variables.css");
const cssVariablesContent = fs.readFileSync(cssVariablesPath, "utf8");

const hasColorVariables = cssVariablesContent.includes("--primary-color");
const hasSpacingVariables = cssVariablesContent.includes("--spacing-");
const hasFontVariables = cssVariablesContent.includes("--font-size-");
const hasTransitionVariables = cssVariablesContent.includes("--transition-");

console.log(`✅ Variables couleurs: ${hasColorVariables ? "OUI" : "NON"}`);
console.log(`✅ Variables espacement: ${hasSpacingVariables ? "OUI" : "NON"}`);
console.log(`✅ Variables typographie: ${hasFontVariables ? "OUI" : "NON"}`);
console.log(
  `✅ Variables transitions: ${hasTransitionVariables ? "OUI" : "NON"}`
);

// 7. Calcul du score de performance
console.log("\n📈 7. SCORE DE PERFORMANCE GLOBAL");
console.log("--------------------------------");

let score = 0;
const maxScore = 100;

// Google Analytics (20 points)
if (hasNextScript && hasAfterInteractive && hasGtmOptimized) score += 20;
else if (hasNextScript && hasAfterInteractive) score += 15;
else if (hasNextScript) score += 10;

// Images optimisées (25 points)
if (hasImageImport && hasImgTags === 0) score += 25;
else if (hasImageImport && hasImageComponents > hasImgTags) score += 20;
else if (hasImageImport) score += 15;

// TypeScript strict (15 points)
if (totalAnyTypes <= 5 && totalConsoleLogs === 0) score += 15;
else if (totalAnyTypes <= 10 && totalConsoleLogs <= 5) score += 10;
else if (totalAnyTypes <= 20) score += 5;

// Centralisation CSS (15 points)
if (hasSharedComponents && importsSharedComponents) score += 15;
else if (hasSharedComponents) score += 10;

// SEO (15 points)
const seoFeatures = [
  hasMetadata,
  hasOpenGraph,
  hasTwitterCard,
  hasCanonical,
  hasStructuredData,
];
const seoScore = seoFeatures.filter(Boolean).length * 3;
score += Math.min(seoScore, 15);

// Variables CSS (10 points)
const cssFeatures = [
  hasColorVariables,
  hasSpacingVariables,
  hasFontVariables,
  hasTransitionVariables,
];
const cssScore = cssFeatures.filter(Boolean).length * 2.5;
score += Math.min(cssScore, 10);

// Affichage du score
const percentage = Math.round((score / maxScore) * 100);
const grade =
  percentage >= 90
    ? "A+"
    : percentage >= 80
    ? "A"
    : percentage >= 70
    ? "B+"
    : percentage >= 60
    ? "B"
    : percentage >= 50
    ? "C"
    : "D";

console.log(`\n🎯 SCORE FINAL: ${score}/${maxScore} (${percentage}%)`);
console.log(`📊 GRADE: ${grade}`);

// Recommandations
console.log("\n💡 RECOMMANDATIONS");
console.log("-----------------");

if (hasImgTags > 0) {
  console.log(
    `⚠️  ${hasImgTags} balises <img> restantes à convertir en <Image />`
  );
}

if (totalAnyTypes > 10) {
  console.log(
    `⚠️  ${totalAnyTypes} types 'any' à remplacer par des interfaces TypeScript`
  );
}

if (totalConsoleLogs > 0) {
  console.log(
    `⚠️  ${totalConsoleLogs} console.log à supprimer pour la production`
  );
}

if (percentage >= 90) {
  console.log("🎉 Excellent ! Le site est optimisé pour la production.");
} else if (percentage >= 80) {
  console.log("✅ Très bien ! Quelques optimisations mineures possibles.");
} else if (percentage >= 70) {
  console.log("📈 Bien ! Améliorations recommandées pour les performances.");
} else {
  console.log("🚨 Attention ! Optimisations importantes nécessaires.");
}

console.log("\n✨ Audit terminé !");
