/**
 * API SUPER ADMIN - IMPERSONATION
 * ================================
 * Permet au Super Admin de se connecter en tant qu'un tenant
 * pour gérer son espace admin
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import {
  signAdminSession,
  getAdminSessionSecret,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin-session";
import { setSecureCookie } from "@/lib/cookie-utils";

/**
 * POST - Se connecter en tant qu'un tenant
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que c'est un Super Admin
    const sessionResult = verifyAdminSessionFromRequest(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentification requise",
        },
        { status: 401 }
      );
    }

    const sessionData = sessionResult.data;

    if (sessionData.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Accès refusé. Super Admin requis.",
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: "tenantId est requis",
        },
        { status: 400 }
      );
    }

    // Vérifier que le tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        template: true,
        users: {
          where: { isActive: true },
          take: 1, // Prendre le premier utilisateur actif
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          error: "Tenant non trouvé",
        },
        { status: 404 }
      );
    }

    if (!tenant.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Ce tenant est désactivé",
        },
        { status: 403 }
      );
    }

    // Trouver un utilisateur du tenant (ou utiliser le premier)
    const tenantUser = tenant.users[0];

    if (!tenantUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun utilisateur actif trouvé pour ce tenant",
        },
        { status: 404 }
      );
    }

    // Sauvegarder la session Super Admin actuelle dans un cookie séparé
    const currentSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (currentSession) {
      // Sauvegarder la session Super Admin pour pouvoir revenir
      // On va créer une réponse avec le cookie de sauvegarde
      const response = NextResponse.json({
        success: true,
        message: "Connexion en tant que tenant réussie",
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        user: {
          id: tenantUser.id,
          name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
          email: tenantUser.email,
          role: "TENANT_ADMIN",
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
        },
      });

      // Sauvegarder la session Super Admin
      response.cookies.set("super_admin_session_backup", currentSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 heures
        path: "/",
      });

      // Créer une nouvelle session en tant que tenant user
      const impersonationSessionData = {
        email: tenantUser.email,
        name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
        id: tenantUser.id,
        role: "TENANT_ADMIN" as const,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        loginTime: new Date().toISOString(),
      };

      const impersonationToken = signAdminSession(
        impersonationSessionData,
        getAdminSessionSecret(),
        ADMIN_SESSION_MAX_AGE_SECONDS
      );

      // Définir le cookie d'impersonation avec le helper standardisé
      setSecureCookie(response, ADMIN_SESSION_COOKIE, impersonationToken, {
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      });

      return response;
    }

    // Si pas de session actuelle, créer une nouvelle session tenant
    const impersonationSessionData = {
      email: tenantUser.email,
      name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
      id: tenantUser.id,
      role: "TENANT_ADMIN" as const,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      loginTime: new Date().toISOString(),
    };

    const impersonationToken = signAdminSession(
      impersonationSessionData,
      getAdminSessionSecret(),
      ADMIN_SESSION_MAX_AGE_SECONDS
    );

    const response = NextResponse.json({
      success: true,
      message: "Connexion en tant que tenant réussie",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      user: {
        id: tenantUser.id,
        name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
        email: tenantUser.email,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      },
    });

    // Définir le cookie d'impersonation avec le helper standardisé
    setSecureCookie(response, ADMIN_SESSION_COOKIE, impersonationToken, {
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error("❌ Erreur impersonation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de l'impersonation",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Quitter le mode impersonation et revenir au Super Admin
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Récupérer la session Super Admin sauvegardée
    const superAdminSession = cookieStore.get(
      "super_admin_session_backup"
    )?.value;

    if (!superAdminSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucune session Super Admin sauvegardée",
        },
        { status: 400 }
      );
    }

    // Restaurer la session Super Admin
    cookieStore.set("auth_session", superAdminSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 heures
      path: "/",
    });

    // Supprimer les cookies d'impersonation
    cookieStore.delete("super_admin_session_backup");
    cookieStore.delete("impersonating");
    cookieStore.delete("impersonator_id");

    return NextResponse.json({
      success: true,
      message: "Retour au mode Super Admin",
    });
  } catch (error: any) {
    console.error("❌ Erreur sortie impersonation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la sortie d'impersonation",
      },
      { status: 500 }
    );
  }
}
