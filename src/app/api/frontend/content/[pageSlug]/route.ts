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

    // Parser le JSON pour chaque contenu
    const parsedContents = contents.map((content) => ({
      ...content,
      content: JSON.parse(content.content),
    }));

    return NextResponse.json({ success: true, data: parsedContents });
  } catch (error) {
    console.error("❌ Erreur récupération contenu frontend:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
