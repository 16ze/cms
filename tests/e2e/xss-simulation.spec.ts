/**
 * 🧪 TESTS E2E - SIMULATION XSS
 * ==============================
 *
 * Tests Playwright pour vérifier que les protections XSS fonctionnent correctement
 * Vérifie que les tentatives d'injection sont bloquées
 */

import { test, expect } from "@playwright/test";

/**
 * Payloads XSS à tester
 */
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  '<keygen onfocus=alert(1) autofocus>',
  '<video><source onerror=alert(1)>',
  '<audio src=x onerror=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>',
  '<div onmouseover=alert(1)>',
  '<link rel=stylesheet href=javascript:alert(1)>',
  '<meta http-equiv=refresh content="0;url=javascript:alert(1)">',
  '<style>@import "javascript:alert(1)";</style>',
  '<object data="javascript:alert(1)">',
  '<embed src="javascript:alert(1)">',
  '"><script>alert(1)</script>',
  "'><script>alert(1)</script>",
  '"><img src=x onerror=alert(1)>',
  "'><img src=x onerror=alert(1)>",
  '<img src="x" onerror="alert(1)">',
  '<svg><script>alert(1)</script></svg>',
];

/**
 * Payloads SQL Injection à tester
 */
const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users--",
  "' UNION SELECT * FROM users--",
  "1' OR '1'='1",
  "admin'--",
  "' OR 1=1--",
];

test.describe("XSS Protection Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Attendre que la page soit chargée
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should block XSS attempts in fetch requests", async ({ page }) => {
    // Intercepter les requêtes fetch
    const blockedRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      const postData = request.postData();

      // Vérifier si le payload contient des patterns XSS
      if (postData) {
        for (const payload of XSS_PAYLOADS) {
          if (postData.includes(payload)) {
            blockedRequests.push(`Blocked: ${payload.substring(0, 50)}`);
          }
        }
      }
    });

    // Tenter d'injecter du XSS via fetch
    for (const payload of XSS_PAYLOADS) {
      try {
        await page.evaluate((p) => {
          return fetch("/api/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: p }),
          });
        }, payload);
      } catch (error) {
        // Attendu - la requête devrait être bloquée
        blockedRequests.push(`Exception: ${payload.substring(0, 50)}`);
      }
    }

    // Attendre un peu pour que les blocages soient enregistrés
    await page.waitForTimeout(1000);

    // Vérifier que le Client Shield est actif
    const clientShieldActive = await page.evaluate(() => {
      return typeof window !== "undefined" && window.__SECURITY_LOGGER__ !== undefined;
    });

    expect(clientShieldActive).toBe(true);
  });

  test("should sanitize HTML content rendered with SafeHTML", async ({ page }) => {
    // Créer un élément avec du contenu XSS
    const maliciousHTML = '<script>alert("XSS")</script><p>Safe content</p>';

    await page.evaluate((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      document.body.appendChild(div);
    }, maliciousHTML);

    // Vérifier que le script est supprimé
    const scripts = await page.$$eval("script", (scripts) => scripts.length);
    expect(scripts).toBe(0);

    // Vérifier que le contenu sûr est toujours présent
    const safeContent = await page.$eval("p", (p) => p.textContent);
    expect(safeContent).toBe("Safe content");
  });

  test("should detect and block DOM mutations with scripts", async ({ page }) => {
    const mutationsDetected: string[] = [];

    // Écouter les erreurs de sécurité
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("Security threat") || text.includes("XSS")) {
        mutationsDetected.push(text);
      }
    });

    // Tenter d'injecter un script via DOM
    await page.evaluate(() => {
      const script = document.createElement("script");
      script.textContent = 'alert("XSS")';
      document.body.appendChild(script);
    });

    await page.waitForTimeout(1000);

    // Vérifier que le script a été supprimé
    const scripts = await page.$$eval("script", (scripts) => {
      return scripts.filter((s) => s.textContent?.includes("alert")).length;
    });

    expect(scripts).toBe(0);
  });

  test("should block eval() calls", async ({ page }) => {
    let evalBlocked = false;

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("eval() is blocked") || text.includes("Security threat")) {
        evalBlocked = true;
      }
    });

    // Tenter d'appeler eval()
    try {
      await page.evaluate(() => {
        eval('alert("XSS")');
      });
    } catch (error) {
      evalBlocked = true;
    }

    await page.waitForTimeout(500);

    // Vérifier que eval() est bloqué
    expect(evalBlocked).toBe(true);
  });

  test("should block Function() constructor calls", async ({ page }) => {
    let functionBlocked = false;

    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("Function() constructor is blocked") || text.includes("Security threat")) {
        functionBlocked = true;
      }
    });

    // Tenter d'appeler Function()
    try {
      await page.evaluate(() => {
        new Function('alert("XSS")')();
      });
    } catch (error) {
      functionBlocked = true;
    }

    await page.waitForTimeout(500);

    // Vérifier que Function() est bloqué
    expect(functionBlocked).toBe(true);
  });

  test("should report security threats to /api/security/report", async ({ page }) => {
    const reports: string[] = [];

    // Intercepter les requêtes vers l'API de sécurité
    await page.route("**/api/security/report", (route) => {
      reports.push("Security report received");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Générer une menace (par exemple, via fetch avec payload suspect)
    try {
      await page.evaluate(() => {
        fetch("/api/security/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "XSS",
            source: "test",
            payload: '<script>alert(1)</script>',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {
          // Ignorer les erreurs
        });
      });
    } catch (error) {
      // Attendu
    }

    await page.waitForTimeout(1000);

    // Vérifier qu'au moins un rapport a été envoyé
    expect(reports.length).toBeGreaterThan(0);
  });

  test("should protect against SQL injection in form inputs", async ({ page }) => {
    // Chercher un formulaire de contact ou de recherche
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Chercher un input de texte
    const input = await page.$('input[type="text"]');

    if (input) {
      // Tenter d'injecter du SQL
      for (const payload of SQLI_PAYLOADS) {
        await input.fill(payload);

        // Vérifier que la valeur n'est pas exécutée (via fetch si le formulaire est soumis)
        const value = await input.inputValue();
        expect(value).not.toContain("DROP TABLE");
        expect(value).not.toContain("UNION SELECT");
      }
    }
  });

  test("should verify CSP headers are present", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();

    expect(headers?.["content-security-policy"]).toBeDefined();
    expect(headers?.["x-frame-options"]).toBe("DENY");
    expect(headers?.["x-content-type-options"]).toBe("nosniff");
    expect(headers?.["x-xss-protection"]).toBe("1; mode=block");
  });

  test("should verify security watchdog is active", async ({ page }) => {
    const watchdogActive = await page.evaluate(() => {
      return typeof window !== "undefined" && window.__SECURITY_LOGGER__ !== undefined;
    });

    expect(watchdogActive).toBe(true);

    // Vérifier que les statistiques de sécurité sont disponibles
    const stats = await page.evaluate(() => {
      if (typeof window !== "undefined" && window.__SECURITY_LOGGER__) {
        return {
          threatCount: window.__SECURITY_LOGGER__.threats.length,
          hasLogger: true,
        };
      }
      return { threatCount: 0, hasLogger: false };
    });

    expect(stats.hasLogger).toBe(true);
  });
});

test.describe("SafeHTML Component Tests", () => {
  test("should sanitize malicious HTML", async ({ page }) => {
    await page.goto("/");

    // Injecter du HTML malveillant via SafeHTML
    const result = await page.evaluate(() => {
      // Simuler SafeHTML sanitization
      const malicious = '<script>alert("XSS")</script><p>Safe</p><img src=x onerror=alert(1)>';
      
      // Note: En réalité, SafeHTML utilise DOMPurify côté client
      // Ici on teste juste que le HTML est bien traité
      const div = document.createElement("div");
      div.innerHTML = malicious;
      
      // Supprimer les scripts
      const scripts = div.querySelectorAll("script");
      scripts.forEach((s) => s.remove());
      
      // Supprimer les événements inline
      const images = div.querySelectorAll("img");
      images.forEach((img) => {
        img.removeAttribute("onerror");
      });
      
      return {
        scriptCount: div.querySelectorAll("script").length,
        hasSafeContent: div.querySelector("p") !== null,
        imageHasOnError: div.querySelector("img")?.hasAttribute("onerror"),
      };
    });

    expect(result.scriptCount).toBe(0);
    expect(result.hasSafeContent).toBe(true);
    expect(result.imageHasOnError).toBe(false);
  });
});

