/**
 * 🌱 SEED AUTOMATIQUE MULTI-TENANT
 * ==================================
 *
 * Script de seed automatique pour créer :
 * - 1 Super Admin
 * - 2 tenants de démo (demo-beaute, demo-agence)
 * - Pour chaque tenant : un admin et un utilisateur
 * - Quelques contenus de test (pages, posts, settings)
 *
 * Usage: npm run seed:auto
 *        ou npx tsx prisma/seeds/auto-seed-tenants.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";
import { faker } from "@faker-js/faker";

// Configuration DATABASE_URL si non définie
if (!process.env.DATABASE_URL) {
  const projectRoot = path.resolve(process.cwd());
  const dbPath = path.join(projectRoot, "prisma", "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
  console.log(`ℹ️  DATABASE_URL non définie, utilisation: ${process.env.DATABASE_URL}\n`);
}

const prisma = new PrismaClient();

// Logger simple pour le seed (pas besoin du logger complet ici)
const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : "");
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error?.message || "");
  },
};

// Identifiants Super Admin
const SUPER_ADMIN_EMAIL = "contact-sa@kairodigital.fr";
const SUPER_ADMIN_PASSWORD = "Bryan25200@";
const SUPER_ADMIN_FIRST_NAME = "Super";
const SUPER_ADMIN_LAST_NAME = "Admin";

// Configuration des tenants de démo
const DEMO_TENANTS = [
  {
    name: "Demo Beauté",
    slug: "demo-beaute",
    email: "contact@demo-beaute.fr",
    templateName: "beaute", // Nom du template à utiliser
    admin: {
      email: "admin@demo-beaute.com",
      password: "DemoBeaute2024!",
      firstName: "Admin",
      lastName: "Beauté",
    },
    user: {
      email: "user@demo-beaute.com",
      password: "DemoBeaute2024!",
      firstName: "Utilisateur",
      lastName: "Beauté",
    },
  },
  {
    name: "Demo Agence",
    slug: "demo-agence",
    email: "contact@demo-agence.fr",
    templateName: "agence", // Nom du template à utiliser
    admin: {
      email: "admin@demo-agence.com",
      password: "DemoAgence2024!",
      firstName: "Admin",
      lastName: "Agence",
    },
    user: {
      email: "user@demo-agence.com",
      password: "DemoAgence2024!",
      firstName: "Utilisateur",
      lastName: "Agence",
    },
  },
];

/**
 * Créer ou récupérer un template par défaut
 */
async function getOrCreateDefaultTemplate(name: string): Promise<string> {
  let template = await prisma.template.findUnique({
    where: { name },
  });

  if (!template) {
    // Créer un template par défaut minimal
    template = await prisma.template.create({
      data: {
        name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        description: `Template par défaut pour ${name}`,
        category: "BEAUTY",
        configJson: {},
        isActive: true,
        isDefault: false,
      },
    });
      logger.info(`Template créé: ${name}`, { templateId: template.id });
  }

  return template.id;
}

/**
 * Créer le Super Admin
 */
async function createSuperAdmin() {
  logger.info("Création du Super Admin...");

  // Vérifier si le Super Admin existe déjà
  const existing = await prisma.superAdmin.findUnique({
    where: { email: SUPER_ADMIN_EMAIL.toLowerCase().trim() },
  });

  if (existing) {
    logger.info("Super Admin existe déjà", { email: SUPER_ADMIN_EMAIL });
    return existing;
  }

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: SUPER_ADMIN_EMAIL.toLowerCase().trim(),
      password: hashedPassword,
      firstName: SUPER_ADMIN_FIRST_NAME,
      lastName: SUPER_ADMIN_LAST_NAME,
      isActive: true,
    },
  });

  logger.info("Super Admin créé avec succès", {
    id: superAdmin.id,
    email: superAdmin.email,
  });

  return superAdmin;
}

/**
 * Créer un tenant avec ses utilisateurs et contenus
 */
async function createTenant(tenantConfig: (typeof DEMO_TENANTS)[0]) {
  logger.info(`Création du tenant: ${tenantConfig.name}`, {
    slug: tenantConfig.slug,
  });

  // Vérifier si le tenant existe déjà
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: tenantConfig.slug },
  });

  if (existingTenant) {
    logger.info(`Tenant existe déjà: ${tenantConfig.slug}`, {
      tenantId: existingTenant.id,
    });
    return existingTenant;
  }

  // Récupérer ou créer le template
  const templateId = await getOrCreateDefaultTemplate(tenantConfig.templateName);

  // Créer le tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: tenantConfig.name,
      slug: tenantConfig.slug,
      email: tenantConfig.email,
      templateId,
      isActive: true,
    },
  });

  logger.info("Tenant créé", {
    tenantId: tenant.id,
    slug: tenant.slug,
  });

  // Créer l'admin du tenant
  const adminPassword = await bcrypt.hash(tenantConfig.admin.password, 10);
  const admin = await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      email: tenantConfig.admin.email,
      password: adminPassword,
      firstName: tenantConfig.admin.firstName,
      lastName: tenantConfig.admin.lastName,
      role: "ADMIN",
      isActive: true,
    },
  });

  logger.info("Admin tenant créé", {
    tenantId: tenant.id,
    userId: admin.id,
    email: admin.email,
  });

  // Créer l'utilisateur du tenant
  const userPassword = await bcrypt.hash(tenantConfig.user.password, 10);
  const user = await prisma.tenantUser.create({
    data: {
      tenantId: tenant.id,
      email: tenantConfig.user.email,
      password: userPassword,
      firstName: tenantConfig.user.firstName,
      lastName: tenantConfig.user.lastName,
      role: "EDITOR",
      isActive: true,
    },
  });

  logger.info("Utilisateur tenant créé", {
    tenantId: tenant.id,
    userId: user.id,
    email: user.email,
  });

  // Créer quelques contenus de test pour le tenant
  await createDemoContent(tenant.id);

  return tenant;
}

/**
 * Créer du contenu de démo pour un tenant
 */
async function createDemoContent(tenantId: string) {
  logger.info("Création du contenu de démo", { tenantId });

  // Créer quelques pages de contenu
  const pages = [
    {
      slug: "accueil",
      title: "Page d'accueil",
      metaTitle: "Bienvenue",
      metaDescription: faker.lorem.sentence(),
      status: "PUBLISHED" as const,
      isActive: true,
    },
    {
      slug: "a-propos",
      title: "À propos",
      metaTitle: "À propos de nous",
      metaDescription: faker.lorem.sentence(),
      status: "PUBLISHED" as const,
      isActive: true,
    },
    {
      slug: "services",
      title: "Nos services",
      metaTitle: "Découvrez nos services",
      metaDescription: faker.lorem.sentence(),
      status: "PUBLISHED" as const,
      isActive: true,
    },
  ];

  for (const pageData of pages) {
    const page = await prisma.contentPage.create({
      data: {
        slug: pageData.slug,
        title: pageData.title,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
        status: pageData.status,
        isActive: pageData.isActive,
        orderIndex: pages.indexOf(pageData),
      },
    });

    // Créer une section de contenu pour chaque page
    await prisma.contentSection.create({
      data: {
        pageId: page.id,
        sectionName: "hero",
        sectionType: "HERO",
        orderIndex: 0,
        contentJson: {
          title: faker.lorem.sentence(),
          subtitle: faker.lorem.paragraph(),
          image: faker.image.url(),
        },
        isActive: true,
      },
    });

    logger.info("Page créée", {
      tenantId,
      pageId: page.id,
      slug: page.slug,
    });
  }

  // Créer quelques médias de test
  for (let i = 0; i < 3; i++) {
    await prisma.contentMedia.create({
      data: {
        filename: `demo-media-${i}.jpg`,
        originalName: `demo-media-${i}.jpg`,
        altText: faker.lorem.words(3),
        filePath: `/uploads/demo-media-${i}.jpg`,
        mimeType: "image/jpeg",
        fileSize: faker.number.int({ min: 100000, max: 5000000 }),
        width: 1920,
        height: 1080,
        isActive: true,
      },
    });
  }

  logger.info("Contenu de démo créé", { tenantId });
}

/**
 * Fonction principale de seed
 */
async function seed() {
  logger.info("🌱 Début du seed automatique multi-tenant");

  try {
    // 1. Créer le Super Admin
    await createSuperAdmin();

    // 2. Créer les tenants de démo
    for (const tenantConfig of DEMO_TENANTS) {
      await createTenant(tenantConfig);
    }

    // 3. Résumé final
    const superAdminCount = await prisma.superAdmin.count();
    const tenantCount = await prisma.tenant.count();
    const tenantUserCount = await prisma.tenantUser.count();
    const pageCount = await prisma.contentPage.count();

    logger.info("✅ Seed automatique terminé avec succès", {
      superAdmins: superAdminCount,
      tenants: tenantCount,
      tenantUsers: tenantUserCount,
      pages: pageCount,
    });

    console.log("\n🎉 Seed automatique terminé !");
    console.log(`   Super Admins: ${superAdminCount}`);
    console.log(`   Tenants: ${tenantCount}`);
    console.log(`   Utilisateurs tenant: ${tenantUserCount}`);
    console.log(`   Pages: ${pageCount}\n`);

    console.log("📋 Identifiants créés :");
    console.log(`\n   Super Admin:`);
    console.log(`   - Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   - Mot de passe: ${SUPER_ADMIN_PASSWORD}`);

    for (const tenantConfig of DEMO_TENANTS) {
      console.log(`\n   Tenant: ${tenantConfig.name} (${tenantConfig.slug})`);
      console.log(`   - Admin: ${tenantConfig.admin.email} / ${tenantConfig.admin.password}`);
      console.log(`   - User: ${tenantConfig.user.email} / ${tenantConfig.user.password}`);
    }
  } catch (error) {
    logger.error("❌ Erreur lors du seed automatique", error as Error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed si le script est appelé directement
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erreur fatale:", error);
      process.exit(1);
    });
}

export default seed;

