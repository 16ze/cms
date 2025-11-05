/**
 * 📊 OPENTELEMETRY TRACING
 * =========================
 *
 * Configuration OpenTelemetry pour le traçage distribué
 * Intègre avec Sentry pour enrichir les traces d'erreurs
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const isEnabled = process.env.OTEL_ENABLED === "true" && process.env.NODE_ENV === "production";

if (isEnabled) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "kairo-cms",
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Désactiver certaines instrumentations qui peuvent causer des problèmes
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();

  // Nettoyage propre à l'arrêt
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("OpenTelemetry terminated"))
      .catch((error) => console.error("Error terminating OpenTelemetry", error))
      .finally(() => process.exit(0));
  });
}

/**
 * Helper pour créer un span personnalisé pour les opérations Prisma
 */
export async function tracePrismaOperation<T>(
  operation: string,
  model: string,
  fn: () => Promise<T>
): Promise<T> {
  const { trace } = await import("@opentelemetry/api");
  const tracer = trace.getTracer("kairo-cms-prisma");
  const span = tracer.startSpan(`prisma.${model}.${operation}`);

  try {
    span.setAttributes({
      "db.operation": operation,
      "db.model": model,
    });

    const result = await fn();
    span.setStatus({ code: 1 }); // OK
    return result;
  } catch (error) {
    span.setStatus({
      code: 2, // ERROR
      message: error instanceof Error ? error.message : String(error),
    });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

export default {};

