/**
 * 🔍 SENTRY CLIENT (BROWSER)
 * ===========================
 *
 * Configuration Sentry pour le client Next.js
 * Capture les erreurs côté frontend
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development";
const sampleRate = parseFloat(process.env.SENTRY_SAMPLE_RATE || "1.0");

if (dsn && typeof window !== "undefined") {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: sampleRate,
    // Désactiver en développement pour éviter le bruit
    enabled: environment !== "development",
    // Capture les erreurs React
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Ignorer certaines erreurs communes
    ignoreErrors: [
      // Erreurs réseau non critiques
      "NetworkError",
      "Failed to fetch",
      // Erreurs de résolution DNS
      "Resolving",
      // Erreurs de timeout
      "timeout",
      // Erreurs de CORS (si API externe)
      "CORS",
    ],
    beforeSend(event, hint) {
      // Filtrer les erreurs en développement
      if (environment === "development") {
        console.error("Sentry Event (dev):", event);
        return null; // Ne pas envoyer en dev
      }
      return event;
    },
  });
}

export default Sentry;

