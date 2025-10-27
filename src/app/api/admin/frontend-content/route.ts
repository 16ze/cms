/**
 * API: Gestion du Contenu Frontend
 * =================================
 * Gère tout le contenu visible sur le frontend
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

// GET - Liste tout le contenu frontend pour un tenant
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug");
    const sectionSlug = searchParams.get("sectionSlug");

    // Pour l'instant, on récupère le premier tenant actif
    // TODO: Détecter le tenant depuis le domaine ou la session
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json({ success: true, data: [] });
    }

    const where: any = { tenantId: tenant.id };
    if (pageSlug) where.pageSlug = pageSlug;
    if (sectionSlug) where.sectionSlug = sectionSlug;

    const contents = await prisma.frontendContent.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    // ✅ Plus besoin de parser - le contenu est déjà en JSON natif
    return NextResponse.json({ success: true, data: contents });
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
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Pour l'instant, on récupère le premier tenant actif
    // TODO: Détecter le tenant depuis le domaine ou la session
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Aucun tenant actif trouvé" },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log("📥 [API] Données reçues:", {
      pageSlug: data.pageSlug,
      sectionSlug: data.sectionSlug,
      dataType: data.dataType,
      content: data.content,
    });

    const { pageSlug, sectionSlug, dataType, content, orderIndex, isActive } =
      data;

    // Validation
    if (!pageSlug || !sectionSlug || !dataType || !content) {
      console.error("❌ [API] Données manquantes:", {
        pageSlug,
        sectionSlug,
        dataType,
        hasContent: !!content,
      });
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier si le contenu existe déjà
    const existing = await prisma.frontendContent.findUnique({
      where: {
        tenantId_pageSlug_sectionSlug_dataType: {
          tenantId: tenant.id,
          pageSlug,
          sectionSlug,
          dataType,
        },
      },
    });

    let result;

    if (existing) {
      // Mettre à jour
      console.log("🔄 [API] Mise à jour du contenu existant:", existing.id);
      result = await prisma.frontendContent.update({
        where: { id: existing.id },
        data: {
          content: content, // ✅ JSON natif - pas besoin de stringify
          orderIndex:
            orderIndex !== undefined ? orderIndex : existing.orderIndex,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
      console.log("✅ [API] Contenu mis à jour avec succès");
    } else {
      // Créer
      console.log("➕ [API] Création d'un nouveau contenu");
      result = await prisma.frontendContent.create({
        data: {
          tenantId: tenant.id,
          pageSlug,
          sectionSlug,
          dataType,
          content: content, // ✅ JSON natif - pas besoin de stringify
          orderIndex: orderIndex || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
      console.log("✅ [API] Contenu créé avec succès");
    }

    return NextResponse.json(
      {
        success: true,
        data: result, // ✅ JSON natif - pas besoin de parse
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
