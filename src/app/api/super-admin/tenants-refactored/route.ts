/**
 * 🔒 API SUPER ADMIN TENANTS - REFACTORISÉE AVEC SAFE HANDLER
 * ============================================================
 *
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Accès super-admin uniquement
 * - Validation automatique
 * - Logs structurés
 * - Gestion d'erreurs centralisée
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { commonSchemas, validateQueryParams } from "@/lib/validation";
import { superAdminRateLimiter } from "@/lib/rate-limit";

const createTenantSchema = z.object({
  name: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug,
  email: commonSchemas.email,
  templateId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

const updateTenantSchema = createTenantSchema.partial();

const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * GET /api/super-admin/tenants
 * Récupérer tous les tenants (super-admin uniquement)
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    // Valider les query params
    const queryValidation = validateQueryParams(request, queryParamsSchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { page = 1, limit = 50, search, isActive } = queryValidation.data;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return secureResponse(
      {
        success: true,
        data: tenants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    requireSuperAdmin: true,
    methods: ["GET"],
    rateLimiter: superAdminRateLimiter,
  }
);

/**
 * POST /api/super-admin/tenants
 * Créer un nouveau tenant (super-admin uniquement)
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const data = getValidatedBody<z.infer<typeof createTenantSchema>>(request);

    // Vérifier que le slug n'existe pas déjà
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existingTenant) {
      return secureErrorResponse(
        "Un tenant avec ce slug existe déjà",
        409
      );
    }

    // Vérifier que le template existe
    const template = await prisma.template.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      return secureErrorResponse(
        "Template non trouvé",
        404
      );
    }

    // Créer le tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        email: data.email,
        templateId: data.templateId,
        isActive: data.isActive,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return secureResponse(
      {
        success: true,
        data: tenant,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    requireSuperAdmin: true,
    methods: ["POST"],
    schema: createTenantSchema,
    rateLimiter: superAdminRateLimiter,
  }
);

