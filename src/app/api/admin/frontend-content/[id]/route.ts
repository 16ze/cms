/**
 * API: Gestion d'un Élément de Contenu Frontend
 * =============================================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant, getTenantFilter } from "@/middleware/tenant-context";

// GET - Récupérer un élément spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId,
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
      data: { ...content, content: JSON.parse(content.content) },
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
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;
    const data = await request.json();

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId,
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
        content: data.content ? JSON.stringify(data.content) : content.content,
        orderIndex:
          data.orderIndex !== undefined ? data.orderIndex : content.orderIndex,
        isActive:
          data.isActive !== undefined ? data.isActive : content.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, content: JSON.parse(updated.content) },
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
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    const content = await prisma.frontendContent.findFirst({
      where: {
        id,
        tenantId,
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
