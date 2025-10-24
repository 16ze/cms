/**
 * API: PRODUIT BEAUTÉ INDIVIDUEL (BEAUTY PRODUCT BY ID)
 * =====================================================
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

    const product = await prisma.beautyProduct.findFirst({
      where: {
        id,
        ...tenantFilter,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Ajouter le statut de stock
    const productWithStatus = {
      ...product,
      stockStatus:
        product.quantity <= product.minQuantity
          ? "LOW"
          : product.quantity === 0
          ? "OUT"
          : "OK",
      stockStatusText:
        product.quantity <= product.minQuantity
          ? "Stock bas"
          : product.quantity === 0
          ? "Rupture"
          : "En stock",
    };

    return NextResponse.json({ success: true, data: productWithStatus });
  } catch (error: any) {
    console.error("❌ GET /api/admin/produits-beaute/[id]:", error);
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

    // Si le nom change, régénérer le slug
    if (data.name) {
      const { tenantId } = await requireTenant(request);

      const baseSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.beautyProduct.findFirst({
          where: {
            tenantId,
            slug,
            NOT: { id },
          },
        });

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      data.slug = slug;
    }

    const product = await prisma.beautyProduct.updateMany({
      where: {
        id,
        ...tenantFilter,
      },
      data,
    });

    if (product.count === 0) {
      return NextResponse.json(
        { success: false, error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ PUT /api/admin/produits-beaute/[id]:", error);
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

    const deleted = await prisma.beautyProduct.deleteMany({
      where: {
        id,
        ...tenantFilter,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE /api/admin/produits-beaute/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
