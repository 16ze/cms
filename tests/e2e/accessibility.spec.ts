/**
 * 🧪 TESTS PLAYWRIGHT - ACCESSIBILITÉ WAI-ARIA
 * ============================================
 *
 * Tests d'accessibilité utilisant axe-playwright pour valider
 * la conformité WCAG
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibilité - Page de connexion", () => {
  test("devrait être conforme WCAG 2.1 niveau AA", async ({ page }) => {
    await page.goto("/login");

    // Analyser avec axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("devrait avoir tous les éléments avec des labels appropriés", async ({
    page,
  }) => {
    await page.goto("/login");

    // Vérifier que tous les inputs ont des labels
    const emailInput = page.getByLabel(/Adresse email/i);
    const passwordInput = page.getByLabel(/Mot de passe/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Vérifier les attributs ARIA
    await expect(emailInput).toHaveAttribute("aria-label").or(
      await expect(page.locator('label[for="email"]')).toBeVisible()
    );
  });

  test("devrait être navigable au clavier uniquement", async ({ page }) => {
    await page.goto("/login");

    // Navigation Tab
    await page.keyboard.press("Tab");
    await expect(page.locator("input[type='email']")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator("input[type='password']")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /Se connecter/i })).toBeFocused();

    // Soumettre avec Enter
    await page.keyboard.press("Enter");
  });

  test("devrait annoncer les erreurs aux lecteurs d'écran", async ({ page }) => {
    await page.goto("/login");

    // Déclencher une erreur de validation
    const emailInput = page.getByLabel(/Adresse email/i);
    await emailInput.fill("invalid-email");
    await emailInput.blur();

    await page.waitForTimeout(500);

    // Vérifier que le message d'erreur a role="alert"
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();

    // Vérifier que l'input a aria-invalid="true"
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  test("devrait avoir un contraste suffisant", async ({ page }) => {
    await page.goto("/login");

    // Analyser le contraste avec axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    // Filtrer les violations de contraste
    const contrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast"
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe("Accessibilité - Dashboard Admin", () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion
    await page.goto("/login");

    await page.route("**/api/auth/login/tenant", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
        headers: {
          "Set-Cookie": "admin_session=test-session; Path=/; HttpOnly",
        },
      });
    });

    await page.getByLabel(/Adresse email/i).fill("admin@example.com");
    await page.getByLabel(/Mot de passe/i).fill("ValidPassword123");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("devrait être conforme WCAG sur le dashboard", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("devrait avoir une navigation clavier fonctionnelle", async ({
    page,
  }) => {
    // Trouver le menu de navigation
    const navLinks = page.locator("nav a, aside a");

    // Naviguer avec Tab
    await page.keyboard.press("Tab");

    // Vérifier qu'un élément est focusable
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("devrait avoir des landmarks ARIA appropriés", async ({ page }) => {
    // Vérifier la présence de landmarks
    const main = page.locator("main, [role='main']");
    const navigation = page.locator("nav, [role='navigation']");

    await expect(main.or(navigation)).toBeVisible();
  });
});

test.describe("Accessibilité - Responsive", () => {
  test("devrait être accessible sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("devrait avoir des zones de touch suffisantes sur mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");

    const submitButton = page.getByRole("button", { name: /Se connecter/i });
    const box = await submitButton.boundingBox();

    if (box) {
      // Vérifier que la zone de touch est au moins 44x44px (recommandation WCAG)
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

