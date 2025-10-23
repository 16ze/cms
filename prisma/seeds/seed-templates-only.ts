const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedTemplatesOnly() {
  console.log("🎨 Début du seed: Templates uniquement...\n");

  try {
    // Nettoyer les templates existants
    await prisma.template.deleteMany();
    console.log("🧹 Templates existants supprimés\n");

    // Créer les 9 templates
    const templates = [
      {
        name: "corporate",
        displayName: "Corporate",
        description: "Template pour entreprises et agences",
        category: "CORPORATE",
        isActive: true,
        isDefault: false,
        configJson: { theme: "professional", layout: "modern" },
      },
      {
        name: "ecommerce",
        displayName: "E-commerce",
        description: "Boutique en ligne complète",
        category: "ECOMMERCE",
        isActive: true,
        isDefault: false,
        configJson: { theme: "shop", layout: "grid" },
      },
      {
        name: "portfolio",
        displayName: "Portfolio",
        description: "Showcase créatif",
        category: "PORTFOLIO",
        isActive: true,
        isDefault: false,
        configJson: { theme: "creative", layout: "masonry" },
      },
      {
        name: "blog",
        displayName: "Blog",
        description: "Publication de contenu",
        category: "BLOG",
        isActive: true,
        isDefault: false,
        configJson: { theme: "editorial", layout: "magazine" },
      },
      {
        name: "restaurant",
        displayName: "Restaurant",
        description: "Menu et réservations",
        category: "RESTAURANT",
        isActive: true,
        isDefault: false,
        configJson: { theme: "dining", layout: "elegant" },
      },
      {
        name: "wellness",
        displayName: "Bien-être & Fitness",
        description: "Cours et coaching",
        category: "WELLNESS",
        isActive: true,
        isDefault: false,
        configJson: { theme: "health", layout: "clean" },
      },
      {
        name: "beauty",
        displayName: "Beauté & Esthétique",
        description: "Salon et spa",
        category: "BEAUTY",
        isActive: true,
        isDefault: true,
        configJson: { theme: "elegant", layout: "luxury" },
      },
      {
        name: "consultation",
        displayName: "Consultation & Thérapie",
        description: "Rendez-vous médicaux",
        category: "CONSULTATION",
        isActive: true,
        isDefault: false,
        configJson: { theme: "medical", layout: "professional" },
      },
      {
        name: "services",
        displayName: "Prestations Professionnelles",
        description: "Services B2B",
        category: "SERVICES",
        isActive: true,
        isDefault: false,
        configJson: { theme: "business", layout: "corporate" },
      },
    ];

    console.log("📋 Création des templates...");
    for (const tmpl of templates) {
      await prisma.template.create({ data: tmpl });
      console.log(`   ✅ ${tmpl.displayName} (${tmpl.category})`);
    }

    console.log(`\n✅ ${templates.length} templates créés avec succès!`);
    console.log("\n🎯 Prochaine étape: seed-multi-tenant-minimal.ts");

  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplatesOnly();

