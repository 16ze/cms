/**
 * API: Gestion d'un Média Individuel
 * ===================================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Récupérer un média
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    const media = await prisma.siteMedia.findUnique({
      where: { id },
    });

    if (!media || media.tenantId !== tenantId) {
      return NextResponse.json({ error: "Média non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("❌ Erreur récupération média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du média" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un média
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

    const media = await prisma.siteMedia.update({
      where: { id },
      data: {
        type: data.type,
        url: data.url,
        alt: data.alt,
        caption: data.caption,
        orderIndex: data.orderIndex,
      },
    });

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("❌ Erreur mise à jour média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du média" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un média
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    await prisma.siteMedia.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du média" },
      { status: 500 }
    );
  }
}
