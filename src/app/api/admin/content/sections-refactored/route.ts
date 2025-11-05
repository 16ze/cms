/**
 * 🔒 API ADMIN CONTENT SECTIONS - REFACTORISÉE AVEC SAFE HANDLER
 * ===============================================================
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
import { validateQueryParams, commonSchemas } from "@/lib/validation";
import { sanitizeApiInput } from "@/lib/sanitize-api";

const updateSectionSchema = z.object({
  sectionName: commonSchemas.nonEmptyString.optional(),
  sectionType: z.string().optional(),
  orderIndex: z.number().int().optional(),
  isActive: z.boolean().optional(),
  contentJson: z.record(z.unknown()).optional(),
});

const queryParamsSchema = z.object({
  id: z.string().uuid().optional(),
});

/**
 * GET /api/admin/content/sections
 * Récupérer toutes les sections avec isolation tenant
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    // Note: Les sections peuvent être partagées ou isolées selon le modèle
    // Ici on assume qu'elles sont isolées par tenant
    
    const sections = await prisma.contentSection.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: [
        { page: { orderIndex: "asc" } },
        { orderIndex: "asc" },
      ],
    });

    return secureResponse(
      {
        success: true,
        data: sections,
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
 * PUT /api/admin/content/sections
 * Modifier une section
 */
export const PUT = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { id } = queryValidation.data;

    if (!id) {
      return secureErrorResponse(
        "ID de section requis",
        400
      );
    }

    // Vérifier que la section existe et appartient au tenant
    const existingSection = await prisma.contentSection.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    if (!existingSection) {
      return secureErrorResponse(
        "Section non trouvée",
        404
      );
    }

    // Récupérer et valider les données
    const data = getValidatedBody<z.infer<typeof updateSectionSchema>>(request);
    
    // Sanitizer le contenu JSON si présent
    const sanitizedData = sanitizeApiInput(data);

    // Mettre à jour la section
    const updatedSection = await prisma.contentSection.update({
      where: { id },
      data: {
        sectionName: sanitizedData.sectionName,
        sectionType: sanitizedData.sectionType,
        orderIndex: sanitizedData.orderIndex,
        isActive: sanitizedData.isActive,
        contentJson: sanitizedData.contentJson,
      },
      include: {
        page: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    return secureResponse(
      {
        success: true,
        message: `Section "${updatedSection.sectionName}" mise à jour avec succès`,
        data: updatedSection,
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["PUT"],
    schema: updateSectionSchema,
  }
);

/**
 * DELETE /api/admin/content/sections
 * Supprimer une section
 */
export const DELETE = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { id } = queryValidation.data;

    if (!id) {
      return secureErrorResponse(
        "ID de section requis",
        400
      );
    }

    // Vérifier que la section existe et appartient au tenant
    const existingSection = await prisma.contentSection.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
      include: {
        page: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!existingSection) {
      return secureErrorResponse(
        "Section non trouvée",
        404
      );
    }

    // Supprimer la section
    await prisma.contentSection.delete({
      where: { id },
    });

    return secureResponse(
      {
        success: true,
        message: `Section "${existingSection.sectionName}" supprimée avec succès`,
        deletedSection: {
          id: existingSection.id,
          sectionName: existingSection.sectionName,
          pageSlug: existingSection.page.slug,
        },
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["DELETE"],
  }
);

