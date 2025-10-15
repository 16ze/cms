import { test, expect } from "@playwright/test";

test.describe("Formulaire de contact", () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de contact avant chaque test
    await page.goto("/contact");
  });

  test("la page de contact se charge correctement", async ({ page }) => {
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Contact | KAIRO Digital/);

    // Vérifier que le formulaire est présent
    const contactForm = await page.locator("form");
    await expect(contactForm).toBeVisible();

    // Vérifier la présence des champs obligatoires
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();

    // Vérifier la présence du bouton d'envoi
    const submitButton = await page.getByRole("button", { name: /Envoyer/i });
    await expect(submitButton).toBeVisible();
  });

  test("affiche des erreurs pour les champs obligatoires vides", async ({
    page,
  }) => {
    // Cliquer sur le bouton d'envoi sans remplir les champs
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Vérifier que les messages d'erreur apparaissent
    await expect(page.locator("text=Le nom est requis")).toBeVisible();
    await expect(page.locator("text=L'email est requis")).toBeVisible();
    await expect(page.locator("text=Le message est requis")).toBeVisible();
  });

  test("valide le format de l'email", async ({ page }) => {
    // Remplir le champ email avec un format invalide
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="email"]').fill("invalid-email");
    await page
      .locator('textarea[name="message"]')
      .fill("Ceci est un message de test");

    // Soumettre le formulaire
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Vérifier que le message d'erreur pour l'email apparaît
    await expect(page.locator("text=Format d'email invalide")).toBeVisible();
  });

  test("soumet le formulaire avec succès avec des données valides", async ({
    page,
  }) => {
    // Intercepter les requêtes API
    await page.route("**/api/contact", async (route) => {
      // Simuler une réponse réussie
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Message envoyé avec succès",
        }),
      });
    });

    // Remplir tous les champs requis
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page
      .locator('textarea[name="message"]')
      .fill("Ceci est un message de test valide");

    // Si présent, cocher la case GDPR
    const gdprCheckbox = page.locator('input[name="gdprConsent"]');
    if (await gdprCheckbox.isVisible()) {
      await gdprCheckbox.check();
    }

    // Soumettre le formulaire
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Vérifier qu'un message de succès apparaît
    await expect(page.locator("text=Message envoyé avec succès")).toBeVisible({
      timeout: 5000,
    });
  });

  test("gère correctement les erreurs du serveur", async ({ page }) => {
    // Intercepter les requêtes API et simuler une erreur
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Erreur serveur" }),
      });
    });

    // Remplir tous les champs requis
    await page.locator('input[name="name"]').fill("Test User");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page
      .locator('textarea[name="message"]')
      .fill("Ceci est un message de test");

    // Si présent, cocher la case GDPR
    const gdprCheckbox = page.locator('input[name="gdprConsent"]');
    if (await gdprCheckbox.isVisible()) {
      await gdprCheckbox.check();
    }

    // Soumettre le formulaire
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator("text=Une erreur s'est produite")).toBeVisible({
      timeout: 5000,
    });
  });
});
