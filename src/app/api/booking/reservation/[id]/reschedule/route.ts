import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";
import { reservationsStoreInstance } from "@/lib/reservations-store";

interface RescheduleRequest {
  newStartTime: string;
  newEndTime: string;
  adminNotes?: string;
  reason?: string;
}

// POST - Déplacer une réservation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const rescheduleData: RescheduleRequest = await request.json();

    console.log(`📅 Demande de déplacement pour la réservation ${reservationId}`);

    // Trouver la réservation à déplacer
    const currentReservation = reservationsStoreInstance.getById(reservationId);

    if (!currentReservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que les nouvelles dates sont valides
    const newStartTime = new Date(rescheduleData.newStartTime);
    const newEndTime = new Date(rescheduleData.newEndTime);
    
    if (newStartTime >= newEndTime) {
      return NextResponse.json(
        { error: "L'heure de fin doit être postérieure à l'heure de début" },
        { status: 400 }
      );
    }

    if (newStartTime <= new Date()) {
      return NextResponse.json(
        { error: "Impossible de programmer une réservation dans le passé" },
        { status: 400 }
      );
    }

    // Vérifier les conflits avec d'autres réservations
    const allReservations = reservationsStoreInstance.getAll();
    const hasConflict = allReservations.some(reservation => {
      if (reservation.id === reservationId) return false; // Ignorer la réservation actuelle
      if (reservation.status === "CANCELLED") return false; // Ignorer les annulées
      
      const existingStart = new Date(reservation.startTime);
      const existingEnd = new Date(reservation.endTime);
      
      return (
        (newStartTime >= existingStart && newStartTime < existingEnd) ||
        (newEndTime > existingStart && newEndTime <= existingEnd) ||
        (newStartTime <= existingStart && newEndTime >= existingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "Ce créneau entre en conflit avec une autre réservation" },
        { status: 409 }
      );
    }

    const previousStartTime = currentReservation.startTime;
    const previousEndTime = currentReservation.endTime;

    // Mettre à jour la réservation avec les nouvelles dates
    const updatedReservation = reservationsStoreInstance.update(reservationId, {
      startTime: rescheduleData.newStartTime,
      endTime: rescheduleData.newEndTime,
      adminNotes: rescheduleData.adminNotes || currentReservation.adminNotes,
    });

    if (!updatedReservation) {
      return NextResponse.json(
        { error: "Erreur lors du déplacement de la réservation" },
        { status: 500 }
      );
    }

    console.log(`✅ Réservation ${reservationId} déplacée avec succès`);

    // Envoyer un email de notification de déplacement
    await sendRescheduleNotificationEmail(
      updatedReservation,
      previousStartTime,
      previousEndTime,
      rescheduleData.reason
    );

    return NextResponse.json({
      success: true,
      message: "Réservation déplacée avec succès",
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error("❌ Erreur lors du déplacement de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour envoyer un email de notification de déplacement
async function sendRescheduleNotificationEmail(
  reservation: any,
  previousStartTime: string,
  previousEndTime: string,
  reason?: string
): Promise<void> {
  try {
    console.log(`📧 Envoi d'email de déplacement à ${reservation.clientEmail}`);

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
        
        <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 20px;">📅 Votre rendez-vous a été déplacé</h2>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Bonjour <strong>${reservation.clientName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Nous vous informons que votre rendez-vous a dû être déplacé${reason ? ` : ${reason}` : ''}.
        </p>
        
        <div style="background-color: #fef3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; font-size: 18px; margin-top: 0;">Ancien créneau</h3>
          <p style="color: #92400e; text-decoration: line-through;"><strong>Date et heure :</strong> ${formatDate(previousStartTime)}</p>
        </div>
        
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; font-size: 18px; margin-top: 0;">Nouveau créneau</h3>
          <p style="color: #065f46;"><strong>Type :</strong> ${getReservationTypeLabel(reservation.reservationType)}</p>
          <p style="color: #065f46;"><strong>Date et heure :</strong> ${formatDate(reservation.startTime)}</p>
          <p style="color: #065f46;"><strong>Mode de communication :</strong> ${
            reservation.communicationMethod === "VISIO" ? "Visioconférence" : "Téléphone"
          }</p>
          <p style="color: #065f46;"><strong>Projet :</strong> ${reservation.projectDescription}</p>
          ${reservation.adminNotes ? `<p style="color: #065f46;"><strong>Note :</strong> ${reservation.adminNotes}</p>` : ""}
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 500;">
            Votre nouveau rendez-vous est maintenant confirmé pour cette nouvelle date.
            Nous vous enverrons les détails de connexion la veille du rendez-vous.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #374151; margin-bottom: 15px;">
            Si vous avez des questions ou si ce nouveau créneau ne vous convient pas :
          </p>
          <a href="mailto:contact.kairodigital@gmail.com" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Nous contacter
          </a>
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
      subject: "📅 Votre rendez-vous avec KAIRO Digital a été déplacé",
      text: `Votre rendez-vous a été déplacé. Ancien créneau: ${formatDate(previousStartTime)}. Nouveau créneau: ${formatDate(reservation.startTime)}`,
      html: emailHtml,
    });

    if (emailSent) {
      console.log(`✅ Email de déplacement envoyé à ${reservation.clientEmail}`);
    } else {
      console.log(`❌ Échec d'envoi de l'email de déplacement à ${reservation.clientEmail}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de déplacement:", error);
  }
}
