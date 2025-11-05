/**
 * 🧪 TEST E2E POUR SEED AUTOMATIQUE
 * ===================================
 *
 * Test Playwright pour vérifier que le seed automatique fonctionne correctement
 */

import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Seed Automatique Multi-Tenant", () => {
  test.beforeAll(async () => {
    // S'assurer que la base de données est prête
    await prisma.$connect();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("devrait créer le Super Admin", async () => {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: "contact-sa@kairodigital.fr" },
    });

    expect(superAdmin).toBeTruthy();
    expect(superAdmin?.email).toBe("contact-sa@kairodigital.fr");
    expect(superAdmin?.isActive).toBe(true);
  });

  test("devrait créer les tenants de démo", async () => {
    const tenants = await prisma.tenant.findMany({
      where: {
        slug: {
          in: ["demo-beaute", "demo-agence"],
        },
      },
    });

    expect(tenants.length).toBeGreaterThanOrEqual(2);

    const demoBeaute = tenants.find((t) => t.slug === "demo-beaute");
    const demoAgence = tenants.find((t) => t.slug === "demo-agence");

    expect(demoBeaute).toBeTruthy();
    expect(demoBeaute?.isActive).toBe(true);

    expect(demoAgence).toBeTruthy();
    expect(demoAgence?.isActive).toBe(true);
  });

  test("devrait créer les utilisateurs pour chaque tenant", async () => {
    const tenantBeaute = await prisma.tenant.findUnique({
      where: { slug: "demo-beaute" },
    });

    if (tenantBeaute) {
      const users = await prisma.tenantUser.findMany({
        where: { tenantId: tenantBeaute.id },
      });

      expect(users.length).toBeGreaterThanOrEqual(2);

      const admin = users.find((u) => u.email === "admin@demo-beaute.com");
      const user = users.find((u) => u.email === "user@demo-beaute.com");

      expect(admin).toBeTruthy();
      expect(admin?.role).toBe("ADMIN");
      expect(admin?.isActive).toBe(true);

      expect(user).toBeTruthy();
      expect(user?.role).toBe("EDITOR");
      expect(user?.isActive).toBe(true);
    }
  });

  test("devrait créer du contenu pour les tenants", async () => {
    const tenantBeaute = await prisma.tenant.findUnique({
      where: { slug: "demo-beaute" },
    });

    if (tenantBeaute) {
      const pages = await prisma.contentPage.findMany({
        take: 5,
      });

      expect(pages.length).toBeGreaterThan(0);

      // Vérifier qu'il y a au moins une page avec des sections
      const pageWithSections = await prisma.contentPage.findFirst({
        where: { slug: "accueil" },
        include: { sections: true },
      });

      expect(pageWithSections).toBeTruthy();
      expect(pageWithSections?.sections.length).toBeGreaterThan(0);
    }
  });

  test("devrait isoler les données entre tenants", async () => {
    const tenantBeaute = await prisma.tenant.findUnique({
      where: { slug: "demo-beaute" },
    });

    const tenantAgence = await prisma.tenant.findUnique({
      where: { slug: "demo-agence" },
    });

    if (tenantBeaute && tenantAgence) {
      const usersBeaute = await prisma.tenantUser.findMany({
        where: { tenantId: tenantBeaute.id },
      });

      const usersAgence = await prisma.tenantUser.findMany({
        where: { tenantId: tenantAgence.id },
      });

      // Vérifier que les utilisateurs sont bien isolés
      const userBeauteIds = usersBeaute.map((u) => u.id);
      const userAgenceIds = usersAgence.map((u) => u.id);

      const intersection = userBeauteIds.filter((id) => userAgenceIds.includes(id));
      expect(intersection.length).toBe(0);
    }
  });
});

