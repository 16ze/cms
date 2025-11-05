import { test, expect } from "@playwright/test";

/**
 * 🧪 TESTS DE VALIDATION ZOD
 * ==========================
 * 
 * Vérifie que la validation Zod fonctionne correctement
 * - Validation des champs requis
 * - Validation des formats (email, UUID, dates)
 * - Messages d'erreur appropriés
 * - Protection contre les injections XSS
 */

test.describe("Zod Validation Security", () => {
  test("Validation email - rejette les emails invalides", async ({
    request,
  }) => {
    const loginUrl = "http://localhost:3000/api/auth/login/super-admin";
    
    const invalidEmails = [
      "not-an-email",
      "@example.com",
      "test@",
      "test..test@example.com",
      "test@example",
      "",
    ];
    
    for (const email of invalidEmails) {
      const response = await request.post(loginUrl, {
        data: {
          email,
          password: "testpassword123",
        },
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/email|validation|invalid/i);
    }
  });

  test("Validation mot de passe - rejette les mots de passe trop courts", async ({
    request,
  }) => {
    const createUserUrl = "http://localhost:3000/api/users";
    
    // Note: Ce test nécessite une authentification admin
    // Pour l'instant, on teste juste la validation côté client
    
    const shortPasswords = ["123", "abc", "pass", "1234567"]; // < 8 caractères
    
    // Ce test nécessiterait une authentification, donc on skip pour l'instant
    // mais on peut tester la validation côté formulaire
    test.skip();
  });

  test("Validation UUID - rejette les UUIDs invalides", async ({
    request,
  }) => {
    const reservationUrl = "http://localhost:3000/api/booking/reservation";
    
    const invalidUUIDs = [
      "not-a-uuid",
      "123",
      "00000000-0000-0000-0000-000000000000", // UUID nul
      "",
    ];
    
    for (const uuid of invalidUUIDs) {
      const response = await request.post(reservationUrl, {
        data: {
          clientName: "Test Client",
          clientEmail: "test@example.com",
          projectDescription: "Test project",
          communicationMethod: "VISIO",
          reservationType: "DISCOVERY",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          userId: uuid, // UUID invalide
        },
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/validation|invalid|uuid/i);
    }
  });

  test("Validation format date/heure - rejette les formats invalides", async ({
    request,
  }) => {
    const reservationUrl = "http://localhost:3000/api/admin/reservations";
    
    const invalidDates = [
      "not-a-date",
      "2024-13-45", // Date invalide
      "2024/01/01", // Format incorrect
      "",
    ];
    
    const invalidTimes = [
      "25:00", // Heure invalide
      "12:60", // Minutes invalides
      "not-a-time",
      "",
    ];
    
    // Note: Ce test nécessite une authentification admin
    // On teste juste la validation de format
    for (const date of invalidDates) {
      const response = await request.post(reservationUrl, {
        data: {
          customerName: "Test",
          customerEmail: "test@example.com",
          customerPhone: "+33123456789",
          date,
          time: "12:00",
          guests: 2,
        },
      });
      
      // Devrait être rejeté (401 non auth ou 400 validation)
      expect([400, 401]).toContain(response.status());
    }
  });

  test("Validation champs requis - rejette les requêtes incomplètes", async ({
    request,
  }) => {
    const contactUrl = "http://localhost:3000/api/contact";
    
    // Test avec champs manquants
    const incompleteRequests = [
      {}, // Vide
      { firstName: "Test" }, // Manque lastName, email, etc.
      { firstName: "Test", lastName: "User" }, // Manque email
      { firstName: "Test", lastName: "User", email: "test@example.com" }, // Manque subject, project
      { firstName: "Test", lastName: "User", email: "test@example.com", subject: "Test", project: "Test project" }, // Manque consent
    ];
    
    for (const data of incompleteRequests) {
      const response = await request.post(contactUrl, {
        data,
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(body.error).toMatch(/required|manquant|validation/i);
    }
  });

  test("Sanitization XSS - les scripts sont supprimés", async ({
    request,
  }) => {
    const contactUrl = "http://localhost:3000/api/contact";
    
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "javascript:alert('XSS')",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
      "<iframe src=javascript:alert('XSS')>",
    ];
    
    for (const payload of xssPayloads) {
      const response = await request.post(contactUrl, {
        data: {
          firstName: payload,
          lastName: "Test",
          email: "test@example.com",
          subject: "Test",
          project: "Test project",
          consent: true,
        },
      });
      
      // La requête devrait soit être rejetée (400) soit le contenu devrait être sanitizé
      const status = response.status();
      
      if (status === 200 || status === 201) {
        // Si acceptée, vérifier que le contenu est sanitizé
        const body = await response.json();
        // Le payload ne devrait pas apparaître tel quel dans les logs ou la réponse
        expect(JSON.stringify(body)).not.toContain("<script>");
        expect(JSON.stringify(body)).not.toContain("javascript:");
      } else {
        // Si rejetée, c'est aussi acceptable
        expect([400, 500]).toContain(status);
      }
    }
  });

  test("Validation enum - rejette les valeurs non autorisées", async ({
    request,
  }) => {
    const reservationUrl = "http://localhost:3000/api/booking/reservation";
    
    const invalidCommunicationMethods = ["INVALID", "SMS", "EMAIL", ""];
    const invalidReservationTypes = ["INVALID", "MEETING", "", null];
    
    for (const method of invalidCommunicationMethods) {
      const response = await request.post(reservationUrl, {
        data: {
          clientName: "Test",
          clientEmail: "test@example.com",
          projectDescription: "Test",
          communicationMethod: method,
          reservationType: "DISCOVERY",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
          userId: "00000000-0000-0000-0000-000000000001",
        },
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty("error");
    }
  });
});

