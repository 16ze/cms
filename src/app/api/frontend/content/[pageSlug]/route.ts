/**
 * API: Contenu Frontend Public
 * =============================
 * Version publique pour le frontend (sans authentification)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setTenantContext } from "@/lib/prisma-middleware";

// GET - Récupérer le contenu frontend public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
    const { pageSlug } = await params;

    // Pour l'instant, on récupère le premier tenant actif
    // TODO: Détecter le tenant depuis le domaine
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: true, data: {} });
    }

    // Définir le contexte tenant pour le middleware Prisma
    setTenantContext(tenant.id);

    const contents = await prisma.frontendContent.findMany({
      where: {
        tenantId: tenant.id,
        pageSlug,
        isActive: true,
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    // Nettoyer le contexte tenant après la requête
    setTenantContext(null);

    // ✅ Plus besoin de parser - le contenu est déjà en JSON natif
    return NextResponse.json({ success: true, data: contents });
  } catch (error) {
    // Nettoyer le contexte tenant en cas d'erreur
    setTenantContext(null);
    console.error("❌ Erreur récupération contenu frontend:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
