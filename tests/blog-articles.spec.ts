import { test, expect } from "@playwright/test";

// Marquer ces tests comme "skip" car la page de blog n'existe pas encore
test.describe.skip("Fonctionnalités du blog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("la page de blog affiche correctement les articles", async ({
    page,
  }) => {
    await page.goto("/blog");

    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Blog | KAIRO Digital/);

    // Vérifier que la liste d'articles est présente
    const articlesList = await page.locator("article, .blog-post, .card").all();
    expect(articlesList.length).toBeGreaterThan(0);

    // Vérifier que chaque article a un titre et une image
    for (const article of articlesList.slice(0, 3)) {
      // Limiter à 3 pour la performance
      const title = await article.locator("h2, h3").first();
      await expect(title).toBeVisible();

      const titleText = await title.textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // Vérifier la présence d'une image ou d'un placeholder
      const image = await article.locator("img, .image-placeholder").first();
      await expect(image).toBeVisible();

      // Vérifier qu'il y a un lien vers l'article complet
      const link = await article.locator("a").first();
      await expect(link).toBeVisible();
      expect(await link.getAttribute("href")).toBeTruthy();
    }
  });

  test("l'article de blog individuel s'affiche correctement", async ({
    page,
  }) => {
    // Cliquer sur le premier article
    const firstArticleLink = await page
      .locator("article a, .blog-post a, .card a")
      .first();
    const articleTitle = await page
      .locator("article h2, .blog-post h2, .card h3")
      .first()
      .textContent();
    await firstArticleLink.click();

    // Vérifier que nous sommes sur une page d'article individuel
    await expect(page).toHaveURL(/\/blog\/.+/);

    // Vérifier que le titre de l'article est présent
    if (articleTitle) {
      const cleanTitle = articleTitle.trim();
      await expect(page.locator("h1")).toContainText(cleanTitle);
    } else {
      // Si le titre n'a pas pu être récupéré avant le clic, vérifier qu'il y a un h1
      await expect(page.locator("h1")).toBeVisible();
    }

    // Vérifier la présence du contenu de l'article
    const articleContent = await page
      .locator("article, .blog-content, .content")
      .first();
    await expect(articleContent).toBeVisible();

    // Vérifier qu'il y a des paragraphes dans le contenu
    const paragraphs = await articleContent.locator("p").all();
    expect(paragraphs.length).toBeGreaterThan(1);

    // Vérifier la présence de la date de publication
    const publishDate = await page.locator("time, .date, [datetime]").first();
    await expect(publishDate).toBeVisible();

    // Vérifier la présence des méta-informations
    const metaAuthor = await page
      .locator("text=/auteur|author|par|by/i")
      .first();
    await expect(metaAuthor).toBeVisible();
  });

  test("la pagination des articles fonctionne correctement", async ({
    page,
  }) => {
    // Vérifier s'il y a une pagination
    const paginationElement = await page
      .locator('nav[aria-label="Pagination"], .pagination')
      .first();

    if (await paginationElement.isVisible()) {
      // Compter les articles sur la première page
      const articlesOnFirstPage = await page
        .locator("article, .blog-post, .card")
        .count();

      // Cliquer sur le bouton "Page suivante" ou sur la page 2
      const nextPageButton = await page
        .locator('a[aria-label="Next page"], [aria-label="Go to page 2"]')
        .first();
      if (await nextPageButton.isVisible()) {
        await nextPageButton.click();

        // Vérifier que l'URL a changé
        await expect(page).toHaveURL(/\/blog\/(page\/2|\?page=2)/);

        // Vérifier que de nouveaux articles sont affichés
        const articlesOnSecondPage = await page
          .locator("article, .blog-post, .card")
          .count();
        expect(articlesOnSecondPage).toBeGreaterThan(0);

        // Retourner à la première page
        const prevPageButton = await page
          .locator('a[aria-label="Previous page"], [aria-label="Go to page 1"]')
          .first();
        if (await prevPageButton.isVisible()) {
          await prevPageButton.click();

          // Vérifier le retour à la première page
          await expect(page).toHaveURL(/\/blog(\/|\?page=1|$)/);

          // Vérifier que le nombre d'articles est le même qu'avant
          const articlesAfterReturn = await page
            .locator("article, .blog-post, .card")
            .count();
          expect(articlesAfterReturn).toBe(articlesOnFirstPage);
        }
      }
    } else {
      // S'il n'y a pas de pagination, vérifier qu'il y a des articles
      const articles = await page.locator("article, .blog-post, .card").all();
      expect(articles.length).toBeGreaterThan(0);
      console.log(
        "Pas de pagination trouvée, mais des articles sont présents."
      );
    }
  });

  test("les articles de blog peuvent être filtrés par catégorie", async ({
    page,
  }) => {
    // Vérifier s'il y a une section de catégories ou de filtres
    const categorySection = await page
      .locator(".categories, .filters, .tags, nav.blog-nav")
      .first();

    if (await categorySection.isVisible()) {
      // Obtenir toutes les catégories disponibles
      const categoryLinks = await categorySection.locator("a").all();

      if (categoryLinks.length > 0) {
        // Cliquer sur la première catégorie
        const categoryName = await categoryLinks[0].textContent();
        await categoryLinks[0].click();

        // Vérifier que l'URL a changé pour inclure la catégorie
        await expect(page).toHaveURL(/\/blog\/(categories|tag|category)/);

        // Vérifier que des articles sont affichés dans cette catégorie
        const filteredArticles = await page
          .locator("article, .blog-post, .card")
          .count();
        expect(filteredArticles).toBeGreaterThan(0);

        // Vérifier que le nom de la catégorie est affiché sur la page
        if (categoryName) {
          await expect(
            page.locator(`text=${categoryName.trim()}`)
          ).toBeVisible();
        }
      } else {
        console.log(
          "Aucun lien de catégorie trouvé dans la section des catégories."
        );
      }
    } else {
      // S'il n'y a pas de section de catégories, vérifier qu'il y a tout de même des articles
      const articles = await page.locator("article, .blog-post, .card").all();
      expect(articles.length).toBeGreaterThan(0);
      console.log(
        "Pas de section de catégories trouvée, mais des articles sont présents."
      );
    }
  });

  test("la recherche d'articles fonctionne correctement", async ({ page }) => {
    // Vérifier s'il y a un champ de recherche
    const searchField = await page
      .locator(
        'input[type="search"], input[placeholder*="recherche"], input[aria-label*="search"]'
      )
      .first();

    if (await searchField.isVisible()) {
      // Obtenir le titre d'un article existant pour la recherche
      const existingArticleTitle = await page
        .locator("article h2, .blog-post h2, .card h3")
        .first()
        .textContent();

      if (existingArticleTitle) {
        // Prendre un mot-clé du titre pour la recherche
        const searchKeyword = existingArticleTitle.split(" ")[0];

        // Remplir le champ de recherche
        await searchField.fill(searchKeyword);

        // Soumettre la recherche
        await searchField.press("Enter");

        // Vérifier que les résultats de recherche sont affichés
        await expect(page).toHaveURL(/\/blog\/(search|\?q=)/);

        // Vérifier que des articles sont affichés dans les résultats
        const searchResults = await page
          .locator("article, .blog-post, .card")
          .count();
        expect(searchResults).toBeGreaterThan(0);

        // Vérifier que le mot-clé de recherche est visible dans les résultats
        await expect(page.locator(`text=${searchKeyword}`)).toBeVisible();
      } else {
        console.log(
          "Aucun titre d'article trouvé pour effectuer une recherche de test."
        );
      }
    } else {
      // S'il n'y a pas de champ de recherche, vérifier qu'il y a tout de même des articles
      const articles = await page.locator("article, .blog-post, .card").all();
      expect(articles.length).toBeGreaterThan(0);
      console.log(
        "Pas de champ de recherche trouvé, mais des articles sont présents."
      );
    }
  });

  test("les articles de blog ont des méta-tags SEO appropriés", async ({
    page,
  }) => {
    // Cliquer sur le premier article
    const firstArticleLink = await page
      .locator("article a, .blog-post a, .card a")
      .first();
    await firstArticleLink.click();

    // Vérifier que nous sommes sur une page d'article individuel
    await expect(page).toHaveURL(/\/blog\/.+/);

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

    // Twitter Card tags
    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute("content");
    expect(twitterCard).toBeTruthy();

    // Canonical URL
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical).toContain(page.url());
  });
});
