const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createSecondTenant() {
  console.log("🚀 Création d'un 2ème tenant pour tester l'isolation...\n");

  try {
    // ===== RÉCUPÉRER LE TEMPLATE E-COMMERCE =====
    console.log("🎨 Récupération du template E-commerce...");
    const ecommerceTemplate = await prisma.template.findFirst({
      where: { category: "ECOMMERCE" },
    });

    if (!ecommerceTemplate) {
      throw new Error("❌ Template E-COMMERCE non trouvé !");
    }
    console.log(`✅ Template trouvé: ${ecommerceTemplate.displayName}\n`);

    // ===== CRÉER LE 2ÈME TENANT =====
    console.log("🏢 Création du 2ème tenant (TechStore)...");
    const tenant = await prisma.tenant.create({
      data: {
        name: "TechStore Paris",
        slug: "techstore-paris",
        email: "contact@techstore.fr",
        templateId: ecommerceTemplate.id,
        domain: "techstore.fr",
        isActive: true,
      },
    });
    console.log(`✅ Tenant créé: ${tenant.name} (${tenant.slug})\n`);

    // ===== CRÉER UN UTILISATEUR POUR LE TENANT =====
    console.log("👤 Création d'un utilisateur pour le tenant...");
    const tenantUserPassword = await bcrypt.hash("test2025", 10);

    const tenantUser = await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        email: "manager@techstore.fr",
        password: tenantUserPassword,
        firstName: "Marc",
        lastName: "Durand",
        role: "OWNER",
        isActive: true,
      },
    });
    console.log(
      `✅ Utilisateur tenant créé: ${tenantUser.email} (Role: ${tenantUser.role})\n`
    );

    // ===== ACTIVER LE TEMPLATE POUR LE TENANT =====
    console.log("🔗 Activation du template pour le tenant...");
    await prisma.siteTemplate.create({
      data: {
        tenantId: tenant.id,
        templateId: ecommerceTemplate.id,
        isActive: true,
        activatedAt: new Date(),
      },
    });
    console.log("✅ Template activé pour le tenant\n");

    // ===== CRÉER DES PRODUITS DE TEST =====
    console.log("📦 Création de produits de test...");
    const products = [
      {
        tenantId: tenant.id,
        name: "MacBook Pro 16",
        slug: "macbook-pro-16",
        description: "Ordinateur portable haute performance",
        price: 2499.99,
        comparePrice: 2799.99,
        category: "Ordinateurs",
        brand: "Apple",
        sku: "MBP16-2024",
        quantity: 10,
        featured: true,
        isActive: true,
      },
      {
        tenantId: tenant.id,
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "Smartphone dernière génération",
        price: 1299.99,
        category: "Smartphones",
        brand: "Apple",
        sku: "IP15PRO-2024",
        quantity: 25,
        featured: true,
        isActive: true,
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
      console.log(`   ✅ ${product.name} (${product.price}€)`);
    }

    // ===== RÉCAP FINAL =====
    console.log("\n" + "═".repeat(60));
    console.log("✨ 2ÈME TENANT CRÉÉ AVEC SUCCÈS !\n");
    console.log("📊 DONNÉES CRÉÉES:");
    console.log(`   • Tenant: ${tenant.name}`);
    console.log(`   • User: ${tenantUser.email}`);
    console.log(`     Password: test2025`);
    console.log(`   • Template: ${ecommerceTemplate.displayName}`);
    console.log(`   • Produits: ${products.length}`);
    console.log("\n📝 COMPTE DE TEST:");
    console.log("   ┌─────────────────────────────────────────────");
    console.log("   │ TENANT 2 (TechStore):");
    console.log("   │   Email: manager@techstore.fr");
    console.log("   │   Password: test2025");
    console.log("   │   Template: E-commerce");
    console.log("   └─────────────────────────────────────────────");
    console.log("\n🎯 MAINTENANT VOUS POUVEZ TESTER L'ISOLATION !");
    console.log("   1. Login sophie@salon-elegance.fr → Voir soins uniquement");
    console.log("   2. Login manager@techstore.fr → Voir produits uniquement");
    console.log("   3. Login admin@kairodigital.com → Voir tout");
    console.log("═".repeat(60));
  } catch (error) {
    console.error("❌ Erreur lors de la création du 2ème tenant:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSecondTenant();

