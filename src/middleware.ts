import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecureHeaders } from "@/lib/secure-headers";
import { applyRateLimit, adminRateLimiter, superAdminRateLimiter } from "@/lib/rate-limit";
import { setTenantContext } from "@/lib/prisma-middleware";
import { getAuthenticatedUser } from "@/lib/tenant-auth";
import { enhancedLogger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

/**
 * MIDDLEWARE MULTI-TENANT AVEC SÉCURITÉ RENFORCÉE
 * ===============================================
 *
 * - Rate limiting global
 * - Headers de sécurité
 * - Détection tenant pour isolation
 * - Protection contre les attaques courantes
 */

/**
 * MIDDLEWARE MULTI-TENANT AVEC SÉCURITÉ RENFORCÉE
 * ===============================================
 *
 * - Rate limiting global avec Upstash Redis
 * - Headers de sécurité renforcés
 * - Détection tenant pour isolation
 * - Protection contre les attaques courantes
 * - Blocage des routes admin non authentifiées
 */

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestId = uuidv4();

  // 🔒 Bloquer l'accès public aux routes admin et super-admin
  if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/super-admin")
  ) {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      enhancedLogger.warn("Unauthorized access attempt to admin route", {
        requestId,
        path: pathname,
        ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      });
      
      return applySecureHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
            message: "Authentication required",
          },
          { status: 401 }
        )
      );
    }

    // Appliquer rate limiting spécifique selon le type d'utilisateur
    if (pathname.startsWith("/api/super-admin")) {
      const rateLimitResponse = await applyRateLimit(request, superAdminRateLimiter);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    } else {
      const rateLimitResponse = await applyRateLimit(request, adminRateLimiter);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }

    // Définir le contexte tenant pour Prisma
    if (user.tenantId) {
      setTenantContext(user.tenantId);
      enhancedLogger.api("info", request.method, pathname, undefined, {
        requestId,
        userId: user.id,
        tenantId: user.tenantId,
        userType: user.type,
      });
    } else if (user.type === "SUPER_ADMIN") {
      // Super admin peut accéder à tous les tenants via query param
      const tenantId = request.nextUrl.searchParams.get("tenantId");
      if (tenantId) {
        setTenantContext(tenantId);
      }
    }
  }

  // Appliquer rate limiting sur les autres routes API
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/admin") && !pathname.startsWith("/api/super-admin")) {
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Définir le contexte tenant pour Prisma (si authentifié)
    try {
      const user = await getAuthenticatedUser(request);
      if (user?.tenantId) {
        setTenantContext(user.tenantId);
      }
    } catch (error) {
      // Ignorer les erreurs d'authentification ici (gérées par les routes)
    }
  }

  // Vérifier si le mode maintenance est activé via un cookie
  const maintenanceMode =
    request.cookies.get("maintenance-mode")?.value === "true";

  // Si le mode maintenance est activé et que ce n'est pas une route admin ou la page de maintenance elle-même
  if (
    maintenanceMode &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/super-admin") &&
    pathname !== "/maintenance"
  ) {
    // Permettre l'accès aux ressources statiques et API
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".") ||
      pathname === "/maintenance"
    ) {
      return applySecureHeaders(NextResponse.next());
    }

    // Rediriger vers la page de maintenance
    return applySecureHeaders(
      NextResponse.redirect(new URL("/maintenance", request.url))
    );
  }

  // Si c'est la page d'accueil principale, router vers le template approprié
  if (
    pathname === "/" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/super-admin")
  ) {
    return applySecureHeaders(
      NextResponse.rewrite(new URL("/beaute", request.url))
    );
  }

  // Laisser passer toutes les autres requêtes avec headers de sécurité
  const response = NextResponse.next();
  return applySecureHeaders(response);
}

// Configuration pour spécifier sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    // Routes API (doivent être protégées)
    "/api/:path*",
    // Routes admin
    "/admin/:path*",
    // Routes super-admin
    "/super-admin/:path*",
    // Toutes les autres routes sauf les ressources statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
