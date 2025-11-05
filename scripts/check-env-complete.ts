#!/usr/bin/env node

/**
 * ✅ Script de Vérification Configuration Complète
 * ================================================
 *
 * Vérifie que toutes les variables d'environnement nécessaires sont configurées
 *
 * Usage:
 *   npm run check:env
 */

import * as fs from "fs";
import * as path from "path";

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  check?: (value: string) => boolean;
}

const REQUIRED_VARS: EnvCheck[] = [
  {
    name: "ADMIN_SESSION_SECRET",
    required: true,
    description: "Secret pour les sessions admin",
    check: (v) => v.length >= 32,
  },
  {
    name: "DATABASE_URL",
    required: true,
    description: "URL de connexion à la base de données",
  },
  {
    name: "NODE_ENV",
    required: true,
    description: "Environnement (development, production, test)",
    check: (v) => ["development", "production", "test"].includes(v),
  },
];

const OPTIONAL_VARS: EnvCheck[] = [
  {
    name: "UPSTASH_REDIS_REST_URL",
    required: false,
    description: "URL Upstash Redis pour rate limiting",
  },
  {
    name: "UPSTASH_REDIS_REST_TOKEN",
    required: false,
    description: "Token Upstash Redis",
  },
  {
    name: "ENABLE_METRICS",
    required: false,
    description: "Activer les métriques Prometheus",
    check: (v) => v === "true" || v === "false",
  },
  {
    name: "METRICS_AUTH_TOKEN",
    required: false,
    description: "Token d'authentification pour /api/metrics",
  },
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    description: "DSN Sentry pour error tracking",
  },
  {
    name: "ALLOWED_ORIGINS",
    required: false,
    description: "Origines autorisées pour CSRF",
  },
];

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const env: Record<string, string> = {};

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  });

  return env;
}

function checkVariable(
  name: string,
  value: string | undefined,
  check: EnvCheck
): { ok: boolean; message: string } {
  if (!value) {
    return {
      ok: !check.required,
      message: check.required
        ? `❌ ${name} est requis mais non défini`
        : `⚠️  ${name} n'est pas défini (optionnel)`,
    };
  }

  if (check.check && !check.check(value)) {
    return {
      ok: false,
      message: `❌ ${name} a une valeur invalide: ${value}`,
    };
  }

  return {
    ok: true,
    message: `✅ ${name}: ${check.description}`,
  };
}

async function main() {
  console.log("🔍 Vérification de la Configuration\n");
  console.log("=" .repeat(50));
  console.log("");

  // Charger les variables d'environnement
  const envLocal = loadEnvFile(".env.local");
  const envProduction = loadEnvFile(".env.production");
  const env = { ...process.env, ...envLocal, ...envProduction };

  let hasErrors = false;
  let hasWarnings = false;

  // Vérifier les variables requises
  console.log("📋 Variables Requises:\n");
  for (const check of REQUIRED_VARS) {
    const value = env[check.name];
    const result = checkVariable(check.name, value, check);
    
    if (!result.ok) {
      hasErrors = true;
    }
    
    console.log(`  ${result.message}`);
  }

  console.log("\n📋 Variables Optionnelles (Recommandées):\n");
  for (const check of OPTIONAL_VARS) {
    const value = env[check.name];
    const result = checkVariable(check.name, value, check);
    
    if (!result.ok && check.required) {
      hasErrors = true;
    } else if (!result.ok && !check.required) {
      hasWarnings = true;
    }
    
    console.log(`  ${result.message}`);
  }

  // Vérifications spécifiques
  console.log("\n🔍 Vérifications Spécifiques:\n");

  // Vérifier Upstash Redis
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    console.log("  ✅ Upstash Redis configuré");
  } else {
    console.log("  ⚠️  Upstash Redis non configuré (rate limiting désactivé en dev)");
    hasWarnings = true;
  }

  // Vérifier Prometheus
  if (env.ENABLE_METRICS === "true" && env.METRICS_AUTH_TOKEN) {
    console.log("  ✅ Prometheus métriques activées");
  } else {
    console.log("  ⚠️  Prometheus métriques non configurées");
    hasWarnings = true;
  }

  // Vérifier Sentry
  if (env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("  ✅ Sentry configuré");
  } else {
    console.log("  ⚠️  Sentry non configuré (error tracking désactivé)");
    hasWarnings = true;
  }

  // Résumé
  console.log("\n" + "=" .repeat(50));
  console.log("");

  if (hasErrors) {
    console.log("❌ Des erreurs de configuration ont été détectées");
    console.log("   Veuillez corriger les variables requises manquantes\n");
    process.exit(1);
  } else if (hasWarnings) {
    console.log("⚠️  Configuration valide mais certaines variables optionnelles sont manquantes");
    console.log("   Certaines fonctionnalités peuvent être désactivées\n");
    process.exit(0);
  } else {
    console.log("✅ Configuration complète et valide !\n");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Erreur lors de la vérification:", error);
  process.exit(1);
});

