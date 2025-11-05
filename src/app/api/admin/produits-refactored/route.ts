/**
 * 🔒 API ADMIN PRODUITS E-COMMERCE - REFACTORISÉE AVEC SAFE HANDLER
 * ==================================================================
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

const createProductSchema = z.object({
  name: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug.optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  category: z.string().optional(),
  featured: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().default(true),
});

const queryParamsSchema = z.object({
  category: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * GET /api/admin/produits
 * Récupérer tous les produits avec filtres
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

    const { category, isActive } = queryValidation.data;

    const where: any = { tenantId };

    if (category) where.category = category;
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
    });

    return secureResponse(
      {
        success: true,
        data: products,
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
 * POST /api/admin/produits
 * Créer un nouveau produit
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createProductSchema>>(request);

    // Générer le slug si non fourni
    let slug = data.slug;
    if (!slug) {
      slug = data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Vérifier l'unicité du slug pour ce tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingProduct) {
      return secureErrorResponse(
        "Un produit avec ce slug existe déjà",
        409
      );
    }

    // Créer le produit avec tenantId (injecté automatiquement par middleware Prisma)
    const product = await prisma.product.create({
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
    schema: createProductSchema,
  }
);

