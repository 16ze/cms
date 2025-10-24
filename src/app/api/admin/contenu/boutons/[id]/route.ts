/**
 * API: Gestion d'un Bouton Individuel
 * ====================================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// PUT - Mettre à jour un bouton
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

    const button = await prisma.siteButton.update({
      where: { id },
      data: {
        label: data.label,
        url: data.url,
        style: data.style,
        color: data.color,
        icon: data.icon,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: button });
  } catch (error) {
    console.error("❌ Erreur mise à jour bouton:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du bouton" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un bouton
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    await prisma.siteButton.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression bouton:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du bouton" },
      { status: 500 }
    );
  }
}
