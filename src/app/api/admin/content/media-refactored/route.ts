/**
 * 🔒 API ADMIN CONTENT MEDIA - REFACTORISÉE AVEC SAFE HANDLER
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
import { safeHandler, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { validateQueryParams } from "@/lib/validation";

const queryParamsSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["all", "images", "videos", "documents"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  id: z.string().uuid().optional(),
});

/**
 * GET /api/admin/content/media
 * Récupérer tous les médias avec filtres et pagination
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { search, type, page = 1, limit = 20 } = queryValidation.data;

    // Construire les filtres avec isolation tenant
    const where: any = tenantId ? { tenantId } : {};
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && type !== "all") {
      if (type === "images") {
        where.mimeType = { startsWith: "image/" };
      } else if (type === "videos") {
        where.mimeType = { startsWith: "video/" };
      } else if (type === "documents") {
        where.OR = [
          { mimeType: { startsWith: "application/" } },
          { mimeType: { startsWith: "text/" } },
        ];
      }
    }

    // Récupérer les médias avec pagination
    const [media, total] = await Promise.all([
      prisma.contentMedia.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contentMedia.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return secureResponse(
      {
        success: true,
        data: {
          media,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
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
 * DELETE /api/admin/content/media
 * Supprimer un média
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
        "ID du média requis",
        400
      );
    }

    // Vérifier que le média existe et appartient au tenant
    const existingMedia = await prisma.contentMedia.findFirst({
      where: {
        id,
        ...(tenantId && { tenantId }),
      },
    });

    if (!existingMedia) {
      return secureErrorResponse(
        "Média non trouvé",
        404
      );
    }

    // Supprimer le média
    await prisma.contentMedia.delete({
      where: { id },
    });

    return secureResponse(
      {
        success: true,
        message: "Média supprimé avec succès",
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["DELETE"],
  }
);

