#!/usr/bin/env tsx
/**
 * 🔍 Script de Vérification Sentry
 * =================================
 * 
 * Vérifie que Sentry est correctement configuré pour le monitoring
 */

import * as fs from "fs";
import * as path from "path";

interface SentryConfig {
  dsn?: string;
  environment?: string;
  sampleRate?: number;
  enabled: boolean;
}

function checkSentryConfig(): {
  success: boolean;
  errors: string[];
  warnings: string[];
  config: SentryConfig;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let config: SentryConfig = { enabled: false };

  // Vérifier les variables d'environnement
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development";
  const sampleRate = parseFloat(process.env.SENTRY_SAMPLE_RATE || "1.0");

  if (dsn) {
    config.enabled = true;
    config.dsn = dsn;
    config.environment = environment;
    config.sampleRate = sampleRate;

    // Vérifier le format du DSN
    if (!dsn.startsWith("https://")) {
      errors.push("NEXT_PUBLIC_SENTRY_DSN doit commencer par 'https://'");
    }

    if (!dsn.includes("@")) {
      errors.push("NEXT_PUBLIC_SENTRY_DSN semble invalide (format attendu: https://xxx@xxx.ingest.sentry.io/xxx)");
    }
  } else {
    warnings.push("NEXT_PUBLIC_SENTRY_DSN n'est pas défini - Sentry est désactivé");
  }

  // Vérifier les fichiers de configuration
  const sentryClientConfig = path.join(process.cwd(), "sentry.client.config.ts");
  const sentryServerConfig = path.join(process.cwd(), "sentry.server.config.ts");

  if (!fs.existsSync(sentryClientConfig)) {
    warnings.push("sentry.client.config.ts non trouvé");
  } else {
    const clientContent = fs.readFileSync(sentryClientConfig, "utf-8");
    if (!clientContent.includes("Sentry.init")) {
      warnings.push("sentry.client.config.ts semble incomplet");
    }
  }

  if (!fs.existsSync(sentryServerConfig)) {
    warnings.push("sentry.server.config.ts non trouvé");
  } else {
    const serverContent = fs.readFileSync(sentryServerConfig, "utf-8");
    if (!serverContent.includes("Sentry.init")) {
      warnings.push("sentry.server.config.ts semble incomplet");
    }
  }

  // Vérifier l'intégration Next.js
  const nextConfig = path.join(process.cwd(), "next.config.ts");
  if (fs.existsSync(nextConfig)) {
    const nextContent = fs.readFileSync(nextConfig, "utf-8");
    if (!nextContent.includes("withSentryConfig")) {
      warnings.push("next.config.ts ne semble pas utiliser withSentryConfig");
    }
  }

  // Vérifier le sample rate
  if (sampleRate < 0 || sampleRate > 1) {
    errors.push("SENTRY_SAMPLE_RATE doit être entre 0.0 et 1.0");
  }

  if (environment === "production" && sampleRate === 1.0) {
    warnings.push("SENTRY_SAMPLE_RATE est à 1.0 en production - considérez réduire à 0.1 pour éviter la surcharge");
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

function main() {
  console.log("🔍 Vérification de la configuration Sentry...\n");

  const result = checkSentryConfig();

  if (result.config.enabled) {
    console.log("✅ Sentry est activé\n");
    console.log(`📊 Configuration:`);
    console.log(`   DSN: ${result.config.dsn?.substring(0, 30)}...`);
    console.log(`   Environment: ${result.config.environment}`);
    console.log(`   Sample Rate: ${result.config.sampleRate}\n`);
  } else {
    console.log("⚠️  Sentry est désactivé\n");
  }

  if (result.errors.length > 0) {
    console.log("❌ Erreurs:");
    result.errors.forEach((error) => console.log(`   - ${error}`));
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log("⚠️  Avertissements:");
    result.warnings.forEach((warning) => console.log(`   - ${warning}`));
    console.log();
  }

  if (result.success && result.config.enabled) {
    console.log("✅ Configuration Sentry valide\n");
    console.log("📝 Prochaines étapes:");
    console.log("   1. Vérifiez que le serveur de développement est lancé");
    console.log("   2. Visitez /api/test-sentry pour tester la capture d'erreurs");
    console.log("   3. Consultez votre dashboard Sentry pour voir les erreurs capturées");
    process.exit(0);
  } else if (result.success && !result.config.enabled) {
    console.log("ℹ️  Sentry n'est pas configuré - consultez docs/SENTRY-CONFIGURATION.md pour l'activer");
    process.exit(0);
  } else {
    console.log("❌ Configuration Sentry invalide");
    process.exit(1);
  }
}

main();

