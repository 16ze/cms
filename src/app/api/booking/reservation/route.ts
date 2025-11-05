import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../../lib/email-service";
import { notificationService as notificationServiceWS } from "../../../../lib/websocket";
import { notificationService } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import {
  reservationsStoreInstance,
  type ReservationData,
} from "../../../../lib/reservations-store";
import { validateRequest, commonSchemas } from "@/lib/validation";
import { z } from "zod";

// Schéma de validation pour les réservations
const reservationSchema = z.object({
  clientName: commonSchemas.nonEmptyString,
  clientEmail: commonSchemas.email,
  clientPhone: commonSchemas.phone.optional(),
  projectDescription: commonSchemas.nonEmptyString,
  communicationMethod: z.enum(["VISIO", "PHONE"]),
  reservationType: z.enum(["DISCOVERY", "CONSULTATION", "PRESENTATION", "FOLLOWUP"]),
  startTime: z.string().datetime().or(z.coerce.date()),
  endTime: z.string().datetime().or(z.coerce.date()),
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  console.log("📝 API: Début de traitement POST /api/booking/reservation");

  try {
    // Validation avec Zod
    const validation = await validateRequest(request, reservationSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data;

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

    // Envoyer une notification admin en temps réel (WebSocket)
    try {
      notificationServiceWS.sendNewReservationNotification(newReservation);
      console.log(
        "🔔 Notification WebSocket admin envoyée pour la nouvelle réservation"
      );
    } catch (notificationError) {
      console.error(
        "❌ Erreur lors de l'envoi de la notification WebSocket admin:",
        notificationError
      );
    }

    // Créer une notification persistante pour tous les admins
    try {
      const admins = await prisma.adminUser.findMany({
        where: {
          role: {
            in: ["ADMIN", "SUPER_ADMIN"],
          },
        },
      });

      for (const admin of admins) {
        await notificationService.notifyNewReservation(
          admin.id,
          newReservation
        );
      }

      console.log(
        `✅ Notifications persistantes créées pour ${admins.length} admins`
      );
    } catch (notificationError) {
      console.error(
        "❌ Erreur lors de la création des notifications persistantes:",
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
