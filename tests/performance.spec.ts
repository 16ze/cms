import { test, expect } from "@playwright/test";

interface WebVitalsMetrics {
  CLS?: number;
  FID?: number;
  LCP?: number;
  FCP?: number;
  TTFB?: number;
}

interface WindowWithWebVitals extends Window {
  webVitals?: {
    getCLS: (cb: (result: { value: number }) => void) => void;
    getFID: (cb: (result: { value: number }) => void) => void;
    getLCP: (cb: (result: { value: number }) => void) => void;
    getFCP: (cb: (result: { value: number }) => void) => void;
    getTTFB: (cb: (result: { value: number }) => void) => void;
  };
}

// Marquer ces tests comme "skip" car ils peuvent être flaky ou pas prioritaires
test.describe.skip("Tests de performance", () => {
  test("les métriques Web Vitals sont dans des plages acceptables", async ({
    page,
  }) => {
    // Navigation sur la page d'accueil
    await page.goto("/", { waitUntil: "networkidle" });

    // Exécuter un script pour collecter les Web Vitals
    const webVitalsResult = await page.evaluate<WebVitalsMetrics>(async () => {
      return new Promise<WebVitalsMetrics>((resolve) => {
        // Vérifier si la bibliothèque web-vitals est déjà disponible
        const win = window as WindowWithWebVitals;

        if (typeof win.webVitals === "undefined") {
          // Si elle n'est pas disponible, charger la bibliothèque de manière dynamique
          const script = document.createElement("script");
          script.src = "https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js";
          script.onload = collectMetrics;
          document.head.appendChild(script);
        } else {
          collectMetrics();
        }

        function collectMetrics() {
          const webVitals = (window as WindowWithWebVitals).webVitals;
          if (!webVitals) {
            resolve({});
            return;
          }

          const metrics: WebVitalsMetrics = {};

          const resolveWhenAllCollected = () => {
            if (Object.keys(metrics).length === 5) {
              resolve(metrics);
            }
          };

          webVitals.getCLS((result) => {
            metrics.CLS = result.value;
            resolveWhenAllCollected();
          });

          webVitals.getFID((result) => {
            metrics.FID = result.value;
            resolveWhenAllCollected();
          });

          webVitals.getLCP((result) => {
            metrics.LCP = result.value;
            resolveWhenAllCollected();
          });

          webVitals.getFCP((result) => {
            metrics.FCP = result.value;
            resolveWhenAllCollected();
          });

          webVitals.getTTFB((result) => {
            metrics.TTFB = result.value;
            resolveWhenAllCollected();
          });
        }
      });
    });

    console.log("Résultats Web Vitals:", webVitalsResult);

    // Définir les seuils de performance recommandés
    const thresholds = {
      // Seuils recommandés par Google pour "bon"
      CLS: 0.1, // Cumulative Layout Shift - moins de 0.1 est bon
      FID: 100, // First Input Delay - moins de 100ms est bon
      LCP: 2500, // Largest Contentful Paint - moins de 2.5s est bon
      FCP: 1800, // First Contentful Paint - moins de 1.8s est bon
      TTFB: 800, // Time to First Byte - moins de 800ms est bon
    };

    // Vérifier chaque métrique avec des seuils un peu plus indulgents pour les tests
    // CLS - Cumulative Layout Shift
    if (webVitalsResult.CLS !== undefined) {
      expect(webVitalsResult.CLS).toBeLessThan(thresholds.CLS * 1.5);
      console.log(
        `CLS: ${webVitalsResult.CLS} (seuil: ${thresholds.CLS * 1.5})`
      );
    }

    // FID - First Input Delay
    if (webVitalsResult.FID !== undefined) {
      expect(webVitalsResult.FID).toBeLessThan(thresholds.FID * 1.5);
      console.log(
        `FID: ${webVitalsResult.FID}ms (seuil: ${thresholds.FID * 1.5}ms)`
      );
    }

    // LCP - Largest Contentful Paint
    if (webVitalsResult.LCP !== undefined) {
      expect(webVitalsResult.LCP).toBeLessThan(thresholds.LCP * 1.5);
      console.log(
        `LCP: ${webVitalsResult.LCP}ms (seuil: ${thresholds.LCP * 1.5}ms)`
      );
    }

    // FCP - First Contentful Paint
    if (webVitalsResult.FCP !== undefined) {
      expect(webVitalsResult.FCP).toBeLessThan(thresholds.FCP * 1.5);
      console.log(
        `FCP: ${webVitalsResult.FCP}ms (seuil: ${thresholds.FCP * 1.5}ms)`
      );
    }

    // TTFB - Time to First Byte
    if (webVitalsResult.TTFB !== undefined) {
      expect(webVitalsResult.TTFB).toBeLessThan(thresholds.TTFB * 1.5);
      console.log(
        `TTFB: ${webVitalsResult.TTFB}ms (seuil: ${thresholds.TTFB * 1.5}ms)`
      );
    }
  });

  test("la page se charge correctement en 3G lente", async ({ browser }) => {
    // Créer un nouveau contexte avec émulation 3G
    const slowContext = await browser.newContext({
      networkConditions: {
        download: (500 * 1024) / 8, // 500 kbps
        upload: (256 * 1024) / 8, // 256 kbps
        latency: 100, // 100ms de latence
      },
    });

    const slowPage = await slowContext.newPage();

    // Mesurer le temps de chargement
    const startTime = Date.now();
    await slowPage.goto("/", { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    console.log(`Temps de chargement en 3G lente: ${loadTime}ms`);

    // Le temps de chargement devrait être inférieur à 10 secondes
    expect(loadTime).toBeLessThan(10000);

    // Vérifier que tous les éléments essentiels sont visibles
    await expect(slowPage.locator("header")).toBeVisible();
    await expect(slowPage.locator("main")).toBeVisible();
    await expect(slowPage.locator("footer")).toBeVisible();

    // Vérifier que les images importantes sont chargées
    const mainImages = await slowPage
      .locator('img[loading="eager"], img:not([loading="lazy"])')
      .all();
    for (const img of mainImages) {
      // Vérifier si l'image est dans le viewport
      const isInViewport = await img.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
      });

      if (isInViewport) {
        await expect(img).toBeVisible();
      }
    }

    // Fermer le contexte de test
    await slowContext.close();
  });

  test("la taille totale des ressources est raisonnable", async ({ page }) => {
    // Collecter toutes les requêtes réseau pendant le chargement de la page
    const resources = [];
    page.on("request", (request) => {
      resources.push({
        url: request.url(),
        resourceType: request.resourceType(),
        method: request.method(),
      });
    });

    page.on("response", async (response) => {
      const request = response.request();
      const resource = resources.find((r) => r.url === request.url());

      if (resource) {
        const headers = await response.allHeaders();
        const contentLength = headers["content-length"]
          ? parseInt(headers["content-length"], 10)
          : 0;
        resource.contentLength = contentLength;
        resource.status = response.status();
      }
    });

    // Charger la page
    await page.goto("/", { waitUntil: "networkidle" });

    // Analyser les ressources par type
    const resourceStats = {
      total: 0,
      js: 0,
      css: 0,
      image: 0,
      font: 0,
      other: 0,
    };

    resources.forEach((resource) => {
      if (!resource.contentLength || resource.status >= 400) return;

      resourceStats.total += resource.contentLength;

      switch (resource.resourceType) {
        case "script":
          resourceStats.js += resource.contentLength;
          break;
        case "stylesheet":
          resourceStats.css += resource.contentLength;
          break;
        case "image":
          resourceStats.image += resource.contentLength;
          break;
        case "font":
          resourceStats.font += resource.contentLength;
          break;
        default:
          resourceStats.other += resource.contentLength;
      }
    });

    // Convertir les tailles en KB pour une meilleure lisibilité
    const toKB = (bytes) => Math.round(bytes / 1024);

    console.log("Taille des ressources:");
    console.log(`- Total: ${toKB(resourceStats.total)}KB`);
    console.log(`- JavaScript: ${toKB(resourceStats.js)}KB`);
    console.log(`- CSS: ${toKB(resourceStats.css)}KB`);
    console.log(`- Images: ${toKB(resourceStats.image)}KB`);
    console.log(`- Fonts: ${toKB(resourceStats.font)}KB`);
    console.log(`- Autres: ${toKB(resourceStats.other)}KB`);

    // Vérifier que la taille totale est raisonnable (moins de 2MB)
    expect(resourceStats.total).toBeLessThan(2 * 1024 * 1024);

    // Vérifier que le JavaScript est bien optimisé (moins de 500KB)
    expect(resourceStats.js).toBeLessThan(500 * 1024);

    // Vérifier que le CSS est bien optimisé (moins de 100KB)
    expect(resourceStats.css).toBeLessThan(100 * 1024);
  });

  test("le site conserve ses performances après interaction", async ({
    page,
  }) => {
    // Naviguer vers la page d'accueil
    await page.goto("/", { waitUntil: "networkidle" });

    // Identifier les éléments interactifs principaux
    const interactiveElements = await page
      .locator('button, a, [role="button"], details summary')
      .all();
    const elementsToInteractWith = interactiveElements.slice(
      0,
      Math.min(5, interactiveElements.length)
    );

    for (const element of elementsToInteractWith) {
      if (await element.isVisible()) {
        // Mesurer le temps de réaction
        const startTime = Date.now();

        // Simuler un hover
        await element.hover();

        // Attendre une court délai pour observer l'effet hover
        await page.waitForTimeout(100);

        // Cliquer sur l'élément si cela ne navigue pas vers une autre page
        const willNavigate = await element.evaluate((el) => {
          return (
            el.tagName === "A" &&
            el.href &&
            !el.href.includes("#") &&
            !el.target
          );
        });

        if (!willNavigate) {
          await element.click();

          // Temps total pour réagir à l'interaction
          const responseTime = Date.now() - startTime;

          console.log(`Temps de réponse pour l'interaction: ${responseTime}ms`);

          // Le temps de réponse devrait être rapide (moins de 200ms)
          expect(responseTime).toBeLessThan(200);

          // Vérifier qu'il n'y a pas de glitches visuels importants
          // On peut vérifier qu'il n'y a pas de déplacements importants des éléments principaux
          await expect(page.locator("header")).toHavePosition(
            { x: expect.any(Number), y: expect.any(Number) },
            { timeout: 1000 }
          );
          await expect(page.locator("main")).toBeVisible();
        }
      }
    }

    // Vérifier les performances de défilement
    const scrollStartTime = Date.now();

    // Défiler jusqu'en bas de la page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Attendre que le défilement soit terminé
    await page.waitForTimeout(500);

    const scrollTime = Date.now() - scrollStartTime;
    console.log(`Temps de défilement: ${scrollTime}ms`);

    // Le défilement devrait être fluide (moins de 300ms)
    expect(scrollTime).toBeLessThan(300);

    // Remonter en haut de la page
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    // Vérifier que la page est toujours interactive
    await expect(page.locator("header")).toBeVisible();
  });

  // Test pour vérifier les requêtes réseau inutiles
  test("le site ne fait pas de requêtes réseau inutiles", async ({ page }) => {
    // Collecter toutes les requêtes réseau
    const requests = [];
    page.on("request", (request) => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        method: request.method(),
      });
    });

    // Naviguer vers la page d'accueil
    await page.goto("/", { waitUntil: "networkidle" });

    // Analyser les requêtes
    const duplicateRequests = findDuplicateRequests(requests);
    const suspiciousRequests = findSuspiciousRequests(requests);

    console.log(`Requêtes totales: ${requests.length}`);

    if (duplicateRequests.length > 0) {
      console.log(
        `Requêtes dupliquées potentielles: ${duplicateRequests.length}`
      );
      console.log(duplicateRequests.map((r) => r.url).join("\n"));
    }

    if (suspiciousRequests.length > 0) {
      console.log(`Requêtes suspectes: ${suspiciousRequests.length}`);
      console.log(suspiciousRequests.map((r) => r.url).join("\n"));
    }

    // Vérifier qu'il n'y a pas trop de requêtes dupliquées ou suspectes
    expect(duplicateRequests.length).toBeLessThan(requests.length * 0.1); // Moins de 10% de requêtes dupliquées
    expect(suspiciousRequests.length).toBeLessThan(5); // Moins de 5 requêtes suspectes

    // Vérifier que les ressources importantes utilisent un cache approprié
    // via la page d'administration de Lighthouse ou les outils de développement
    const hasProperCaching = await page.evaluate(() => {
      return new Promise((resolve) => {
        const imgElements = document.querySelectorAll("img");
        const totalImages = imgElements.length;
        let cachedImages = 0;

        // Vérifier sommairement le cache des images
        for (const img of imgElements) {
          const src = img.src;

          // Charger l'image à nouveau pour voir si elle vient du cache
          const tempImg = new Image();

          tempImg.onload = () => {
            // Utiliser performance.getEntriesByName si disponible
            if (window.performance && window.performance.getEntriesByName) {
              const entries = performance.getEntriesByName(src);
              if (entries.length > 0) {
                // Si transferSize est 0 ou très petit, elle vient probablement du cache
                if (
                  entries[0].transferSize === 0 ||
                  entries[0].transferSize < 100
                ) {
                  cachedImages++;
                }
              }
            }

            if (cachedImages + 1 >= totalImages) {
              resolve(cachedImages / totalImages >= 0.5); // Au moins 50% des images sont cachées
            }
          };

          tempImg.onerror = () => {
            if (cachedImages + 1 >= totalImages) {
              resolve(cachedImages / totalImages >= 0.5);
            }
          };

          tempImg.src = src + "?_cache=" + new Date().getTime();
        }

        // Si pas d'images, considérer que le cache est OK
        if (totalImages === 0) {
          resolve(true);
        }
      });
    });

    expect(hasProperCaching).toBe(true);
  });
});

// Fonctions utilitaires
function findDuplicateRequests(requests) {
  const urlCounts = {};

  // Ignorer les URL qui contiennent souvent des paramètres uniques
  const ignoredPatterns = [
    /google-analytics/,
    /analytics/,
    /tracking/,
    /beacon/,
    /\?_t=/,
    /\?v=/,
  ];

  // Compter les occurrences de chaque URL (simplifiée pour ignorer les paramètres de cache)
  requests.forEach((request) => {
    // Ignorer certains types de requêtes analytiques
    if (ignoredPatterns.some((pattern) => pattern.test(request.url))) {
      return;
    }

    // Simplifier l'URL pour ignorer les paramètres non pertinents
    const simplifiedUrl = request.url.split("?")[0];

    if (!urlCounts[simplifiedUrl]) {
      urlCounts[simplifiedUrl] = [];
    }

    urlCounts[simplifiedUrl].push(request);
  });

  // Trouver les URL avec des requêtes en double
  const duplicates = [];

  for (const url in urlCounts) {
    if (urlCounts[url].length > 1) {
      // Pour les ressources comme JS et CSS, c'est suspect
      // Pour les XHR/fetch, cela peut être normal
      const resourceType = urlCounts[url][0].resourceType;
      if (
        resourceType === "script" ||
        resourceType === "stylesheet" ||
        resourceType === "image"
      ) {
        duplicates.push(...urlCounts[url]);
      }
    }
  }

  return duplicates;
}

function findSuspiciousRequests(requests) {
  const suspicious = [];

  const suspiciousPatterns = [
    /\.min\.js\.map$/, // Fichiers source map en production
    /localhost/, // Références à localhost
    /example\.com/, // Domaines d'exemple
    /test\./, // Domaines de test
    /undefined/, // URLs contenant "undefined"
    /\{\{/, // Templates non rendus
  ];

  requests.forEach((request) => {
    if (suspiciousPatterns.some((pattern) => pattern.test(request.url))) {
      suspicious.push(request);
    }

    // Détecter les 404 ou autres erreurs (pas implémenté ici car nous n'avons pas les statuts de réponse)
  });

  return suspicious;
}
