/**
 * API: Avis Google Public
 * =======================
 * Version publique pour le frontend (sans authentification)
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Récupérer les avis Google publics
export async function GET(request: NextRequest) {
  try {
    // Pour l'instant, on récupère le premier tenant actif
    // TODO: Détecter le tenant depuis le domaine
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: true, data: [] });
    }

    const reviews = await prisma.googleReview.findMany({
      where: {
        tenantId: tenant.id,
        isVisible: true,
      },
      orderBy: [{ orderIndex: "asc" }, { date: "desc" }],
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("❌ Erreur récupération avis Google:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
