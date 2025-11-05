#!/usr/bin/env node

/**
 * 🔄 Script de Remplacement Automatique des Routes Migrées
 * =========================================================
 *
 * Ce script aide à remplacer progressivement les routes existantes
 * par leurs versions migrées vers safeHandler
 *
 * Usage:
 *   npm run replace:route -- --from src/app/api/admin/reservations/route.ts --to src/app/api/admin/reservations-refactored/route.ts
 *   npm run replace:route -- --dry-run
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface ReplaceOptions {
  from?: string;
  to?: string;
  dryRun?: boolean;
  all?: boolean;
}

/**
 * Vérifier que la route migrée existe et est valide
 */
function validateRefactoredRoute(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  
  // Vérifier que la route utilise safeHandler
  if (!content.includes("safeHandler")) {
    return false;
  }

  // Vérifier que les imports essentiels sont présents
  const requiredImports = [
    "safeHandler",
    "secureResponse",
  ];

  // Au moins 2 des imports requis doivent être présents
  const foundImports = requiredImports.filter((imp) => content.includes(imp));
  
  return foundImports.length >= 2;
}

/**
 * Remplacer une route par sa version migrée
 */
function replaceRoute(fromPath: string, toPath: string, options: ReplaceOptions): void {
  if (!fs.existsSync(fromPath)) {
    console.error(`❌ Fichier source non trouvé: ${fromPath}`);
    return;
  }

  if (!fs.existsSync(toPath)) {
    console.error(`❌ Fichier migré non trouvé: ${toPath}`);
    return;
  }

  // Valider la route migrée
  if (!validateRefactoredRoute(toPath)) {
    console.error(`❌ Route migrée invalide: ${toPath}`);
    console.error(`   Vérifiez qu'elle utilise safeHandler et les imports corrects`);
    return;
  }

  console.log(`\n📋 Remplacement: ${fromPath}`);
  console.log(`   Par: ${toPath}`);

  if (options.dryRun) {
    console.log(`   ⚠️  Mode dry-run - Aucune modification effectuée`);
    return;
  }

  // Créer une sauvegarde
  const backupPath = `${fromPath}.backup`;
  fs.copyFileSync(fromPath, backupPath);
  console.log(`   💾 Sauvegarde créée: ${backupPath}`);

  // Copier le contenu de la route migrée
  const refactoredContent = fs.readFileSync(toPath, "utf-8");
  fs.writeFileSync(fromPath, refactoredContent);
  console.log(`   ✅ Route remplacée avec succès`);

  console.log(`   ⚠️  N'oubliez pas de:`);
  console.log(`      1. Tester la route migrée`);
  console.log(`      2. Vérifier que les tests passent`);
  console.log(`      3. Supprimer le fichier backup si tout fonctionne`);
}

/**
 * Trouver automatiquement les paires de routes migrées
 */
async function findMigratedRoutes(): Promise<Array<{ from: string; to: string }>> {
  const routes = await glob("src/app/api/**/*-refactored/route.ts", {
    ignore: ["**/node_modules/**"],
  });

  const pairs: Array<{ from: string; to: string }> = [];

  for (const refactoredRoute of routes) {
    // Trouver la route originale correspondante
    const originalRoute = refactoredRoute.replace("-refactored", "");
    
    if (fs.existsSync(originalRoute)) {
      pairs.push({
        from: originalRoute,
        to: refactoredRoute,
      });
    }
  }

  return pairs;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const options: ReplaceOptions = {
    dryRun: args.includes("--dry-run"),
    all: args.includes("--all"),
  };

  // Extraire --from et --to
  const fromIndex = args.indexOf("--from");
  const toIndex = args.indexOf("--to");

  if (fromIndex !== -1 && args[fromIndex + 1]) {
    options.from = args[fromIndex + 1];
  }

  if (toIndex !== -1 && args[toIndex + 1]) {
    options.to = args[toIndex + 1];
  }

  console.log("🔄 Remplacement des Routes Migrées\n");
  console.log("=" .repeat(50));
  console.log("");

  if (options.dryRun) {
    console.log("⚠️  Mode dry-run activé - Aucune modification ne sera effectuée\n");
  }

  if (options.from && options.to) {
    // Remplacement d'un fichier spécifique
    replaceRoute(options.from, options.to, options);
  } else if (options.all) {
    // Trouver et remplacer toutes les routes migrées
    const pairs = await findMigratedRoutes();

    if (pairs.length === 0) {
      console.log("ℹ️  Aucune route migrée trouvée");
      console.log("   Créez d'abord des routes avec le suffixe '-refactored'");
      return;
    }

    console.log(`📁 ${pairs.length} paires de routes trouvées\n`);

    for (const pair of pairs) {
      replaceRoute(pair.from, pair.to, options);
    }

    console.log(`\n✅ ${pairs.length} route(s) traitée(s)`);
  } else {
    console.log(`
Usage:
  npm run replace:route -- --from <route-originale> --to <route-migrée>
  npm run replace:route -- --all                   Remplacer toutes les routes migrées
  npm run replace:route -- --dry-run               Mode dry-run (analyse uniquement)

Exemples:
  npm run replace:route -- --from src/app/api/admin/reservations/route.ts \\
                            --to src/app/api/admin/reservations-refactored/route.ts
  
  npm run replace:route -- --all --dry-run
    `);
  }
}

main().catch(console.error);

