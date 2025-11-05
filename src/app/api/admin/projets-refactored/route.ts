/**
 * 🔒 API ADMIN PROJETS - REFACTORISÉE AVEC SAFE HANDLER
 * =====================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/lib/prisma-middleware";
import { commonSchemas, validateQueryParams } from "@/lib/validation";

// Schéma de validation pour créer un projet
const createProjectSchema = z.object({
  title: commonSchemas.nonEmptyString,
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  client: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  projectUrl: z.string().url().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("COMPLETED"),
  startDate: z.string().datetime().optional().transform((str) => str ? new Date(str) : null),
  endDate: z.string().datetime().optional().transform((str) => str ? new Date(str) : null),
  featured: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

// Schéma de validation pour les query params
const queryParamsSchema = z.object({
  status: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
});

/**
 * GET /api/admin/projets - Liste des projets
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

    const { status, featured } = queryValidation.data;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (featured !== undefined) where.featured = featured === "true";

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    return secureResponse(
      {
        success: true,
        data: projects,
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
 * POST /api/admin/projets - Créer un projet
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createProjectSchema>>(request);

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
    const existingProject = await prisma.project.findFirst({
      where: {
        slug,
        tenantId,
      },
    });

    if (existingProject) {
      return secureResponse(
        {
          success: false,
          error: "Un projet avec ce slug existe déjà",
        },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: data.content,
        category: data.category,
        client: data.client,
        technologies: data.technologies,
        imageUrl: data.imageUrl,
        images: data.images,
        projectUrl: data.projectUrl,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        featured: data.featured,
        orderIndex: data.orderIndex,
        tenantId,
      },
    });

    return secureResponse(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createProjectSchema,
  }
);

