/**
 * API: CLIENTS BEAUTÉ (BEAUTY CLIENTS)
 * ====================================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const where: any = { ...tenantFilter };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const clients = await prisma.beautyClient.findMany({
      where,
      include: {
        appointments: {
          include: {
            treatment: true,
            esthetician: true,
          },
          orderBy: { date: "desc" },
          take: 5, // Derniers 5 RDV
        },
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error("❌ GET /api/admin/clients-beaute:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const data = await request.json();

    // Validation
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { success: false, error: "Prénom, nom et email requis" },
        { status: 400 }
      );
    }

    // Vérifier l'unicité de l'email dans le tenant
    const existingClient = await prisma.beautyClient.findFirst({
      where: {
        tenantId,
        email: data.email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: "Ce client existe déjà" },
        { status: 400 }
      );
    }

    // Traiter les allergies et préférences (JSON)
    let allergies = [];
    let preferences = [];

    if (data.allergies && Array.isArray(data.allergies)) {
      allergies = data.allergies;
    }

    if (data.preferences && Array.isArray(data.preferences)) {
      preferences = data.preferences;
    }

    // 🔒 Créer avec tenantId
    const client = await prisma.beautyClient.create({
      data: {
        ...data,
        allergies: JSON.stringify(allergies),
        preferences: JSON.stringify(preferences),
        tenantId, // 🔒 ISOLATION
      },
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST /api/admin/clients-beaute:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
