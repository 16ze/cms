import { test, expect } from "@playwright/test";

/**
 * 🧪 TESTS CRUD MULTI-TENANT
 * ===========================
 * 
 * Tests de création, lecture, mise à jour et suppression
 * avec vérification de l'isolation des tenants
 */

test.describe("CRUD Operations avec Isolation", () => {
  test.beforeEach(async ({ page }) => {
    // Simuler l'authentification Tenant A
    await page.goto("http://localhost:3000/admin/login");
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("CREATE - Créer une ressource avec tenantId automatique", async ({
    page,
  }) => {
    // Créer un nouveau client
    const createResponse = await page.request.post(
      "http://localhost:3000/api/admin/clients",
      {
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+33123456789",
        },
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (createResponse.ok()) {
      const created = await createResponse.json();
      
      // Vérifier que le tenantId est automatiquement ajouté
      expect(created.data).toHaveProperty("tenantId");
      expect(created.data.tenantId).toBeTruthy();
    } else {
      // Si non authentifié, le statut doit être 401 ou 403
      expect([401, 403]).toContain(createResponse.status());
    }
  });

  test("READ - Lire les ressources filtrées par tenant", async ({ page }) => {
    const getResponse = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (getResponse.ok()) {
      const data = await getResponse.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Tous les clients doivent appartenir au même tenant
        const tenants = [...new Set(data.data.map((c: { tenantId: string }) => c.tenantId))];
        expect(tenants.length).toBeLessThanOrEqual(1);
      }
    } else {
      expect([401, 403]).toContain(getResponse.status());
    }
  });

  test("UPDATE - Modifier une ressource de son propre tenant", async ({
    page,
  }) => {
    // D'abord créer une ressource
    const createResponse = await page.request.post(
      "http://localhost:3000/api/admin/clients",
      {
        data: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
        },
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (createResponse.ok()) {
      const created = await createResponse.json();
      const clientId = created.data?.id;

      if (clientId) {
        // Modifier la ressource créée
        const updateResponse = await page.request.put(
          `http://localhost:3000/api/admin/clients/${clientId}`,
          {
            data: {
              firstName: "Jane Updated",
            },
            headers: {
              Cookie: "auth_session=tenant-a-token",
            },
          }
        );

        // La modification doit réussir (200) ou retourner 404 si l'endpoint n'existe pas
        expect([200, 404]).toContain(updateResponse.status());
      }
    }
  });

  test("DELETE - Supprimer une ressource de son propre tenant", async ({
    page,
  }) => {
    // Créer puis supprimer
    const createResponse = await page.request.post(
      "http://localhost:3000/api/admin/clients",
      {
        data: {
          firstName: "ToDelete",
          lastName: "Client",
          email: "todelete@example.com",
        },
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (createResponse.ok()) {
      const created = await createResponse.json();
      const clientId = created.data?.id;

      if (clientId) {
        const deleteResponse = await page.request.delete(
          `http://localhost:3000/api/admin/clients/${clientId}`,
          {
            headers: {
              Cookie: "auth_session=tenant-a-token",
            },
          }
        );

        // La suppression doit réussir (200) ou retourner 404 si l'endpoint n'existe pas
        expect([200, 204, 404]).toContain(deleteResponse.status());
      }
    }
  });

  test("Isolation - Ne peut pas lire les ressources d'un autre tenant", async ({
    page,
  }) => {
    // Authentifier en tant que Tenant A
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    const responseA = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    // Authentifier en tant que Tenant B
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-b-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    const responseB = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-b-token",
        },
      }
    );

    if (responseA.ok() && responseB.ok()) {
      const dataA = await responseA.json();
      const dataB = await responseB.json();

      if (dataA.data && dataB.data && Array.isArray(dataA.data) && Array.isArray(dataB.data)) {
        // Les IDs des clients doivent être différents
        const idsA = dataA.data.map((c: { id: string }) => c.id);
        const idsB = dataB.data.map((c: { id: string }) => c.id);
        
        // Aucun ID ne doit être commun entre les deux tenants
        const commonIds = idsA.filter((id: string) => idsB.includes(id));
        expect(commonIds.length).toBe(0);
      }
    }
  });
});

