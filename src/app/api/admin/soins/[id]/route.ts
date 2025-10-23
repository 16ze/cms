/**
 * API: SOIN INDIVIDUEL (GET/PUT/DELETE)
 * ======================================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import {
  getTenantFilter,
  verifyTenantAccess,
} from "@/middleware/tenant-context";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);

    const treatment = await prisma.beautyTreatment.findFirst({
      where: {
        id: params.id,
        ...tenantFilter, // 🔒 ISOLATION
      },
      include: {
        appointments: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { success: false, error: "Soin introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: treatment });
  } catch (error: any) {
    console.error("❌ GET /api/admin/soins/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Vérifier que la ressource appartient au tenant
    const existing = await prisma.beautyTreatment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Soin introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    const data = await request.json();

    const treatment = await prisma.beautyTreatment.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: treatment });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/soins/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Vérifier que la ressource appartient au tenant
    const existing = await prisma.beautyTreatment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Soin introuvable" },
        { status: 404 }
      );
    }

    const hasAccess = await verifyTenantAccess(request, existing.tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Vérifier s'il y a des rendez-vous liés
    const { tenantFilter } = await getTenantFilter(request);
    const appointmentsCount = await prisma.beautyAppointment.count({
      where: {
        treatmentId: params.id,
        ...tenantFilter, // 🔒 ISOLATION
      },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer : ${appointmentsCount} rendez-vous lié(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.beautyTreatment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Soin supprimé",
    });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/soins/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
