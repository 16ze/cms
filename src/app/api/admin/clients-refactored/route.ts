/**
 * 🔒 API ADMIN CLIENTS - REFACTORISÉE AVEC SAFE HANDLER
 * ======================================================
 *
 * Route refactorisée utilisant safeHandler pour une sécurité complète
 * - Validation automatique
 * - Isolation tenant garantie
 * - Logs structurés
 * - Gestion d'erreurs centralisée
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { commonSchemas, validateQueryParams } from "@/lib/validation";
import { ClientStatus, ClientSource } from "@prisma/client";

// Schéma de validation pour créer un client
const createClientSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["PROSPECT", "CLIENT", "INACTIVE"]),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "DIRECT"]),
  notes: z.string().optional(),
});

// Schéma de validation pour mettre à jour un client
const updateClientSchema = createClientSchema.partial();

// Schéma de validation pour mise à jour en masse
const bulkUpdateSchema = z.object({
  operation: z.literal("bulk_update_status"),
  clientIds: z.array(z.string().uuid()),
  data: z.object({
    status: z.enum(["PROSPECT", "CLIENT", "INACTIVE"]),
  }),
});

// Schéma de validation pour les query params
const queryParamsSchema = z.object({
  status: z.enum(["PROSPECT", "CLIENT", "INACTIVE", "ALL"]).optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "SOCIAL", "DIRECT", "ALL"]).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

/**
 * GET /api/admin/clients - Récupérer tous les clients
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

    const { status, source, search, page = 1, limit = 50 } = queryValidation.data;

    // Construire les filtres WHERE avec isolation tenant automatique
    const where: any = { tenantId };

    // Filtrage par statut
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Filtrage par source
    if (source && source !== "ALL") {
      where.source = source;
    }

    // Recherche textuelle
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      where.OR = [
        { firstName: { contains: searchLower, mode: "insensitive" } },
        { lastName: { contains: searchLower, mode: "insensitive" } },
        { email: { contains: searchLower, mode: "insensitive" } },
        { company: { contains: searchLower, mode: "insensitive" } },
      ];
    }

    // Récupérer les clients avec Prisma (isolation tenant automatique)
    const [clients, totalClients] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              budget: true,
            },
          },
          interactions: {
            select: {
              id: true,
              type: true,
              date: true,
              description: true,
              outcome: true,
            },
            orderBy: { date: "desc" },
            take: 3,
          },
        },
        orderBy: { lastContact: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    // Statistiques globales (avec isolation tenant)
    const [totalCount, clientCount, prospectCount, inactiveCount] =
      await Promise.all([
        prisma.client.count({ where: { tenantId } }),
        prisma.client.count({ where: { tenantId, status: "CLIENT" } }),
        prisma.client.count({ where: { tenantId, status: "PROSPECT" } }),
        prisma.client.count({ where: { tenantId, status: "INACTIVE" } }),
      ]);

    return secureResponse(
      {
        success: true,
        data: clients,
        pagination: {
          page,
          limit,
          total: totalClients,
          totalPages: Math.ceil(totalClients / limit),
        },
        stats: {
          total: totalCount,
          filtered: totalClients,
          clients: clientCount,
          prospects: prospectCount,
          inactive: inactiveCount,
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
 * POST /api/admin/clients - Créer un nouveau client
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // Le body est déjà validé par safeHandler
    const data = getValidatedBody<z.infer<typeof createClientSchema>>(request);

    // Vérifier si l'email existe déjà (avec isolation tenant)
    const existingClient = await prisma.client.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
        tenantId,
      },
    });

    if (existingClient) {
      return secureResponse(
        {
          success: false,
          error: "Un client avec cet email existe déjà",
        },
        { status: 409 }
      );
    }

    // Créer le nouveau client (tenantId injecté automatiquement par middleware Prisma)
    const newClient = await prisma.client.create({
      data: {
        tenantId, // Explicite pour la sécurité
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        company: data.company?.trim(),
        address: data.address?.trim(),
        status: data.status,
        source: data.source,
        notes: data.notes?.trim(),
        lastContact: new Date(),
      },
      include: {
        projects: true,
        interactions: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: newClient,
        message: "Client créé avec succès",
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

/**
 * PUT /api/admin/clients - Mise à jour en masse
 */
export const PUT = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof bulkUpdateSchema>>(request);

    if (data.operation === "bulk_update_status") {
      // Mise à jour en masse avec isolation tenant garantie
      const result = await prisma.client.updateMany({
        where: {
          id: { in: data.clientIds },
          tenantId, // Isolation garantie
        },
        data: {
          status: data.data.status,
          lastContact: new Date(),
        },
      });

      return secureResponse(
        {
          success: true,
          message: `${result.count} client(s) mis à jour`,
          updatedCount: result.count,
        },
        { status: 200 }
      );
    }

    return secureResponse(
      {
        success: false,
        error: "Opération non supportée",
      },
      { status: 400 }
    );
  },
  {
    requireAuth: true,
    methods: ["PUT"],
    schema: bulkUpdateSchema,
  }
);

/**
 * DELETE /api/admin/clients - Suppression en masse
 */
export const DELETE = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const { searchParams } = new URL(request.url);
    const clientIds = searchParams.get("ids")?.split(",") || [];

    if (clientIds.length === 0) {
      return secureResponse(
        {
          success: false,
          error: "Aucun ID de client fourni",
        },
        { status: 400 }
      );
    }

    // Valider que tous les IDs sont des UUIDs valides
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = clientIds.filter((id) => !uuidRegex.test(id));
    
    if (invalidIds.length > 0) {
      return secureResponse(
        {
          success: false,
          error: "Format d'ID invalide",
          invalidIds,
        },
        { status: 400 }
      );
    }

    // Suppression en masse avec isolation tenant garantie
    const result = await prisma.client.deleteMany({
      where: {
        id: { in: clientIds },
        tenantId, // Isolation garantie
      },
    });

    return secureResponse(
      {
        success: true,
        message: `${result.count} client(s) supprimé(s)`,
        deletedCount: result.count,
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["DELETE"],
  }
);

