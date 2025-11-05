/**
 * 🔒 API ADMIN AUTEURS - REFACTORISÉE AVEC SAFE HANDLER
 * ======================================================
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

const createAuthorSchema = z.object({
  firstName: commonSchemas.nonEmptyString,
  lastName: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug.optional(),
  email: commonSchemas.email.optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/auteurs
 * Récupérer tous les auteurs
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const authors = await prisma.author.findMany({
      where: { tenantId },
      orderBy: { lastName: "asc" },
    });

    return secureResponse(
      {
        success: true,
        data: authors,
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
 * POST /api/admin/auteurs
 * Créer un nouvel auteur
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createAuthorSchema>>(request);

    // Générer le slug si non fourni
    let slug = data.slug;
    if (!slug) {
      slug = `${data.firstName}-${data.lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Vérifier l'unicité du slug pour ce tenant
    const existingAuthor = await prisma.author.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingAuthor) {
      return secureErrorResponse(
        "Un auteur avec ce slug existe déjà",
        409
      );
    }

    // Créer l'auteur avec tenantId (injecté automatiquement par middleware Prisma)
    const author = await prisma.author.create({
      data: {
        ...data,
        slug,
        tenantId, // Explicite pour la sécurité
      },
    });

    return secureResponse(
      {
        success: true,
        data: author,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createAuthorSchema,
  }
);

