/**
 * API: Gestion des Médias
 * =======================
 * Gère les photos, vidéos et autres médias du site
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Liste des médias
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "logo", "hero", "gallery", etc.

    const where: any = { tenantId };
    if (type) where.type = type;

    const medias = await prisma.siteMedia.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: medias });
  } catch (error) {
    console.error("❌ Erreur récupération médias:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des médias" },
      { status: 500 }
    );
  }
}

// POST - Créer un média
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    const media = await prisma.siteMedia.create({
      data: {
        tenantId,
        type: data.type,
        url: data.url,
        alt: data.alt || "",
        caption: data.caption || "",
        orderIndex: data.orderIndex || 0,
      },
    });

    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur création média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du média" },
      { status: 500 }
    );
  }
}
