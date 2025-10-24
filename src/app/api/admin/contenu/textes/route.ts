/**
 * API: Gestion des Textes
 * =======================
 * Gère les textes éditoriaux du site
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Liste des textes
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug");
    const sectionId = searchParams.get("sectionId");

    const where: any = { tenantId };
    if (pageSlug) where.pageSlug = pageSlug;
    if (sectionId) where.sectionId = sectionId;

    const sections = await prisma.siteSection.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }],
    });

    // Transformer les sections en textes avec parsing du JSON
    const textes = sections.map((section) => ({
      id: section.id,
      pageSlug: section.pageSlug,
      sectionId: section.sectionId,
      content: JSON.parse(section.content),
      orderIndex: section.orderIndex,
      isActive: section.isActive,
    }));

    return NextResponse.json({ success: true, data: textes });
  } catch (error) {
    console.error("❌ Erreur récupération textes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des textes" },
      { status: 500 }
    );
  }
}

// POST - Créer/Mettre à jour un texte
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    // Vérifier si le texte existe déjà
    const existing = await prisma.siteSection.findUnique({
      where: {
        tenantId_pageSlug_sectionId: {
          tenantId,
          pageSlug: data.pageSlug,
          sectionId: data.sectionId,
        },
      },
    });

    let section;

    if (existing) {
      // Mettre à jour
      section = await prisma.siteSection.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(data.content),
          orderIndex: data.orderIndex || existing.orderIndex,
          isActive:
            data.isActive !== undefined ? data.isActive : existing.isActive,
        },
      });
    } else {
      // Créer
      section = await prisma.siteSection.create({
        data: {
          tenantId,
          pageSlug: data.pageSlug,
          sectionId: data.sectionId,
          content: JSON.stringify(data.content),
          orderIndex: data.orderIndex || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur sauvegarde texte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du texte" },
      { status: 500 }
    );
  }
}
