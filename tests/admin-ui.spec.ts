import { test, expect, Page } from "@playwright/test";

// Configuration des tests d'interface administrateur
test.describe("Interface administrateur", () => {
  // Fonction d'authentification réutilisable
  async function adminLogin(page: Page) {
    await page.goto("/admin/login");
    await page.getByLabel(/Email/i).fill("contact.kairodigital@gmail.com");
    await page.getByLabel(/Mot de passe/i).fill("admin123");
    await page.getByRole("button", { name: /Se connecter|Connexion/i }).click();
    // Attendre que le dashboard soit chargé
    await expect(
      page.getByRole("heading", { name: /Tableau de bord/i })
    ).toBeVisible();
  }

  test("vérifie la cohérence de la barre latérale sur toutes les pages admin", async ({
    page,
  }) => {
    // Se connecter d'abord
    await adminLogin(page);

    // Liste des pages à tester
    const pages = [
      { url: "/admin/dashboard", title: "Tableau de bord" },
      { url: "/admin/portfolio", title: "Gestion du Portfolio" },
      { url: "/admin/blog", title: "Gestion du Blog" },
      { url: "/admin/reservations", title: "Gestion des Réservations" },
      { url: "/admin/settings", title: "Paramètres" },
    ];

    // Tester chaque page
    for (const pageInfo of pages) {
      // Naviguer vers la page
      await page.goto(pageInfo.url);

      // Vérifier que le titre de la page est correct
      await expect(
        page.getByRole("heading", { name: new RegExp(pageInfo.title, "i") })
      ).toBeVisible();

      // Vérifier que la barre latérale est présente et identique
      await expect(page.locator("aside")).toBeVisible();

      // Vérifier que tous les liens de navigation sont présents
      await expect(page.locator("aside").getByText("Dashboard")).toBeVisible();
      await expect(page.locator("aside").getByText("Portfolio")).toBeVisible();
      await expect(page.locator("aside").getByText("Blog")).toBeVisible();
      await expect(
        page.locator("aside").getByText("Réservations")
      ).toBeVisible();
      await expect(page.locator("aside").getByText("Paramètres")).toBeVisible();

      // Vérifier que le bouton de déconnexion est présent
      await expect(
        page.locator("aside").getByText("Déconnexion")
      ).toBeVisible();
    }
  });

  test("vérifie le responsive design sur toutes les pages", async ({
    page,
  }) => {
    // Se connecter
    await adminLogin(page);

    // Liste des pages à tester
    const pages = [
      "/admin/dashboard",
      "/admin/portfolio",
      "/admin/blog",
      "/admin/reservations",
      "/admin/settings",
    ];

    // Tailles d'écran à tester
    const screenSizes = [
      { width: 1920, height: 1080, name: "desktop" },
      { width: 1024, height: 768, name: "tablet" },
      { width: 375, height: 667, name: "mobile" },
    ];

    // Tester chaque page à chaque taille d'écran
    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      for (const size of screenSizes) {
        // Changer la taille de l'écran
        await page.setViewportSize({ width: size.width, height: size.height });

        if (size.name === "desktop") {
          // Sur desktop, vérifier que la barre latérale est visible
          await expect(page.locator("aside")).toBeVisible();
          // Le contenu principal doit avoir un grand padding gauche pour accommoder la sidebar
          await expect(page.locator("main")).toHaveClass(/lg:ml-64/);
        } else if (size.name === "mobile") {
          // Sur mobile, vérifier que la barre latérale est cachée
          await expect(page.locator("aside")).not.toBeInViewport();
          // Le bouton de menu doit être visible
          await expect(page.locator("button[aria-label='Menu']")).toBeVisible();
        }

        // Vérifier que le contenu principal est visible
        await expect(page.locator("main")).toBeVisible();
      }
    }
  });

  test("vérifie l'accessibilité des éléments d'interface", async ({ page }) => {
    // Se connecter
    await adminLogin(page);

    // Vérifier que les éléments d'interface sont accessibles avec le clavier

    // Accéder à une page avec des formulaires (paramètres)
    await page.goto("/admin/settings");

    // Vérifier que les champs de formulaire sont focusables
    await page.keyboard.press("Tab"); // Premier élément
    await page.keyboard.press("Tab"); // Deuxième élément

    // Vérifier qu'on peut interagir avec les onglets
    await page.getByRole("tab", { name: /Réseaux/i }).click();
    await expect(page.getByLabel(/Facebook/i)).toBeVisible();

    await page.getByRole("tab", { name: /SEO/i }).click();
    await expect(page.getByLabel(/Titre/i)).toBeVisible();

    // Vérifier que les boutons d'action sont accessible
    await expect(
      page.getByRole("button", { name: /Enregistrer/i })
    ).toBeEnabled();
  });

  test("vérifie que tous les liens de navigation fonctionnent", async ({
    page,
  }) => {
    // Se connecter
    await adminLogin(page);

    // Tester chaque lien de navigation dans la barre latérale
    const navLinks = [
      { text: "Dashboard", url: "/admin/dashboard" },
      { text: "Réservations", url: "/admin/reservations" },
      { text: "Portfolio", url: "/admin/portfolio" },
      { text: "Blog", url: "/admin/blog" },
      { text: "Paramètres", url: "/admin/settings" },
    ];

    for (const link of navLinks) {
      // Cliquer sur le lien
      await page.getByRole("link", { name: link.text }).click();

      // Vérifier que la navigation a fonctionné
      await expect(page).toHaveURL(new RegExp(link.url));

      // Vérifier que le lien actif est mis en évidence
      await expect(page.locator(`a[href='${link.url}']`)).toHaveClass(
        /text-blue-600/
      );
    }
  });
});
