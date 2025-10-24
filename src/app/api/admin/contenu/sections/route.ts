/**
 * API: Gestion des Sections
 * ==========================
 * Gère les sections de pages du site
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Liste des sections
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug");

    const where: any = { tenantId };
    if (pageSlug) where.pageSlug = pageSlug;

    const sections = await prisma.siteSection.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }],
    });

    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error("❌ Erreur récupération sections:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sections" },
      { status: 500 }
    );
  }
}

// POST - Créer une section
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    const section = await prisma.siteSection.create({
      data: {
        tenantId,
        pageSlug: data.pageSlug,
        sectionId: data.sectionId,
        content: JSON.stringify(data.content || {}),
        orderIndex: data.orderIndex || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur création section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la section" },
      { status: 500 }
    );
  }
}
