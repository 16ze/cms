/**
 * 🏥 HEALTH CHECK ENDPOINT
 * ========================
 *
 * Endpoint de vérification de santé de l'application
 * Vérifie la connexion à la base de données et les services critiques
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { enhancedLogger } from "@/lib/logger";
import { withApiLogging } from "@/lib/api-wrapper";

const prisma = new PrismaClient();

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: {
      status: "ok" | "error";
      latency?: number;
      error?: string;
    };
    memory: {
      status: "ok" | "warning" | "error";
      usage: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

/**
 * GET /api/health
 * Retourne le statut de santé de l'application
 */
export const GET = withApiLogging(async (request, context) => {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: "ok",
      },
      memory: {
        status: "ok",
        usage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
      },
    },
  };

  try {
    // Vérifier la connexion à la base de données
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.checks.database.latency = Date.now() - dbStartTime;
      healthStatus.checks.database.status = "ok";
    } catch (error) {
      healthStatus.checks.database.status = "error";
      healthStatus.checks.database.error = error instanceof Error ? error.message : String(error);
      healthStatus.status = "unhealthy";
    }

    // Vérifier l'utilisation mémoire
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const percentage = (usedMemory / totalMemory) * 100;

      healthStatus.checks.memory.usage = {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(percentage * 100) / 100,
      };

      // Warning si utilisation > 80%
      if (percentage > 80) {
        healthStatus.checks.memory.status = "warning";
        if (healthStatus.status === "healthy") {
          healthStatus.status = "degraded";
        }
      }

      // Error si utilisation > 95%
      if (percentage > 95) {
        healthStatus.checks.memory.status = "error";
        healthStatus.status = "unhealthy";
      }
    }

    // Déterminer le code de statut HTTP
    const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503;

    // Logger le health check
    enhancedLogger.info("Health check", {
      status: healthStatus.status,
      duration: Date.now() - startTime,
      checks: healthStatus.checks,
    });

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    enhancedLogger.error("Health check failed", error as Error);

    healthStatus.status = "unhealthy";
    return NextResponse.json(healthStatus, { status: 503 });
  }
});

