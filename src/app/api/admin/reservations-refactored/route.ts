/**
 * 🔒 API ADMIN RÉSERVATIONS - REFACTORISÉE AVEC SAFE HANDLER
 * ===========================================================
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
import { commonSchemas, validateQueryParams } from "@/lib/validation";

const createReservationSchema = z.object({
  customerName: commonSchemas.nonEmptyString,
  customerEmail: commonSchemas.email,
  customerPhone: commonSchemas.phone,
  date: z.string().datetime().or(z.coerce.date()),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  guests: z.coerce.number().int().min(1).max(50),
  tableId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateReservationSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

const queryParamsSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  customerEmail: z.string().email().optional(),
  date: z.string().datetime().optional(),
});

/**
 * GET /api/admin/reservations
 * Récupérer toutes les réservations avec filtres
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

    const { status, customerEmail, date } = queryValidation.data;

    // Construire le where avec isolation tenant automatique
    const where: any = { tenantId };

    if (status) where.status = status;
    if (customerEmail) {
      where.customerEmail = { contains: customerEmail, mode: "insensitive" };
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Récupérer les réservations du tenant
    const reservations = await prisma.restaurantReservation.findMany({
      where,
      include: {
        table: true,
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });

    return secureResponse(
      {
        success: true,
        data: reservations,
        count: reservations.length,
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
 * POST /api/admin/reservations
 * Créer une nouvelle réservation
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof createReservationSchema>>(request);

    // Créer la réservation avec tenantId (injecté automatiquement par middleware Prisma)
    const reservation = await prisma.restaurantReservation.create({
      data: {
        tenantId, // Explicite pour la sécurité
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        date: new Date(data.date),
        time: data.time,
        guests: data.guests,
        tableId: data.tableId || null,
        notes: data.notes || null,
        status: "PENDING",
      },
      include: {
        table: true,
      },
    });

    return secureResponse(
      {
        success: true,
        data: reservation,
      },
      { status: 201 }
    );
  },
  {
    requireAuth: true,
    methods: ["POST"],
    schema: createReservationSchema,
  }
);

/**
 * PATCH /api/admin/reservations
 * Mettre à jour le statut d'une réservation
 */
export const PATCH = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const data = getValidatedBody<z.infer<typeof updateReservationSchema>>(request);

    // Vérifier que la réservation appartient au tenant
    const existing = await prisma.restaurantReservation.findFirst({
      where: {
        id: data.id,
        tenantId, // Isolation garantie
      },
    });

    if (!existing) {
      return secureErrorResponse(
        "Réservation non trouvée",
        404
      );
    }

    // Mettre à jour
    const reservation = await prisma.restaurantReservation.update({
      where: { id: data.id },
      data: { status: data.status },
      include: { table: true },
    });

    return secureResponse(
      {
        success: true,
        data: reservation,
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["PATCH"],
    schema: updateReservationSchema,
  }
);

/**
 * DELETE /api/admin/reservations
 * Supprimer une réservation
 */
export const DELETE = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    const tenantId = getTenantContext();
    
    if (!tenantId) {
      throw new Error("Tenant context required");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return secureErrorResponse(
        "ID requis",
        400
      );
    }

    // Vérifier que la réservation appartient au tenant
    const existing = await prisma.restaurantReservation.findFirst({
      where: {
        id,
        tenantId, // Isolation garantie
      },
    });

    if (!existing) {
      return secureErrorResponse(
        "Réservation non trouvée",
        404
      );
    }

    // Supprimer
    await prisma.restaurantReservation.delete({
      where: { id },
    });

    return secureResponse(
      {
        success: true,
        message: "Réservation supprimée",
      },
      { status: 200 }
    );
  },
  {
    requireAuth: true,
    methods: ["DELETE"],
  }
);

