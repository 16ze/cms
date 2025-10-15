import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/require-admin";
import { adminPermissionService } from "@/lib/admin-permission-service";

/**
 * GET /api/auth/my-permissions
 * Récupérer les permissions de l'utilisateur connecté
 * Accessible à tous les utilisateurs authentifiés (pas seulement SUPER_ADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔐 API: Récupération des permissions de l'utilisateur connecté");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const currentUser = authResult;
    console.log("🔐 Récupération des permissions pour:", currentUser.email);

    // Si super admin, retourner tous les accès
    if (currentUser.role === "SUPER_ADMIN") {
      const allPages = adminPermissionService.getAvailablePages();
      const fullPermissions = allPages.map((page) => ({
        page: page.id,
        canView: true,
        canEdit: true,
        canDelete: true,
      }));

      return NextResponse.json({
        success: true,
        data: {
          permissions: fullPermissions,
          role: "SUPER_ADMIN",
        },
      });
    }

    // Pour les admins, récupérer leurs permissions depuis la base
    const permissions = await adminPermissionService.getUserPermissions(
      currentUser.id
    );

    console.log("✅ Permissions récupérées:", permissions.length);

    return NextResponse.json({
      success: true,
      data: {
        permissions,
        role: "ADMIN",
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération permissions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des permissions" },
      { status: 500 }
    );
  }
}

