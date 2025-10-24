/**
 * API: PROFESSIONNELS DE BEAUTÉ (BEAUTY PROFESSIONALS)
 * ====================================================
 * Multi-tenant ready ✅
 * Multi-métiers ready ✅
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

    const professionals = await prisma.beautyProfessional.findMany({
      where: tenantFilter,
      include: {
        appointments: {
          include: {
            treatment: true,
          },
          orderBy: { date: "desc" },
          take: 5, // Derniers 5 RDV
        },
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ success: true, data: professionals });
  } catch (error) {
    console.error("❌ GET /api/admin/professionnels:", error);
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
    const existingProfessional = await prisma.beautyProfessional.findFirst({
      where: {
        tenantId,
        email: data.email,
      },
    });

    if (existingProfessional) {
      return NextResponse.json(
        { success: false, error: "Ce professionnel existe déjà" },
        { status: 400 }
      );
    }

    // Traiter les spécialités (JSON)
    let specialties = [];
    if (data.specialties && Array.isArray(data.specialties)) {
      specialties = data.specialties;
    }

    // 🔒 Créer avec tenantId
    const professional = await prisma.beautyProfessional.create({
      data: {
        ...data,
        specialties: JSON.stringify(specialties),
        tenantId, // 🔒 ISOLATION
      },
    });

    return NextResponse.json(
      { success: true, data: professional },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/admin/professionnels:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
