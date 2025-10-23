import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionOnEdge,
} from "@/lib/admin-session-edge";

// Types pour les rôles utilisateur
type UserRole = "ADMIN" | "SUPER_ADMIN";

// Pages restreintes aux super admins uniquement
const RESTRICTED_ADMIN_PAGES = [
  "/admin/users",
  "/admin/settings",
  "/admin/content/advanced",
  "/admin/site",
];

// Définition des permissions simplifiée pour le middleware
const PAGE_PERMISSIONS = {
  dashboard: ["ADMIN", "SUPER_ADMIN"],
  reservations: ["ADMIN", "SUPER_ADMIN"],
  clients: ["ADMIN", "SUPER_ADMIN"],
  users: ["SUPER_ADMIN"],
  settings: ["SUPER_ADMIN"],
  content: ["SUPER_ADMIN"],
  site: ["SUPER_ADMIN"],
} as const;

// Fonction simplifiée pour vérifier l'accès aux pages
function hasPageAccess(userRole: UserRole, page: string): boolean {
  const allowedRoles = PAGE_PERMISSIONS[page as keyof typeof PAGE_PERMISSIONS];
  if (!allowedRoles) {
    // Par défaut, seul le super admin a accès aux pages non définies
    return userRole === "SUPER_ADMIN";
  }
  return allowedRoles.includes(userRole as any);
}

// Middleware pour protéger les routes admin
export async function middleware(request: NextRequest) {
  // Vérifier si le mode maintenance est activé via un cookie
  const maintenanceMode =
    request.cookies.get("maintenance-mode")?.value === "true";

  // Si le mode maintenance est activé et que ce n'est pas une route admin ou la page de maintenance elle-même
  if (
    maintenanceMode &&
    !request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/maintenance"
  ) {
    // Permettre l'accès aux ressources statiques et API
    if (
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.includes(".") ||
      request.nextUrl.pathname === "/maintenance"
    ) {
      return NextResponse.next();
    }

    // Rediriger vers la page de maintenance
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin");

  if (
    (!isAdminPage && !isAdminApi) ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Pour les pages admin (pas les APIs), laisser le client-side gérer l'auth
  // Cela évite les problèmes de timing avec les cookies
  if (isAdminPage) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!secret || secret.length < 32) {
    console.error("ADMIN_SESSION_SECRET manquant ou trop court.");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "config_error");
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Ajouter un paramètre pour le retour après connexion
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const verification = await verifyAdminSessionOnEdge(token, secret);
  if (!verification.valid) {
    const loginUrl = new URL("/login", request.url);
    const reason =
      "reason" in verification ? verification.reason : "INVALID_SESSION";
    loginUrl.searchParams.set("error", reason.toLowerCase());
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApi) {
    return NextResponse.next();
  }

  const sessionData = verification.claims as { role?: UserRole };
  try {
    const userRole = sessionData.role as UserRole;
    const currentPath = request.nextUrl.pathname;

    // Vérifier si la page actuelle est restreinte
    const isRestrictedPage = RESTRICTED_ADMIN_PAGES.some((restrictedPath) =>
      currentPath.startsWith(restrictedPath)
    );

    if (isRestrictedPage) {
      // Extraire le nom de la page pour vérifier les permissions
      const pageName = currentPath.split("/")[2]; // /admin/[pageName]/...

      if (!hasPageAccess(userRole, pageName)) {
        // Rediriger vers le dashboard si l'utilisateur n'a pas accès
        const dashboardUrl = new URL("/admin/dashboard", request.url);
        dashboardUrl.searchParams.set("error", "access_denied");
        dashboardUrl.searchParams.set("attempted_page", pageName);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "invalid_session");
    return NextResponse.redirect(loginUrl);
  }

  // Si tout est OK, laisser passer la requête
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
