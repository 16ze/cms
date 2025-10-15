import { NextResponse } from "next/server";
import { ReservationsStore } from "../../../../lib/reservations-store";
import {
  getBookingSettings,
  validateBookingSettings,
} from "../../../../lib/booking-settings";

interface AvailabilityRequest {
  date: string; // Date au format ISO (YYYY-MM-DD)
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Fonction pour générer tous les créneaux possibles pour une journée
async function generateAllTimeSlots(date: Date): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];

  try {
    // Récupérer les paramètres de réservation de manière sécurisée
    const settings = await getBookingSettings();

    if (!validateBookingSettings(settings)) {
      console.warn(
        "⚠️ Paramètres invalides, utilisation des valeurs par défaut"
      );
    }

    // Utiliser les paramètres récupérés ou les valeurs par défaut
    const startHour = 9; // 9h du matin
    const endHour = 18; // 18h du soir
    const slotDuration = settings.bookingTimeSlotMinutes || 60; // Durée des créneaux en minutes

    // Vérifier les réservations weekend
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Dimanche = 0, Samedi = 6

    if (isWeekend && !settings.allowWeekendBookings) {
      console.log("📅 Weekend détecté, réservations non autorisées");
      return [];
    }

    // Créer les créneaux en heure locale française (UTC+1 ou UTC+2)
    // Pour éviter les problèmes de fuseau horaire, on travaille sur la date locale
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    for (let hour = startHour; hour < endHour; hour++) {
      // Pour les créneaux de 60 minutes, créer un créneau par heure
      if (slotDuration >= 60) {
        const start = new Date(
          localDate.getFullYear(),
          localDate.getMonth(),
          localDate.getDate(),
          hour,
          0,
          0,
          0
        );
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + slotDuration);

        // Vérifier le délai minimum de réservation
        const now = new Date();
        const minNoticeTime = new Date(
          now.getTime() + (settings.minimumNoticeHours || 24) * 60 * 60 * 1000
        );
        const maxAdvanceTime = new Date(
          now.getTime() +
            (settings.maxAdvanceBookingDays || 30) * 24 * 60 * 60 * 1000
        );

        // Permettre les créneaux dans la plage configurée
        if (start > minNoticeTime && start <= maxAdvanceTime) {
          slots.push({
            start,
            end,
            available: true, // Par défaut disponible, sera vérifié après
          });
        }
      } else {
        // Pour les créneaux plus courts, créer plusieurs créneaux par heure
        const slotsPerHour = 60 / slotDuration;

        for (let i = 0; i < slotsPerHour; i++) {
          const minute = i * slotDuration;

          // Créer le créneau en heure locale
          const start = new Date(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            hour,
            minute,
            0,
            0
          );

          const end = new Date(start);
          end.setMinutes(start.getMinutes() + slotDuration);

          // Vérifier le délai minimum de réservation
          const now = new Date();
          const minNoticeTime = new Date(
            now.getTime() + (settings.minimumNoticeHours || 24) * 60 * 60 * 1000
          );
          const maxAdvanceTime = new Date(
            now.getTime() +
              (settings.maxAdvanceBookingDays || 30) * 24 * 60 * 60 * 1000
          );

          // Permettre les créneaux dans la plage configurée
          if (start > minNoticeTime && start <= maxAdvanceTime) {
            slots.push({
              start,
              end,
              available: true, // Par défaut disponible, sera vérifié après
            });
          }
        }
      }
    }

    console.log(
      `📅 Génération de ${slots.length} créneaux avec les paramètres:`,
      {
        slotDuration,
        allowWeekendBookings: settings.allowWeekendBookings,
        minimumNoticeHours: settings.minimumNoticeHours,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
        startHour,
        endHour,
        requestedDate: date.toISOString(),
        now: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("❌ Erreur lors de la génération des créneaux:", error);
    // En cas d'erreur, utiliser les valeurs par défaut
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const start = new Date(
          localDate.getFullYear(),
          localDate.getMonth(),
          localDate.getDate(),
          hour,
          minute,
          0,
          0
        );
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 60);

        const now = new Date();
        if (start > now) {
          slots.push({ start, end, available: true });
        }
      }
    }
  }

  return slots;
}

// Fonction pour vérifier si un créneau est en conflit avec une réservation existante
function isSlotConflicting(slot: TimeSlot, reservations: any[]): boolean {
  const slotStart = new Date(slot.start);
  const slotEnd = new Date(slot.end);

  return reservations.some((reservation) => {
    // Ignorer les réservations annulées/refusées
    if (reservation.status === "CANCELLED") {
      return false;
    }

    const reservationStart = new Date(reservation.startTime);
    const reservationEnd = new Date(reservation.endTime);

    // Vérifier si les créneaux se chevauchent
    return (
      (slotStart >= reservationStart && slotStart < reservationEnd) ||
      (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
      (slotStart <= reservationStart && slotEnd >= reservationEnd)
    );
  });
}

export async function GET(request: Request) {
  console.log("📅 API: Vérification de la disponibilité des créneaux");

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Paramètre 'date' requis" },
        { status: 400 }
      );
    }

    // Parser la date
    const requestedDate = new Date(dateParam);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez YYYY-MM-DD" },
        { status: 400 }
      );
    }

    console.log(
      `📅 Vérification des créneaux pour: ${requestedDate.toDateString()}`
    );

    // Générer tous les créneaux possibles pour cette date
    const allSlots = await generateAllTimeSlots(requestedDate);

    // Récupérer toutes les réservations existantes
    const allReservations = ReservationsStore.getAll();

    // Filtrer les réservations pour cette date uniquement
    // Utiliser les dates locales pour éviter les problèmes de fuseau horaire
    const reservationsForDate = allReservations.filter((reservation) => {
      const reservationDate = new Date(reservation.startTime);
      const localReservationDate = new Date(
        reservationDate.getFullYear(),
        reservationDate.getMonth(),
        reservationDate.getDate()
      );
      const localRequestedDate = new Date(
        requestedDate.getFullYear(),
        requestedDate.getMonth(),
        requestedDate.getDate()
      );

      return localReservationDate.getTime() === localRequestedDate.getTime();
    });

    console.log(
      `📅 ${reservationsForDate.length} réservation(s) trouvée(s) pour cette date`
    );

    // Marquer les créneaux comme non disponibles s'ils sont en conflit
    const availableSlots = allSlots.map((slot) => ({
      ...slot,
      available: !isSlotConflicting(slot, reservationsForDate),
    }));

    // Filtrer pour ne retourner que les créneaux disponibles
    const onlyAvailableSlots = availableSlots.filter((slot) => slot.available);

    console.log(
      `📅 ${onlyAvailableSlots.length} créneau(x) disponible(s) sur ${allSlots.length} total`
    );

    return NextResponse.json({
      success: true,
      date: dateParam,
      totalSlots: allSlots.length,
      availableSlots: onlyAvailableSlots.length,
      slots: onlyAvailableSlots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        available: slot.available,
      })),
      // Pour debug : inclure aussi les créneaux occupés
      occupiedSlots: availableSlots
        .filter((slot) => !slot.available)
        .map((slot) => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          available: slot.available,
        })),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification de disponibilité:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification de disponibilité",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("📅 API: Vérification de disponibilité pour plusieurs dates");

  try {
    const { dates }: { dates: string[] } = await request.json();

    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "Paramètre 'dates' requis (array)" },
        { status: 400 }
      );
    }

    const results = {};

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        continue; // Ignorer les dates invalides
      }

      // Générer tous les créneaux possibles pour cette date
      const allSlots = await generateAllTimeSlots(date);

      // Récupérer les réservations pour cette date
      const allReservations = ReservationsStore.getAll();
      const reservationsForDate = allReservations.filter((reservation) => {
        const reservationDate = new Date(reservation.startTime);
        const localReservationDate = new Date(
          reservationDate.getFullYear(),
          reservationDate.getMonth(),
          reservationDate.getDate()
        );
        const localDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        return localReservationDate.getTime() === localDate.getTime();
      });

      // Calculer les créneaux disponibles
      const availableSlots = allSlots.filter(
        (slot) => !isSlotConflicting(slot, reservationsForDate)
      );

      results[dateStr] = {
        totalSlots: allSlots.length,
        availableSlots: availableSlots.length,
        hasAvailability: availableSlots.length > 0,
      };
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification multiple:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification multiple" },
      { status: 500 }
    );
  }
}
