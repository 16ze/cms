import { test, expect } from "@playwright/test";

// Tests d'authentification administrateur
test.describe("Authentification administrateur", () => {
  test.beforeEach(async ({ page }) => {
    // Accéder directement à la page de connexion admin
    await page.goto("/admin/login");
  });

  test("affiche correctement la page de connexion admin", async ({ page }) => {
    // Vérifier le titre et le contenu de la page
    await expect(page).toHaveTitle(/Administration|Admin|KAIRO Digital/);

    // Vérifier que le formulaire de connexion est présent
    await expect(
      page.getByRole("heading", { name: /Espace Administration/i })
    ).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Se connecter|Connexion/i })
    ).toBeVisible();
  });

  test("devrait afficher une erreur si les champs sont vides", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.click("button[type='submit']");
    await expect(
      page.locator("text=Veuillez remplir tous les champs")
    ).toBeVisible();
  });

  test("devrait afficher une erreur si les identifiants sont incorrects", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.fill("input[name='email']", "wrong@example.com");
    await page.fill("input[name='password']", "wrongpassword");
    await page.locator("button[type='submit']").click();
    await expect(
      page.locator("text=Email ou mot de passe incorrect")
    ).toBeVisible();
  });

  test("connecte l'administrateur avec succès et déconnecte", async ({
    page,
  }) => {
    // Remplir le formulaire avec les bons identifiants
    await page.getByLabel(/Email/i).fill("contact.kairodigital@gmail.com");
    await page.getByLabel(/Mot de passe/i).fill("admin123");

    // Soumettre le formulaire
    await page.getByRole("button", { name: /Se connecter|Connexion/i }).click();

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Vérifier que le dashboard est bien chargé
    await expect(
      page.getByRole("heading", { name: /Tableau de bord/i })
    ).toBeVisible();

    // Test de navigation
    await page.getByText(/Paramètres/i).click();
    await expect(page).toHaveURL(/\/admin\/settings/);

    // Test de déconnexion
    await page.getByText(/Déconnexion/i).click();

    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("vérifie le responsive de la barre latérale", async ({ page }) => {
    // Connexion admin
    await page.getByLabel(/Email/i).fill("contact.kairodigital@gmail.com");
    await page.getByLabel(/Mot de passe/i).fill("admin123");
    await page.getByRole("button", { name: /Se connecter|Connexion/i }).click();

    // Vérifier que nous sommes sur le dashboard
    await expect(
      page.getByRole("heading", { name: /Tableau de bord/i })
    ).toBeVisible();

    // Tester sur desktop (sidebar visible)
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator("aside")).toBeVisible();

    // Tester sur mobile (sidebar cachée, bouton hamburger visible)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("aside")).not.toBeVisible();

    // Le bouton hamburger doit être visible
    const menuButton = page.locator("button[aria-label='Menu']");
    await expect(menuButton).toBeVisible();

    // Cliquer sur le bouton pour ouvrir le menu
    await menuButton.click();

    // La sidebar doit maintenant être visible
    await expect(page.locator("aside")).toBeVisible();

    // Fermer le menu en cliquant sur le bouton X
    await page.locator("button").filter({ hasText: "✕" }).click();

    // La sidebar doit à nouveau être cachée
    await expect(page.locator("aside")).not.toBeVisible();
  });
});
