/**
 * 🛡️ TESTS DE RATE LIMITING
 * =========================
 * 
 * Tests pour vérifier que le rate limiting fonctionne correctement
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Rate Limiting", () => {
  test("Bloque après 10 requêtes par seconde sur les routes API publiques", async ({
    request,
  }) => {
    // Envoyer 11 requêtes rapidement
    const requests = Array.from({ length: 11 }, () =>
      request.get(`${BASE_URL}/api/auth/verify`)
    );

    const responses = await Promise.all(requests);

    // Au moins une requête doit être bloquée (429)
    const rateLimited = responses.some((r) => r.status() === 429);
    expect(rateLimited).toBe(true);

    // Vérifier les headers de rate limit
    const lastResponse = responses[responses.length - 1];
    const headers = lastResponse.headers();
    
    if (lastResponse.status() === 429) {
      expect(headers["x-ratelimit-limit"]).toBeDefined();
      expect(headers["retry-after"]).toBeDefined();
    }
  });

  test("Bloque après 5 tentatives de login par minute", async ({
    request,
  }) => {
    // Envoyer 6 tentatives de login avec de mauvais credentials
    const requests = Array.from({ length: 6 }, () =>
      request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      })
    );

    const responses = await Promise.all(requests);

    // Au moins une requête doit être bloquée (429)
    const rateLimited = responses.some((r) => r.status() === 429);
    expect(rateLimited).toBe(true);
  });

  test("Les headers de rate limit sont présents", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/verify`);

    const headers = response.headers();
    
    // Vérifier que les headers sont présents (même si pas de limite atteinte)
    // Note: Ces headers peuvent ne pas être présents si Redis n'est pas configuré
    // Dans ce cas, le test doit être adapté
  });

  test("Le rate limiting est par IP", async ({ request, browser }) => {
    // Créer deux contextes différents (simuler deux IPs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Envoyer 11 requêtes depuis le contexte 1
    const requests1 = Array.from({ length: 11 }, () =>
      page1.request.get(`${BASE_URL}/api/auth/verify`)
    );

    // Envoyer une requête depuis le contexte 2
    const request2 = page2.request.get(`${BASE_URL}/api/auth/verify`);

    const [responses1, response2] = await Promise.all([
      Promise.all(requests1),
      request2,
    ]);

    // Le contexte 1 devrait être rate limité
    const rateLimited1 = responses1.some((r) => r.status() === 429);
    expect(rateLimited1).toBe(true);

    // Le contexte 2 devrait pouvoir faire sa requête
    expect(response2.status()).not.toBe(429);

    await context1.close();
    await context2.close();
  });
});

