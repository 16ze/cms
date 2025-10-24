/**
 * API: ESTHÉTICIENNE INDIVIDUELLE (BEAUTY ESTHETICIAN BY ID)
 * ==========================================================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);
    const { id } = await params;

    const esthetician = await prisma.beautyEsthetician.findFirst({
      where: {
        id,
        ...tenantFilter,
      },
      include: {
        appointments: {
          include: {
            treatment: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!esthetician) {
      return NextResponse.json(
        { success: false, error: "Esthéticienne non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: esthetician });
  } catch (error: any) {
    console.error("❌ GET /api/admin/estheticiennes/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);
    const { id } = await params;

    const data = await request.json();

    // Traiter les spécialités (JSON)
    let specialties = [];
    if (data.specialties && Array.isArray(data.specialties)) {
      specialties = data.specialties;
    }

    const esthetician = await prisma.beautyEsthetician.updateMany({
      where: {
        id,
        ...tenantFilter,
      },
      data: {
        ...data,
        specialties: JSON.stringify(specialties),
      },
    });

    if (esthetician.count === 0) {
      return NextResponse.json(
        { success: false, error: "Esthéticienne non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/estheticiennes/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);
    const { id } = await params;

    // Vérifier s'il y a des rendez-vous associés
    const appointmentsCount = await prisma.beautyAppointment.count({
      where: {
        estheticianId: id,
        ...tenantFilter,
      },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer: ${appointmentsCount} rendez-vous associés`,
        },
        { status: 400 }
      );
    }

    const deleted = await prisma.beautyEsthetician.deleteMany({
      where: {
        id,
        ...tenantFilter,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: "Esthéticienne non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/estheticiennes/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
