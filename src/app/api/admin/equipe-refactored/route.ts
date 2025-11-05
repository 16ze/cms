/**
 * 🔒 API ADMIN ÉQUIPE - REFACTORISÉE AVEC SAFE HANDLER
 * =====================================================
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

const createTeamMemberSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  role: z.string().optional(),
  department: z.string().optional(),
  email: commonSchemas.email.optional(),
  phone: commonSchemas.phone.optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const queryParamsSchema = z.object({
  isActive: z.enum(["true", "false"]).optional(),
  department: z.string().optional(),
});

/**
 * GET /api/admin/equipe
 * Récupérer tous les membres de l'équipe
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

    const { isActive, department } = queryValidation.data;

    const where: any = { tenantId };

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (department) {
      where.department = department;
    }

    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { lastName: "asc" }],
    });

    return secureResponse(
      {
        success: true,
        data: teamMembers,
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
 * POST /api/admin/equipe
 * Créer un nouveau membre de l'équipe
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createTeamMemberSchema>>(request);

    // Validation
    if (!data.firstName || !data.lastName) {
      return secureErrorResponse(
        "Prénom et nom requis",
        400
      );
    }

    // Créer le membre avec tenantId (injecté automatiquement par middleware Prisma)
    const teamMember = await prisma.teamMember.create({
      data: {
        ...data,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: teamMember,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createTeamMemberSchema,
  }
);

