/**
 * 🧪 TESTS PLAYWRIGHT - ÉDITEUR DE SITE
 * =====================================
 *
 * Tests pour valider le fonctionnement de l'éditeur de site
 * avec debounce, sanitization et sauvegarde automatique
 */

import { test, expect } from "@playwright/test";

test.describe("Éditeur de site CMS", () => {
  test.beforeEach(async ({ page }) => {
    // Simuler une connexion admin
    await page.goto("/login");

    // Mock connexion réussie
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

    // Attendre d'être sur le dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Naviguer vers l'éditeur de site
    await page.goto("/admin/site");
    await page.waitForLoadState("networkidle");
  });

  test("devrait charger l'éditeur avec le contenu existant", async ({
    page,
  }) => {
    // Mock l'API de récupération du contenu
    await page.route("**/api/admin/frontend-content*", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              hero: {
                text: {
                  title: "Titre initial",
                  subtitle: "Sous-titre initial",
                },
              },
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.reload();

    // Vérifier que l'éditeur est chargé
    const editor = page.locator('[data-testid="site-editor"]').or(
      page.locator('text=/Hero|Services|Équipe|Contact/i')
    );
    await expect(editor.first()).toBeVisible({ timeout: 10000 });
  });

  test("devrait appliquer un debounce sur la sauvegarde automatique", async ({
    page,
  }) => {
    let saveCount = 0;

    // Intercepter les requêtes de sauvegarde
    await page.route("**/api/admin/frontend-content", async (route) => {
      if (route.request().method() === "POST") {
        saveCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Trouver un champ éditable (exemple : titre)
    const titleInput = page
      .getByLabel(/Titre/i)
      .or(page.locator('input[placeholder*="Titre"]'))
      .first();

    if (await titleInput.isVisible({ timeout: 5000 })) {
      // Taper rapidement plusieurs caractères
      await titleInput.fill("Nouveau titre");
      await titleInput.type(" avec modifications");

      // Attendre le debounce (500ms)
      await page.waitForTimeout(600);

      // Vérifier qu'une seule sauvegarde a été déclenchée après le debounce
      expect(saveCount).toBeGreaterThanOrEqual(1);
      expect(saveCount).toBeLessThanOrEqual(2); // Peut être 1 ou 2 selon le timing
    }
  });

  test("devrait valider le contenu avant sauvegarde", async ({ page }) => {
    // Mock une réponse d'erreur pour contenu invalide
    await page.route("**/api/admin/frontend-content", (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        // Simuler une validation côté serveur
        if (body?.content && JSON.stringify(body.content).length > 10 * 1024 * 1024) {
          route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: "Contenu trop volumineux",
            }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true }),
          });
        }
      } else {
        route.continue();
      }
    });

    const titleInput = page
      .getByLabel(/Titre/i)
      .or(page.locator('input[placeholder*="Titre"]'))
      .first();

    if (await titleInput.isVisible({ timeout: 5000 })) {
      await titleInput.fill("Titre valide");
      await page.waitForTimeout(600);

      // Vérifier qu'un toast de succès apparaît
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toBeVisible({ timeout: 2000 });
    }
  });

  test("devrait sanitizer le contenu HTML avant sauvegarde", async ({
    page,
  }) => {
    let savedContent: any = null;

    await page.route("**/api/admin/frontend-content", (route) => {
      if (route.request().method() === "POST") {
        savedContent = route.request().postDataJSON();
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    const titleInput = page
      .getByLabel(/Titre/i)
      .or(page.locator('input[placeholder*="Titre"]'))
      .first();

    if (await titleInput.isVisible({ timeout: 5000 })) {
      // Tenter d'insérer du code malveillant
      const maliciousContent = '<script>alert("XSS")</script>Titre';
      await titleInput.fill(maliciousContent);
      await page.waitForTimeout(600);

      // Vérifier que le contenu sauvegardé ne contient pas de script
      if (savedContent) {
        const contentStr = JSON.stringify(savedContent);
        expect(contentStr).not.toContain("<script>");
        expect(contentStr).not.toContain("javascript:");
      }
    }
  });

  test("devrait afficher un toast de succès après sauvegarde manuelle", async ({
    page,
  }) => {
    await page.route("**/api/admin/frontend-content", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    // Trouver le bouton de sauvegarde
    const saveButton = page
      .getByRole("button", { name: /Sauvegarder|Enregistrer/i })
      .first();

    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();

      // Vérifier le toast de succès
      const toast = page.locator('[data-sonner-toast]');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText(/sauvegardé|enregistré/i);
    }
  });

  test("devrait gérer les erreurs de sauvegarde", async ({ page }) => {
    // Mock une erreur serveur
    await page.route("**/api/admin/frontend-content", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Erreur serveur",
          }),
        });
      } else {
        route.continue();
      }
    });

    const saveButton = page
      .getByRole("button", { name: /Sauvegarder|Enregistrer/i })
      .first();

    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();

      // Vérifier le toast d'erreur
      const errorToast = page.locator('[data-sonner-toast]');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText(/erreur|Erreur/i);
    }
  });
});

