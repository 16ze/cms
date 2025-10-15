import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import {
  reservationsStoreInstance,
  type ReservationData,
} from "@/lib/reservations-store";

// Interface pour la mise à jour du statut
interface UpdateStatusRequest {
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  adminNotes?: string;
}

// Utilisation du store partagé des réservations

// GET - Récupérer une réservation spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const reservation = reservationsStoreInstance.getById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour le statut d'une réservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const updateData: UpdateStatusRequest = await request.json();

    // Trouver la réservation à mettre à jour
    const currentReservation = reservationsStoreInstance.getById(reservationId);

    if (!currentReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    const previousStatus = currentReservation.status;

    // Mettre à jour la réservation
    const updatedReservation = reservationsStoreInstance.update(reservationId, {
      status: updateData.status,
      adminNotes: updateData.adminNotes || currentReservation.adminNotes,
    });

    if (!updatedReservation) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    console.log(
      `📝 Mise à jour du statut de la réservation ${reservationId}: ${previousStatus} → ${updateData.status}`
    );

    // Envoyer un email de notification au client si le statut a changé
    if (previousStatus !== updateData.status) {
      await sendStatusUpdateEmail(updatedReservation, previousStatus);
    }

    return NextResponse.json({
      success: true,
      message: "Statut de la réservation mis à jour avec succès",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour envoyer un email de mise à jour de statut
async function sendStatusUpdateEmail(
  reservation: any,
  previousStatus: string
): Promise<void> {
  try {
    console.log(
      `📧 Envoi d'email de mise à jour de statut pour ${reservation.clientEmail}`
    );

    const statusMessages = {
      CONFIRMED: {
        subject: "✅ Votre rendez-vous avec KAIRO Digital a été confirmé",
        title: "Rendez-vous confirmé !",
        message:
          "Excellente nouvelle ! Votre demande de consultation a été confirmée.",
        color: "#10b981", // green
        action: "Votre rendez-vous aura lieu comme prévu.",
      },
      CANCELLED: {
        subject: "❌ Votre rendez-vous avec KAIRO Digital a été annulé",
        title: "Rendez-vous annulé",
        message: "Nous vous informons que votre rendez-vous a dû être annulé.",
        color: "#ef4444", // red
        action: "Nous vous contacterons prochainement pour reprogrammer.",
      },
      PENDING: {
        subject: "⏳ Votre demande de rendez-vous est en cours de traitement",
        title: "Demande en cours de traitement",
        message: "Votre demande de consultation est actuellement à l'étude.",
        color: "#f59e0b", // yellow
        action: "Nous vous répondrons dans les plus brefs délais.",
      },
    };

    const statusInfo =
      statusMessages[reservation.status as keyof typeof statusMessages];

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getReservationTypeLabel = (type: string) => {
      const types = {
        DISCOVERY: "Appel découverte",
        CONSULTATION: "Consultation stratégique",
        PRESENTATION: "Présentation de projet",
        FOLLOWUP: "Suivi de projet",
      };
      return types[type as keyof typeof types] || type;
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">
            <span style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;">KAIRO</span>
            <span style="color: #6b7280; font-size: 16px; font-weight: normal;">Digital</span>
          </h1>
        </div>
        
        <div style="background-color: ${
          statusInfo.color
        }; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 20px;">${statusInfo.title}</h2>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Bonjour <strong>${reservation.clientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          ${statusInfo.message}
        </p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1e40af; font-size: 18px; margin-top: 0;">Détails de votre rendez-vous</h3>
          <p><strong>Type :</strong> ${getReservationTypeLabel(
            reservation.reservationType
          )}</p>
          <p><strong>Date et heure :</strong> ${formatDate(
            reservation.startTime
          )}</p>
          <p><strong>Mode de communication :</strong> ${
            reservation.communicationMethod === "VISIO"
              ? "Visioconférence"
              : "Téléphone"
          }</p>
          <p><strong>Projet :</strong> ${reservation.projectDescription}</p>
          ${
            reservation.adminNotes
              ? `<p><strong>Note :</strong> ${reservation.adminNotes}</p>`
              : ""
          }
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 500;">
            ${statusInfo.action}
          </p>
        </div>
        
        ${
          reservation.status === "CONFIRMED"
            ? `
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #374151; margin-bottom: 15px;">
              Si vous avez des questions ou besoin de modifier ce rendez-vous :
            </p>
            <a href="mailto:contact.kairodigital@gmail.com" 
               style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Nous contacter
            </a>
          </div>
        `
            : ""
        }
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>KAIRO Digital - Développement web et solutions digitales</p>
          <p>Email: <a href="mailto:contact.kairodigital@gmail.com" style="color: #1e40af;">contact.kairodigital@gmail.com</a></p>
          <p>&copy; ${new Date().getFullYear()} KAIRO Digital - Tous droits réservés</p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail({
      to: reservation.clientEmail,
      subject: statusInfo.subject,
      text: `${statusInfo.message} Rendez-vous: ${formatDate(
        reservation.startTime
      )}`,
      html: emailHtml,
    });

    if (emailSent) {
      console.log(
        `✅ Email de mise à jour envoyé à ${reservation.clientEmail}`
      );
    } else {
      console.log(`❌ Échec d'envoi de l'email à ${reservation.clientEmail}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de mise à jour:", error);
  }
}
