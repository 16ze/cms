const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addSidebarConfigs() {
  console.log("🎨 Ajout des configurations de sidebar pour les templates...\n");

  try {
    // Récupérer tous les templates
    const templates = await prisma.template.findMany();
    console.log(`📋 ${templates.length} templates trouvés\n`);

    // Définir les configurations pour chaque template
    const sidebarConfigs = {
      CORPORATE: [
        { elementId: "projets", label: "Projets", icon: "FolderOpen", href: "/admin/projets", orderIndex: 1, category: "CONTENT" },
        { elementId: "equipe", label: "Équipe", icon: "Users", href: "/admin/equipe", orderIndex: 2, category: "CONTENT" },
      ],
      ECOMMERCE: [
        { elementId: "produits", label: "Produits", icon: "Package", href: "/admin/produits", orderIndex: 1, category: "CONTENT" },
        { elementId: "commandes", label: "Commandes", icon: "ShoppingCart", href: "/admin/commandes", orderIndex: 2, category: "CONTENT" },
      ],
      PORTFOLIO: [
        { elementId: "projets", label: "Projets", icon: "FolderOpen", href: "/admin/projets", orderIndex: 1, category: "CONTENT" },
        { elementId: "galerie", label: "Galerie", icon: "Image", href: "/admin/galerie", orderIndex: 2, category: "CONTENT" },
      ],
      BLOG: [
        { elementId: "articles", label: "Articles", icon: "FileText", href: "/admin/articles", orderIndex: 1, category: "CONTENT" },
        { elementId: "categories", label: "Catégories", icon: "Tag", href: "/admin/categories", orderIndex: 2, category: "CONTENT" },
        { elementId: "auteurs", label: "Auteurs", icon: "User", href: "/admin/auteurs", orderIndex: 3, category: "CONTENT" },
      ],
      RESTAURANT: [
        { elementId: "menu", label: "Menu", icon: "Utensils", href: "/admin/menu", orderIndex: 1, category: "CONTENT" },
        { elementId: "tables", label: "Tables", icon: "Table", href: "/admin/tables", orderIndex: 2, category: "CONTENT" },
      ],
      WELLNESS: [
        { elementId: "cours", label: "Cours", icon: "Activity", href: "/admin/cours", orderIndex: 1, category: "CONTENT" },
        { elementId: "coaches", label: "Coaches", icon: "Users", href: "/admin/coaches", orderIndex: 2, category: "CONTENT" },
      ],
      BEAUTY: [
        { elementId: "soins", label: "Soins", icon: "Sparkles", href: "/admin/soins", orderIndex: 1, category: "CONTENT" },
        { elementId: "rendez-vous-beaute", label: "Rendez-vous", icon: "Calendar", href: "/admin/rendez-vous-beaute", orderIndex: 2, category: "CONTENT" },
      ],
      CONSULTATION: [
        { elementId: "patients", label: "Patients", icon: "Users", href: "/admin/patients", orderIndex: 1, category: "CONTENT" },
        { elementId: "therapeutes", label: "Thérapeutes", icon: "User", href: "/admin/therapeutes", orderIndex: 2, category: "CONTENT" },
      ],
      SERVICES: [
        { elementId: "projets", label: "Projets", icon: "FolderOpen", href: "/admin/projets", orderIndex: 1, category: "CONTENT" },
        { elementId: "devis", label: "Devis", icon: "FileText", href: "/admin/devis", orderIndex: 2, category: "CONTENT" },
        { elementId: "facturation", label: "Facturation", icon: "CreditCard", href: "/admin/facturation", orderIndex: 3, category: "CONTENT" },
      ],
    };

    // Pour chaque template, ajouter ses configurations
    for (const template of templates) {
      console.log(`\n📝 Template: ${template.displayName} (${template.category})`);

      const configs = sidebarConfigs[template.category] || [];

      if (configs.length === 0) {
        console.log(`   ⚠️  Aucune configuration définie pour ${template.category}`);
        continue;
      }

      // Supprimer les anciennes configurations
      await prisma.templateSidebarConfig.deleteMany({
        where: { templateId: template.id },
      });

      // Créer les nouvelles configurations
      for (const config of configs) {
        await prisma.templateSidebarConfig.create({
          data: {
            templateId: template.id,
            elementId: config.elementId,
            label: config.label,
            icon: config.icon,
            href: config.href,
            orderIndex: config.orderIndex,
            category: config.category,
          },
        });
        console.log(`   ✅ ${config.label} (${config.elementId})`);
      }
    }

    console.log("\n\n✅ Configurations de sidebar ajoutées avec succès !");
    console.log("\n📊 Résumé:");
    const totalConfigs = await prisma.templateSidebarConfig.count();
    console.log(`   Total configurations: ${totalConfigs}`);

  } catch (error) {
    console.error("\n❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSidebarConfigs();

