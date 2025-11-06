import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecureHeaders } from "@/lib/secure-headers";
import { applyRateLimit, adminRateLimiter, superAdminRateLimiter, apiRateLimiter } from "@/lib/rate-limit";
// Note: setTenantContext et getAuthenticatedUser ne sont pas importés car Prisma ne fonctionne pas en Edge Runtime
// L'authentification et le contexte tenant seront gérés dans les routes API individuelles (Node.js Runtime)
import { enhancedLogger } from "@/lib/logger-edge";
import { applyWAF } from "@/lib/waf";
import { validateOriginAndReferer } from "@/lib/tenant-context-validator";
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

  // 🛡️ WAF - Vérifier toutes les requêtes API en premier
  if (pathname.startsWith("/api")) {
    const wafResponse = await applyWAF(request);
    if (wafResponse) {
      // Ajouter le header X-Edge-Security
      wafResponse.headers.set("X-Edge-Security", "blocked");
      return wafResponse;
    }
  }

  // 🔒 Bloquer l'accès public aux routes admin et super-admin
  // Exception : les routes de login sont publiques
  if (
    (pathname.startsWith("/api/admin") || pathname.startsWith("/api/super-admin")) &&
    !pathname.includes("/login")
  ) {
    // Vérifier l'origine et le referer pour les routes sensibles
    const allowedOrigins = process.env.NEXT_PUBLIC_ADMIN_ALLOWED_ORIGINS
      ? process.env.NEXT_PUBLIC_ADMIN_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : [];

    const originCheck = validateOriginAndReferer(request, allowedOrigins);
    if (!originCheck.valid) {
      enhancedLogger.warn("Origin/Referer validation failed", {
        requestId,
        path: pathname,
        ip: request.headers.get("x-forwarded-for") || request.ip || "unknown",
        error: originCheck.error,
      });

      return applySecureHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Forbidden",
            message: "Invalid origin",
          },
          { status: 403 }
        )
      );
    }

    // Note: L'authentification et la définition du contexte tenant sont gérées dans les routes API individuelles
    // car Prisma ne fonctionne pas en Edge Runtime. Le middleware Edge Runtime ne fait que du rate limiting
    // et de la validation d'origine/referer.

    // Appliquer rate limiting spécifique selon le type de route
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
  }

  // Appliquer rate limiting sur les autres routes API (10 req/sec)
  // Note: Ne pas appeler getAuthenticatedUser ici car Prisma ne fonctionne pas en Edge Runtime
  // Le contexte tenant sera défini dans les routes API individuelles (Node.js Runtime)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/admin") && !pathname.startsWith("/api/super-admin")) {
    const rateLimitResponse = await applyRateLimit(request, apiRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse;
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
  const securedResponse = applySecureHeaders(response);
  
  // Ajouter le header X-Edge-Security pour indiquer que le WAF est actif
  if (pathname.startsWith("/api")) {
    securedResponse.headers.set("X-Edge-Security", "active");
  }
  
  return securedResponse;
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
