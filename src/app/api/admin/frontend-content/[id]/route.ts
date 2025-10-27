/**
 * API: Gestion d'un Élément de Contenu Frontend
 * =============================================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/auth";

// GET - Récupérer un élément spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    // Pour l'instant, on récupère le premier tenant actif
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Aucun tenant actif trouvé" },
        { status: 400 }
      );
    }

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: content, // ✅ JSON natif - pas besoin de parse
    });
  } catch (error) {
    console.error("❌ Erreur récupération contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un élément
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const data = await request.json();

    // Pour l'instant, on récupère le premier tenant actif
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Aucun tenant actif trouvé" },
        { status: 400 }
      );
    }

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    const updated = await prisma.frontendContent.update({
      where: { id },
      data: {
        content: data.content || content.content, // ✅ JSON natif - pas besoin de stringify
        orderIndex:
          data.orderIndex !== undefined ? data.orderIndex : content.orderIndex,
        isActive:
          data.isActive !== undefined ? data.isActive : content.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated, // ✅ JSON natif - pas besoin de parse
    });
  } catch (error) {
    console.error("❌ Erreur modification contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du contenu" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un élément
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    // Pour l'instant, on récupère le premier tenant actif
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Aucun tenant actif trouvé" },
        { status: 400 }
      );
    }

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    await prisma.frontendContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    );
  }
}
