/**
 * API: Gestion des Boutons
 * =========================
 * Gère les boutons d'action du site
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { requireTenant } from "@/middleware/tenant-context";

// GET - Liste des boutons
export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const buttons = await prisma.siteButton.findMany({
      where: { tenantId },
      orderBy: [{ key: "asc" }],
    });

    return NextResponse.json({ success: true, data: buttons });
  } catch (error) {
    console.error("❌ Erreur récupération boutons:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des boutons" },
      { status: 500 }
    );
  }
}

// POST - Créer/Mettre à jour un bouton
export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    // Vérifier si le bouton existe déjà
    const existing = await prisma.siteButton.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: data.key,
        },
      },
    });

    let button;

    if (existing) {
      // Mettre à jour
      button = await prisma.siteButton.update({
        where: { id: existing.id },
        data: {
          label: data.label,
          url: data.url,
          style: data.style,
          color: data.color,
          icon: data.icon,
          isActive:
            data.isActive !== undefined ? data.isActive : existing.isActive,
        },
      });
    } else {
      // Créer
      button = await prisma.siteButton.create({
        data: {
          tenantId,
          key: data.key,
          label: data.label,
          url: data.url,
          style: data.style || "primary",
          color: data.color || "#ec4899",
          icon: data.icon,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    return NextResponse.json({ success: true, data: button }, { status: 201 });
  } catch (error) {
    console.error("❌ Erreur sauvegarde bouton:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du bouton" },
      { status: 500 }
    );
  }
}
