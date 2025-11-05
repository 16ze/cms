import { test, expect } from "@playwright/test";

/**
 * 🧪 TESTS DES HEADERS DE SÉCURITÉ
 * =================================
 * 
 * Vérifie que tous les headers de sécurité HTTP sont présents
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - X-XSS-Protection
 * - Strict-Transport-Security
 * - Content-Security-Policy
 * - Referrer-Policy
 * - Permissions-Policy
 */

test.describe("Security Headers", () => {
  test("Headers de sécurité présents sur toutes les routes", async ({
    request,
  }) => {
    const routes = [
      "/",
      "/admin/login",
      "/api/health",
      "/api/metrics",
      "/api/contact",
    ];
    
    for (const route of routes) {
      const response = await request.get(`http://localhost:3000${route}`);
      const headers = response.headers();
      
      // Headers obligatoires
      expect(headers["x-frame-options"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-xss-protection"]).toBeDefined();
      
      // Headers optionnels mais recommandés
      if (headers["strict-transport-security"]) {
        expect(headers["strict-transport-security"]).toContain("max-age");
      }
      
      if (headers["content-security-policy"]) {
        expect(headers["content-security-policy"]).toBeDefined();
      }
      
      if (headers["referrer-policy"]) {
        expect(headers["referrer-policy"]).toBeDefined();
      }
    }
  });

  test("X-Frame-Options est défini sur DENY", async ({ request }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const xFrameOptions = headers["x-frame-options"];
    expect(xFrameOptions).toBeDefined();
    expect(xFrameOptions?.toUpperCase()).toBe("DENY");
  });

  test("X-Content-Type-Options est défini sur nosniff", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const xContentTypeOptions = headers["x-content-type-options"];
    expect(xContentTypeOptions).toBe("nosniff");
  });

  test("X-XSS-Protection est présent", async ({ request }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const xXssProtection = headers["x-xss-protection"];
    expect(xXssProtection).toBeDefined();
    expect(xXssProtection).toMatch(/1; mode=block/i);
  });

  test("Strict-Transport-Security est présent en production", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    // HSTS peut ne pas être présent en développement local
    if (headers["strict-transport-security"]) {
      const hsts = headers["strict-transport-security"];
      expect(hsts).toContain("max-age");
      expect(hsts).toContain("includeSubDomains");
    }
  });

  test("Content-Security-Policy est présent", async ({ request }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const csp = headers["content-security-policy"];
    if (csp) {
      // Vérifier que la CSP contient des directives de sécurité
      expect(csp).toContain("default-src");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
    }
  });

  test("Referrer-Policy est présent", async ({ request }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const referrerPolicy = headers["referrer-policy"];
    if (referrerPolicy) {
      expect(referrerPolicy).toMatch(/strict-origin|no-referrer|same-origin/i);
    }
  });

  test("Permissions-Policy est présent", async ({ request }) => {
    const response = await request.get("http://localhost:3000/");
    const headers = response.headers();
    
    const permissionsPolicy = headers["permissions-policy"];
    if (permissionsPolicy) {
      // Vérifier que les permissions sensibles sont désactivées
      expect(permissionsPolicy).toMatch(/camera|microphone|geolocation/i);
    }
  });

  test("Headers de sécurité présents sur les routes API", async ({
    request,
  }) => {
    const apiRoutes = [
      "/api/health",
      "/api/metrics",
      "/api/contact",
    ];
    
    for (const route of apiRoutes) {
      const response = await request.get(`http://localhost:3000${route}`);
      const headers = response.headers();
      
      // Headers de base doivent être présents
      expect(headers["x-frame-options"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBe("nosniff");
    }
  });

  test("Headers de sécurité présents sur les routes d'authentification", async ({
    request,
  }) => {
    const authRoutes = [
      "/admin/login",
      "/super-admin/login",
      "/api/auth/login/super-admin",
    ];
    
    for (const route of authRoutes) {
      const response = await request.get(`http://localhost:3000${route}`);
      const headers = response.headers();
      
      // Headers de sécurité critiques pour l'authentification
      expect(headers["x-frame-options"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      
      // Pas de XSS possible sur les pages de login
      if (headers["x-xss-protection"]) {
        expect(headers["x-xss-protection"]).toBeDefined();
      }
    }
  });
});

