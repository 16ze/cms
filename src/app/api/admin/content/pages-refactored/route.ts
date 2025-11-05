/**
 * 🔒 API ADMIN CONTENT PAGES - REFACTORISÉE AVEC SAFE HANDLER
 * ============================================================
 *
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Authentification requise (ajoutée)
 * - Validation automatique
 * - Isolation tenant garantie
 * - Logs structurés
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { commonSchemas, validateQueryParams } from "@/lib/validation";

const createPageSchema = z.object({
  slug: commonSchemas.slug,
  title: commonSchemas.nonEmptyString,
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  orderIndex: z.number().int().default(0),
});

const updatePageSchema = createPageSchema.partial();

/**
 * GET /api/admin/content/pages
 * Récupérer toutes les pages avec isolation tenant
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    const pages = await prisma.contentPage.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return secureResponse(
      {
        success: true,
        data: pages,
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
 * POST /api/admin/content/pages
 * Créer une nouvelle page
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createPageSchema>>(request);

    // Vérifier si le slug existe déjà pour ce tenant
    const existingPage = await prisma.contentPage.findFirst({
      where: {
        slug: data.slug,
        tenantId,
      },
    });

    if (existingPage) {
      return secureErrorResponse(
        "Une page avec ce slug existe déjà",
        409
      );
    }

    const page = await prisma.contentPage.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        sections: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: page,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createPageSchema,
  }
);

