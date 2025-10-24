import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * MIDDLEWARE MULTI-TENANT SIMPLIFIÉ
 * ==================================
 *
 * Ce middleware a été simplifié pour :
 * 1. Laisser le client-side gérer l'authentification
 * 2. Éviter les problèmes de timing avec les cookies
 * 3. Permettre au nouveau système multi-tenant de fonctionner
 *
 * La vérification d'authentification se fait maintenant via :
 * - /api/auth/me (côté client)
 * - useAdminSession hook
 * - useTempAdmin hook
 */

// Middleware pour protéger les routes admin
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
      return NextResponse.next();
    }

    // Rediriger vers la page de maintenance
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Si c'est la page d'accueil principale, router vers le template approprié
  // TODO: Détecter le tenant depuis le domaine ou le contexte
  // Pour l'instant, rediriger vers /beaute pour tester
  if (
    pathname === "/" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/super-admin")
  ) {
    return NextResponse.rewrite(new URL("/beaute", request.url));
  }

  // Laisser passer toutes les autres requêtes
  // L'authentification est gérée côté client via :
  // - /api/auth/me
  // - useAdminSession()
  // - useTempAdmin()
  return NextResponse.next();
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
