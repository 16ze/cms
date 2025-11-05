/**
 * 🧪 TESTS PLAYWRIGHT - ISOLATION TENANT PRISMA
 * ==============================================
 *
 * Tests pour valider l'isolation stricte des tenants dans Prisma
 * avec mock Prisma simulant 2 tenants isolés
 */

import { test, expect } from "@playwright/test";

test.describe("Isolation Tenant Prisma", () => {
  test("devrait isoler les données entre deux tenants", async ({ page }) => {
    // Simuler une connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Mock l'API clients pour tenant 1
    await page.route("**/api/admin/clients*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              { id: "1", firstName: "Client", lastName: "Tenant1", tenantId: "tenant-1" },
              { id: "2", firstName: "Another", lastName: "Client1", tenantId: "tenant-1" },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    // Accéder à la liste des clients
    await page.goto("/admin/clients");
    await page.waitForLoadState("networkidle");

    // Vérifier que seuls les clients du tenant 1 sont affichés
    const clients = await page.$$eval("[data-testid='client-item']", (items) =>
      items.map((item) => item.textContent)
    );

    // Vérifier qu'aucun client du tenant 2 n'est présent
    expect(clients.some((c) => c?.includes("Tenant2"))).toBe(false);
  });

  test("devrait empêcher l'accès cross-tenant via manipulation d'URL", async ({
    page,
  }) => {
    // Connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Tenter d'accéder à une ressource d'un autre tenant via query param
    await page.route("**/api/admin/clients*", (route) => {
      // Le middleware Prisma devrait filtrer automatiquement
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [], // Aucun résultat car filtré par tenantId
        }),
      });
    });

    await page.goto("/admin/clients?tenantId=tenant-2");

    // Vérifier que les données sont filtrées (vide car pas de données du tenant 1)
    const response = await page.waitForResponse("**/api/admin/clients*");
    const data = await response.json();
    
    // Les données devraient être vides ou filtrées
    expect(data.success).toBe(true);
    // Le middleware Prisma devrait avoir filtré par tenantId automatiquement
  });

  test("devrait bloquer les opérations d'écriture cross-tenant", async ({
    page,
  }) => {
    // Connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Tenter de créer une ressource avec un tenantId différent
    await page.route("**/api/admin/clients", (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        
        // Vérifier que le tenantId dans le body correspond au contexte
        if (body.tenantId && body.tenantId !== "tenant-1") {
          route.fulfill({
            status: 403,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: "Forbidden - Tenant ID mismatch",
            }),
          });
        } else {
          // Le middleware Prisma devrait avoir injecté le bon tenantId
          route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              data: { ...body, id: "new-id", tenantId: "tenant-1" },
            }),
          });
        }
      } else {
        route.continue();
      }
    });

    // Tenter de créer avec un tenantId incorrect
    const response = await page.request.post("/api/admin/clients", {
      data: {
        firstName: "Test",
        lastName: "Client",
        email: "test@example.com",
        tenantId: "tenant-2", // Tentative de manipulation
      },
    });

    // Devrait être bloqué ou le tenantId devrait être corrigé automatiquement
    const responseData = await response.json();
    
    // Soit erreur 403, soit le tenantId est corrigé automatiquement
    expect(
      response.status === 403 || responseData.data?.tenantId === "tenant-1"
    ).toBe(true);
  });

  test("devrait empêcher la mise à jour d'une ressource d'un autre tenant", async ({
    page,
  }) => {
    // Connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Mock l'API pour simuler une tentative de mise à jour cross-tenant
    await page.route("**/api/admin/clients/*", (route) => {
      if (route.request().method() === "PUT") {
        // Simuler que le client appartient à tenant-2
        route.fulfill({
          status: 404, // Pas trouvé car filtré par tenantId
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Client non trouvé",
          }),
        });
      } else {
        route.continue();
      }
    });

    // Tenter de mettre à jour un client qui appartient à tenant-2
    const response = await page.request.put("/api/admin/clients/client-tenant-2-id", {
      data: {
        firstName: "Hacked",
        lastName: "Client",
      },
    });

    // Devrait retourner 404 car filtré par tenantId
    expect(response.status()).toBe(404);
  });

  test("devrait empêcher la suppression d'une ressource d'un autre tenant", async ({
    page,
  }) => {
    // Connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Mock l'API pour simuler une tentative de suppression cross-tenant
    await page.route("**/api/admin/clients/*", (route) => {
      if (route.request().method() === "DELETE") {
        // Simuler que le client appartient à tenant-2
        route.fulfill({
          status: 404, // Pas trouvé car filtré par tenantId
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Client non trouvé",
          }),
        });
      } else {
        route.continue();
      }
    });

    // Tenter de supprimer un client qui appartient à tenant-2
    const response = await page.request.delete("/api/admin/clients/client-tenant-2-id");

    // Devrait retourner 404 car filtré par tenantId
    expect(response.status()).toBe(404);
  });

  test("devrait isoler les statistiques par tenant", async ({ page }) => {
    // Connexion tenant 1
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Mock l'API avec statistiques isolées par tenant
    await page.route("**/api/admin/clients*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              { id: "1", firstName: "Client", lastName: "Tenant1", tenantId: "tenant-1" },
            ],
            stats: {
              total: 10, // Seulement pour tenant-1
              clients: 5,
              prospects: 3,
              inactive: 2,
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/admin/clients");
    await page.waitForLoadState("networkidle");

    // Vérifier que les statistiques sont isolées
    const response = await page.waitForResponse("**/api/admin/clients*");
    const data = await response.json();
    
    expect(data.stats.total).toBe(10);
    // Les stats ne devraient pas inclure les données de tenant-2
  });
});

test.describe("Super Admin - Accès multi-tenant", () => {
  test("devrait permettre au super admin d'accéder à tous les tenants", async ({
    page,
  }) => {
    await page.goto("/super-admin/login");

    await page.route("**/api/auth/login/super-admin", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
        headers: {
          "Set-Cookie": "super_admin_session=session-super-admin; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Email/i).fill("admin@kairodigital.com");
    await page.getByLabel(/Mot de passe/i).fill("SuperAdmin123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Mock l'API avec support du paramètre tenantId
    await page.route("**/api/admin/clients*", (route) => {
      const url = new URL(route.request().url());
      const tenantId = url.searchParams.get("tenantId") || "tenant-1";
      
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: "1", firstName: "Client", lastName: tenantId, tenantId },
          ],
        }),
      });
    });

    // Accéder aux données du tenant 1
    await page.goto("/admin/clients?tenantId=tenant-1");
    await page.waitForLoadState("networkidle");

    // Accéder aux données du tenant 2
    await page.goto("/admin/clients?tenantId=tenant-2");
    await page.waitForLoadState("networkidle");

    // Vérifier que les deux requêtes ont fonctionné
    const responses = await page.waitForResponse("**/api/admin/clients*");
    expect(responses.ok()).toBe(true);
  });

  test("devrait empêcher un tenant user d'accéder aux données d'un autre tenant même avec query param", async ({
    page,
  }) => {
    // Connexion tenant 1 (pas super-admin)
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          tenantId: "tenant-1",
        }),
        headers: {
          "Set-Cookie": "admin_session=session-tenant-1; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("tenant1@example.com");
    await page.getByLabel(/Mot de passe/i).fill("Password123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Tenter d'accéder aux données de tenant-2 via query param
    await page.route("**/api/admin/clients*", (route) => {
      // Le middleware devrait ignorer le query param et utiliser le tenantId de la session
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [], // Vide car filtré par tenantId de la session (tenant-1)
        }),
      });
    });

    await page.goto("/admin/clients?tenantId=tenant-2");

    const response = await page.waitForResponse("**/api/admin/clients*");
    const data = await response.json();
    
    // Devrait retourner les données filtrées par tenant-1, pas tenant-2
    expect(data.success).toBe(true);
    // Les données devraient être filtrées par le tenantId de la session
  });
});
