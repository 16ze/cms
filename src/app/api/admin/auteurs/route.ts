/**
 * API: AUTEURS
 * ============
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
    const authors = await prisma.author.findMany({
      where: tenantFilter, // 🔒 ISOLATION
      orderBy: { lastName: "asc" } });
    return NextResponse.json({ success: true, data: authors });
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
    if (!data.slug) data.slug = `${data.firstName}-${data.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const author = await prisma.author.create({
      data: {
        ...data,
        tenantId, // 🔒 ISOLATION
      },
    });
    return NextResponse.json({ success: true, data: author }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

