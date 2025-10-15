const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndInitDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Vérifier la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier les tables
    const pageCount = await prisma.contentPage.count();
    const sectionCount = await prisma.contentSection.count();
    
    console.log(`📊 État actuel:`);
    console.log(`   - Pages: ${pageCount}`);
    console.log(`   - Sections: ${sectionCount}`);
    
    if (pageCount === 0) {
      console.log('🚀 Initialisation des données de base...');
      
      // Créer les pages de base
      const pages = [
        {
          slug: 'home',
          title: 'Accueil',
          metaTitle: 'Kairo Digital - Accueil',
          metaDescription: 'Agence digitale spécialisée dans le développement web et le marketing digital',
          orderIndex: 1,
          status: 'PUBLISHED',
          isActive: true
        },
        {
          slug: 'about',
          title: 'À propos',
          metaTitle: 'Kairo Digital - À propos',
          metaDescription: 'Découvrez notre équipe et notre expertise en développement web',
          orderIndex: 2,
          status: 'PUBLISHED',
          isActive: true
        },
        {
          slug: 'services',
          title: 'Services',
          metaTitle: 'Kairo Digital - Services',
          metaDescription: 'Nos services de développement web et marketing digital',
          orderIndex: 3,
          status: 'PUBLISHED',
          isActive: true
        },
        {
          slug: 'freelance',
          title: 'Freelance',
          metaTitle: 'Kairo Digital - Freelance',
          metaDescription: 'Services freelance en développement web',
          orderIndex: 4,
          status: 'PUBLISHED',
          isActive: true
        },
        {
          slug: 'contact',
          title: 'Contact',
          metaTitle: 'Kairo Digital - Contact',
          metaDescription: 'Contactez-nous pour vos projets digitaux',
          orderIndex: 5,
          status: 'PUBLISHED',
          isActive: true
        }
      ];
      
      for (const pageData of pages) {
        const page = await prisma.contentPage.create({
          data: pageData
        });
        console.log(`   ✅ Page créée: ${page.slug}`);
        
        // Créer des sections de base pour chaque page
        const sections = [
          {
            sectionName: 'hero',
            sectionType: 'HERO',
            orderIndex: 1,
            contentJson: {
              title: 'Section Hero',
              subtitle: 'Sous-titre de la section',
              content: 'Contenu de la section hero'
            },
            isActive: true
          },
          {
            sectionName: 'content',
            sectionType: 'CONTENT',
            orderIndex: 2,
            contentJson: {
              title: 'Section Contenu',
              content: 'Contenu principal de la section'
            },
            isActive: true
          }
        ];
        
        for (const sectionData of sections) {
          await prisma.contentSection.create({
            data: {
              ...sectionData,
              pageId: page.id
            }
          });
        }
        console.log(`   ✅ Sections créées pour ${page.slug}`);
      }
      
      console.log('🎉 Base de données initialisée avec succès !');
    } else {
      console.log('✅ Base de données déjà initialisée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndInitDatabase();
