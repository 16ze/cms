// Module sécurisé pour la gestion des paramètres de réservation
// Garantit que le système de réservation reste fonctionnel même en cas d'erreur

export interface BookingSettings {
  minimumNoticeHours: number;
  maxAdvanceBookingDays: number;
  allowWeekendBookings: boolean;
  bookingTimeSlotMinutes: number;
  shootingDuration: number;
}

// Valeurs par défaut sécurisées (utilisées en cas d'erreur)
const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  minimumNoticeHours: 24,
  maxAdvanceBookingDays: 30,
  allowWeekendBookings: true,
  bookingTimeSlotMinutes: 60,
  shootingDuration: 180
};

// Fonction sécurisée pour récupérer les paramètres de réservation
export async function getBookingSettings(): Promise<BookingSettings> {
  try {
    console.log("🔧 Tentative de récupération des paramètres de réservation...");
    
    // Utiliser une URL absolue pour éviter les erreurs côté serveur
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("⚠️ Impossible de récupérer les paramètres de réservation, utilisation des valeurs par défaut");
      return DEFAULT_BOOKING_SETTINGS;
    }

    const data = await response.json();
    
    if (!data.bookingSettings) {
      console.warn("⚠️ Aucun paramètre de réservation trouvé, utilisation des valeurs par défaut");
      return DEFAULT_BOOKING_SETTINGS;
    }

    // Fusionner avec les valeurs par défaut pour garantir la sécurité
    const settings: BookingSettings = {
      minimumNoticeHours: data.bookingSettings.minimumNoticeHours ?? DEFAULT_BOOKING_SETTINGS.minimumNoticeHours,
      maxAdvanceBookingDays: data.bookingSettings.maxAdvanceBookingDays ?? DEFAULT_BOOKING_SETTINGS.maxAdvanceBookingDays,
      allowWeekendBookings: data.bookingSettings.allowWeekendBookings ?? DEFAULT_BOOKING_SETTINGS.allowWeekendBookings,
      bookingTimeSlotMinutes: data.bookingSettings.bookingTimeSlotMinutes ?? DEFAULT_BOOKING_SETTINGS.bookingTimeSlotMinutes,
      shootingDuration: data.bookingSettings.shootingDuration ?? DEFAULT_BOOKING_SETTINGS.shootingDuration,
    };

    console.log("✅ Paramètres de réservation récupérés avec succès:", settings);
    return settings;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres de réservation:", error);
    console.log("🛡️ Utilisation des valeurs par défaut sécurisées");
    return DEFAULT_BOOKING_SETTINGS;
  }
}

// Fonction pour valider les paramètres
export function validateBookingSettings(settings: BookingSettings): boolean {
  const isValid = (
    typeof settings.minimumNoticeHours === 'number' && settings.minimumNoticeHours >= 0 &&
    typeof settings.maxAdvanceBookingDays === 'number' && settings.maxAdvanceBookingDays > 0 &&
    typeof settings.allowWeekendBookings === 'boolean' &&
    typeof settings.bookingTimeSlotMinutes === 'number' && settings.bookingTimeSlotMinutes > 0 &&
    typeof settings.shootingDuration === 'number' && settings.shootingDuration > 0
  );

  if (!isValid) {
    console.warn("⚠️ Paramètres de réservation invalides détectés");
  }

  return isValid;
}
