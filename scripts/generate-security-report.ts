/**
 * 📊 GÉNÉRATEUR DE RAPPORT DE SÉCURITÉ
 * ====================================
 *
 * Script pour générer un rapport d'audit de sécurité automatique
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

interface SecurityCheck {
  name: string;
  status: "✅" | "⚠️" | "❌";
  message: string;
  details?: string;
}

const checks: SecurityCheck[] = [];

function addCheck(name: string, status: "✅" | "⚠️" | "❌", message: string, details?: string) {
  checks.push({ name, status, message, details });
}

// 1. Vérifier npm audit
console.log("🔍 Vérification npm audit...");
try {
  const auditOutput = execSync("npm audit --json", { encoding: "utf-8" });
  const audit = JSON.parse(auditOutput);
  const vulnerabilities = audit.metadata?.vulnerabilities || {};

  const total = vulnerabilities.total || 0;
  const critical = vulnerabilities.critical || 0;
  const high = vulnerabilities.high || 0;
  const moderate = vulnerabilities.moderate || 0;
  const low = vulnerabilities.low || 0;

  if (total === 0) {
    addCheck("npm audit", "✅", "Aucune vulnérabilité détectée");
  } else {
    addCheck(
      "npm audit",
      critical > 0 || high > 0 ? "❌" : "⚠️",
      `${total} vulnérabilités détectées`,
      `Critiques: ${critical}, Élevées: ${high}, Modérées: ${moderate}, Faibles: ${low}`
    );
  }
} catch (error) {
  addCheck("npm audit", "⚠️", "Impossible d'exécuter npm audit", String(error));
}

// 2. Vérifier les fichiers de sécurité
console.log("🔍 Vérification des fichiers de sécurité...");
const securityFiles = [
  "src/lib/security.ts",
  "src/lib/prisma-middleware.ts",
  "src/lib/validation.ts",
  "next.config.ts",
  ".env.example",
];

for (const file of securityFiles) {
  try {
    const fs = require("fs");
    if (fs.existsSync(file)) {
      addCheck(`Fichier: ${file}`, "✅", "Fichier présent");
    } else {
      addCheck(`Fichier: ${file}`, "⚠️", "Fichier manquant");
    }
  } catch (error) {
    addCheck(`Fichier: ${file}`, "❌", "Erreur lors de la vérification", String(error));
  }
}

// 3. Vérifier les headers de sécurité dans next.config.ts
console.log("🔍 Vérification des headers de sécurité...");
try {
  const fs = require("fs");
  const nextConfig = fs.readFileSync("next.config.ts", "utf-8");

  const requiredHeaders = [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Strict-Transport-Security",
    "Content-Security-Policy",
  ];

  const missingHeaders: string[] = [];

  for (const header of requiredHeaders) {
    if (!nextConfig.includes(header)) {
      missingHeaders.push(header);
    }
  }

  if (missingHeaders.length === 0) {
    addCheck("Headers de sécurité", "✅", "Tous les headers requis sont présents");
  } else {
    addCheck(
      "Headers de sécurité",
      "⚠️",
      `Headers manquants: ${missingHeaders.join(", ")}`
    );
  }
} catch (error) {
  addCheck("Headers de sécurité", "❌", "Erreur lors de la vérification", String(error));
}

// 4. Vérifier la présence de validation Zod
console.log("🔍 Vérification de la validation Zod...");
try {
  const fs = require("fs");
  const validationFile = fs.readFileSync("src/lib/validation.ts", "utf-8");

  if (validationFile.includes("zod") && validationFile.includes("validateRequest")) {
    addCheck("Validation Zod", "✅", "Validation Zod configurée");
  } else {
    addCheck("Validation Zod", "⚠️", "Validation Zod incomplète");
  }
} catch (error) {
  addCheck("Validation Zod", "❌", "Fichier de validation non trouvé", String(error));
}

// 5. Vérifier le middleware Prisma
console.log("🔍 Vérification du middleware Prisma...");
try {
  const fs = require("fs");
  const prismaMiddleware = fs.readFileSync("src/lib/prisma-middleware.ts", "utf-8");

  if (prismaMiddleware.includes("tenantIsolationMiddleware")) {
    addCheck("Middleware Prisma", "✅", "Middleware d'isolation tenant configuré");
  } else {
    addCheck("Middleware Prisma", "⚠️", "Middleware d'isolation tenant incomplet");
  }
} catch (error) {
  addCheck("Middleware Prisma", "❌", "Fichier middleware non trouvé", String(error));
}

// 6. Vérifier les variables d'environnement sensibles
console.log("🔍 Vérification des variables d'environnement...");
try {
  const fs = require("fs");
  if (fs.existsSync(".env.example")) {
    const envExample = fs.readFileSync(".env.example", "utf-8");
    const requiredVars = ["DATABASE_URL", "ADMIN_SESSION_SECRET"];

    const missingVars: string[] = [];
    for (const varName of requiredVars) {
      if (!envExample.includes(varName)) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length === 0) {
      addCheck("Variables d'environnement", "✅", "Variables requises documentées");
    } else {
      addCheck(
        "Variables d'environnement",
        "⚠️",
        `Variables manquantes dans .env.example: ${missingVars.join(", ")}`
      );
    }
  } else {
    addCheck("Variables d'environnement", "⚠️", ".env.example non trouvé");
  }
} catch (error) {
  addCheck("Variables d'environnement", "❌", "Erreur lors de la vérification", String(error));
}

// Générer le rapport
const report = `# 🔒 AUDIT DE SÉCURITÉ - CMS KAIRO Digital

**Date**: ${new Date().toISOString()}
**Version**: ${require("../package.json").version}

## 📊 Résumé des vérifications

${checks
  .map((check) => `### ${check.status} ${check.name}\n\n${check.message}${check.details ? `\n\n${check.details}` : ""}`)
  .join("\n\n")}

## 📈 Statistiques

- ✅ **Réussies**: ${checks.filter((c) => c.status === "✅").length}
- ⚠️ **Avertissements**: ${checks.filter((c) => c.status === "⚠️").length}
- ❌ **Échecs**: ${checks.filter((c) => c.status === "❌").length}

## 🔧 Actions recommandées

${checks
  .filter((c) => c.status !== "✅")
  .map((check) => `- [ ] Corriger: ${check.name} - ${check.message}`)
  .join("\n")}

## 📝 Notes

Ce rapport a été généré automatiquement. Pour mettre à jour, exécutez:
\`\`\`bash
npm run report:audit
\`\`\`
`;

const reportPath = join(process.cwd(), "AUDIT-SECURITE.md");
writeFileSync(reportPath, report, "utf-8");

console.log("\n✅ Rapport généré:", reportPath);
console.log("\n📊 Résumé:");
console.log(`   ✅ ${checks.filter((c) => c.status === "✅").length} vérifications réussies`);
console.log(`   ⚠️  ${checks.filter((c) => c.status === "⚠️").length} avertissements`);
console.log(`   ❌ ${checks.filter((c) => c.status === "❌").length} échecs`);

