const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addSidebarConfigs() {
  console.log(
    "🎨 Ajout des configurations de sidebar pour les templates (V2)...\n"
  );
  console.log("⚠️  IMPORTANT : 'Réservations' retiré des éléments de base\n");
  console.log(
    "✅ Chaque template a maintenant son propre système de rendez-vous\n"
  );

  try {
    // Récupérer tous les templates
    const templates = await prisma.template.findMany();
    console.log(`📋 ${templates.length} templates trouvés\n`);

    // Définir les configurations pour chaque template
    // ⚠️ NOUVEAU : Chaque template avec rendez-vous a son propre élément
    const sidebarConfigs = {
      CORPORATE: [
        {
          elementId: "projets",
          label: "Projets",
          icon: "Briefcase",
          href: "/admin/projets",
          orderIndex: 1,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "equipe",
          label: "Équipe",
          icon: "Users",
          href: "/admin/equipe",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      ECOMMERCE: [
        {
          elementId: "produits",
          label: "Produits",
          icon: "Package",
          href: "/admin/produits",
          orderIndex: 1,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "commandes",
          label: "Commandes",
          icon: "ShoppingCart",
          href: "/admin/commandes",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: true,
        },
      ],
      PORTFOLIO: [
        {
          elementId: "projets",
          label: "Projets",
          icon: "Briefcase",
          href: "/admin/projets",
          orderIndex: 1,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "galerie",
          label: "Galerie",
          icon: "Image",
          href: "/admin/galerie",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      BLOG: [
        {
          elementId: "articles",
          label: "Articles",
          icon: "FileText",
          href: "/admin/articles",
          orderIndex: 1,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "categories",
          label: "Catégories",
          icon: "Tag",
          href: "/admin/categories",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "auteurs",
          label: "Auteurs",
          icon: "UserCheck",
          href: "/admin/auteurs",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      RESTAURANT: [
        {
          elementId: "reservations-restaurant",
          label: "Réservations",
          icon: "CalendarRange",
          href: "/admin/reservations",
          orderIndex: 1,
          category: "RESERVATION",
          isRequired: false,
        },
        {
          elementId: "menu",
          label: "Menu",
          icon: "Utensils",
          href: "/admin/menu",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "tables",
          label: "Tables",
          icon: "Grid",
          href: "/admin/tables",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      WELLNESS: [
        {
          elementId: "reservations-wellness",
          label: "Réservations Cours",
          icon: "CalendarRange",
          href: "/admin/reservations",
          orderIndex: 1,
          category: "RESERVATION",
          isRequired: false,
        },
        {
          elementId: "cours",
          label: "Cours",
          icon: "Dumbbell",
          href: "/admin/cours",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "coaches",
          label: "Coaches",
          icon: "UserCheck",
          href: "/admin/coaches",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      BEAUTY: [
        {
          elementId: "rendez-vous-beaute",
          label: "Rendez-vous",
          icon: "Calendar",
          href: "/admin/rendez-vous-beaute",
          orderIndex: 1,
          category: "RESERVATION",
          isRequired: false,
        },
        {
          elementId: "soins",
          label: "Soins",
          icon: "Sparkles",
          href: "/admin/soins",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "professionnels",
          label: "Professionnels",
          icon: "Users",
          href: "/admin/professionnels",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "clients-beaute",
          label: "Clients",
          icon: "UserCheck",
          href: "/admin/clients-beaute",
          orderIndex: 4,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "planning-beaute",
          label: "Planning",
          icon: "Calendar",
          href: "/admin/planning-beaute",
          orderIndex: 5,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "produits-beaute",
          label: "Produits",
          icon: "Package",
          href: "/admin/produits-beaute",
          orderIndex: 6,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "stats-beaute",
          label: "Rapports",
          icon: "BarChart3",
          href: "/admin/stats-beaute",
          orderIndex: 7,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      CONSULTATION: [
        {
          elementId: "rendez-vous-consultation",
          label: "Rendez-vous",
          icon: "Calendar",
          href: "/admin/rendez-vous-consultation",
          orderIndex: 1,
          category: "RESERVATION",
          isRequired: false,
        },
        {
          elementId: "patients",
          label: "Patients",
          icon: "Users",
          href: "/admin/patients",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: true,
        },
        {
          elementId: "therapeutes",
          label: "Thérapeutes",
          icon: "UserCheck",
          href: "/admin/therapeutes",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
      ],
      SERVICES: [
        {
          elementId: "projets-services",
          label: "Projets",
          icon: "Briefcase",
          href: "/admin/projets",
          orderIndex: 1,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "devis",
          label: "Devis",
          icon: "FileText",
          href: "/admin/devis",
          orderIndex: 2,
          category: "CONTENT",
          isRequired: false,
        },
        {
          elementId: "facturation",
          label: "Facturation",
          icon: "CreditCard",
          href: "/admin/facturation",
          orderIndex: 3,
          category: "CONTENT",
          isRequired: false,
        },
      ],
    };

    // Pour chaque template, ajouter ses configurations
    for (const template of templates) {
      console.log(
        `\n📝 Template: ${template.displayName} (${template.category})`
      );

      const configs = sidebarConfigs[template.category] || [];

      if (configs.length === 0) {
        console.log(
          `   ⚠️  Aucune configuration définie pour ${template.category}`
        );
        continue;
      }

      // Supprimer les anciennes configurations
      const deleted = await prisma.templateSidebarConfig.deleteMany({
        where: { templateId: template.id },
      });
      console.log(
        `   🗑️  ${deleted.count} anciennes configurations supprimées`
      );

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
            isRequired: config.isRequired,
          },
        });
        const badge = config.isRequired ? "🔒" : "✅";
        console.log(`   ${badge} ${config.label} (${config.elementId})`);
      }
    }

    console.log("\n\n✅ Configurations de sidebar ajoutées avec succès !");
    console.log("\n📊 Résumé:");
    const totalConfigs = await prisma.templateSidebarConfig.count();
    console.log(`   Total configurations: ${totalConfigs}`);

    console.log("\n🔍 Détails par template:");
    for (const template of templates) {
      const count = await prisma.templateSidebarConfig.count({
        where: { templateId: template.id },
      });
      console.log(`   - ${template.displayName}: ${count} éléments`);
    }
  } catch (error) {
    console.error("\n❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSidebarConfigs();
