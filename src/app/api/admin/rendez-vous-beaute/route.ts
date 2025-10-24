/**
 * API: RENDEZ-VOUS BEAUTÉ
 * ========================
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
    const status = searchParams.get("status");
    const treatmentId = searchParams.get("treatmentId");
    const date = searchParams.get("date");

    const where: any = { ...tenantFilter }; // 🔒 ISOLATION
    if (status) where.status = status;
    if (treatmentId) where.treatmentId = treatmentId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const appointments = await prisma.beautyAppointment.findMany({
      where,
      include: {
        treatment: true,
        professional: true, // Inclure le professionnel assigné
        client: true, // Inclure le client si disponible
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    console.error("❌ GET /api/admin/rendez-vous-beaute:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
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
    if (!data.treatmentId) {
      return NextResponse.json(
        { success: false, error: "Le soin est requis" },
        { status: 400 }
      );
    }

    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Informations client requises" },
        { status: 400 }
      );
    }

    if (!data.date || !data.time) {
      return NextResponse.json(
        { success: false, error: "Date et heure requises" },
        { status: 400 }
      );
    }

    // 🔒 Créer avec tenantId
    const appointment = await prisma.beautyAppointment.create({
      data: {
        ...data,
        date: new Date(data.date),
        tenantId, // 🔒 ISOLATION
      },
      include: {
        treatment: true,
        professional: true, // Inclure le professionnel assigné
        client: true, // Inclure le client si disponible
      },
    });

    return NextResponse.json(
      { success: true, data: appointment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/admin/rendez-vous-beaute:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
