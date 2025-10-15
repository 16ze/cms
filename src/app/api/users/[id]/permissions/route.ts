import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/require-admin";
import { adminPermissionService } from "@/lib/admin-permission-service";

/**
 * GET /api/users/[id]/permissions
 * Récupérer les permissions d'un utilisateur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await ensureAdmin(request);
  if (admin instanceof NextResponse) {
    return admin;
  }

  // Seul le super admin peut gérer les permissions
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const permissions = await adminPermissionService.getUserPermissions(id);
    const availablePages = adminPermissionService.getAvailablePages();

    return NextResponse.json({
      success: true,
      data: {
        permissions,
        availablePages,
      },
    });
  } catch (error) {
    console.error("Erreur récupération permissions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]/permissions
 * Définir les permissions d'un utilisateur
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await ensureAdmin(request);
  if (admin instanceof NextResponse) {
    return admin;
  }

  // Seul le super admin peut gérer les permissions
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Format de permissions invalide" },
        { status: 400 }
      );
    }

    const updated = await adminPermissionService.setUserPermissions(
      id,
      permissions
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Permissions mises à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur mise à jour permissions:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

