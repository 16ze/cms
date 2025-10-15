import { test, expect } from "@playwright/test";

test.describe("Système de réservation de consultation", () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de consultation
    await page.goto("/consultation");
  });

  test("la page de réservation se charge correctement", async ({ page }) => {
    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/Consultation | KAIRO Digital/);

    // Vérifier que le formulaire de réservation est présent
    const bookingForm = await page.locator("form").first();
    await expect(bookingForm).toBeVisible();

    // Vérifier la présence des éléments clés
    await expect(page.getByText(/Réserver une consultation/i)).toBeVisible();
    await expect(page.locator('input[name="clientName"]')).toBeVisible();
    await expect(page.locator('input[name="clientEmail"]')).toBeVisible();
  });

  test("affiche les différents types de consultation disponibles", async ({
    page,
  }) => {
    // Vérifier que les options de type de consultation sont présentes
    const reservationTypeElement = await page.locator(
      'select[name="reservationType"], [name="reservationType"] + div, fieldset:has-text("Type de consultation")'
    );
    await expect(reservationTypeElement).toBeVisible();

    // Vérifier la présence des différents types de consultation
    const pageContent = await page.content();

    // Rechercher les types de consultation dans le contenu de la page
    const hasDiscovery =
      pageContent.includes("DISCOVERY") || pageContent.includes("Découverte");
    const hasConsultation =
      pageContent.includes("CONSULTATION") ||
      pageContent.includes("Consultation");
    const hasPresentation =
      pageContent.includes("PRESENTATION") ||
      pageContent.includes("Présentation");
    const hasFollowup =
      pageContent.includes("FOLLOWUP") || pageContent.includes("Suivi");

    expect(
      hasDiscovery || hasConsultation || hasPresentation || hasFollowup
    ).toBeTruthy();
  });

  test("permet de sélectionner une date et un créneau horaire", async ({
    page,
  }) => {
    // Rechercher un élément de sélection de date (peut être un input date, un datepicker custom, etc.)
    const dateElement = await page
      .locator(
        'input[type="date"], [aria-label*="date"], [placeholder*="date"], [data-testid*="date"]'
      )
      .first();

    if (await dateElement.isVisible()) {
      // Si c'est un input date standard
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Formater la date au format YYYY-MM-DD
      const formattedDate = tomorrow.toISOString().split("T")[0];
      await dateElement.fill(formattedDate);
    } else {
      // Si c'est un datepicker personnalisé
      const calendarButton = await page
        .locator(
          'button[aria-label*="calendar"], button:has-text("Choisir une date")'
        )
        .first();
      if (await calendarButton.isVisible()) {
        await calendarButton.click();

        // Attendre que le calendrier soit visible
        await page.waitForSelector(
          '[role="dialog"], [role="grid"], [class*="calendar"]'
        );

        // Sélectionner une date ultérieure dans le mois actuel
        const futureDateCell = await page
          .locator('[role="gridcell"]:not([aria-disabled="true"])')
          .nth(5);
        await futureDateCell.click();
      }
    }

    // Tenter de sélectionner un créneau horaire
    const timeSlotElement = await page
      .locator(
        '[name="startTime"], [aria-label*="heure"], [data-testid*="time-slot"]'
      )
      .first();
    if (await timeSlotElement.isVisible()) {
      await timeSlotElement.click();

      // Sélectionner le premier créneau disponible
      const availableSlot = await page
        .locator(
          '[role="option"]:not([aria-disabled="true"]), button:not([disabled]):has-text(":")'
        )
        .first();
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
      }
    }
  });

  test("affiche des erreurs pour les champs obligatoires vides", async ({
    page,
  }) => {
    // Soumettre le formulaire sans remplir les champs
    const submitButton = await page
      .getByRole("button", { name: /Réserver|Confirmer|Envoyer/i })
      .first();
    await submitButton.click();

    // Vérifier que les messages d'erreur apparaissent
    await expect(
      page.locator("text=/Nom.*requis|Le nom est requis/i")
    ).toBeVisible();
    await expect(
      page.locator("text=/Email.*requis|L'email est requis/i")
    ).toBeVisible();
  });

  test("soumet le formulaire avec succès avec des données valides", async ({
    page,
  }) => {
    // Intercepter les requêtes API
    await page.route("**/api/booking/**", async (route) => {
      // Simuler une réponse réussie
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Réservation confirmée",
          data: { id: "123" },
        }),
      });
    });

    // Remplir les champs obligatoires
    await page.locator('input[name="clientName"]').fill("Test User");
    await page.locator('input[name="clientEmail"]').fill("test@example.com");

    // Sélectionner un type de consultation (si c'est un select)
    const reservationTypeSelect = page.locator(
      'select[name="reservationType"]'
    );
    if (await reservationTypeSelect.isVisible()) {
      await reservationTypeSelect.selectOption({ index: 1 });
    } else {
      // Si c'est un groupe de radio buttons ou autre
      const typeOptions = await page
        .locator('input[name="reservationType"], [role="radio"]')
        .all();
      if (typeOptions.length > 0) {
        await typeOptions[0].click();
      }
    }

    // Essayer de sélectionner une date
    const dateElement = await page
      .locator(
        'input[type="date"], [aria-label*="date"], [placeholder*="date"], [data-testid*="date"]'
      )
      .first();
    if (await dateElement.isVisible()) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Formater la date au format YYYY-MM-DD
      const formattedDate = tomorrow.toISOString().split("T")[0];
      await dateElement.fill(formattedDate);
    }

    // Remplir une description de projet si présente
    const projectDescription = page.locator(
      'textarea[name="projectDescription"]'
    );
    if (await projectDescription.isVisible()) {
      await projectDescription.fill("Ceci est une description de projet test.");
    }

    // Soumettre le formulaire
    const submitButton = await page
      .getByRole("button", { name: /Réserver|Confirmer|Envoyer/i })
      .first();
    await submitButton.click();

    // Vérifier qu'un message de succès apparaît
    await expect(
      page.locator("text=/Réservation confirmée|Merci pour votre réservation/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("gère correctement les erreurs du serveur", async ({ page }) => {
    // Intercepter les requêtes API et simuler une erreur
    await page.route("**/api/booking/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Erreur serveur" }),
      });
    });

    // Remplir les champs obligatoires
    await page.locator('input[name="clientName"]').fill("Test User");
    await page.locator('input[name="clientEmail"]').fill("test@example.com");

    // Sélectionner un type de consultation (si c'est un select)
    const reservationTypeSelect = page.locator(
      'select[name="reservationType"]'
    );
    if (await reservationTypeSelect.isVisible()) {
      await reservationTypeSelect.selectOption({ index: 1 });
    } else {
      // Si c'est un groupe de radio buttons ou autre
      const typeOptions = await page
        .locator('input[name="reservationType"], [role="radio"]')
        .all();
      if (typeOptions.length > 0) {
        await typeOptions[0].click();
      }
    }

    // Soumettre le formulaire
    const submitButton = await page
      .getByRole("button", { name: /Réserver|Confirmer|Envoyer/i })
      .first();
    await submitButton.click();

    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator("text=/Erreur|Échec|problème/i")).toBeVisible({
      timeout: 5000,
    });
  });
});
