/**
 * Script de Migration : Conversion JSON String → JSON Natif
 * ==========================================================
 * Convertit les données FrontendContent de String vers Json natif
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateJsonContent() {
  console.log("🔄 Début de la migration JSON...");

  try {
    // Récupérer tous les contenus avec content en String
    const contents = (await prisma.$queryRaw`
      SELECT id, content 
      FROM FrontendContent 
      WHERE typeof(content) = 'text'
    `) as Array<{ id: string; content: string }>;

    console.log(`📊 ${contents.length} éléments à migrer`);

    for (const item of contents) {
      try {
        // Parser le JSON stringifié
        const parsedContent = JSON.parse(item.content);

        // Mettre à jour avec le JSON natif
        await prisma.$executeRaw`
          UPDATE FrontendContent 
          SET content = ${JSON.stringify(parsedContent)} 
          WHERE id = ${item.id}
        `;

        console.log(`✅ Migré: ${item.id}`);
      } catch (error) {
        console.error(`❌ Erreur migration ${item.id}:`, error);
        // Garder le contenu tel quel si ce n'est pas du JSON valide
        console.log(`⚠️  Conservation du contenu brut pour ${item.id}`);
      }
    }

    console.log("✅ Migration terminée");
  } catch (error) {
    console.error("❌ Erreur migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateJsonContent();
