/**
 * API: Contenu Frontend Public
 * =============================
 * Version publique pour le frontend (sans authentification)
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const contents = await prisma.frontendContent.findMany({
      where: {
        tenantId: tenant.id,
        pageSlug,
        isActive: true,
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    // ✅ Plus besoin de parser - le contenu est déjà en JSON natif
    return NextResponse.json({ success: true, data: contents });
  } catch (error) {
    console.error("❌ Erreur récupération contenu frontend:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
