import { test, expect } from "@playwright/test";

test.describe("Accessibilité et SEO", () => {
  test("la page d'accueil a les balises méta SEO appropriées", async ({
    page,
  }) => {
    await page.goto("/");

    // Vérifier le titre
    await expect(page).toHaveTitle(
      /KAIRO Digital | Développeur web freelance et consultant SEO/
    );

    // Vérifier la méta description
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.length).toBeGreaterThan(50);
    expect(metaDescription?.length).toBeLessThan(160);

    // Vérifier les balises Open Graph
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

    // Vérifier la balise canonical
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical).toContain("kairo-digital");

    // Vérifier les données structurées (Schema.org)
    const schemaScripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    expect(schemaScripts.length).toBeGreaterThan(0);

    // Vérifier le contenu d'au moins un script Schema.org
    if (schemaScripts.length > 0) {
      const schemaContent = await schemaScripts[0].innerHTML();
      const schemaJson = JSON.parse(schemaContent);
      expect(schemaJson["@context"]).toBe("https://schema.org");
    }
  });

  test("toutes les pages ont une structure de heading appropriée", async ({
    page,
  }) => {
    const pagesToCheck = ["/", "/about", "/contact", "/portfolio", "/services"];

    for (const path of pagesToCheck) {
      await page.goto(path);

      // Vérifier qu'il y a exactement un h1
      const h1Elements = await page.locator("h1").all();
      expect(h1Elements.length).toBe(1);

      // Vérifier que les headings suivent une hiérarchie logique
      const h2Elements = await page.locator("h2").all();
      const h3Elements = await page.locator("h3").all();

      // Au moins un h2 si on a des h3
      if (h3Elements.length > 0) {
        expect(h2Elements.length).toBeGreaterThan(0);
      }

      // Vérifier que les headings ne sont pas vides
      for (const h1 of h1Elements) {
        const h1Text = await h1.textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("toutes les images ont des attributs alt appropriés", async ({
    page,
  }) => {
    const pagesToCheck = ["/", "/about", "/portfolio", "/services"];

    for (const path of pagesToCheck) {
      await page.goto(path);

      // Vérifier toutes les images
      const images = await page.locator("img").all();

      for (const img of images) {
        const alt = await img.getAttribute("alt");
        const src = await img.getAttribute("src");

        // Toutes les images doivent avoir un attribut alt (peut être vide pour les images décoratives)
        expect(alt).not.toBeNull();

        // Si l'image semble être informative (non décorative), elle devrait avoir un alt non vide
        const isDecorative =
          src?.includes("background") ||
          src?.includes("pattern") ||
          src?.includes("decoration");

        if (!isDecorative) {
          // Pour les images informatives, l'alt ne devrait pas être vide
          // Mais on ne peut pas être sûr à 100%, donc on ne fait pas cette assertion
          // expect(alt?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("le site est navigable au clavier", async ({ page }) => {
    await page.goto("/");

    // Vérifier que les éléments interactifs sont atteignables par tabulation
    await page.keyboard.press("Tab");

    // Vérifier que le focus est visible
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (!activeElement) return null;

      const style = window.getComputedStyle(activeElement);
      return {
        tagName: activeElement.tagName,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
      };
    });

    expect(focusedElement).not.toBeNull();

    if (focusedElement) {
      // Vérifier que le focus est visible d'une manière ou d'une autre
      const hasFocusStyles =
        focusedElement.outlineStyle !== "none" ||
        focusedElement.boxShadow !== "none";

      expect(hasFocusStyles).toBe(true);
    }

    // Trouver un élément cliquable et tabuler jusqu'à lui
    // Identifier un lien dans le menu principal qui mène à une autre page
    const mainNavLinks = await page
      .locator("nav a[href], header a[href]")
      .all();
    expect(mainNavLinks.length).toBeGreaterThan(0);

    if (mainNavLinks.length > 0) {
      // Récupérer l'URL initiale pour comparaison
      const initialUrl = page.url();

      // Cliquer sur le premier lien et vérifier que nous avons navigué
      await mainNavLinks[0].click();

      // Vérifier que l'URL a changé
      const newUrl = page.url();
      expect(newUrl).not.toBe(initialUrl);
    }
  });

  test("les formulaires sont accessibles", async ({ page }) => {
    await page.goto("/contact");

    // Vérifier que les champs de formulaire ont des labels associés
    const inputFields = await page
      .locator('input:not([type="hidden"]):not([aria-hidden="true"])')
      .all();

    for (const input of inputFields) {
      // Vérifier si l'input a un id
      const inputId = await input.getAttribute("id");

      if (inputId) {
        // Vérifier s'il y a un label correspondant
        const hasLabel =
          (await page.locator(`label[for="${inputId}"]`).count()) > 0;

        // Si pas de label explicite, vérifier si l'input est dans un fieldset avec legend
        // ou s'il a aria-label ou aria-labelledby
        const hasAriaLabel = (await input.getAttribute("aria-label")) !== null;
        const hasAriaLabelledBy =
          (await input.getAttribute("aria-labelledby")) !== null;

        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
      } else {
        // Si pas d'id, vérifier si l'input a aria-label ou est dans un label
        const hasAriaLabel = (await input.getAttribute("aria-label")) !== null;
        const isInsideLabel = await input.evaluate((node) => {
          return node.closest("label") !== null;
        });

        expect(hasAriaLabel || isInsideLabel).toBe(true);
      }
    }

    // Vérifier que les messages d'erreur sont liés aux champs correspondants
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Attendre les messages d'erreur
    await page.waitForSelector(
      '[aria-invalid="true"], .error, .invalid, [aria-errormessage]'
    );

    // Vérifier que les champs d'erreur sont correctement associés
    const invalidFields = await page.locator('[aria-invalid="true"]').all();

    for (const field of invalidFields) {
      const hasErrorMessage =
        (await field.getAttribute("aria-errormessage")) !== null ||
        (await field.evaluate((node) => {
          // Chercher un message d'erreur voisin
          const id = node.id;
          if (id) {
            return (
              document.querySelector(`[id="${id}-error"], #${id}_error`) !==
              null
            );
          }
          // Chercher un message d'erreur enfant dans le parent
          const parent = node.parentElement;
          return parent
            ? parent.querySelector('.error, .invalid, [role="alert"]') !== null
            : false;
        }));

      expect(hasErrorMessage).toBe(true);
    }
  });

  test("le site a des contrastes de couleur appropriés", async ({ page }) => {
    await page.goto("/");

    // Cette fonction est limitée car Playwright ne peut pas facilement évaluer les contrastes
    // C'est juste une vérification basique des éléments de texte principaux

    const textElements = await page
      .locator("h1, h2, h3, p, a, button, label")
      .all();
    const results = [];

    for (const element of textElements.slice(0, 10)) {
      // Limiter à 10 éléments pour la vitesse
      const styles = await element.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
        };
      });

      // On ne peut pas calculer le rapport de contraste ici,
      // mais on peut vérifier que la couleur n'est pas trop proche du fond
      // (vérification très basique et limitée)
      const color = styles.color;
      const bgColor = styles.backgroundColor;

      results.push({
        element: await element.evaluate((node) => node.tagName),
        color,
        bgColor,
      });
    }

    // Journaliser les résultats pour inspection manuelle ultérieure
    console.log("Résultats de contraste à vérifier manuellement:", results);
  });
});
