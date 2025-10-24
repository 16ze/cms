/**
 * API: HORAIRES PROFESSIONNELS DE BEAUTÉ (BEAUTY PROFESSIONAL SCHEDULES)
 * =====================================================================
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

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get("professionalId");

    const schedules = await prisma.beautyProfessionalSchedule.findMany({
      where: {
        ...tenantFilter,
        ...(professionalId && { professionalId }),
      },
      include: {
        professional: true,
      },
      orderBy: [
        { professionalId: "asc" },
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("❌ GET /api/admin/professional-schedules:", error);
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
    if (
      !data.professionalId ||
      !data.dayOfWeek ||
      !data.startTime ||
      !data.endTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Professionnel, jour, heure de début et fin requis",
        },
        { status: 400 }
      );
    }

    // Vérifier que le professionnel appartient au tenant
    const professional = await prisma.beautyProfessional.findFirst({
      where: {
        id: data.professionalId,
        tenantId,
      },
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: "Professionnel non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de conflit d'horaire
    const existingSchedule = await prisma.beautyProfessionalSchedule.findFirst({
      where: {
        tenantId,
        professionalId: data.professionalId,
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
    const schedule = await prisma.beautyProfessionalSchedule.create({
      data: {
        ...data,
        tenantId, // 🔒 ISOLATION
      },
      include: {
        professional: true,
      },
    });

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/admin/professional-schedules:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
