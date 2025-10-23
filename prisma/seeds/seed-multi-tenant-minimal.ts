const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedMultiTenantMinimal() {
  console.log("🚀 Début du seed multi-tenant minimal...\n");

  try {
    // ===== NETTOYER LES DONNÉES =====
    console.log("🧹 Nettoyage des données existantes...");
    await prisma.tenantUser.deleteMany();
    await prisma.beautyAppointment.deleteMany();
    await prisma.beautyTreatment.deleteMany();
    await prisma.siteTemplate.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.superAdmin.deleteMany();
    console.log("✅ Données nettoyées\n");

    // ===== CRÉER LE SUPER ADMIN (KAIRO) =====
    console.log("👨‍💻 Création du Super Admin KAIRO...");
    const superAdminPassword = await bcrypt.hash("kairo2025!", 10);
    
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: "admin@kairodigital.com",
        password: superAdminPassword,
        firstName: "KAIRO",
        lastName: "Digital",
        isActive: true,
      },
    });
    console.log(`✅ Super Admin créé: ${superAdmin.email}\n`);

    // ===== RÉCUPÉRER LE TEMPLATE BEAUTÉ =====
    console.log("🎨 Récupération du template Beauté...");
    const beautyTemplate = await prisma.template.findFirst({
      where: { category: "BEAUTY" },
    });

    if (!beautyTemplate) {
      throw new Error("❌ Template BEAUTY non trouvé ! Exécutez d'abord seed-all-templates.ts");
    }
    console.log(`✅ Template trouvé: ${beautyTemplate.displayName}\n`);

    // ===== CRÉER UN TENANT DE TEST =====
    console.log("🏢 Création d'un Tenant de test...");
    const tenant = await prisma.tenant.create({
      data: {
        name: "Salon Élégance Paris",
        slug: "salon-elegance-paris",
        email: "contact@salon-elegance.fr",
        templateId: beautyTemplate.id,
        domain: "salon-elegance.fr",
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
        email: "sophie@salon-elegance.fr",
        password: tenantUserPassword,
        firstName: "Sophie",
        lastName: "Durand",
        role: "OWNER",
        isActive: true,
      },
    });
    console.log(`✅ Utilisateur tenant créé: ${tenantUser.email} (Role: ${tenantUser.role})\n`);

    // ===== ACTIVER LE TEMPLATE POUR LE TENANT =====
    console.log("🔗 Activation du template pour le tenant...");
    const siteTemplate = await prisma.siteTemplate.create({
      data: {
        tenantId: tenant.id,
        templateId: beautyTemplate.id,
        isActive: true,
        activatedAt: new Date(),
      },
    });
    console.log("✅ Template activé pour le tenant\n");

    // ===== CRÉER UN SOIN DE TEST =====
    console.log("💆 Création d'un soin de test...");
    const treatment = await prisma.beautyTreatment.create({
      data: {
        tenantId: tenant.id,
        name: "Soin Visage Éclat",
        slug: "soin-visage-eclat",
        description: "Un soin revitalisant pour une peau lumineuse",
        category: "Visage",
        duration: 60,
        price: 75,
        isActive: true,
      },
    });
    console.log(`✅ Soin créé: ${treatment.name} (${treatment.price}€)\n`);

    // ===== RÉCAP FINAL =====
    console.log("═".repeat(60));
    console.log("✨ SEED MULTI-TENANT MINIMAL TERMINÉ AVEC SUCCÈS !\n");
    console.log("📊 DONNÉES CRÉÉES:");
    console.log(`   • 1 Super Admin: ${superAdmin.email}`);
    console.log(`     Password: kairo2025!`);
    console.log(`   • 1 Tenant: ${tenant.name}`);
    console.log(`   • 1 Tenant User: ${tenantUser.email}`);
    console.log(`     Password: test2025`);
    console.log(`   • 1 Template actif: ${beautyTemplate.displayName}`);
    console.log(`   • 1 Soin de test: ${treatment.name}`);
    console.log("\n📝 COMPTES DE TEST:");
    console.log("   ┌─────────────────────────────────────────────");
    console.log("   │ SUPER ADMIN (KAIRO):");
    console.log("   │   Email: admin@kairodigital.com");
    console.log("   │   Password: kairo2025!");
    console.log("   │   Accès: GLOBAL (tous les tenants)");
    console.log("   ├─────────────────────────────────────────────");
    console.log("   │ TENANT USER (Client):");
    console.log("   │   Email: sophie@salon-elegance.fr");
    console.log("   │   Password: test2025");
    console.log("   │   Accès: LIMITÉ (Salon Élégance uniquement)");
    console.log("   └─────────────────────────────────────────────");
    console.log("\n🎯 PROCHAINE ÉTAPE: Système d'authentification");
    console.log("═".repeat(60));

  } catch (error) {
    console.error("❌ Erreur lors du seed multi-tenant:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMultiTenantMinimal();

