#!/usr/bin/env node

/**
 * 🔄 Script de Migration Automatique vers safeHandler
 * ===================================================
 *
 * Ce script aide à migrer progressivement les routes API
 * vers safeHandler pour une sécurité renforcée.
 *
 * Usage:
 *   npm run migrate:routes -- --file src/app/api/admin/clients/route.ts
 *   npm run migrate:routes -- --all
 *   npm run migrate:routes -- --dry-run
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface MigrationOptions {
  file?: string;
  all?: boolean;
  dryRun?: boolean;
  output?: string;
}

/**
 * Analyse une route et suggère les changements
 */
function analyzeRoute(filePath: string): {
  canMigrate: boolean;
  suggestions: string[];
  complexity: "simple" | "medium" | "complex";
} {
  const content = fs.readFileSync(filePath, "utf-8");
  const suggestions: string[] = [];
  let complexity: "simple" | "medium" | "complex" = "simple";

  // Vérifier si déjà migré
  if (content.includes("safeHandler")) {
    return {
      canMigrate: false,
      suggestions: ["Route déjà migrée vers safeHandler"],
      complexity: "simple",
    };
  }

  // Vérifier la présence d'authentification
  if (!content.includes("ensureAuthenticated") && !content.includes("ensureAdmin")) {
    suggestions.push("⚠️  Route sans authentification - Ajouter requireAuth: true");
  }

  // Vérifier la présence de validation
  if (!content.includes("validateRequest") && !content.includes("z.object")) {
    suggestions.push("⚠️  Route sans validation - Ajouter schema Zod");
  }

  // Vérifier la gestion d'erreurs
  if (!content.includes("try {") || !content.includes("catch")) {
    suggestions.push("ℹ️  Route avec gestion d'erreurs basique - safeHandler gère automatiquement");
  }

  // Évaluer la complexité
  const lines = content.split("\n").length;
  const hasComplexLogic = content.includes("if (") && content.split("if (").length > 5;
  const hasAsyncOperations = (content.match(/await/g) || []).length > 5;

  if (hasComplexLogic || hasAsyncOperations || lines > 300) {
    complexity = "complex";
  } else if (lines > 150) {
    complexity = "medium";
  }

  return {
    canMigrate: true,
    suggestions,
    complexity,
  };
}

/**
 * Génère un template de migration
 */
function generateMigrationTemplate(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath, ".ts");
  const routeName = fileName;

  return `/**
 * 🔒 ${routeName.toUpperCase()} - ROUTE MIGRÉE VERS SAFE HANDLER
 * ==============================================================
 * 
 * Migration automatique depuis: ${filePath}
 * Date: ${new Date().toISOString()}
 */

import { NextRequest, NextResponse } from "next/server";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { validateQueryParams, commonSchemas } from "@/lib/validation";
import { z } from "zod";

// TODO: Définir les schémas Zod selon vos besoins
const createSchema = z.object({
  // Ajouter vos champs ici
});

const updateSchema = createSchema.partial();

const queryParamsSchema = z.object({
  page: z.string().regex(/^\\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\\d+$/).transform(Number).optional(),
});

/**
 * GET /api/admin/${routeName}
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // TODO: Implémenter la logique GET
    // La logique existante doit être adaptée ici

    return secureResponse(
      {
        success: true,
        data: [],
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["GET"],
  }
);

/**
 * POST /api/admin/${routeName}
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createSchema>>(request);

    // TODO: Implémenter la logique POST

    return secureResponse(
      {
        success: true,
        data: {},
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createSchema,
  }
);

// TODO: Ajouter PUT, DELETE, PATCH selon vos besoins
`;
}

/**
 * Migre un fichier
 */
function migrateFile(filePath: string, options: MigrationOptions): void {
  const analysis = analyzeRoute(filePath);

  if (!analysis.canMigrate) {
    console.log(`\n❌ ${filePath} - ${analysis.suggestions[0]}`);
    return;
  }

  console.log(`\n📋 ${filePath}`);
  console.log(`   Complexité: ${analysis.complexity}`);
  console.log(`   Suggestions:`);
  analysis.suggestions.forEach((s) => console.log(`     ${s}`));

  if (options.dryRun) {
    console.log(`   ⚠️  Mode dry-run - Aucune modification effectuée`);
    return;
  }

  const template = generateMigrationTemplate(filePath);
  const outputPath = options.output || filePath.replace(".ts", "-migrated.ts");

  fs.writeFileSync(outputPath, template);
  console.log(`   ✅ Template généré: ${outputPath}`);
  console.log(`   ⚠️  À compléter manuellement avec la logique existante`);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: args.includes("--dry-run"),
    all: args.includes("--all"),
  };

  // Extraire --file
  const fileIndex = args.indexOf("--file");
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    options.file = args[fileIndex + 1];
  }

  // Extraire --output
  const outputIndex = args.indexOf("--output");
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.output = args[outputIndex + 1];
  }

  console.log("🔄 Migration vers safeHandler\n");

  if (options.dryRun) {
    console.log("⚠️  Mode dry-run activé - Aucune modification ne sera effectuée\n");
  }

  if (options.file) {
    // Migration d'un fichier spécifique
    if (!fs.existsSync(options.file)) {
      console.error(`❌ Fichier non trouvé: ${options.file}`);
      process.exit(1);
    }
    migrateFile(options.file, options);
  } else if (options.all) {
    // Migration de tous les fichiers
    const files = await glob("src/app/api/admin/**/*.ts", {
      ignore: [
        "**/node_modules/**",
        "**/*-refactored.ts",
        "**/*-migrated.ts",
        "**/example-secure-route/**",
      ],
    });

    console.log(`📁 ${files.length} fichiers trouvés\n`);

    for (const file of files) {
      migrateFile(file, options);
    }
  } else {
    console.log(`
Usage:
  npm run migrate:routes -- --file <chemin>     Migrer un fichier spécifique
  npm run migrate:routes -- --all               Analyser tous les fichiers
  npm run migrate:routes -- --dry-run           Mode dry-run (analyse uniquement)
  npm run migrate:routes -- --output <chemin>   Spécifier le fichier de sortie

Exemples:
  npm run migrate:routes -- --file src/app/api/admin/clients/route.ts
  npm run migrate:routes -- --all --dry-run
    `);
  }
}

main().catch(console.error);

