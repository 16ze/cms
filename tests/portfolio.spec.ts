import { test, expect } from "@playwright/test";

// Marquer ces tests comme "skip" car la page de portfolio n'existe pas encore
test.describe.skip("Fonctionnalités du portfolio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio");
  });

  test("la page de portfolio affiche correctement les projets", async ({
    page,
  }) => {
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Portfolio | KAIRO Digital/);

    // Vérifier que la liste de projets est présente
    const projectsList = await page
      .locator(".project, .portfolio-item, .card, article")
      .all();
    expect(projectsList.length).toBeGreaterThan(0);

    // Vérifier que chaque projet a un titre, une image et une description
    for (const project of projectsList.slice(0, 3)) {
      // Limiter à 3 pour la performance
      // Vérifier le titre du projet
      const title = await project.locator("h2, h3").first();
      await expect(title).toBeVisible();

      // Vérifier la présence d'une image
      const image = await project.locator("img, .image-placeholder").first();
      await expect(image).toBeVisible();

      // Vérifier la présence d'une description ou d'un texte
      const description = await project.locator("p, .description").first();
      await expect(description).toBeVisible();

      // Vérifier qu'il y a un lien vers le projet
      const link = await project.locator("a").first();
      await expect(link).toBeVisible();
      expect(await link.getAttribute("href")).toBeTruthy();
    }
  });

  test("la page détaillée d'un projet s'affiche correctement", async ({
    page,
  }) => {
    // Vérifier que le titre du projet est présent
    const projectTitle = await page
      .locator(".project h2, .portfolio-item h2, .card h3, article h3")
      .first()
      .textContent();

    // Vérifier la présence d'éléments essentiels de la page de projet

    // Images du projet
    const projectImages = await page
      .locator(".project-images img, .gallery img, .carousel img, .slider img")
      .all();
    expect(projectImages.length).toBeGreaterThan(0);

    // Description détaillée
    const detailedDescription = await page
      .locator(".project-description, .content, article p")
      .first();
    await expect(detailedDescription).toBeVisible();

    // Informations sur le client ou la catégorie
    const clientInfo = await page
      .locator(".client-info, .project-meta, .details, .info")
      .first();
    await expect(clientInfo).toBeVisible();

    // Vérifier s'il y a un bouton pour revenir à la liste des projets
    const backLink = await page
      .locator(
        'a:has-text("Retour"), a:has-text("Projets"), a:has-text("Portfolio"), a:has-text("Back")'
      )
      .first();
    if (await backLink.isVisible()) {
      // Cliquer sur le lien de retour
      await backLink.click();

      // Vérifier que nous sommes revenus à la page portfolio
      await expect(page).toHaveURL(/\/portfolio\/?$/);

      // Vérifier que la liste des projets est visible
      const projects = await page
        .locator(".project, .portfolio-item, .card, article")
        .all();
      expect(projects.length).toBeGreaterThan(0);
    }
  });

  test("les projets peuvent être filtrés par catégorie", async ({ page }) => {
    // Vérifier s'il y a une section de filtrage ou de catégories
    const filterSection = await page
      .locator(".filters, .categories, .portfolio-nav, .project-categories")
      .first();

    if (await filterSection.isVisible()) {
      // Obtenir tous les filtres disponibles
      const filterButtons = await filterSection.locator("button, a").all();

      if (filterButtons.length > 0) {
        // Compter le nombre initial de projets
        const initialProjectsCount = await page
          .locator(".project, .portfolio-item, .card, article")
          .count();

        // Cliquer sur un filtre de catégorie (pas le filtre "Tous" qui est souvent le premier)
        const filterToClick =
          filterButtons.length > 1 ? filterButtons[1] : filterButtons[0];
        const categoryName = await filterToClick.textContent();
        await filterToClick.click();

        // Attendre que le filtrage soit appliqué
        await page.waitForTimeout(500);

        // Vérifier que des projets sont affichés après le filtrage
        const filteredProjectsCount = await page
          .locator(".project, .portfolio-item, .card, article")
          .count();
        expect(filteredProjectsCount).toBeGreaterThan(0);

        // Si le filtre n'est pas "Tous", vérifier que le nombre a changé
        if (
          categoryName &&
          !categoryName.includes("All") &&
          !categoryName.includes("Tous")
        ) {
          expect(filteredProjectsCount).not.toBe(initialProjectsCount);
        }

        // Vérifier que la catégorie active est mise en évidence
        await expect(filterToClick).toHaveClass(/active|selected|current/);
      } else {
        console.log(
          "Aucun bouton de filtre trouvé dans la section de filtrage."
        );
      }
    } else {
      // S'il n'y a pas de section de filtrage, vérifier qu'il y a tout de même des projets
      const projects = await page
        .locator(".project, .portfolio-item, .card, article")
        .all();
      expect(projects.length).toBeGreaterThan(0);
      console.log(
        "Pas de section de filtrage trouvée, mais des projets sont présents."
      );
    }
  });

  test("l'animation de chargement des projets fonctionne correctement", async ({
    page,
  }) => {
    // Activer l'interception des ressources pour ralentir la page artificiellement
    await page.route("**/*.{png,jpg,jpeg,webp}", (route) => {
      // Retarder le chargement des images de 500ms
      setTimeout(() => route.continue(), 500);
    });

    // Vérifier s'il y a des animations de chargement ou des placeholders
    const loaders = await page
      .locator(".loading, .skeleton, .placeholder, .shimmer")
      .all();

    if (loaders.length > 0) {
      // Vérifier que les loaders sont visibles pendant le chargement
      for (const loader of loaders.slice(0, 2)) {
        await expect(loader).toBeVisible();
      }

      // Attendre que le contenu soit chargé
      await page.waitForTimeout(1000);

      // Vérifier que les projets sont visibles après le chargement
      const projects = await page
        .locator(".project, .portfolio-item, .card, article")
        .all();
      expect(projects.length).toBeGreaterThan(0);

      // Vérifier que les loaders ne sont plus visibles ou ont été remplacés
      const remainingLoaders = await page
        .locator(
          ".loading:visible, .skeleton:visible, .placeholder:visible, .shimmer:visible"
        )
        .count();
      expect(remainingLoaders).toBeLessThan(loaders.length);
    } else {
      // S'il n'y a pas d'animations de chargement, vérifier simplement que les projets sont visibles
      const projects = await page
        .locator(".project, .portfolio-item, .card, article")
        .all();
      expect(projects.length).toBeGreaterThan(0);
      console.log(
        "Pas d'animations de chargement trouvées, mais des projets sont présents."
      );
    }

    // Désactiver l'interception des ressources
    await page.unroute("**/*.{png,jpg,jpeg,webp}");
  });

  test("la galerie d'images du projet fonctionne correctement", async ({
    page,
  }) => {
    // Vérifier s'il y a une galerie d'images ou un carousel
    const gallery = await page
      .locator(".gallery, .carousel, .slider, .lightbox")
      .first();

    if (await gallery.isVisible()) {
      // Vérifier que la galerie contient des images
      const galleryImages = await gallery.locator("img").all();
      expect(galleryImages.length).toBeGreaterThan(0);

      // Vérifier s'il y a des contrôles de navigation dans la galerie
      const nextButton = await gallery
        .locator(
          'button[aria-label="Next"], .next, .slick-next, [data-role="next"]'
        )
        .first();

      if (await nextButton.isVisible()) {
        // Obtenir la source de la première image
        const firstImageSrc = await galleryImages[0].getAttribute("src");

        // Cliquer sur le bouton suivant
        await nextButton.click();

        // Attendre que l'animation se termine
        await page.waitForTimeout(500);

        // Vérifier que l'image a changé (si possible)
        if (galleryImages.length > 1) {
          const newCurrentImageSrc = await gallery
            .locator("img:visible, img.active, img.current")
            .first()
            .getAttribute("src");
          expect(newCurrentImageSrc).not.toBe(firstImageSrc);
        }
      } else {
        // S'il n'y a pas de contrôles, vérifier que les images sont cliquables
        const firstImage = galleryImages[0];

        // Vérifier si l'image est cliquable (a un parent avec un href ou un onclick)
        const isInLink = await firstImage.evaluate((el) => {
          const hasClickableParent = !!el.closest("a[href], [onclick]");
          return hasClickableParent;
        });

        if (isInLink) {
          console.log(
            "Les images sont cliquables mais il n'y a pas de contrôles de navigation visibles."
          );
        } else {
          console.log(
            "La galerie contient des images mais pas de contrôles de navigation interactifs."
          );
        }
      }
    } else {
      // S'il n'y a pas de galerie, vérifier qu'il y a au moins une image du projet
      const projectImage = await page
        .locator(".project-image img, .featured-image img, figure img")
        .first();
      await expect(projectImage).toBeVisible();
      console.log(
        "Pas de galerie trouvée, mais une image du projet est présente."
      );
    }
  });

  test("les méta-tags SEO sont correctement configurés sur les pages de projet", async ({
    page,
  }) => {
    // Vérifier la présence des méta-tags SEO
    // Title
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(10);

    // Description
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.length).toBeGreaterThan(50);

    // Open Graph tags
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute("content");
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute("content");
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();

    // Canonical URL
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical).toContain(page.url());
  });
});
