/**
 * API: PRODUITS BEAUTÉ (BEAUTY PRODUCTS)
 * =======================================
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
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const lowStock = searchParams.get("lowStock");
    const isActive = searchParams.get("isActive");

    const where: any = { ...tenantFilter };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock === "true") {
      where.quantity = { lte: prisma.beautyProduct.fields.minQuantity };
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const products = await prisma.beautyProduct.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Ajouter le statut de stock pour chaque produit
    const productsWithStatus = products.map((product) => ({
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
    }));

    return NextResponse.json({ success: true, data: productsWithStatus });
  } catch (error) {
    console.error("❌ GET /api/admin/produits-beaute:", error);
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
    if (!data.name || !data.category) {
      return NextResponse.json(
        { success: false, error: "Nom et catégorie requis" },
        { status: 400 }
      );
    }

    // Générer un slug unique
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.beautyProduct.findFirst({
        where: { tenantId, slug },
      });

      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 🔒 Créer avec tenantId
    const product = await prisma.beautyProduct.create({
      data: {
        ...data,
        slug,
        tenantId, // 🔒 ISOLATION
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST /api/admin/produits-beaute:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
