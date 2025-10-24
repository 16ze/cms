/**
 * API: RENDEZ-VOUS BEAUTÉ INDIVIDUEL
 * ===================================
 * Multi-tenant ready ✅
 * Multi-métiers ready ✅
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

    const appointment = await prisma.beautyAppointment.findFirst({
      where: {
        id: params.id,
        ...tenantFilter, // 🔒 ISOLATION
      },
      include: {
        treatment: true,
        professional: true, // Inclure le professionnel assigné
        client: true, // Inclure le client si disponible
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("❌ GET /api/admin/rendez-vous-beaute/[id]:", error);
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

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.beautyAppointment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous introuvable" },
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

    // Convertir la date si présente
    if (data.date) {
      data.date = new Date(data.date);
    }

    // Gérer les dates de confirmation/annulation
    if (data.status === "CONFIRMED" && !data.confirmedAt) {
      data.confirmedAt = new Date();
    }
    if (data.status === "CANCELLED" && !data.cancelledAt) {
      data.cancelledAt = new Date();
    }

    const appointment = await prisma.beautyAppointment.update({
      where: { id: params.id },
      data,
      include: {
        treatment: true,
        professional: true, // Inclure le professionnel assigné
        client: true, // Inclure le client si disponible
      },
    });

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/rendez-vous-beaute/[id]:", error);
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

    // 🔒 Vérifier l'accès au tenant
    const existing = await prisma.beautyAppointment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Rendez-vous introuvable" },
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

    await prisma.beautyAppointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Rendez-vous supprimé",
    });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/rendez-vous-beaute/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
