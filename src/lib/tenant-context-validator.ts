/**
 * 🛡️ VALIDATEUR DE CONTEXTE TENANT
 * =================================
 * 
 * Vérifie que les requêtes respectent l'isolation des tenants
 * - Validation du header x-tenant-id
 * - Comparaison avec la session utilisateur
 * - Blocage des accès croisés (tenant A → B)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "./tenant-auth";
import { prisma } from "./prisma";
import { secureErrorResponse } from "./secure-headers";
import { enhancedLogger } from "./logger";

/**
 * Valider le contexte tenant d'une requête
 * 
 * @param request - Requête Next.js
 * @returns Résultat de validation avec tenantId validé ou erreur
 */
export async function validateTenantContext(
  request: NextRequest
): Promise<
  | { valid: true; tenantId: string; tenantSlug: string | null }
  | { valid: false; response: NextResponse }
> {
  try {
    // Récupérer l'utilisateur authentifié
    const user = await getAuthenticatedUser(request);

    if (!user) {
      enhancedLogger.warn("Tenant context validation failed - No authenticated user", {
        path: request.nextUrl.pathname,
        ip: request.headers.get("x-forwarded-for") || request.ip,
      });

      return {
        valid: false,
        response: secureErrorResponse("Authentication required", 401),
      };
    }

    // Super Admin peut accéder à n'importe quel tenant via query param ou header
    if (user.type === "SUPER_ADMIN") {
      const requestedTenantId =
        request.headers.get("x-tenant-id") ||
        request.nextUrl.searchParams.get("tenantId");

      if (requestedTenantId) {
        // Vérifier que le tenant existe
        const tenant = await prisma.tenant.findUnique({
          where: { id: requestedTenantId },
          select: { id: true, slug: true, isActive: true },
        });

        if (!tenant) {
          enhancedLogger.warn("Tenant context validation failed - Tenant not found", {
            tenantId: requestedTenantId,
            userId: user.id,
            path: request.nextUrl.pathname,
          });

          return {
            valid: false,
            response: secureErrorResponse("Tenant not found", 404),
          };
        }

        if (!tenant.isActive) {
          return {
            valid: false,
            response: secureErrorResponse("Tenant is inactive", 403),
          };
        }

        return {
          valid: true,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
        };
      }

      // Super Admin sans tenant spécifié = accès global
      return {
        valid: true,
        tenantId: "", // Vide pour Super Admin sans tenant
        tenantSlug: null,
      };
    }

    // TenantUser: TOUJOURS limité à son propre tenant
    if (user.type === "TENANT_USER") {
      if (!user.tenantId) {
        enhancedLogger.error("TenantUser without tenantId", {
          userId: user.id,
          path: request.nextUrl.pathname,
        });

        return {
          valid: false,
          response: secureErrorResponse("Tenant context missing", 500),
        };
      }

      // Vérifier si un header x-tenant-id est présent (tentative d'accès croisé)
      const requestedTenantId = request.headers.get("x-tenant-id");
      if (requestedTenantId && requestedTenantId !== user.tenantId) {
        enhancedLogger.warn("Tenant isolation violation attempt", {
          userId: user.id,
          userTenantId: user.tenantId,
          requestedTenantId,
          path: request.nextUrl.pathname,
          ip: request.headers.get("x-forwarded-for") || request.ip,
        });

        return {
          valid: false,
          response: secureErrorResponse("Forbidden - Tenant isolation violation", 403),
        };
      }

      // Vérifier que le tenant existe et est actif
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { id: true, slug: true, isActive: true },
      });

      if (!tenant || !tenant.isActive) {
        return {
          valid: false,
          response: secureErrorResponse("Tenant is inactive", 403),
        };
      }

      return {
        valid: true,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug || null,
      };
    }

    // Type d'utilisateur inconnu
    return {
      valid: false,
      response: secureErrorResponse("Invalid user type", 403),
    };
  } catch (error) {
    enhancedLogger.error("Error validating tenant context", error as Error, {
      path: request.nextUrl.pathname,
    });

    return {
      valid: false,
      response: secureErrorResponse("Internal server error", 500),
    };
  }
}

/**
 * Vérifier l'origine et le referer d'une requête
 * Protection contre CSRF et accès non autorisés
 */
export function validateOriginAndReferer(
  request: NextRequest,
  allowedOrigins?: string[]
): { valid: boolean; error?: string } {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // En développement, autoriser les requêtes locales
  if (process.env.NODE_ENV === "development") {
    return { valid: true };
  }

  // Si ALLOWED_ORIGINS est défini, utiliser cette liste
  if (allowedOrigins && allowedOrigins.length > 0) {
    if (origin && !allowedOrigins.includes(origin)) {
      return {
        valid: false,
        error: `Origin not allowed: ${origin}`,
      };
    }

    if (referer) {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (!allowedOrigins.includes(refererOrigin)) {
        return {
          valid: false,
          error: `Referer not allowed: ${refererOrigin}`,
        };
      }
    }
  } else {
    // Sinon, vérifier que l'origine correspond au host de la requête
    const host = request.headers.get("host");
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return {
          valid: false,
          error: `Origin host mismatch: ${originUrl.host} vs ${host}`,
        };
      }
    }
  }

  return { valid: true };
}

