import { NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/email-service";
import { notificationService } from "../../../../lib/websocket";
import {
  reservationsStoreInstance,
  type ReservationData,
} from "../../../../lib/reservations-store";

// Types pour la réservation
type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface ReservationRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectDescription: string;
  communicationMethod: "VISIO" | "PHONE";
  reservationType: "DISCOVERY" | "CONSULTATION" | "PRESENTATION" | "FOLLOWUP";
  startTime: Date;
  endTime: Date;
  userId: string;
}

// Utilisation du store partagé des réservations

export async function POST(request: Request) {
  console.log("📝 API: Début de traitement POST /api/booking/reservation");
  console.log("📝 ENV MODE: ", process.env.NODE_ENV || "non défini");
  console.log("📝 ENV EMAIL CONFIG: ", {
    EMAIL_SERVER: process.env.EMAIL_SERVER,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "DÉFINI" : "NON DÉFINI",
  });

  try {
    // Extraire les données de la requête
    let data: ReservationRequest;
    try {
      data = await request.json();
      console.log("📝 Données reçues:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("❌ Erreur de parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Valider les données reçues
    if (
      !data.clientName ||
      !data.clientEmail ||
      !data.startTime ||
      !data.endTime
    ) {
      console.error("❌ Données de réservation incomplètes:", data);
      return NextResponse.json(
        { error: "Informations manquantes pour la réservation" },
        { status: 400 }
      );
    }

    // Créer un ID unique pour la réservation
    const reservationId = `res-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Créer une nouvelle réservation
    const newReservation: ReservationData = {
      id: reservationId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      projectDescription: data.projectDescription,
      communicationMethod: data.communicationMethod,
      reservationType: data.reservationType,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      userId: data.userId,
    };

    // Ajouter la réservation au store partagé
    reservationsStoreInstance.add(newReservation);
    console.log(`✅ Réservation créée avec l'ID: ${reservationId}`);

    // Envoyer un email de confirmation au client
    console.log("📧 Tentative d'envoi des emails de confirmation...");
    let emailClientSent = false;
    let emailAdminSent = false;
    const emailErrors: string[] = [];

    try {
      // Email au client
      console.log(`📧 Envoi d'email au client: ${data.clientEmail}`);

      const emailToClientResult = await sendEmail({
        to: data.clientEmail,
        subject:
          "Confirmation de votre demande de consultation avec KAIRO Digital",
        text: `Bonjour ${
          data.clientName
        },\n\nNous avons bien reçu votre demande de consultation. Un membre de notre équipe va confirmer rapidement ce rendez-vous.\n\nDate: ${new Date(
          data.startTime
        ).toLocaleDateString("fr-FR")}\nHeure: ${new Date(
          data.startTime
        ).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(data.endTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}\n\nMerci de votre confiance.\n\nL'équipe KAIRO Digital`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Confirmation de votre demande de consultation</h2>
            <p>Bonjour ${data.clientName},</p>
            <p>Nous avons bien reçu votre demande de consultation. Un membre de notre équipe va confirmer rapidement ce rendez-vous.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${new Date(
                data.startTime
              ).toLocaleDateString("fr-FR")}</p>
              <p><strong>Heure:</strong> ${new Date(
                data.startTime
              ).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(data.endTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
              <p><strong>Type de consultation:</strong> ${
                data.reservationType
              }</p>
              <p><strong>Méthode de communication:</strong> ${
                data.communicationMethod
              }</p>
            </div>
            <p>Merci de votre confiance.</p>
            <p>L'équipe KAIRO Digital</p>
          </div>
        `,
      });

      emailClientSent = !!emailToClientResult;
      console.log(
        `📧 Email au client ${emailClientSent ? "envoyé ✅" : "échec ❌"}`
      );

      if (!emailClientSent) {
        emailErrors.push("Échec d'envoi de l'email client");
      }

      // Email à l'administrateur
      const adminEmail =
        process.env.ADMIN_EMAIL ||
        process.env.EMAIL_RECIPIENT ||
        "contact.kairodigital@gmail.com";
      console.log(`📧 Envoi d'email à l'administrateur: ${adminEmail}`);

      const emailToAdminResult = await sendEmail({
        to: adminEmail,
        subject: "Nouvelle demande de consultation",
        text: `Nouvelle demande de consultation de ${data.clientName} (${
          data.clientEmail
        })\n\nDate: ${new Date(data.startTime).toLocaleDateString(
          "fr-FR"
        )}\nHeure: ${new Date(data.startTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(data.endTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}\n\nDescription du projet: ${
          data.projectDescription
        }\n\nMéthode de communication: ${data.communicationMethod}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Nouvelle demande de consultation</h2>
            <p><strong>Client:</strong> ${data.clientName} (${
          data.clientEmail
        })</p>
            ${
              data.clientPhone
                ? `<p><strong>Téléphone:</strong> ${data.clientPhone}</p>`
                : ""
            }
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Date:</strong> ${new Date(
                data.startTime
              ).toLocaleDateString("fr-FR")}</p>
              <p><strong>Heure:</strong> ${new Date(
                data.startTime
              ).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(data.endTime).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
              <p><strong>Type de consultation:</strong> ${
                data.reservationType
              }</p>
              <p><strong>Méthode de communication:</strong> ${
                data.communicationMethod
              }</p>
              <p><strong>Description du projet:</strong> ${
                data.projectDescription
              }</p>
            </div>
            <p>Connectez-vous au <a href="${
              process.env.NEXT_PUBLIC_SITE_URL || "https://www.kairo-digital.fr"
            }/admin/reservations">panneau d'administration</a> pour gérer cette réservation.</p>
          </div>
        `,
      });

      emailAdminSent = !!emailToAdminResult;
      console.log(
        `📧 Email à l'administrateur ${
          emailAdminSent ? "envoyé ✅" : "échec ❌"
        }`
      );

      if (!emailAdminSent) {
        emailErrors.push("Échec d'envoi de l'email admin");
      }
    } catch (emailError) {
      console.error(
        "❌ Erreur globale lors de l'envoi des emails:",
        emailError
      );
      emailErrors.push(
        emailError instanceof Error ? emailError.message : String(emailError)
      );
    }

    // Envoyer une notification admin en temps réel
    try {
      notificationService.sendNewReservationNotification(newReservation);
      console.log("🔔 Notification admin envoyée pour la nouvelle réservation");
    } catch (notificationError) {
      console.error(
        "❌ Erreur lors de l'envoi de la notification admin:",
        notificationError
      );
    }

    // Même si l'envoi d'email échoue, la réservation reste créée
    return NextResponse.json(
      {
        success: true,
        message:
          "Réservation créée avec succès" +
          (emailClientSent ? "" : " (notification email non envoyée)"),
        reservation: newReservation,
        emailStatus: {
          clientEmailSent: emailClientSent,
          adminEmailSent: emailAdminSent,
          errors: emailErrors.length > 0 ? emailErrors : undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création de la réservation:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la réservation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    console.log("📝 API: Fin de traitement POST /api/booking/reservation");
  }
}

// Endpoint pour récupérer les réservations
export async function GET() {
  console.log("📝 API: Traitement GET /api/booking/reservation");

  try {
    // Récupérer toutes les réservations du store
    const allReservations = reservationsStoreInstance.getAll();

    return NextResponse.json({
      success: true,
      reservations: allReservations,
      count: allReservations.length,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des réservations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    );
  }
}
