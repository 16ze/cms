import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { reservationsStoreInstance } from "@/lib/reservations-store";

interface CancelConfirmedRequest {
  reason: string;
  adminNotes?: string;
}

// POST - Annuler une réservation confirmée
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const cancelData: CancelConfirmedRequest = await request.json();

    console.log(`❌ Demande d'annulation post-confirmation pour la réservation ${reservationId}`);

    // Vérifier que la raison est fournie
    if (!cancelData.reason || cancelData.reason.trim() === "") {
      return NextResponse.json(
        { error: "Une raison d'annulation est requise" },
        { status: 400 }
      );
    }

    // Trouver la réservation à annuler
    const currentReservation = reservationsStoreInstance.getById(reservationId);

    if (!currentReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (currentReservation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cette réservation est déjà annulée" },
        { status: 400 }
      );
    }

    const previousStatus = currentReservation.status;

    // Mettre à jour la réservation avec le statut CANCELLED
    const updatedReservation = reservationsStoreInstance.update(reservationId, {
      status: "CANCELLED",
      adminNotes: `${currentReservation.adminNotes ? currentReservation.adminNotes + ' | ' : ''}Annulé par admin: ${cancelData.reason}`,
    });

    if (!updatedReservation) {
      return NextResponse.json(
        { error: "Erreur lors de l'annulation de la réservation" },
        { status: 500 }
      );
    }

    console.log(`✅ Réservation ${reservationId} annulée avec succès (était ${previousStatus})`);

    // Envoyer un email de notification d'annulation
    await sendCancellationNotificationEmail(
      updatedReservation,
      cancelData.reason,
      previousStatus === "CONFIRMED"
    );

    return NextResponse.json({
      success: true,
      message: "Réservation annulée avec succès",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'annulation de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour envoyer un email de notification d'annulation
async function sendCancellationNotificationEmail(
  reservation: any,
  reason: string,
  wasConfirmed: boolean
): Promise<void> {
  try {
    console.log(`📧 Envoi d'email d'annulation à ${reservation.clientEmail}`);

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
        
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 20px;">❌ Votre rendez-vous a été annulé</h2>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Bonjour <strong>${reservation.clientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Nous sommes désolés de vous informer que votre rendez-vous${wasConfirmed ? ' confirmé' : ''} a dû être annulé.
        </p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #991b1b; font-size: 18px; margin-top: 0;">Raison de l'annulation</h3>
          <p style="color: #991b1b; margin: 0;">${reason}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1e40af; font-size: 18px; margin-top: 0;">Détails du rendez-vous annulé</h3>
          <p><strong>Type :</strong> ${getReservationTypeLabel(reservation.reservationType)}</p>
          <p><strong>Date et heure :</strong> ${formatDate(reservation.startTime)}</p>
          <p><strong>Mode de communication :</strong> ${
            reservation.communicationMethod === "VISIO" ? "Visioconférence" : "Téléphone"
          }</p>
          <p><strong>Projet :</strong> ${reservation.projectDescription}</p>
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 500;">
            💡 <strong>Reprogrammer un nouveau rendez-vous :</strong><br>
            Nous vous invitons à programmer un nouveau créneau qui vous conviendrait mieux.
            N'hésitez pas à nous contacter pour organiser une nouvelle consultation.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #374151; margin-bottom: 15px;">
            Pour programmer un nouveau rendez-vous ou nous poser une question :
          </p>
          <div style="margin: 15px 0;">
            <a href="https://www.kairo-digital.fr/consultation" 
               style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 5px;">
              Prendre un nouveau rendez-vous
            </a>
          </div>
          <div style="margin: 15px 0;">
            <a href="mailto:contact.kairodigital@gmail.com" 
               style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 5px;">
              Nous contacter par email
            </a>
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px; text-align: center;">
            <strong>Encore désolé pour ce désagrément.</strong><br>
            Nous mettrons tout en œuvre pour éviter que cela ne se reproduise.
          </p>
        </div>
        
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
      subject: "❌ Votre rendez-vous avec KAIRO Digital a été annulé",
      text: `Votre rendez-vous a été annulé. Raison: ${reason}. Rendez-vous prévu: ${formatDate(reservation.startTime)}`,
      html: emailHtml,
    });

    if (emailSent) {
      console.log(`✅ Email d'annulation envoyé à ${reservation.clientEmail}`);
    } else {
      console.log(`❌ Échec d'envoi de l'email d'annulation à ${reservation.clientEmail}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email d'annulation:", error);
  }
}
