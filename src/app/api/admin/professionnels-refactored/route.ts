/**
 * 🔒 API ADMIN PROFESSIONNELS BEAUTÉ - REFACTORISÉE AVEC SAFE HANDLER
 * ====================================================================
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

const createProfessionalSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/professionnels
 * Récupérer tous les professionnels avec leurs rendez-vous
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const professionals = await prisma.beautyProfessional.findMany({
      where: { tenantId },
      include: {
        appointments: {
          include: {
            treatment: true,
          },
          orderBy: { date: "desc" },
          take: 5, // Derniers 5 RDV
        },
      },
      orderBy: { firstName: "asc" },
    });

    return secureResponse(
      {
        success: true,
        data: professionals,
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
 * POST /api/admin/professionnels
 * Créer un nouveau professionnel
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createProfessionalSchema>>(request);

    // Validation
    if (!data.firstName || !data.lastName || !data.email) {
      return secureErrorResponse(
        "Prénom, nom et email requis",
        400
      );
    }

    // Vérifier l'unicité de l'email dans le tenant
    const existingProfessional = await prisma.beautyProfessional.findFirst({
      where: {
        tenantId,
        email: data.email.toLowerCase().trim(),
      },
    });

    if (existingProfessional) {
      return secureErrorResponse(
        "Ce professionnel existe déjà",
        409
      );
    }

    // Traiter les spécialités (JSON)
    const specialties = data.specialties || [];

    // Créer le professionnel avec tenantId (injecté automatiquement par middleware Prisma)
    const professional = await prisma.beautyProfessional.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        bio: data.bio?.trim(),
        specialties: JSON.stringify(specialties),
        photoUrl: data.photoUrl,
        isActive: data.isActive,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: professional,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createProfessionalSchema,
  }
);

