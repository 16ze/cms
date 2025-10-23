/**
 * API: RÉSERVATIONS ADMIN
 * =======================
 * Multi-tenant ready ✅
 * Remplace /api/booking/reservation pour l'admin
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    console.log("📋 API: GET /api/admin/reservations");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      console.log("❌ Non authentifié");
      return authResult;
    }

    const user = authResult;
    console.log(`✅ User authentifié: ${user.email} (type: ${user.type})`);

    // 🔒 Isolation multi-tenant
    const { tenantFilter, tenantId } = await getTenantFilter(request);
    console.log(`🔒 Tenant filter:`, tenantFilter);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerEmail = searchParams.get("customerEmail");
    const date = searchParams.get("date");

    // Construire le where avec isolation tenant
    const where: any = { ...tenantFilter }; // 🔒 ISOLATION

    if (status) where.status = status;
    if (customerEmail) where.customerEmail = { contains: customerEmail, mode: "insensitive" };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Récupérer les réservations du tenant
    const reservations = await prisma.restaurantReservation.findMany({
      where,
      include: {
        table: true,
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    console.log(`✅ ${reservations.length} réservations trouvées pour tenant ${tenantId || 'super-admin'}`);

    return NextResponse.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error: any) {
    console.error("❌ Erreur GET /api/admin/reservations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📋 API: POST /api/admin/reservations");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      guests,
      tableId,
      notes,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !date || !time || !guests) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Créer la réservation avec tenantId
    const reservation = await prisma.restaurantReservation.create({
      data: {
        tenantId, // 🔒 ISOLATION
        customerName,
        customerEmail,
        customerPhone,
        date: new Date(date),
        time,
        guests: parseInt(guests),
        tableId: tableId || null,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        table: true,
      },
    });

    console.log(`✅ Réservation créée: ${reservation.id} pour tenant ${tenantId}`);

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    console.error("❌ Erreur POST /api/admin/reservations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("📋 API: PATCH /api/admin/reservations");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID et status requis" },
        { status: 400 }
      );
    }

    // Vérifier que la réservation appartient au tenant
    const existing = await prisma.restaurantReservation.findFirst({
      where: {
        id,
        tenantId, // 🔒 ISOLATION
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour
    const reservation = await prisma.restaurantReservation.update({
      where: { id },
      data: { status },
      include: { table: true },
    });

    console.log(`✅ Réservation ${id} mise à jour pour tenant ${tenantId}`);

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error: any) {
    console.error("❌ Erreur PATCH /api/admin/reservations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("📋 API: DELETE /api/admin/reservations");

    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID requis" },
        { status: 400 }
      );
    }

    // Vérifier que la réservation appartient au tenant
    const existing = await prisma.restaurantReservation.findFirst({
      where: {
        id,
        tenantId, // 🔒 ISOLATION
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer
    await prisma.restaurantReservation.delete({
      where: { id },
    });

    console.log(`✅ Réservation ${id} supprimée pour tenant ${tenantId}`);

    return NextResponse.json({
      success: true,
      message: "Réservation supprimée",
    });
  } catch (error: any) {
    console.error("❌ Erreur DELETE /api/admin/reservations:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

