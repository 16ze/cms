/**
 * API: GET CURRENT USER
 * Route: GET /api/auth/me
 *
 * Retourne les informations de l'utilisateur connecté (admin ou tenant)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier la session admin (unifiée)
    const sessionResult = verifyAdminSessionFromRequest(request);

    if (!sessionResult.success) {
      // En développement, logger la raison de l'échec pour le débogage
      if (process.env.NODE_ENV === "development") {
        const cookieValue = request.cookies.get("admin_session")?.value;
        console.log("🔍 [auth/me] Échec authentification:", {
          reason: sessionResult.error,
          hasCookie: !!cookieValue,
          cookieLength: cookieValue?.length || 0,
          allCookies: Array.from(request.cookies.getAll()).map(c => c.name),
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Non authentifié",
        },
        { status: 401 }
      );
    }

    const sessionData = sessionResult.data;

    // Déterminer le type d'utilisateur basé sur les données de session
    if (sessionData.role === "SUPER_ADMIN") {
      // Utilisateur admin (AdminUser)
      return NextResponse.json({
        success: true,
        user: {
          id: sessionData.id,
          name: sessionData.name,
          email: sessionData.email,
          type: "SUPER_ADMIN",
        },
      });
    } else if (sessionData.role === "TENANT_ADMIN") {
      // Utilisateur tenant (TenantUser)
      return NextResponse.json({
        success: true,
        user: {
          id: sessionData.id,
          name: sessionData.name,
          email: sessionData.email,
          type: "TENANT_ADMIN",
          tenantId: sessionData.tenantId,
          tenantSlug: sessionData.tenantSlug,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Type d'utilisateur non reconnu",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur /api/auth/me:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
