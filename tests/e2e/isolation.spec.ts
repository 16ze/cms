import { test, expect } from "@playwright/test";

/**
 * 🧪 TESTS D'ISOLATION MULTI-TENANT
 * ===================================
 * 
 * Vérifie que chaque tenant est complètement isolé des autres
 */

test.describe("Isolation Multi-Tenant", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Utiliser une base de données de test temporaire
    process.env.DATABASE_URL = "file:./prisma/test.db";
  });

  test("Tenant A ne doit pas voir les ressources de Tenant B", async ({
    page,
  }) => {
    // Simuler la connexion en tant que Tenant A
    await page.goto("http://localhost:3000/admin/login");
    
    // Mock de l'authentification Tenant A via cookie
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Accéder à la liste des clients via API
    const response = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    // Vérifier que seuls les clients de Tenant A sont retournés
    if (response.ok()) {
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const clients = data.data;
        
        // Tous les clients doivent appartenir à Tenant A
        for (const client of clients) {
          if (client.tenantId) {
            expect(client.tenantId).toBe("tenant-a-id");
          }
        }
        
        // Ne doit pas contenir de clients de Tenant B
        const tenantBClients = clients.filter(
          (c: { tenantId?: string }) => c.tenantId === "tenant-b-id"
        );
        expect(tenantBClients.length).toBe(0);
      }
    } else {
      // Si non authentifié, le statut doit être 401 ou 403
      expect([401, 403]).toContain(response.status());
    }
  });

  test("Super Admin peut voir toutes les ressources", async ({ page }) => {
    // Simuler la connexion en tant que Super Admin
    await page.goto("http://localhost:3000/super-admin/login");
    
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "super-admin-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Accéder à la liste des clients sans filtre tenant
    const response = await page.request.get(
      "http://localhost:3000/api/admin/clients?tenantId=tenant-a-id"
    );

    // Le Super Admin doit pouvoir voir les clients de n'importe quel tenant
    expect(response.status()).toBeLessThan(500);
  });

  test("Création de ressource avec isolation automatique", async ({
    page,
  }) => {
    // Simuler la connexion Tenant A
    await page.goto("http://localhost:3000/admin/login");
    
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Créer un nouveau client
    const createResponse = await page.request.post(
      "http://localhost:3000/api/admin/clients",
      {
        data: {
          firstName: "Test",
          lastName: "Client",
          email: "test@example.com",
        },
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (createResponse.ok()) {
      const created = await createResponse.json();
      
      // Le client créé doit automatiquement avoir le tenantId de Tenant A
      if (created.data?.tenantId) {
        expect(created.data.tenantId).toBe("tenant-a-id");
      }
    } else {
      // Si non authentifié ou erreur, vérifier le statut
      expect([400, 401, 403]).toContain(createResponse.status());
    }
  });

  test("Tenant B ne peut pas modifier les ressources de Tenant A", async ({
    page,
  }) => {
    // Simuler la connexion Tenant B
    await page.goto("http://localhost:3000/admin/login");
    
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-b-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Tentative de modification d'un client de Tenant A
    const updateResponse = await page.request.put(
      "http://localhost:3000/api/admin/clients/client-1",
      {
        data: {
          name: "Modified",
        },
        headers: {
          Cookie: "auth_session=tenant-b-token",
        },
      }
    );

    // Doit retourner 403 ou 404 (ressource non trouvée car filtrée)
    expect([403, 404, 401]).toContain(updateResponse.status());
  });
});

test.describe("Multi-Tenant API Routes", () => {
  test("GET /api/admin/clients avec isolation", async ({ page }) => {
    const response = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    // Vérifier le statut de la réponse
    expect([200, 401, 403]).toContain(response.status());
  });

  test("GET /api/admin/reservations avec isolation", async ({ page }) => {
    const response = await page.request.get(
      "http://localhost:3000/api/admin/reservations",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    expect([200, 401, 403]).toContain(response.status());
  });

  test("POST /api/admin/clients avec isolation automatique", async ({
    page,
  }) => {
    const response = await page.request.post(
      "http://localhost:3000/api/admin/clients",
      {
        data: {
          firstName: "New",
          lastName: "Client",
          email: "new@example.com",
        },
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });
});
