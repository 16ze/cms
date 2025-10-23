import { NextRequest, NextResponse } from "next/server";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification multi-tenant
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    // Si Super Admin, retourner null ou un template par défaut
    if (user.type === "SUPER_ADMIN") {
      return NextResponse.json({ 
        success: true, 
        data: null,
        message: "Super Admin n'a pas de template spécifique" 
      });
    }

    // Pour un tenant user, récupérer le template du tenant
    if (!user.tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant ID manquant" },
        { status: 400 }
      );
    }

    // Récupérer le tenant avec son template
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        template: {
          include: {
            sidebarConfigs: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!tenant || !tenant.template) {
      return NextResponse.json(
        { success: false, error: "Template non trouvé pour ce tenant" },
        { status: 404 }
      );
    }

    console.log(`✅ Template actif pour tenant ${user.tenantId}:`, tenant.template.displayName);

    return NextResponse.json({ 
      success: true, 
      data: tenant.template 
    });
  } catch (error) {
    console.error("❌ Erreur récupération template actif:", error);
    return NextResponse.json(
      { success: false, error: "Erreur récupération template actif" },
      { status: 500 }
    );
  }
}
