/**
 * 🔒 API ADMIN SOINS BEAUTÉ - REFACTORISÉE AVEC SAFE HANDLER
 * ==========================================================
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

const createTreatmentSchema = z.object({
  name: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug.optional(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/soins
 * Récupérer tous les soins
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const treatments = await prisma.beautyTreatment.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    return secureResponse(
      {
        success: true,
        data: treatments,
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
 * POST /api/admin/soins
 * Créer un nouveau soin
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createTreatmentSchema>>(request);

    // Auto-générer le slug si non fourni
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
    const existingTreatment = await prisma.beautyTreatment.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingTreatment) {
      return secureErrorResponse(
        "Un soin avec ce slug existe déjà",
        409
      );
    }

    // Créer le soin avec tenantId (injecté automatiquement par middleware Prisma)
    const treatment = await prisma.beautyTreatment.create({
      data: {
        ...data,
        slug,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: treatment,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createTreatmentSchema,
  }
);

