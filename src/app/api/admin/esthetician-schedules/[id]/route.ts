/**
 * API: HORAIRE ESTHÉTICIENNE INDIVIDUEL (BEAUTY ESTHETICIAN SCHEDULE BY ID)
 * =========================================================================
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";

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

    const schedule = await prisma.beautyEstheticianSchedule.updateMany({
      where: {
        id,
        ...tenantFilter,
      },
      data,
    });

    if (schedule.count === 0) {
      return NextResponse.json(
        { success: false, error: "Horaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/esthetician-schedules/[id]:", error);
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

    const deleted = await prisma.beautyEstheticianSchedule.deleteMany({
      where: {
        id,
        ...tenantFilter,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: "Horaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/esthetician-schedules/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
