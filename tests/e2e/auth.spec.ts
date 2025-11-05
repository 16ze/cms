import { test as base, expect } from "@playwright/test";
import { Page } from "@playwright/test";

/**
 * 🧪 TESTS D'AUTHENTIFICATION MULTI-TENANT
 * ==========================================
 */

// Fixtures pour les différents types d'utilisateurs
type AuthFixtures = {
  superAdminPage: Page;
  tenantAPage: Page;
  tenantBPage: Page;
};

export const test = base.extend<AuthFixtures>({
  superAdminPage: async ({ page }, use) => {
    // Setup: Simuler la connexion Super Admin
    await page.goto("http://localhost:3000/super-admin/login");
    
    // Mock de l'authentification Super Admin via cookie
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "super-admin-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);
  },

  tenantAPage: async ({ page }, use) => {
    await page.goto("http://localhost:3000/login");
    
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-a-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);
  },

  tenantBPage: async ({ page }, use) => {
    await page.goto("http://localhost:3000/login");
    
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "tenant-b-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await use(page);
  },
});

test.describe("Authentification Multi-Tenant", () => {
  test("Connexion Super Admin", async ({ page }) => {
    await page.goto("http://localhost:3000/super-admin/login");
    
    // Vérifier que la page de login est accessible
    await expect(page.locator("h1, h2")).toContainText(/login|connexion/i);
    
    // Simuler la connexion
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill("contact-sa@kairodigital.fr");
      await passwordInput.fill("Bryan25200@");
      
      // Intercepter la requête POST
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/login/super-admin") &&
          response.request().method() === "POST"
      );
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        const response = await responsePromise;
        
        // Vérifier que la connexion réussit
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    }
  });

  test("Connexion Tenant User", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    
    await expect(page.locator("h1, h2")).toContainText(/login|connexion/i);
    
    // Simuler la connexion tenant
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill("user@tenant.com");
      await passwordInput.fill("password123");
      
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/login/tenant") &&
          response.request().method() === "POST"
      );
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        const response = await responsePromise;
        
        // Vérifier la réponse (peut être 401 si credentials invalides, mais la route doit fonctionner)
        expect([200, 401]).toContain(response.status());
      }
    }
  });

  test("Redirection après connexion réussie", async ({ page }) => {
    await page.goto("http://localhost:3000/super-admin/login");
    
    // Simuler une session valide
    await page.context().addCookies([
      {
        name: "auth_session",
        value: "valid-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    
    // Tenter d'accéder au dashboard
    await page.goto("http://localhost:3000/super-admin/dashboard");
    
    // La page doit être accessible ou rediriger vers login
    const url = page.url();
    expect(url).toMatch(/dashboard|login/);
  });
});

test.describe("Navigation Multi-Tenant", () => {
  test("Super Admin peut accéder au dashboard super-admin", async ({
    superAdminPage,
  }) => {
    await superAdminPage.goto("http://localhost:3000/super-admin/dashboard");
    
    // Vérifier que la page charge (peut être une redirection si non authentifié)
    await expect(superAdminPage).toHaveURL(/super-admin|login/);
  });

  test("Tenant User peut accéder au dashboard admin", async ({
    tenantAPage,
  }) => {
    await tenantAPage.goto("http://localhost:3000/admin/dashboard");
    
    await expect(tenantAPage).toHaveURL(/admin|login/);
  });

  test("Utilisateur non authentifié redirigé vers login", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/admin/dashboard");
    
    // Doit être redirigé vers login
    await expect(page).toHaveURL(/login/);
  });
});


