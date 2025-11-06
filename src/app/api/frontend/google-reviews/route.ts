/**
 * API: Avis Google Public
 * =======================
 * Version publique pour le frontend (sans authentification)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setTenantContext } from "@/lib/prisma-middleware";

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

    // Définir le contexte tenant pour le middleware Prisma
    setTenantContext(tenant.id);

    const reviews = await prisma.googleReview.findMany({
      where: {
        tenantId: tenant.id,
        isVisible: true,
      },
      orderBy: [{ orderIndex: "asc" }, { date: "desc" }],
    });

    // Nettoyer le contexte tenant après la requête
    setTenantContext(null);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    // Nettoyer le contexte tenant en cas d'erreur
    setTenantContext(null);
    console.error("❌ Erreur récupération avis Google:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
