/**
 * API: HORAIRES ESTHÉTICIENNES (BEAUTY ESTHETICIAN SCHEDULES)
 * ============================================================
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
    const estheticianId = searchParams.get("estheticianId");

    const schedules = await prisma.beautyEstheticianSchedule.findMany({
      where: {
        ...tenantFilter,
        ...(estheticianId && { estheticianId }),
      },
      include: {
        esthetician: true,
      },
      orderBy: [
        { estheticianId: "asc" },
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("❌ GET /api/admin/esthetician-schedules:", error);
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
    if (!data.estheticianId || !data.dayOfWeek || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { success: false, error: "Esthéticienne, jour, heure de début et fin requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'esthéticienne appartient au tenant
    const esthetician = await prisma.beautyEsthetician.findFirst({
      where: {
        id: data.estheticianId,
        tenantId,
      },
    });

    if (!esthetician) {
      return NextResponse.json(
        { success: false, error: "Esthéticienne non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de conflit d'horaire
    const existingSchedule = await prisma.beautyEstheticianSchedule.findFirst({
      where: {
        tenantId,
        estheticianId: data.estheticianId,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { success: false, error: "Conflit d'horaire détecté" },
        { status: 400 }
      );
    }

    // 🔒 Créer avec tenantId
    const schedule = await prisma.beautyEstheticianSchedule.create({
      data: {
        ...data,
        tenantId, // 🔒 ISOLATION
      },
      include: {
        esthetician: true,
      },
    });

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/admin/esthetician-schedules:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
