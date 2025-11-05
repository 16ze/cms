/**
 * 🔒 API ADMIN ARTICLES - REFACTORISÉE AVEC SAFE HANDLER
 * =======================================================
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
import { sanitizeApiInput } from "@/lib/sanitize-api";

const createArticleSchema = z.object({
  title: commonSchemas.nonEmptyString,
  slug: commonSchemas.slug.optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  featuredImage: z.string().url().optional(),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  isPublished: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

/**
 * GET /api/admin/articles
 * Récupérer tous les articles avec isolation tenant
 */
export const GET = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    const articles = await prisma.article.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        author: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return secureResponse(
      {
        success: true,
        data: articles,
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
 * POST /api/admin/articles
 * Créer un nouvel article
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createArticleSchema>>(request);

    // Générer le slug si non fourni
    let slug = data.slug;
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Vérifier l'unicité du slug pour ce tenant
    const existingArticle = await prisma.article.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingArticle) {
      return secureErrorResponse(
        "Un article avec ce slug existe déjà",
        409
      );
    }

    // Sanitizer le contenu
    const sanitizedData = sanitizeApiInput(data);

    // Créer l'article avec tenantId (injecté automatiquement par middleware Prisma)
    const article = await prisma.article.create({
      data: {
        ...sanitizedData,
        slug,
        tenantId, // Explicite pour la sécurité
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
      include: {
        author: true,
        category: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: article,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createArticleSchema,
  }
);

