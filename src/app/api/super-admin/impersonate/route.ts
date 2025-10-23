/**
 * API SUPER ADMIN - IMPERSONATION
 * ================================
 * Permet au Super Admin de se connecter en tant qu'un tenant
 * pour gérer son espace admin
 */

import { NextRequest, NextResponse } from "next/server";
import { ensureSuperAdmin } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * POST - Se connecter en tant qu'un tenant
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que c'est un Super Admin
    const authResult = await ensureSuperAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const superAdmin = authResult;
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
    const cookieStore = await cookies();
    const currentSession = cookieStore.get("auth_session")?.value;

    if (currentSession) {
      // Sauvegarder la session Super Admin pour pouvoir revenir
      cookieStore.set("super_admin_session_backup", currentSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 heures
        path: "/",
      });
    }

    // Créer une nouvelle session en tant que tenant user
    const impersonationToken = `TENANT_USER:${tenantUser.id}`;

    cookieStore.set("auth_session", impersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 heures
      path: "/",
    });

    // Marquer qu'on est en mode impersonation
    cookieStore.set("impersonating", "true", {
      httpOnly: false, // Doit être accessible côté client
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 heures
      path: "/",
    });

    // Sauvegarder l'ID du Super Admin qui impersonne
    cookieStore.set("impersonator_id", superAdmin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 heures
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: `Connecté en tant que ${tenant.name}`,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          email: tenant.email,
        },
        user: {
          id: tenantUser.id,
          email: tenantUser.email,
          firstName: tenantUser.firstName,
          lastName: tenantUser.lastName,
          role: tenantUser.role,
        },
        impersonating: true,
      },
    });
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
    const superAdminSession = cookieStore.get("super_admin_session_backup")?.value;

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

