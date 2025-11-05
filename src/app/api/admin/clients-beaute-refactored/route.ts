/**
 * 🔒 API ADMIN CLIENTS BEAUTÉ - REFACTORISÉE AVEC SAFE HANDLER
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

const createClientSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  dateOfBirth: z.string().date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

const queryParamsSchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * GET /api/admin/clients-beaute
 * Récupérer tous les clients beauté avec leurs rendez-vous
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

    const { search, isActive } = queryValidation.data;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const clients = await prisma.beautyClient.findMany({
      where,
      include: {
        appointments: {
          include: {
            treatment: true,
            esthetician: true,
          },
          orderBy: { date: "desc" },
          take: 5, // Derniers 5 RDV
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return secureResponse(
      {
        success: true,
        data: clients,
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
 * POST /api/admin/clients-beaute
 * Créer un nouveau client beauté
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createClientSchema>>(request);

    // Validation
    if (!data.firstName || !data.lastName || !data.email) {
      return secureErrorResponse(
        "Prénom, nom et email requis",
        400
      );
    }

    // Vérifier l'unicité de l'email dans le tenant
    const existingClient = await prisma.beautyClient.findFirst({
      where: {
        tenantId,
        email: data.email.toLowerCase().trim(),
      },
    });

    if (existingClient) {
      return secureErrorResponse(
        "Ce client existe déjà",
        409
      );
    }

    // Traiter les allergies (JSON)
    const allergies = data.allergies || [];

    // Créer le client avec tenantId (injecté automatiquement par middleware Prisma)
    const client = await prisma.beautyClient.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address?.trim(),
        city: data.city?.trim(),
        postalCode: data.postalCode?.trim(),
        country: data.country?.trim(),
        notes: data.notes?.trim(),
        allergies: JSON.stringify(allergies),
        isActive: data.isActive,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: client,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createClientSchema,
  }
);

