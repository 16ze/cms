// Script d'importation du contenu JSON vers PostgreSQL
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importContent() {
  try {
    console.log('📦 Lecture du fichier content.json...');
    const contentPath = path.join(__dirname, 'config', 'content.json');
    const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    console.log(`📝 Nombre de pages à importer: ${Object.keys(contentData).length}`);

    for (const [slug, content] of Object.entries(contentData)) {
      console.log(`\n🔄 Importation de la page: ${slug}`);
      
      try {
        // Vérifier si la page existe déjà
        const existing = await prisma.contentPage.findUnique({
          where: { slug }
        });

        if (existing) {
          // Mettre à jour
          await prisma.contentPage.update({
            where: { slug },
            data: {
              content: content,
              updatedAt: new Date()
            }
          });
          console.log(`  ✅ Page "${slug}" mise à jour`);
        } else {
          // Créer
          await prisma.contentPage.create({
            data: {
              slug,
              content: content,
              version: 1
            }
          });
          console.log(`  ✅ Page "${slug}" créée`);
        }
      } catch (error) {
        console.error(`  ❌ Erreur pour "${slug}":`, error.message);
      }
    }

    console.log('\n🎉 Importation terminée avec succès !');
    
    // Afficher le résumé
    const totalPages = await prisma.contentPage.count();
    console.log(`📊 Total de pages dans la BD: ${totalPages}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importContent();

