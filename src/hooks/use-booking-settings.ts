import { useState, useEffect } from "react";

export interface BookingSettings {
  minimumNoticeHours: number;
  maxAdvanceBookingDays: number;
  allowWeekendBookings: boolean;
  bookingTimeSlotMinutes: number;
  shootingDuration: number;
}

// Valeurs par défaut sécurisées
const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  minimumNoticeHours: 24,
  maxAdvanceBookingDays: 30,
  allowWeekendBookings: true,
  bookingTimeSlotMinutes: 60,
  shootingDuration: 180,
};

export function useBookingSettings() {
  const [settings, setSettings] = useState<BookingSettings>(
    DEFAULT_BOOKING_SETTINGS
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/settings");

        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer les paramètres de réservation"
          );
        }

        const data = await response.json();

        if (data.success && data.bookingSettings) {
          // Fusionner avec les valeurs par défaut pour garantir la sécurité
          const mergedSettings: BookingSettings = {
            minimumNoticeHours:
              data.bookingSettings.minimumNoticeHours ??
              DEFAULT_BOOKING_SETTINGS.minimumNoticeHours,
            maxAdvanceBookingDays:
              data.bookingSettings.maxAdvanceBookingDays ??
              DEFAULT_BOOKING_SETTINGS.maxAdvanceBookingDays,
            allowWeekendBookings:
              data.bookingSettings.allowWeekendBookings ??
              DEFAULT_BOOKING_SETTINGS.allowWeekendBookings,
            bookingTimeSlotMinutes:
              data.bookingSettings.bookingTimeSlotMinutes ??
              DEFAULT_BOOKING_SETTINGS.bookingTimeSlotMinutes,
            shootingDuration:
              data.bookingSettings.shootingDuration ??
              DEFAULT_BOOKING_SETTINGS.shootingDuration,
          };

          setSettings(mergedSettings);
          console.log(
            "✅ Paramètres de réservation chargés côté client:",
            mergedSettings
          );
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err) {
        console.warn(
          "⚠️ Erreur lors du chargement des paramètres de réservation, utilisation des valeurs par défaut:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setSettings(DEFAULT_BOOKING_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Polling pour la synchronisation en temps réel (toutes les 10 secondes)
    const interval = setInterval(() => {
      fetchSettings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return { settings, loading, error };
}
