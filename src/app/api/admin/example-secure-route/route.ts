/**
 * 🔒 EXEMPLE ROUTE API SÉCURISÉE
 * ==============================
 *
 * Exemple de route API utilisant safeHandler pour une sécurité complète
 * Ce fichier sert de référence pour refactoriser les autres routes
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { commonSchemas } from "@/lib/validation";

// Schéma de validation pour créer une ressource
const createResourceSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// Schéma de validation pour mettre à jour une ressource
const updateResourceSchema = z.object({
  name: commonSchemas.nonEmptyString.optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

/**
 * GET /api/admin/example-resources
 * Récupérer toutes les ressources avec isolation tenant automatique
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // Prisma applique automatiquement le filtre tenantId via le middleware
    const resources = await prisma.client.findMany({
      where: {
        tenantId, // Redondant mais explicite pour la sécurité
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return secureResponse(
      {
        success: true,
        data: resources,
        count: resources.length,
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
 * POST /api/admin/example-resources
 * Créer une nouvelle ressource avec validation automatique
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    // Le body est déjà validé par safeHandler
    const data = getValidatedBody<z.infer<typeof createResourceSchema>>(request);

    // Créer la ressource (tenantId injecté automatiquement par le middleware Prisma)
    const resource = await prisma.client.create({
      data: {
        ...data,
        tenantId, // Redondant mais explicite
        firstName: data.name, // Mapping pour l'exemple
        lastName: "",
        email: `${data.name.toLowerCase()}@example.com`,
        status: "PROSPECT",
        source: "WEBSITE",
      },
    });

    return secureResponse(
      {
        success: true,
        data: resource,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createResourceSchema,
  }
);

/**
 * PUT /api/admin/example-resources/[id]
 * Mettre à jour une ressource avec validation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeHandler(
    async (request: NextRequest, context: ApiContext) => {
      const tenantId = getTenantContext();
      
      if (!tenantId) {
        throw new Error("Tenant context required");
      }

      const data = getValidatedBody<z.infer<typeof updateResourceSchema>>(request);

      // Mise à jour avec isolation tenant automatique
      const resource = await prisma.client.update({
        where: {
          id: params.id,
          tenantId, // Isolation garantie
        },
        data: {
          ...data,
        },
      });

      return secureResponse(
        {
          success: true,
          data: resource,
        },
        { status: 200 }
      );
    },
    {
      requireAuth: true,
      methods: ["PUT"],
      schema: updateResourceSchema,
    }
  )(request);
}

/**
 * DELETE /api/admin/example-resources/[id]
 * Supprimer une ressource avec isolation tenant
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeHandler(
    async (request: NextRequest, context: ApiContext) => {
      const tenantId = getTenantContext();
      
      if (!tenantId) {
        throw new Error("Tenant context required");
      }

      // Suppression avec isolation tenant automatique
      await prisma.client.delete({
        where: {
          id: params.id,
          tenantId, // Isolation garantie
        },
      });

      return secureResponse(
        {
          success: true,
          message: "Resource deleted successfully",
        },
        { status: 200 }
      );
    },
    {
      requireAuth: true,
      methods: ["DELETE"],
    }
  )(request);
}

