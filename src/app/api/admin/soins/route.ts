/**
 * API: SOINS (BEAUTY TREATMENTS)
 * ===============================
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

    const treatments = await prisma.beautyTreatment.findMany({
      where: tenantFilter,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: treatments });
  } catch (error) {
    console.error("❌ GET /api/admin/soins:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 Authentification
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) return authResult;

    // 🔒 Récupérer le tenantId (obligatoire pour CREATE)
    const { tenantId } = await requireTenant(request);

    const data = await request.json();
    
    // Auto-générer le slug si non fourni
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    // 🔒 Créer avec tenantId (isolation automatique)
    const treatment = await prisma.beautyTreatment.create({
      data: {
        ...data,
        tenantId, // 🔒 ISOLATION
      },
    });

    return NextResponse.json(
      { success: true, data: treatment },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /api/admin/soins:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
