import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, applySecurityHeaders } from "@/lib/security";
import { setTenantContext } from "@/lib/prisma-middleware";
import { getAuthenticatedUser } from "@/lib/tenant-auth";

/**
 * MIDDLEWARE MULTI-TENANT AVEC SÉCURITÉ RENFORCÉE
 * ===============================================
 *
 * - Rate limiting global
 * - Headers de sécurité
 * - Détection tenant pour isolation
 * - Protection contre les attaques courantes
 */

// Rate limiting pour les routes API
const apiRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requêtes par minute
});

// Rate limiting plus strict pour les routes d'authentification
const authRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 5, // 5 tentatives par minute
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Appliquer rate limiting sur les routes API
  if (pathname.startsWith("/api")) {
    // Rate limiting plus strict pour les routes d'auth
    if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/tenant")) {
      const authLimitResponse = authRateLimit(request);
      if (authLimitResponse) {
        return applySecurityHeaders(authLimitResponse);
      }
    } else {
      // Rate limiting standard pour les autres routes API
      const apiLimitResponse = apiRateLimit(request);
      if (apiLimitResponse) {
        return applySecurityHeaders(apiLimitResponse);
      }
    }

    // Définir le contexte tenant pour Prisma
    try {
      const user = await getAuthenticatedUser(request);
      if (user?.tenantId) {
        setTenantContext(user.tenantId);
      } else {
        // Essayer de récupérer depuis query params (pour Super Admin)
        const tenantId = request.nextUrl.searchParams.get("tenantId");
        if (tenantId) {
          setTenantContext(tenantId);
        }
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
      return applySecurityHeaders(NextResponse.next());
    }

    // Rediriger vers la page de maintenance
    return applySecurityHeaders(
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
    return applySecurityHeaders(
      NextResponse.rewrite(new URL("/beaute", request.url))
    );
  }

  // Laisser passer toutes les autres requêtes avec headers de sécurité
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// Configuration pour spécifier sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    // Routes admin protégées
    "/admin/:path*",
    // Exclure la page de login admin et les routes API
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
