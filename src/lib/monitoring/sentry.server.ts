/**
 * 🔍 SENTRY SERVER (NODE.JS)
 * ===========================
 *
 * Configuration Sentry pour le serveur Next.js
 * Capture les erreurs côté API routes
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development";
const sampleRate = parseFloat(process.env.SENTRY_SAMPLE_RATE || "1.0");

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: sampleRate,
    // Désactiver en développement
    enabled: environment !== "development",
    // Configuration spécifique serveur
    integrations: [
      Sentry.nodeContextIntegration(),
      Sentry.httpIntegration(),
    ],
    // Ignorer certaines erreurs communes
    ignoreErrors: [
      // Erreurs Prisma non critiques
      "P2002", // Unique constraint
      "P2025", // Record not found
      // Erreurs de validation
      "ValidationError",
      // Erreurs de connexion (retry automatique)
      "ECONNREFUSED",
      "ETIMEDOUT",
    ],
    beforeSend(event, hint) {
      // Filtrer en développement
      if (environment === "development") {
        console.error("Sentry Event (dev):", event);
        return null;
      }
      return event;
    },
  });
}

export default Sentry;

