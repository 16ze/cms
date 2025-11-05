/**
 * 🛡️ API SECURITY REPORT
 * =======================
 *
 * Endpoint pour recevoir les alertes de sécurité du WAF client-side
 * Log les menaces détectées et les rapporte à Sentry
 */

import { NextRequest, NextResponse } from "next/server";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { enhancedLogger } from "@/lib/logger";
import { applyRateLimit } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";

/**
 * Schéma de validation pour les rapports de sécurité
 */
interface SecurityReport {
  type: string;
  source: string;
  payload: string;
  url?: string;
  method?: string;
  timestamp: number;
  userAgent: string;
  stack?: string;
}

/**
 * Valider le rapport de sécurité
 */
function validateReport(body: unknown): body is SecurityReport {
  if (!body || typeof body !== "object") return false;

  const report = body as Partial<SecurityReport>;

  return (
    typeof report.type === "string" &&
    typeof report.source === "string" &&
    typeof report.payload === "string" &&
    typeof report.timestamp === "number" &&
    typeof report.userAgent === "string"
  );
}

/**
 * POST /api/security/report
 * Recevoir et traiter les rapports de sécurité du WAF client-side
 */
export async function POST(request: NextRequest) {
  try {
    // Appliquer rate limiting pour éviter le spam
    const rateLimitResponse = await applyRateLimit(request, {
      limit: 100, // 100 rapports par minute max
      window: 60,
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    // Valider le rapport
    if (!validateReport(body)) {
      enhancedLogger.warn("Invalid security report format", {
        body,
        ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      });

      return secureErrorResponse("Invalid report format", 400);
    }

    const report: SecurityReport = body;

    // Logger localement
    enhancedLogger.warn("Security threat detected", {
      type: report.type,
      source: report.source,
      payload: report.payload.substring(0, 500), // Limiter la taille
      url: report.url,
      method: report.method,
      userAgent: report.userAgent,
      ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      timestamp: new Date(report.timestamp).toISOString(),
    });

    // Reporter à Sentry avec contexte enrichi
    try {
      Sentry.captureMessage(`Security threat: ${report.type}`, {
        level: "warning",
        tags: {
          threat_type: report.type,
          source: report.source,
        },
        contexts: {
          security: {
            threat: report.type,
            source: report.source,
            payload: report.payload.substring(0, 200),
            url: report.url,
            method: report.method,
            userAgent: report.userAgent,
            ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
          },
          browser: {
            name: report.userAgent,
            version: undefined,
          },
        },
        extra: {
          fullPayload: report.payload,
          timestamp: report.timestamp,
          stack: report.stack,
        },
      });
    } catch (sentryError) {
      enhancedLogger.error("Failed to report to Sentry", {
        error: sentryError,
        report,
      });
    }

    // Retourner une réponse de succès
    return secureResponse(
      {
        success: true,
        message: "Security report received",
      },
      { status: 200 }
    );
  } catch (error) {
    enhancedLogger.error("Error processing security report", {
      error,
      ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
    });

    Sentry.captureException(error, {
      tags: {
        operation: "security_report",
      },
    });

    return secureErrorResponse("Internal server error", 500);
  }
}

/**
 * GET /api/security/report
 * Statistiques de sécurité (optionnel, pour debug)
 */
export async function GET(request: NextRequest) {
  // Cette route peut être utilisée pour obtenir des statistiques
  // mais nécessite une authentification admin en production
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    return secureErrorResponse("Not available in production", 403);
  }

  return secureResponse({
    message: "Security report endpoint",
    endpoint: "/api/security/report",
    method: "POST",
    description: "Receives security reports from client-side WAF",
  });
}

