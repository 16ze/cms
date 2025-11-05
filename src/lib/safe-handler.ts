/**
 * 🛡️ SAFE API HANDLER
 * ====================
 *
 * Wrapper pour sécuriser toutes les routes API
 * - Gestion d'erreurs centralisée
 * - Validation automatique
 * - Logs structurés
 * - Capture Sentry
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { secureErrorResponse, secureResponse } from "./secure-headers";
import { applyRateLimit } from "./rate-limit";
import { enhancedLogger } from "./logger";
import { getAuthenticatedUser } from "./tenant-auth";
import { setTenantContext } from "./prisma-middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Contexte de requête enrichi
 */
export interface ApiContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  userType?: "SUPER_ADMIN" | "TENANT_USER";
  ip?: string;
  userAgent?: string;
}

/**
 * Options pour le handler sécurisé
 */
export interface SafeHandlerOptions {
  /**
   * Schéma Zod pour valider le body de la requête
   */
  schema?: z.ZodSchema;
  
  /**
   * Méthodes HTTP autorisées
   */
  methods?: string[];
  
  /**
   * Requiert une authentification
   */
  requireAuth?: boolean;
  
  /**
   * Rate limiter personnalisé (défaut: globalApiRateLimiter)
   */
  rateLimiter?: Ratelimit;
  
  /**
   * Permettre l'accès super-admin seulement
   */
  requireSuperAdmin?: boolean;
}

/**
 * Wrapper pour sécuriser une route API
 */
export function safeHandler<T = unknown>(
  handler: (
    request: NextRequest,
    context: ApiContext
  ) => Promise<NextResponse | T>,
  options: SafeHandlerOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    const context: ApiContext = {
      requestId,
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        request.ip ||
        "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    };

    try {
      // 1. Vérifier la méthode HTTP
      if (options.methods && !options.methods.includes(request.method)) {
        enhancedLogger.warn("Method not allowed", {
          requestId,
          method: request.method,
          path: request.nextUrl.pathname,
          allowedMethods: options.methods,
        });
        
        return secureErrorResponse("Method not allowed", 405);
      }

      // 2. Appliquer le rate limiting
      const rateLimitResponse = await applyRateLimit(request, options.rateLimiter);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      // 3. Vérifier l'authentification si requise
      if (options.requireAuth || options.requireSuperAdmin) {
        const user = await getAuthenticatedUser(request);
        
        if (!user) {
          enhancedLogger.warn("Unauthorized access attempt", {
            requestId,
            path: request.nextUrl.pathname,
            ip: context.ip,
          });
          
          return secureErrorResponse("Unauthorized", 401);
        }

        context.userId = user.id;
        context.userType = user.type;
        
        if (user.tenantId) {
          context.tenantId = user.tenantId;
          setTenantContext(user.tenantId);
        }

        // Vérifier super-admin si requis
        if (options.requireSuperAdmin && user.type !== "SUPER_ADMIN") {
          enhancedLogger.warn("Super admin access required", {
            requestId,
            userId: user.id,
            userType: user.type,
            path: request.nextUrl.pathname,
          });
          
          return secureErrorResponse("Forbidden - Super admin access required", 403);
        }
      }

      // 4. Valider le body si un schéma est fourni
      if (options.schema && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH")) {
        try {
          const body = await request.json();
          const validatedData = options.schema.parse(body);
          
          // Remplacer le body par les données validées
          (request as any).validatedBody = validatedData;
        } catch (error) {
          if (error instanceof z.ZodError) {
            enhancedLogger.warn("Validation error", {
              requestId,
              errors: error.errors,
              path: request.nextUrl.pathname,
            });
            
            return secureErrorResponse("Validation error", 400, {
              errors: error.errors,
            });
          }
          throw error;
        }
      }

      // 5. Logger la requête
      enhancedLogger.api("info", request.method, request.nextUrl.pathname, undefined, {
        requestId,
        userId: context.userId,
        tenantId: context.tenantId,
        userType: context.userType,
        ip: context.ip,
      });

      // 6. Exécuter le handler
      const result = await handler(request, context);
      
      // 7. Calculer la durée
      const duration = Date.now() - startTime;
      
      // 8. Logger la réponse
      const statusCode = result instanceof NextResponse ? result.status : 200;
      enhancedLogger.api("info", request.method, request.nextUrl.pathname, statusCode, {
        requestId,
        userId: context.userId,
        tenantId: context.tenantId,
        duration,
      });

      // 9. Retourner la réponse
      if (result instanceof NextResponse) {
        return result;
      }
      
      return secureResponse(result, { status: 200 });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Logger l'erreur
      enhancedLogger.api("error", request.method, request.nextUrl.pathname, 500, {
        requestId,
        userId: context.userId,
        tenantId: context.tenantId,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      // Capturer dans Sentry
      Sentry.captureException(error, {
        tags: {
          requestId,
          route: request.nextUrl.pathname,
          method: request.method,
        },
        contexts: {
          user: context.userId
            ? {
                id: context.userId,
              }
            : undefined,
          custom: {
            tenantId: context.tenantId,
            userType: context.userType,
            ip: context.ip,
          },
        },
      });

      // Retourner une erreur sécurisée (ne pas exposer les détails internes)
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      
      // En développement, retourner plus de détails
      if (process.env.NODE_ENV === "development") {
        return secureErrorResponse(errorMessage, 500, {
          requestId,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
      
      return secureErrorResponse("Internal server error", 500, {
        requestId,
      });
    }
  };
}

/**
 * Helper pour obtenir le body validé d'une requête
 */
export function getValidatedBody<T>(request: NextRequest): T {
  return (request as any).validatedBody;
}

