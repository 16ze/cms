/**
 * 🔒 API ADMIN PRODUITS BEAUTÉ - REFACTORISÉE AVEC SAFE HANDLER
 * =============================================================
 *
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Validation automatique
 * - Isolation tenant garantie
 * - Logs structurés
 * - Gestion d'erreurs centralisée
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { validateQueryParams, commonSchemas } from "@/lib/validation";

const createBeautyProductSchema = z.object({
  name: commonSchemas.nonEmptyString,
  brand: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  lowStock: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * GET /api/admin/produits-beaute
 * Récupérer tous les produits beauté avec filtres
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { search, category, lowStock, isActive } = queryValidation.data;

    const where: any = { tenantId };

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

    if (isActive !== undefined) {
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

    return secureResponse(
      {
        success: true,
        data: productsWithStatus,
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["GET"],
  }
);

/**
 * POST /api/admin/produits-beaute
 * Créer un nouveau produit beauté
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createBeautyProductSchema>>(request);

    // Validation
    if (!data.name || !data.category) {
      return secureErrorResponse(
        "Nom et catégorie requis",
        400
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

    // Créer le produit avec tenantId (injecté automatiquement par middleware Prisma)
    const product = await prisma.beautyProduct.create({
      data: {
        ...data,
        slug,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createBeautyProductSchema,
  }
);

