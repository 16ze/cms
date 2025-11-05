/**
 * 📊 MONITORING & OBSERVABILITÉ
 * =============================
 *
 * Intégration OpenTelemetry et métriques Prometheus
 * pour le monitoring des performances et de la sécurité
 */

import { Counter, Histogram, register } from "prom-client";
import { enhancedLogger } from "@/lib/logger";

/**
 * Métriques Prometheus
 */

// Compteur de requêtes HTTP
export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status", "tenant_id"],
});

// Durée des requêtes HTTP
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status", "tenant_id"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Durée des requêtes Prisma par tenant
export const tenantDbQueryDuration = new Histogram({
  name: "tenant_db_query_duration_seconds",
  help: "Duration of Prisma queries per tenant in seconds",
  labelNames: ["model", "action", "tenant_id"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2],
});

// Compteur de requêtes Prisma
export const dbQueriesTotal = new Counter({
  name: "db_queries_total",
  help: "Total number of Prisma queries",
  labelNames: ["model", "action", "tenant_id"],
});

// Compteur d'erreurs API
export const apiErrorsTotal = new Counter({
  name: "api_errors_total",
  help: "Total number of API errors",
  labelNames: ["route", "error_type", "tenant_id"],
});

/**
 * Middleware Prisma pour tracer les queries lentes
 */
export function createPrismaMonitoringMiddleware() {
  return async (params: any, next: any) => {
    const startTime = Date.now();
    const { model, action } = params;
    const tenantId = (global as any).__currentTenantId || "unknown";

    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Enregistrer la métrique
      dbQueriesTotal.inc({ model, action, tenant_id: tenantId });
      tenantDbQueryDuration.observe({ model, action, tenant_id: tenantId }, duration / 1000);

      // Logger les queries lentes (> 200ms)
      if (duration > 200) {
        enhancedLogger.prisma("warn", action, model, {
          tenantId,
          duration,
          message: "Slow query detected",
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      apiErrorsTotal.inc({
        route: `${model}.${action}`,
        error_type: error instanceof Error ? error.name : "Unknown",
        tenant_id: tenantId,
      });

      throw error;
    }
  };
}

/**
 * Endpoint pour exporter les métriques Prometheus
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Réinitialiser les métriques (utile pour les tests)
 */
export function resetMetrics(): void {
  register.resetMetrics();
}

