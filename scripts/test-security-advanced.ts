/**
 * 🛡️ SCRIPT DE TEST DE SÉCURITÉ AVANCÉE
 * ======================================
 * 
 * Tests automatisés pour valider les défenses de sécurité
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name: string, minLength?: number): boolean {
  const value = process.env[name];
  if (!value) {
    log(`❌ ${name} n'est pas défini`, "red");
    return false;
  }
  if (minLength && value.length < minLength) {
    log(
      `❌ ${name} est trop court (${value.length} < ${minLength} caractères)`,
      "red"
    );
    return false;
  }
  log(`✅ ${name} est configuré`, "green");
  return true;
}

function checkFileExists(path: string): boolean {
  const exists = existsSync(path);
  if (!exists) {
    log(`❌ Fichier manquant: ${path}`, "red");
  } else {
    log(`✅ Fichier trouvé: ${path}`, "green");
  }
  return exists;
}

async function main() {
  log("\n🛡️  VÉRIFICATION DE LA SÉCURITÉ AVANCÉE\n", "blue");

  let allChecksPassed = true;

  // 1. Vérifier les variables d'environnement
  log("\n📋 Vérification des variables d'environnement...", "yellow");
  allChecksPassed = checkEnvVar("ADMIN_SESSION_SECRET", 64) && allChecksPassed;
  checkEnvVar("ENCRYPTION_KEY", 64); // Optionnel

  // 2. Vérifier les fichiers de sécurité
  log("\n📁 Vérification des fichiers de sécurité...", "yellow");
  allChecksPassed =
    checkFileExists("src/lib/crypto-utils.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("src/lib/secure-session.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("src/lib/two-factor-auth.ts") && allChecksPassed;
  allChecksPassed = checkFileExists("src/lib/waf.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("src/lib/tenant-context-validator.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("src/lib/prisma-error-sanitizer.ts") && allChecksPassed;

  // 3. Vérifier que le middleware utilise le WAF
  log("\n🔍 Vérification du middleware...", "yellow");
  try {
    const middlewareContent = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    if (middlewareContent.includes("applyWAF")) {
      log("✅ WAF intégré dans le middleware", "green");
    } else {
      log("❌ WAF non trouvé dans le middleware", "red");
      allChecksPassed = false;
    }
  } catch (error) {
    log("❌ Erreur lors de la lecture du middleware", "red");
    allChecksPassed = false;
  }

  // 4. Vérifier les tests de sécurité
  log("\n🧪 Vérification des tests de sécurité...", "yellow");
  allChecksPassed =
    checkFileExists("tests/e2e/security-waf.spec.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("tests/e2e/security-isolation.spec.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("tests/e2e/security-sessions.spec.ts") && allChecksPassed;
  allChecksPassed =
    checkFileExists("tests/e2e/security-rate-limiting.spec.ts") &&
    allChecksPassed;

  // 5. Vérifier le schéma Prisma
  log("\n🗄️  Vérification du schéma Prisma...", "yellow");
  try {
    const schemaContent = readFileSync(
      join(process.cwd(), "prisma/schema.prisma"),
      "utf-8"
    );
    if (schemaContent.includes("model RefreshToken")) {
      log("✅ Modèle RefreshToken présent", "green");
    } else {
      log("❌ Modèle RefreshToken manquant", "red");
      allChecksPassed = false;
    }
    if (schemaContent.includes("model SuperAdmin2FA")) {
      log("✅ Modèle SuperAdmin2FA présent", "green");
    } else {
      log("❌ Modèle SuperAdmin2FA manquant", "red");
      allChecksPassed = false;
    }
  } catch (error) {
    log("❌ Erreur lors de la lecture du schéma Prisma", "red");
    allChecksPassed = false;
  }

  // 6. Résumé
  log("\n" + "=".repeat(50), "blue");
  if (allChecksPassed) {
    log("✅ Toutes les vérifications sont passées !", "green");
    process.exit(0);
  } else {
    log("❌ Certaines vérifications ont échoué", "red");
    log(
      "\n💡 Assurez-vous que:\n" +
        "  - ADMIN_SESSION_SECRET fait au moins 64 caractères\n" +
        "  - Tous les fichiers de sécurité sont présents\n" +
        "  - Les migrations Prisma ont été exécutées",
      "yellow"
    );
    process.exit(1);
  }
}

main().catch((error) => {
  log(`❌ Erreur: ${error.message}`, "red");
  process.exit(1);
});

