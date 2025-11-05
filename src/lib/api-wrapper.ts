/**
 * 🔄 WRAPPER API AVEC LOGGING
 * ============================
 *
 * Wrapper réutilisable pour les routes API avec logging et monitoring
 * Utilise ce wrapper dans vos routes API pour un logging automatique
 */

import { NextRequest, NextResponse } from "next/server";
import { enhancedLogger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

// Générer un ID unique pour chaque requête
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface ApiHandlerContext {
  requestId: string;
  tenantId?: string;
  userId?: string;
  startTime: number;
}

/**
 * Wrapper pour les handlers API avec logging automatique
 * 
 * Usage:
 * ```typescript
 * export const GET = withApiLogging(async (request, context) => {
 *   // Votre logique ici
 *   return NextResponse.json({ data: "..." });
 * });
 * ```
 */
export function withApiLogging<T = unknown>(
  handler: (request: NextRequest, context: ApiHandlerContext) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const requestId = generateRequestId();
    const startTime = Date.now();

    // Extraire les informations de la requête
    const method = request.method;
    const pathname = request.nextUrl.pathname;
    const searchParams = request.nextUrl.searchParams.toString();
    const fullPath = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

    // Extraire tenantId depuis les query params ou headers
    const tenantId =
      request.nextUrl.searchParams.get("tenantId") ||
      request.headers.get("x-tenant-id") ||
      undefined;

    // Extraire userId depuis les cookies (si disponible)
    const sessionCookie =
      request.cookies.get("admin_session") || request.cookies.get("tenant_session");
    const userId = sessionCookie?.value ? "authenticated" : undefined;

    // Contexte de log
    const logContext = {
      requestId,
      tenantId,
      userId,
      method,
      path: fullPath,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    };

    const apiContext: ApiHandlerContext = {
      requestId,
      tenantId,
      userId,
      startTime,
    };

    // Logger la requête entrante
    enhancedLogger.api("info", method, fullPath, undefined, logContext);

    try {
      // Appeler le handler
      const response = await handler(request, apiContext);

      // Calculer la durée
      const duration = Date.now() - startTime;

      // Logger la réponse
      enhancedLogger.api("info", method, fullPath, response.status, {
        ...logContext,
        statusCode: response.status,
        duration,
      });

      // Ajouter des headers de tracing
      response.headers.set("X-Request-ID", requestId);

      if (duration > 1000) {
        // Logger les requêtes lentes
        enhancedLogger.warn(`Slow request detected: ${method} ${fullPath} took ${duration}ms`, {
          ...logContext,
          duration,
          statusCode: response.status,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Logger l'erreur
      enhancedLogger.error("API request failed", error as Error, {
        ...logContext,
        duration,
      });

      // Capturer dans Sentry
      Sentry.captureException(error, {
        tags: {
          requestId,
          tenantId,
          method,
          path: fullPath,
        },
        extra: {
          ...logContext,
          duration,
        },
      });

      // Retourner une erreur 500
      return NextResponse.json(
        {
          error: "Internal server error",
          requestId,
        },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

