import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { adminPermissionService } from "@/lib/admin-permission-service";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/my-permissions
 * Récupérer les permissions de l'utilisateur connecté
 * Accessible à tous les utilisateurs authentifiés (pas seulement SUPER_ADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔐 API: Récupération des permissions de l'utilisateur connecté"
    );

    // Vérifier l'authentification (système unifié)
    const sessionResult = verifyAdminSessionFromRequest(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentification requise.",
        },
        { status: 401 }
      );
    }

    const sessionData = sessionResult.data;
    console.log(
      "🔐 Récupération des permissions pour:",
      sessionData.email,
      sessionData.role
    );

    // Si super admin, retourner tous les accès
    if (sessionData.role === "SUPER_ADMIN") {
      const fullPermissions = [
        { page: "dashboard", canView: true, canEdit: true, canDelete: true },
        { page: "reservations", canView: true, canEdit: true, canDelete: true },
        { page: "clients", canView: true, canEdit: true, canDelete: true },
        { page: "content", canView: true, canEdit: true, canDelete: true },
        { page: "site", canView: true, canEdit: true, canDelete: true },
        { page: "users", canView: true, canEdit: true, canDelete: true },
        { page: "settings", canView: true, canEdit: true, canDelete: true },
      ];

      return NextResponse.json({
        success: true,
        data: {
          permissions: fullPermissions,
          role: "SUPER_ADMIN",
        },
      });
    }

    // Pour les tenants users, charger les permissions dynamiquement
    // Inclure les éléments du template
    const basePermissions = [
      { page: "dashboard", canView: true, canEdit: true, canDelete: false },
      { page: "reservations", canView: true, canEdit: true, canDelete: true },
      { page: "clients", canView: true, canEdit: true, canDelete: true },
      { page: "content", canView: true, canEdit: true, canDelete: false },
      { page: "site", canView: true, canEdit: true, canDelete: false },
      // Permissions SEO (menu accordéon)
      { page: "keywords", canView: true, canEdit: true, canDelete: false },
      { page: "analysis", canView: true, canEdit: true, canDelete: false },
      { page: "performance", canView: true, canEdit: true, canDelete: false },
      { page: "seo-settings", canView: true, canEdit: true, canDelete: false },
      // Autres
      { page: "settings", canView: true, canEdit: true, canDelete: false },
    ];

    // Charger les éléments sidebar du template pour ajouter leurs permissions
    let allPermissions = [...basePermissions];

    if (sessionData.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: sessionData.tenantId },
        include: {
          template: {
            include: {
              sidebarConfigs: true,
            },
          },
        },
      });

      if (tenant && tenant.template && tenant.template.sidebarConfigs) {
        const templatePermissions = tenant.template.sidebarConfigs.map(
          (config) => ({
            page: config.elementId,
            canView: true,
            canEdit: true,
            canDelete: true,
          })
        );
        allPermissions = [...allPermissions, ...templatePermissions];

        console.log(
          `✅ ${templatePermissions.length} permissions template ajoutées pour ${tenant.template.displayName}`
        );
      }
    }

    console.log(`✅ Total ${allPermissions.length} permissions pour tenant`);

    return NextResponse.json({
      success: true,
      data: {
        permissions: allPermissions,
        role: "TENANT_ADMIN",
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
