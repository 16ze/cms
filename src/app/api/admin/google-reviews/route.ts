/**
 * API: Gestion des Avis Google
 * ============================
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant, getTenantFilter } from "@/middleware/tenant-context";

// GET - Liste des avis Google
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const visibleOnly = searchParams.get("visibleOnly") === "true";

    const where: any = { ...tenantFilter };
    if (visibleOnly) where.isVisible = true;

    const reviews = await prisma.googleReview.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { date: "desc" }],
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("❌ Erreur récupération avis Google:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un avis Google
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);
    const { tenantFilter } = await getTenantFilter(request);

    const data = await request.json();
    const {
      authorName,
      rating,
      text,
      date,
      authorUrl,
      photoUrl,
      isVerified,
      isVisible,
      orderIndex,
    } = data;

    // Validation
    if (!authorName || !rating || !text || !date) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    const review = await prisma.googleReview.create({
      data: {
        ...tenantFilter,
        authorName,
        rating,
        text,
        date: new Date(date),
        authorUrl,
        photoUrl,
        isVerified: isVerified || false,
        isVisible: isVisible !== undefined ? isVisible : true,
        orderIndex: orderIndex || 0,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur ajout avis Google:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'avis" },
      { status: 500 }
    );
  }
}
