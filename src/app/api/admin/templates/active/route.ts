import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
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

    // Si Super Admin, retourner null ou un template par défaut
    if (sessionData.role === "SUPER_ADMIN") {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Super Admin n'a pas de template spécifique",
      });
    }

    // Pour un tenant user, récupérer le template du tenant
    if (!sessionData.tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant ID manquant" },
        { status: 400 }
      );
    }

    // Récupérer le tenant avec son template
    const tenant = await prisma.tenant.findUnique({
      where: { id: sessionData.tenantId },
      include: {
        template: {
          include: {
            sidebarConfigs: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!tenant || !tenant.template) {
      return NextResponse.json(
        { success: false, error: "Template non trouvé pour ce tenant" },
        { status: 404 }
      );
    }

    console.log(
      `✅ Template actif pour tenant ${sessionData.tenantId}:`,
      tenant.template.displayName
    );

    return NextResponse.json({
      success: true,
      data: tenant.template,
    });
  } catch (error) {
    console.error("❌ Erreur récupération template actif:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération template actif" },
      { status: 500 }
    );
  }
}
