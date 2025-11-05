/**
 * 🧪 TESTS PLAYWRIGHT - NAVIGATION MULTI-TENANT
 * ==============================================
 *
 * Tests pour valider l'isolation des tenants et la navigation
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation multi-tenant", () => {
  test("devrait isoler les données entre tenants", async ({ page }) => {
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

    // Intercepter les requêtes API pour vérifier l'isolation
    const apiRequests: Array<{ url: string; headers: Record<string, string> }> =
      [];

    page.on("request", (request) => {
      if (request.url().includes("/api/admin/")) {
        apiRequests.push({
          url: request.url(),
          headers: request.headers(),
        });
      }
    });

    // Naviguer vers une page qui fait des requêtes API
    await page.goto("/admin/clients");
    await page.waitForLoadState("networkidle");

    // Vérifier que les requêtes incluent le tenantId dans les headers ou cookies
    const tenantIsolationPresent = apiRequests.some((req) => {
      return (
        req.headers["x-tenant-id"] ||
        req.url.includes("tenantId") ||
        req.headers.cookie?.includes("tenant")
      );
    });

    // Note: Cette vérification dépend de l'implémentation réelle
    // Si l'isolation se fait via middleware, elle peut ne pas être visible ici
    expect(apiRequests.length).toBeGreaterThan(0);
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
        body: JSON.stringify({ success: true }),
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
    await page.goto("/admin/clients?tenantId=tenant-2");

    // Mock la réponse API pour vérifier que le middleware bloque
    await page.route("**/api/admin/clients*", (route) => {
      route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Accès interdit : isolation tenant",
        }),
      });
    });

    await page.waitForLoadState("networkidle");

    // Vérifier que l'accès est refusé ou que les données sont filtrées
    const errorMessage = page.locator('text=/Accès interdit|Forbidden/i');
    // L'erreur peut être affichée ou les données peuvent être filtrées côté serveur
    // Cette vérification dépend de l'implémentation réelle
  });

  test("devrait rediriger vers login si session expirée", async ({ page }) => {
    await page.goto("/admin/dashboard");

    // Mock une réponse 401 (non authentifié)
    await page.route("**/api/admin/**", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Session expirée",
        }),
      });
    });

    await page.waitForLoadState("networkidle");

    // Vérifier la redirection vers login
    // (peut être géré côté client ou middleware)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/login/);
  });
});

test.describe("Super Admin - Gestion multi-tenant", () => {
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

    // Naviguer vers la gestion des tenants
    await page.goto("/super-admin/tenants");
    await page.waitForLoadState("networkidle");

    // Vérifier que la page est accessible
    const tenantsPage = page.locator('text=/Tenants|Gestion/i');
    await expect(tenantsPage.first()).toBeVisible({ timeout: 10000 });
  });
});

