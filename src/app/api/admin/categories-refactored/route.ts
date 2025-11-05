/**
 * 🔒 API ADMIN CATÉGORIES - REFACTORISÉE AVEC SAFE HANDLER
 * =========================================================
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
import { commonSchemas } from "@/lib/validation";

const createCategorySchema = z.object({
  name: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug.optional(),
  description: z.string().optional(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/categories
 * Récupérer toutes les catégories
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const categories = await prisma.articleCategory.findMany({
      where: { tenantId },
      orderBy: { orderIndex: "asc" },
    });

    return secureResponse(
      {
        success: true,
        data: categories,
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
 * POST /api/admin/categories
 * Créer une nouvelle catégorie
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createCategorySchema>>(request);

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
    const existingCategory = await prisma.articleCategory.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingCategory) {
      return secureErrorResponse(
        "Une catégorie avec ce slug existe déjà",
        409
      );
    }

    // Créer la catégorie avec tenantId (injecté automatiquement par middleware Prisma)
    const category = await prisma.articleCategory.create({
      data: {
        ...data,
        slug,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createCategorySchema,
  }
);

