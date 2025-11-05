/**
 * 🛡️ TESTS DE SÉCURITÉ - WAF
 * ===========================
 * 
 * Tests pour vérifier que le WAF bloque les attaques courantes
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("WAF - Protection contre les attaques", () => {
  test("Bloque les tentatives XSS dans les query params", async ({ request }) => {
    const maliciousPayloads = [
      "<script>alert('XSS')</script>",
      "javascript:alert('XSS')",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
      "eval('alert(1)')",
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.get(`${BASE_URL}/api/test?q=${encodeURIComponent(payload)}`);
      
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.code).toBe("WAF_BLOCKED");
    }
  });

  test("Bloque les tentatives SQL Injection", async ({ request }) => {
    const maliciousPayloads = [
      "1' OR '1'='1",
      "'; DROP TABLE users; --",
      "1 UNION SELECT * FROM users",
      "' OR 1=1 --",
      "admin'--",
      "1' AND 1=1",
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/test`, {
        data: { query: payload },
      });
      
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.code).toBe("WAF_BLOCKED");
    }
  });

  test("Bloque les tentatives LFI / Path Traversal", async ({ request }) => {
    const maliciousPayloads = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\win.ini",
      "....//....//etc/passwd",
      "file:///etc/passwd",
      "php://filter",
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.get(`${BASE_URL}/api/test?file=${encodeURIComponent(payload)}`);
      
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.code).toBe("WAF_BLOCKED");
    }
  });

  test("Bloque les tentatives Command Injection", async ({ request }) => {
    const maliciousPayloads = [
      "; ls -la",
      "| cat /etc/passwd",
      "& whoami",
      "`id`",
      "$(uname -a)",
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/test`, {
        data: { command: payload },
      });
      
      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.code).toBe("WAF_BLOCKED");
    }
  });

  test("Bloque les payloads trop volumineux (> 1 Mo)", async ({ request }) => {
    const largePayload = "x".repeat(1024 * 1024 + 1); // 1 Mo + 1 byte

    const response = await request.post(`${BASE_URL}/api/test`, {
      data: { content: largePayload },
      headers: {
        "Content-Length": String(largePayload.length),
      },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.code).toBe("WAF_BLOCKED");
  });

  test("Header X-Edge-Security présent sur les routes API", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/verify`);
    
    const securityHeader = response.headers()["x-edge-security"];
    expect(securityHeader).toBeDefined();
    expect(["active", "blocked"]).toContain(securityHeader);
  });

  test("Autorise les requêtes légitimes", async ({ request }) => {
    const legitimatePayload = {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello, this is a legitimate message.",
    };

    // Note: Cette route peut ne pas exister, mais on vérifie que le WAF ne bloque pas
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: legitimatePayload,
    });

    // Le WAF ne doit pas bloquer (même si la route retourne 404 ou autre)
    expect(response.status()).not.toBe(403);
  });
});

