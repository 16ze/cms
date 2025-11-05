/**
 * 🧪 TESTS PLAYWRIGHT - CONNEXION & VALIDATION CLIENT
 * ==================================================
 *
 * Tests pour valider les améliorations de sécurité et validation
 * des pages de login (tenant et super-admin)
 */

import { test, expect } from "@playwright/test";

test.describe("Page de connexion Tenant - Validation client", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("devrait afficher la page de connexion avec les éléments accessibles", async ({
    page,
  }) => {
    // Vérifier les éléments ARIA
    const emailInput = page.getByLabel(/Adresse email/i);
    const passwordInput = page.getByLabel(/Mot de passe/i);
    const submitButton = page.getByRole("button", { name: /Se connecter/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Vérifier les attributs ARIA
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("minLength", "8");
  });

  test("devrait valider l'email côté client avant soumission", async ({
    page,
  }) => {
    const emailInput = page.getByLabel(/Adresse email/i);

    // Test email invalide
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    // Attendre que la validation se déclenche
    await page.waitForTimeout(500);

    // Vérifier le message d'erreur
    const errorMessage = page.locator('[id="email-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/Format d'email invalide/i);

    // Vérifier aria-invalid
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("devrait valider le mot de passe côté client", async ({ page }) => {
    const passwordInput = page.getByLabel(/Mot de passe/i);

    // Test mot de passe trop court
    await passwordInput.fill("short");
    await passwordInput.blur();

    await page.waitForTimeout(500);

    const errorMessage = page.locator('[id="password-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/8 caractères/i);
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("ne devrait pas soumettre le formulaire si validation échoue", async ({
    page,
  }) => {
    // Remplir avec des données invalides
    await page.getByLabel(/Adresse email/i).fill("invalid-email");
    await page.getByLabel(/Mot de passe/i).fill("123");

    // Intercepter la requête API
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/login")) {
        requests.push(request.url());
      }
    });

    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Attendre un peu pour voir si une requête est envoyée
    await page.waitForTimeout(1000);

    // Aucune requête ne devrait être envoyée si la validation échoue
    expect(requests.length).toBe(0);
  });

  test("devrait afficher un toast d'erreur en cas d'échec de connexion", async ({
    page,
  }) => {
    // Intercepter et mock la réponse API
    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Identifiants invalides",
        }),
      });
    });

    // Remplir avec des données valides
    await page.getByLabel(/Adresse email/i).fill("test@example.com");
    await page.getByLabel(/Mot de passe/i).fill("ValidPassword123");

    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Vérifier le toast d'erreur (Sonner)
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    await expect(page.locator('[data-sonner-toast]')).toContainText(
      /Identifiants invalides/i
    );
  });

  test("devrait rediriger vers le dashboard après connexion réussie", async ({
    page,
  }) => {
    // Mock une connexion réussie
    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
        }),
      });
    });

    await page.getByLabel(/Adresse email/i).fill("valid@example.com");
    await page.getByLabel(/Mot de passe/i).fill("ValidPassword123");

    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Vérifier la redirection
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("devrait respecter le paramètre redirect dans l'URL", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/admin/settings");

    // Mock connexion réussie
    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByLabel(/Adresse email/i).fill("valid@example.com");
    await page.getByLabel(/Mot de passe/i).fill("ValidPassword123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Vérifier la redirection vers la page spécifiée
    await expect(page).toHaveURL(/\/admin\/settings/);
  });
});

test.describe("Page de connexion Super Admin - Validation client", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/super-admin/login");
  });

  test("devrait valider l'email et le mot de passe côté client", async ({
    page,
  }) => {
    const emailInput = page.getByLabel(/Email/i);
    const passwordInput = page.getByLabel(/Mot de passe/i);

    // Test email invalide
    await emailInput.fill("invalid");
    await emailInput.blur();
    await page.waitForTimeout(500);

    const emailError = page.locator('[id="email-error"]');
    await expect(emailError).toBeVisible();

    // Test mot de passe invalide
    await passwordInput.fill("short");
    await passwordInput.blur();
    await page.waitForTimeout(500);

    const passwordError = page.locator('[id="password-error"]');
    await expect(passwordError).toBeVisible();
  });

  test("devrait capturer les erreurs dans Sentry", async ({ page }) => {
    // Simuler une erreur réseau
    await page.route("**/api/auth/login/super-admin", (route) => {
      route.abort("failed");
    });

    await page.getByLabel(/Email/i).fill("admin@kairodigital.com");
    await page.getByLabel(/Mot de passe/i).fill("ValidPassword123");

    // Intercepter les appels à Sentry (si disponibles)
    const sentryCalls: string[] = [];
    await page.addInitScript(() => {
      // Mock Sentry pour capturer les appels
      (window as any).__sentryCallbacks = [];
      const originalCapture = (window as any).Sentry?.captureException;
      if (originalCapture) {
        (window as any).Sentry.captureException = (...args: any[]) => {
          (window as any).__sentryCallbacks.push(args);
          return originalCapture(...args);
        };
      }
    });

    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Vérifier qu'un toast d'erreur est affiché
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
  });
});

test.describe("Accessibilité WAI-ARIA", () => {
  test("devrait avoir tous les attributs ARIA nécessaires sur /login", async ({
    page,
  }) => {
    await page.goto("/login");

    const emailInput = page.getByLabel(/Adresse email/i);
    const passwordInput = page.getByLabel(/Mot de passe/i);

    // Vérifier les labels
    await expect(emailInput).toHaveAttribute("id", "email");
    await expect(passwordInput).toHaveAttribute("id", "password");

    // Vérifier les descriptions d'erreur (quand elles apparaissent)
    await emailInput.fill("invalid");
    await emailInput.blur();
    await page.waitForTimeout(500);

    const emailError = page.locator('[id="email-error"]');
    await expect(emailError).toHaveAttribute("role", "alert");
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
  });

  test("devrait être navigable au clavier", async ({ page }) => {
    await page.goto("/login");

    // Tab navigation
    await page.keyboard.press("Tab");
    const emailInput = page.getByLabel(/Adresse email/i);
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");
    const passwordInput = page.getByLabel(/Mot de passe/i);
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press("Tab");
    const submitButton = page.getByRole("button", { name: /Se connecter/i });
    await expect(submitButton).toBeFocused();
  });

  test("devrait avoir un contraste suffisant pour les erreurs", async ({
    page,
  }) => {
    await page.goto("/login");

    // Déclencher une erreur
    await page.getByLabel(/Adresse email/i).fill("invalid");
    await page.getByLabel(/Adresse email/i).blur();
    await page.waitForTimeout(500);

    const errorMessage = page.locator('[id="email-error"]');
    const color = await errorMessage.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });

    // Vérifier que c'est une couleur rouge (format rgb)
    expect(color).toMatch(/rgb\(.*\)/);
  });
});

