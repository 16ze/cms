/**
 * 📊 METRICS ENDPOINT (PROMETHEUS)
 * =================================
 *
 * Endpoint protégé pour exposer les métriques Prometheus
 * Accessible uniquement par le Super Admin
 */

import { NextRequest, NextResponse } from "next/server";
import { ensureSuperAdmin } from "@/lib/tenant-auth";
import { register, Counter, Histogram, Gauge } from "prom-client";
import { PrismaClient } from "@prisma/client";
import { enhancedLogger } from "@/lib/logger";
import { withApiLogging } from "@/lib/api-wrapper";

const prisma = new PrismaClient();

// Réinitialiser le registre pour éviter les doublons
register.clear();

// Métriques Prometheus
const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpErrorsTotal = new Counter({
  name: "http_errors_total",
  help: "Total number of HTTP errors",
  labelNames: ["method", "route", "status_code"],
});

const activeTenants = new Gauge({
  name: "active_tenants_total",
  help: "Total number of active tenants",
});

const activeUsers = new Gauge({
  name: "active_users_total",
  help: "Total number of active users",
});

const databaseConnections = new Gauge({
  name: "database_connections_active",
  help: "Number of active database connections",
});

/**
 * GET /api/metrics
 * Retourne les métriques au format Prometheus
 */
export const GET = withApiLogging(async (request, context) => {
  try {
    // Vérifier l'authentification Super Admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    // Mettre à jour les métriques dynamiques
    try {
      const tenantCount = await prisma.tenant.count({
        where: { isActive: true },
      });
      activeTenants.set(tenantCount);

      const userCount = await prisma.tenantUser.count({
        where: { isActive: true },
      });
      activeUsers.set(userCount);

      // Pour SQLite, on ne peut pas vraiment mesurer les connexions
      // mais on peut mettre une valeur par défaut
      databaseConnections.set(1);
    } catch (error) {
      enhancedLogger.error("Failed to update metrics", error as Error);
    }

    // Retourner les métriques au format Prometheus
    const metrics = await register.metrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4",
      },
    });
  } catch (error) {
    enhancedLogger.error("Failed to generate metrics", error as Error);
    return NextResponse.json(
      {
        error: "Failed to generate metrics",
      },
      { status: 500 }
    );
  }
});

// Export des métriques pour utilisation dans d'autres parties de l'application
export const metrics = {
  httpRequestDuration,
  httpRequestsTotal,
  httpErrorsTotal,
  activeTenants,
  activeUsers,
  databaseConnections,
};

