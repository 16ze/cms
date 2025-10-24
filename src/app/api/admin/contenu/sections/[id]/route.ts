/**
 * API: Gestion d'une Section Individuelle
 * ========================================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// PUT - Mettre à jour une section
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

    const section = await prisma.siteSection.update({
      where: { id },
      data: {
        content: JSON.stringify(data.content),
        orderIndex: data.orderIndex,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error("❌ Erreur mise à jour section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la section" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    await prisma.siteSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression section:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la section" },
      { status: 500 }
    );
  }
}
