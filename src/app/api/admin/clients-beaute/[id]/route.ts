/**
 * API: CLIENT BEAUTÉ INDIVIDUEL (BEAUTY CLIENT BY ID)
 * ==================================================
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

    const client = await prisma.beautyClient.findFirst({
      where: {
        id,
        ...tenantFilter,
      },
      include: {
        appointments: {
          include: {
            treatment: true,
            esthetician: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    console.error("❌ GET /api/admin/clients-beaute/[id]:", error);
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

    // Traiter les allergies et préférences (JSON)
    let allergies = [];
    let preferences = [];

    if (data.allergies && Array.isArray(data.allergies)) {
      allergies = data.allergies;
    }

    if (data.preferences && Array.isArray(data.preferences)) {
      preferences = data.preferences;
    }

    const client = await prisma.beautyClient.updateMany({
      where: {
        id,
        ...tenantFilter,
      },
      data: {
        ...data,
        allergies: JSON.stringify(allergies),
        preferences: JSON.stringify(preferences),
      },
    });

    if (client.count === 0) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/clients-beaute/[id]:", error);
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
        clientId: id,
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

    const deleted = await prisma.beautyClient.deleteMany({
      where: {
        id,
        ...tenantFilter,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: "Client non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/clients-beaute/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
