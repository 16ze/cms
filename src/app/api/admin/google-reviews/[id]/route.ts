/**
 * API: Gestion d'un Avis Google
 * =============================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Récupérer un avis spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    const review = await prisma.googleReview.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("❌ Erreur récupération avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'avis" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un avis
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

    const review = await prisma.googleReview.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    const updated = await prisma.googleReview.update({
      where: { id },
      data: {
        authorName: data.authorName || review.authorName,
        rating: data.rating !== undefined ? data.rating : review.rating,
        text: data.text || review.text,
        date: data.date ? new Date(data.date) : review.date,
        authorUrl:
          data.authorUrl !== undefined ? data.authorUrl : review.authorUrl,
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : review.photoUrl,
        isVerified:
          data.isVerified !== undefined ? data.isVerified : review.isVerified,
        isVisible:
          data.isVisible !== undefined ? data.isVisible : review.isVisible,
        orderIndex:
          data.orderIndex !== undefined ? data.orderIndex : review.orderIndex,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Erreur modification avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'avis" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un avis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { id } = await params;

    const review = await prisma.googleReview.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    await prisma.googleReview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur suppression avis:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}
