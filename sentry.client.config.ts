/**
 * 🔍 SENTRY CLIENT CONFIGURATION
 * ===============================
 *
 * Configuration Sentry pour le client Next.js
 * Ce fichier est automatiquement généré par Sentry CLI
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || "1.0"),
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

