/**
 * 🔒 API ADMIN RENDEZ-VOUS BEAUTÉ - REFACTORISÉE AVEC SAFE HANDLER
 * ================================================================
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

const createAppointmentSchema = z.object({
  treatmentId: z.string().uuid(),
  customerName: commonSchemas.nonEmptyString,
  customerEmail: commonSchemas.email,
  customerPhone: commonSchemas.phone,
  date: z.string().datetime().or(z.coerce.date()),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  professionalId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const queryParamsSchema = z.object({
  status: z.string().optional(),
  treatmentId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
});

/**
 * GET /api/admin/rendez-vous-beaute
 * Récupérer tous les rendez-vous avec filtres
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

    const { status, treatmentId, date } = queryValidation.data;

    const where: any = { tenantId };

    if (status) where.status = status;
    if (treatmentId) where.treatmentId = treatmentId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const appointments = await prisma.beautyAppointment.findMany({
      where,
      include: {
        treatment: true,
        professional: true,
        client: true,
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    return secureResponse(
      {
        success: true,
        data: appointments,
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
 * POST /api/admin/rendez-vous-beaute
 * Créer un nouveau rendez-vous
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createAppointmentSchema>>(request);

    // Vérifier que le traitement existe et appartient au tenant
    const treatment = await prisma.beautyTreatment.findFirst({
      where: {
        id: data.treatmentId,
        tenantId,
      },
    });

    if (!treatment) {
      return secureErrorResponse(
        "Soin non trouvé",
        404
      );
    }

    // Créer le rendez-vous avec tenantId (injecté automatiquement par middleware Prisma)
    const appointment = await prisma.beautyAppointment.create({
      data: {
        tenantId, // Explicite pour la sécurité
        treatmentId: data.treatmentId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        date: new Date(data.date),
        time: data.time,
        professionalId: data.professionalId,
        notes: data.notes,
        status: "PENDING",
      },
      include: {
        treatment: true,
        professional: true,
        client: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: appointment,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createAppointmentSchema,
  }
);

