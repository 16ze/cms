/**
 * API: Gestion du Contenu Frontend
 * =================================
 * Gère tout le contenu visible sur le frontend
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant, getTenantFilter } from "@/middleware/tenant-context";

// GET - Liste tout le contenu frontend pour un tenant
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug");
    const sectionSlug = searchParams.get("sectionSlug");

    const where: any = { ...tenantFilter };
    if (pageSlug) where.pageSlug = pageSlug;
    if (sectionSlug) where.sectionSlug = sectionSlug;

    const contents = await prisma.frontendContent.findMany({
      where,
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
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// POST - Créer/Mettre à jour un élément de contenu
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { tenantFilter } = await getTenantFilter(request);

    const data = await request.json();
    const { pageSlug, sectionSlug, dataType, content, orderIndex, isActive } =
      data;

    // Validation
    if (!pageSlug || !sectionSlug || !dataType || !content) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier si le contenu existe déjà
    const existing = await prisma.frontendContent.findUnique({
      where: {
        tenantId_pageSlug_sectionSlug_dataType: {
          tenantId,
          pageSlug,
          sectionSlug,
          dataType,
        },
      },
    });

    let result;

    if (existing) {
      // Mettre à jour
      result = await prisma.frontendContent.update({
        where: { id: existing.id },
        data: {
          content: JSON.stringify(content),
          orderIndex:
            orderIndex !== undefined ? orderIndex : existing.orderIndex,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
    } else {
      // Créer
      result = await prisma.frontendContent.create({
        data: {
          ...tenantFilter,
          pageSlug,
          sectionSlug,
          dataType,
          content: JSON.stringify(content),
          orderIndex: orderIndex || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: { ...result, content: JSON.parse(result.content) },
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error("❌ Erreur sauvegarde contenu frontend:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du contenu" },
      { status: 500 }
    );
  }
}
