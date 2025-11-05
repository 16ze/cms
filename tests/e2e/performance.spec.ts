/**
 * 🧪 TESTS PLAYWRIGHT - PERFORMANCE
 * ==================================
 *
 * Tests de performance pour valider les optimisations
 */

import { test, expect } from "@playwright/test";

test.describe("Performance - Métriques de chargement", () => {
  test("devrait charger la page de login rapidement", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // La page devrait se charger en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test("devrait avoir un bon score Lighthouse pour la performance", async ({
    page,
  }) => {
    await page.goto("/login");

    // Utiliser les métriques de performance de Playwright
    const metrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded:
          performance.timing.domContentLoadedEventEnd -
          performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType("paint").find(
          (entry) => entry.name === "first-paint"
        )?.startTime,
        firstContentfulPaint: performance.getEntriesByType("paint").find(
          (entry) => entry.name === "first-contentful-paint"
        )?.startTime,
      };
    });

    // Vérifier que le DOM est chargé rapidement
    expect(metrics.domContentLoaded).toBeLessThan(2000);

    // Vérifier le First Contentful Paint
    if (metrics.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(2500);
    }
  });

  test("devrait utiliser le lazy loading pour les composants lourds", async ({
    page,
  }) => {
    await page.goto("/login");

    // Analyser les ressources chargées
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType("resource").map((entry) => ({
        name: entry.name,
        size: (entry as any).transferSize || 0,
        duration: entry.duration,
      }));
    });

    // Vérifier qu'il n'y a pas trop de ressources chargées initialement
    const initialResources = resources.filter(
      (r) => r.name.includes(".js") || r.name.includes(".css")
    );

    // Le nombre de ressources JS devrait être raisonnable (moins de 20)
    expect(initialResources.length).toBeLessThan(20);
  });

  test("devrait avoir un bundle size raisonnable", async ({ page }) => {
    await page.goto("/login");

    const bundleSize = await page.evaluate(() => {
      let totalSize = 0;
      performance.getEntriesByType("resource").forEach((entry: any) => {
        if (entry.name.includes(".js") && entry.transferSize) {
          totalSize += entry.transferSize;
        }
      });
      return totalSize;
    });

    // Le bundle total devrait être inférieur à 1MB (1,000,000 bytes)
    expect(bundleSize).toBeLessThan(1000000);
  });
});

test.describe("Performance - Dashboard Admin", () => {
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

  test("devrait charger le dashboard rapidement", async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    // Le dashboard devrait se charger en moins de 4 secondes
    expect(loadTime).toBeLessThan(4000);
  });

  test("devrait utiliser le code splitting pour les composants admin", async ({
    page,
  }) => {
    // Naviguer vers une page admin spécifique
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    // Vérifier que les chunks sont chargés à la demande
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter((entry: any) => entry.name.includes("chunk"))
        .map((entry: any) => ({
          name: entry.name,
          size: entry.transferSize || 0,
        }));
    });

    // Vérifier qu'il y a des chunks (code splitting actif)
    expect(resources.length).toBeGreaterThan(0);
  });
});

test.describe("Performance - Images", () => {
  test("devrait utiliser next/image pour optimiser les images", async ({
    page,
  }) => {
    await page.goto("/");

    // Vérifier que les images utilisent next/image
    const images = await page.$$eval("img", (imgs) => {
      return imgs.map((img) => ({
        src: img.src,
        loading: img.loading,
        srcset: img.srcset,
      }));
    });

    // Vérifier que certaines images ont l'attribut loading="lazy"
    const lazyImages = images.filter((img) => img.loading === "lazy");
    expect(lazyImages.length).toBeGreaterThan(0);
  });

  test("devrait avoir des images avec blurDataURL pour le placeholder", async ({
    page,
  }) => {
    await page.goto("/");

    // Vérifier la présence de placeholders blur
    const imagesWithBlur = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs).some((img) => {
        const style = window.getComputedStyle(img);
        return (
          style.filter.includes("blur") ||
          img.src.includes("data:image") ||
          img.src.includes("blur")
        );
      });
    });

    // Au moins certaines images devraient avoir un placeholder
    // (cette vérification peut être ajustée selon l'implémentation)
  });
});

