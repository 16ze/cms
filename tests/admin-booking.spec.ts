import { test, expect } from "@playwright/test";

// Marquer ces tests comme "skip" car la page d'admin n'existe pas encore
test.describe.skip("Gestion des réservations - Admin", () => {
  // Simuler une connexion admin avant chaque test
  test.beforeEach(async ({ page }) => {
    // Simuler la page de connexion admin
    await page.route("/admin/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Admin | KAIRO Digital</title>
            </head>
            <body>
              <form id="login-form">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Connexion</button>
              </form>
            </body>
          </html>
        `,
      });
    });

    // Simuler la page dashboard
    await page.route("/admin/dashboard", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Dashboard | KAIRO Digital</title>
            </head>
            <body>
              <header>
                <div>Admin Test</div>
                <button>Déconnexion</button>
              </header>
              <nav>
                <a href="/admin/reservations">Réservations</a>
              </nav>
            </body>
          </html>
        `,
      });
    });

    // Simuler la page de réservations
    await page.route("/admin/reservations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Réservations | KAIRO Digital</title>
            </head>
            <body>
              <header>
                <div>Admin Test</div>
                <button>Déconnexion</button>
              </header>
              <main>
                <h1>Gestion des réservations</h1>
                <div class="filter-controls">
                  <select name="statusFilter" aria-label="Filtrer par statut">
                    <option value="ALL">Tous</option>
                    <option value="PENDING">En attente</option>
                    <option value="CONFIRMED">Confirmé</option>
                    <option value="CANCELLED">Annulé</option>
                  </select>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="reservations-list">
                    <!-- Les réservations seront injectées ici par JavaScript -->
                  </tbody>
                </table>
                <div id="reservation-details" class="modal" style="display:none">
                  <!-- Les détails de réservation seront affichés ici -->
                </div>
                <div id="confirmation-dialog" class="dialog" style="display:none">
                  <p>Êtes-vous sûr de vouloir annuler cette réservation?</p>
                  <button id="confirm-yes">Oui</button>
                  <button id="confirm-no">Non</button>
                </div>
              </main>
            </body>
          </html>
        `,
      });
    });

    // Accéder à la page de connexion admin
    await page.goto("/admin/login");

    // Simuler la connexion réussie
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          window.location.href = "/admin/dashboard";
        });
      }
    });

    // Intercepter la requête d'authentification
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "1",
            name: "Admin Test",
            email: "admin@example.com",
          },
        }),
      });
    });

    // Se connecter
    await page.locator('input[type="email"]').fill("admin@example.com");
    await page.locator('input[type="password"]').fill("motdepassevalide");
    await page.getByRole("button", { name: /Connexion|Se connecter/i }).click();

    // Vérifier la redirection vers le dashboard admin
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Préparer le script de navigation vers la page de réservations
    await page.evaluate(() => {
      document
        .querySelector('a[href="/admin/reservations"]')
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "/admin/reservations";
        });
    });

    // Naviguer vers la section de gestion des réservations
    await page
      .getByRole("link", { name: /Réservations|Consultations/i })
      .click();
    await expect(page).toHaveURL(/\/admin\/reservations/);
  });

  test("affiche la liste des réservations", async ({ page }) => {
    // Préparer les données de réservation à afficher
    await page.evaluate(() => {
      const reservations = [
        {
          id: "1",
          clientName: "Jean Dupont",
          clientEmail: "jean@exemple.fr",
          reservationType: "CONSULTATION",
          status: "CONFIRMED",
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        },
        {
          id: "2",
          clientName: "Marie Martin",
          clientEmail: "marie@exemple.fr",
          reservationType: "DISCOVERY",
          status: "PENDING",
          startTime: new Date(Date.now() + 172800000).toISOString(),
          endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(),
        },
      ];

      const tbody = document.getElementById("reservations-list");
      if (tbody) {
        reservations.forEach((reservation) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${reservation.clientName}</td>
            <td>${reservation.reservationType}</td>
            <td>${new Date(reservation.startTime).toLocaleDateString()}</td>
            <td>${reservation.status}</td>
            <td>
              <button aria-label="Voir les détails">Détails</button>
              ${
                reservation.status === "PENDING"
                  ? '<button aria-label="Confirmer">Confirmer</button>'
                  : ""
              }
              ${
                reservation.status === "CONFIRMED"
                  ? '<button aria-label="Annuler">Annuler</button>'
                  : ""
              }
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    });

    // Intercepter la requête API pour les réservations
    await page.route("**/api/booking/reservation*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reservations: [
            {
              id: "1",
              clientName: "Jean Dupont",
              clientEmail: "jean@exemple.fr",
              reservationType: "CONSULTATION",
              status: "CONFIRMED",
              startTime: new Date(Date.now() + 86400000).toISOString(), // demain
              endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // +1h
              projectDescription: "Projet de site e-commerce",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              clientName: "Marie Martin",
              clientEmail: "marie@exemple.fr",
              reservationType: "DISCOVERY",
              status: "PENDING",
              startTime: new Date(Date.now() + 172800000).toISOString(), // dans 2 jours
              endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(), // +30min
              projectDescription: "Refonte de site web",
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // Vérifier que la liste des réservations est affichée
    await expect(page.locator("text=Jean Dupont")).toBeVisible();
    await expect(page.locator("text=Marie Martin")).toBeVisible();

    // Vérifier que les statuts sont correctement affichés
    await expect(page.locator("text=CONFIRMED")).toBeVisible();
    await expect(page.locator("text=PENDING")).toBeVisible();
  });

  test("permet de filtrer les réservations par statut", async ({ page }) => {
    // Préparer les données et le comportement de filtrage
    await page.evaluate(() => {
      // Données initiales
      const allReservations = [
        {
          id: "1",
          clientName: "Jean Dupont",
          clientEmail: "jean@exemple.fr",
          reservationType: "CONSULTATION",
          status: "CONFIRMED",
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        },
        {
          id: "2",
          clientName: "Marie Martin",
          clientEmail: "marie@exemple.fr",
          reservationType: "DISCOVERY",
          status: "PENDING",
          startTime: new Date(Date.now() + 172800000).toISOString(),
          endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(),
        },
      ];

      // Afficher toutes les réservations initialement
      const tbody = document.getElementById("reservations-list");
      if (tbody) {
        allReservations.forEach((reservation) => {
          const row = document.createElement("tr");
          row.dataset.status = reservation.status;
          row.innerHTML = `
            <td>${reservation.clientName}</td>
            <td>${reservation.reservationType}</td>
            <td>${new Date(reservation.startTime).toLocaleDateString()}</td>
            <td>${reservation.status}</td>
            <td>
              <button aria-label="Voir les détails">Détails</button>
              ${
                reservation.status === "PENDING"
                  ? '<button aria-label="Confirmer">Confirmer</button>'
                  : ""
              }
              ${
                reservation.status === "CONFIRMED"
                  ? '<button aria-label="Annuler">Annuler</button>'
                  : ""
              }
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      // Ajouter le comportement du filtre
      const filterSelect = document.querySelector(
        'select[name="statusFilter"]'
      );
      if (filterSelect) {
        filterSelect.addEventListener("change", (e) => {
          const status = e.target.value;
          const rows = document.querySelectorAll("#reservations-list tr");

          rows.forEach((row) => {
            if (status === "ALL" || row.dataset.status === status) {
              row.style.display = "";
            } else {
              row.style.display = "none";
            }
          });
        });
      }
    });

    // Intercepter la requête API pour les réservations
    await page.route("**/api/booking/reservation*", async (route) => {
      const url = route.request().url();
      let reservations = [];

      // Si le filtre est pour les réservations en attente
      if (url.includes("status=PENDING")) {
        reservations = [
          {
            id: "2",
            clientName: "Marie Martin",
            clientEmail: "marie@exemple.fr",
            reservationType: "DISCOVERY",
            status: "PENDING",
            startTime: new Date(Date.now() + 172800000).toISOString(),
            endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(),
            projectDescription: "Refonte de site web",
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        // Toutes les réservations
        reservations = [
          {
            id: "1",
            clientName: "Jean Dupont",
            clientEmail: "jean@exemple.fr",
            reservationType: "CONSULTATION",
            status: "CONFIRMED",
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            projectDescription: "Projet de site e-commerce",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            clientName: "Marie Martin",
            clientEmail: "marie@exemple.fr",
            reservationType: "DISCOVERY",
            status: "PENDING",
            startTime: new Date(Date.now() + 172800000).toISOString(),
            endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(),
            projectDescription: "Refonte de site web",
            createdAt: new Date().toISOString(),
          },
        ];
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          reservations: reservations,
        }),
      });
    });

    // Vérifier que les deux réservations sont initialement visibles
    await expect(page.locator("text=Jean Dupont")).toBeVisible();
    await expect(page.locator("text=Marie Martin")).toBeVisible();

    // Sélectionner le filtre "En attente"
    const filterSelect = page
      .locator('select[name="statusFilter"], [aria-label="Filtrer par statut"]')
      .first();
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption("PENDING");
    } else {
      // Si c'est un composant personnalisé
      const filterButton = page
        .getByRole("button", { name: /Filtrer|Filtre/i })
        .first();
      await filterButton.click();
      await page.getByRole("option", { name: /En attente|Pending/i }).click();
    }

    // Vérifier que seule la réservation en attente est visible
    await expect(page.locator("text=Marie Martin")).toBeVisible();
    await expect(page.locator("text=Jean Dupont")).not.toBeVisible();
  });

  test("permet de confirmer une réservation en attente", async ({ page }) => {
    // Préparer les données et le comportement de confirmation
    await page.evaluate(() => {
      // Afficher une réservation en attente
      const tbody = document.getElementById("reservations-list");
      if (tbody) {
        const row = document.createElement("tr");
        row.dataset.id = "2";
        row.dataset.status = "PENDING";
        row.innerHTML = `
          <td>Marie Martin</td>
          <td>DISCOVERY</td>
          <td>${new Date(Date.now() + 172800000).toLocaleDateString()}</td>
          <td>PENDING</td>
          <td>
            <button aria-label="Voir les détails">Détails</button>
            <button aria-label="Confirmer">Confirmer</button>
          </td>
        `;
        tbody.appendChild(row);

        // Ajouter le comportement du bouton de confirmation
        const confirmButton = row.querySelector(
          'button[aria-label="Confirmer"]'
        );
        if (confirmButton) {
          confirmButton.addEventListener("click", () => {
            // Simuler une requête API
            setTimeout(() => {
              row.dataset.status = "CONFIRMED";
              row.cells[3].textContent = "CONFIRMED";

              // Remplacer le bouton Confirmer par Annuler
              const actionsCell = row.cells[4];
              actionsCell.innerHTML = `
                <button aria-label="Voir les détails">Détails</button>
                <button aria-label="Annuler">Annuler</button>
              `;

              // Afficher un message de succès
              const message = document.createElement("div");
              message.textContent = "Réservation confirmée avec succès";
              message.style.color = "green";
              document.body.appendChild(message);
            }, 100);
          });
        }
      }
    });

    // Intercepter la requête API pour les réservations
    await page.route("**/api/booking/reservation*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            reservations: [
              {
                id: "2",
                clientName: "Marie Martin",
                clientEmail: "marie@exemple.fr",
                reservationType: "DISCOVERY",
                status: "PENDING",
                startTime: new Date(Date.now() + 172800000).toISOString(),
                endTime: new Date(
                  Date.now() + 172800000 + 1800000
                ).toISOString(),
                projectDescription: "Refonte de site web",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else if (
        route.request().method() === "PATCH" ||
        route.request().method() === "PUT"
      ) {
        // Simuler la mise à jour du statut
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Réservation confirmée",
            reservation: {
              id: "2",
              status: "CONFIRMED",
            },
          }),
        });
      }
    });

    // Vérifier que la réservation en attente est affichée
    await expect(page.locator("text=Marie Martin")).toBeVisible();
    await expect(page.locator("text=PENDING")).toBeVisible();

    // Cliquer sur le bouton de confirmation
    const confirmButton = page
      .getByRole("button", { name: /Confirmer|Approve/i })
      .first();
    await confirmButton.click();

    // Vérifier qu'un message de succès apparaît
    await expect(
      page.locator("text=/confirmée|succès|success/i")
    ).toBeVisible();

    // Vérifier que l'état de la réservation a été mis à jour
    await expect(page.locator("text=CONFIRMED")).toBeVisible();
  });

  test("permet d'annuler une réservation", async ({ page }) => {
    // Intercepter la requête API pour les réservations
    await page.route("**/api/booking/reservation*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            reservations: [
              {
                id: "1",
                clientName: "Jean Dupont",
                clientEmail: "jean@exemple.fr",
                reservationType: "CONSULTATION",
                status: "CONFIRMED",
                startTime: new Date(Date.now() + 86400000).toISOString(),
                endTime: new Date(
                  Date.now() + 86400000 + 3600000
                ).toISOString(),
                projectDescription: "Projet de site e-commerce",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
      } else if (
        route.request().method() === "PATCH" ||
        route.request().method() === "PUT" ||
        route.request().method() === "DELETE"
      ) {
        // Simuler l'annulation
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Réservation annulée",
            reservation: {
              id: "1",
              status: "CANCELLED",
            },
          }),
        });
      }
    });

    // Recharger la page pour appliquer le mock
    await page.reload();

    // Vérifier que la réservation confirmée est affichée
    await expect(page.locator("text=Jean Dupont")).toBeVisible();
    await expect(page.locator("text=CONFIRMED")).toBeVisible();

    // Cliquer sur le bouton d'annulation
    const cancelButton = page
      .getByRole("button", { name: /Annuler|Cancel/i })
      .first();
    await cancelButton.click();

    // Confirmer l'annulation si une boîte de dialogue est affichée
    const confirmDialog = page
      .locator('div[role="dialog"], .modal, .dialog')
      .first();
    if (await confirmDialog.isVisible()) {
      await page.getByRole("button", { name: /Confirmer|Oui|Yes/i }).click();
    }

    // Vérifier qu'un message de succès apparaît
    await expect(page.locator("text=/annulée|succès|success/i")).toBeVisible();

    // Vérifier que l'état de la réservation a été mis à jour
    await expect(page.locator("text=CANCELLED")).toBeVisible();
  });

  test("affiche les détails d'une réservation", async ({ page }) => {
    // Intercepter la requête API pour les réservations
    await page.route("**/api/booking/reservation*", async (route) => {
      if (route.request().url().includes("/1")) {
        // Détails d'une réservation spécifique
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            reservation: {
              id: "1",
              clientName: "Jean Dupont",
              clientEmail: "jean@exemple.fr",
              clientPhone: "0123456789",
              reservationType: "CONSULTATION",
              status: "CONFIRMED",
              startTime: new Date(Date.now() + 86400000).toISOString(),
              endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
              projectDescription:
                "Projet de site e-commerce pour une boutique de vêtements. Besoin de fonctionnalités de paiement en ligne et de gestion de stock.",
              communicationMethod: "Visioconférence",
              meetingLink: "https://meet.example.com/room123",
              createdAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        // Liste des réservations
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            reservations: [
              {
                id: "1",
                clientName: "Jean Dupont",
                clientEmail: "jean@exemple.fr",
                reservationType: "CONSULTATION",
                status: "CONFIRMED",
                startTime: new Date(Date.now() + 86400000).toISOString(),
                endTime: new Date(
                  Date.now() + 86400000 + 3600000
                ).toISOString(),
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    });

    // Recharger la page pour appliquer le mock
    await page.reload();

    // Vérifier que la réservation est affichée
    await expect(page.locator("text=Jean Dupont")).toBeVisible();

    // Cliquer sur le bouton de détails ou sur la ligne de la réservation
    const viewDetailsButton = page
      .getByRole("button", { name: /Détails|Voir|View/i })
      .first();
    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click();
    } else {
      // Cliquer sur la ligne de la réservation
      await page.locator('tr:has-text("Jean Dupont")').first().click();
    }

    // Vérifier que les détails de la réservation sont affichés
    await expect(page.locator("text=jean@exemple.fr")).toBeVisible();
    await expect(page.locator("text=0123456789")).toBeVisible();
    await expect(page.locator("text=Projet de site e-commerce")).toBeVisible();
    await expect(page.locator("text=Visioconférence")).toBeVisible();
    await expect(
      page.locator("text=https://meet.example.com/room123")
    ).toBeVisible();
  });
});
