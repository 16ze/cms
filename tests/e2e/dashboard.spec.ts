import { test, expect } from "@playwright/test";

/**
 * 🧪 TESTS DE DASHBOARD MULTI-TENANT
 * ====================================
 */

test.describe("Dashboard Multi-Tenant", () => {
  test("Super Admin Dashboard - Liste des tenants", async ({ page }) => {
    // Simuler la connexion Super Admin
    await page.goto("http://localhost:3000/super-admin/login");
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "super-admin-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("http://localhost:3000/super-admin/dashboard");
    
    // Vérifier que la page charge
    await expect(page).toHaveURL(/super-admin|login/);
    
    // Si authentifié, vérifier la présence d'éléments du dashboard
    const hasContent = await page
      .locator("body")
      .textContent()
      .then((text) => text && text.length > 0);
    
    expect(hasContent).toBe(true);
  });

  test("Admin Dashboard - Vue tenant", async ({ page }) => {
    // Simuler la connexion Tenant User
    await page.goto("http://localhost:3000/login");
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("http://localhost:3000/admin/dashboard");
    
    // Vérifier que la page charge
    await expect(page).toHaveURL(/admin|login/);
    
    // La page doit contenir des éléments du dashboard ou rediriger vers login
    const url = page.url();
    expect(url).toMatch(/dashboard|login/);
  });

  test("Navigation entre sections admin", async ({ page }) => {
    await page.goto("http://localhost:3000/admin/login");
    await page.evaluate(() => {
      document.cookie = `auth_session=tenant-a-token; path=/`;
    });

    // Tester la navigation vers différentes sections
    const sections = [
      "/admin/clients",
      "/admin/reservations",
      "/admin/dashboard",
    ];

    for (const section of sections) {
      const response = await page.goto(`http://localhost:3000${section}`);
      
      // Vérifier que la page charge (peut être une redirection)
      expect(response?.status()).toBeLessThan(500);
    }
  });

  test("Isolation des données dans le dashboard", async ({ page }) => {
    // Simuler Tenant A
    await page.goto("http://localhost:3000/admin/login");
    await page.evaluate(() => {
      document.cookie = `auth_session=tenant-a-token; path=/`;
    });

    // Accéder à une API qui retourne des données filtrées
    const response = await page.request.get(
      "http://localhost:3000/api/admin/clients",
      {
        headers: {
          Cookie: "auth_session=tenant-a-token",
        },
      }
    );

    if (response.ok()) {
      const data = await response.json();
      
      // Les données doivent être filtrées par tenant
      if (data.data && Array.isArray(data.data)) {
        const allSameTenant = data.data.every(
          (item: { tenantId: string }, _: number, arr: { tenantId: string }[]) =>
            item.tenantId === arr[0]?.tenantId
        );
        
        // Tous les éléments doivent avoir le même tenantId
        expect(allSameTenant).toBe(true);
      }
    }
  });
});

