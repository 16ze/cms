/**
 * API: PATIENTS
 * =============
 * Multi-tenant ready ✅
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAuthenticated } from "@/lib/tenant-auth";
import { getTenantFilter, requireTenant, verifyTenantAccess } from "@/middleware/tenant-context";

export async function GET(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);
    const patients = await prisma.patient.findMany({
      where: tenantFilter, // 🔒 ISOLATION
      orderBy: { lastName: "asc" },
    });
    return NextResponse.json({ success: true, data: patients });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId
    const { tenantId } = await requireTenant(request);

    // 🔒 Isolation multi-tenant
    const { tenantFilter } = await getTenantFilter(request);
    const data = await request.json();
    const patient = await prisma.patient.create({
      data: {
        ...data,
        tenantId, // 🔒 ISOLATION
      },
    });
    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
