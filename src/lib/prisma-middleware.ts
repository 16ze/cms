/**
 * 🔒 PRISMA MIDDLEWARE - ISOLATION MULTI-TENANT
 * =============================================
 *
 * Middleware Prisma pour garantir l'isolation des données par tenant
 * Applique automatiquement un filtre tenantId sur toutes les requêtes
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enhancedLogger } from "@/lib/logger";
import { requiresTenantIsolation, guardTenantIsolation } from "./prisma/tenant-guard";

/**
 * Contexte tenant pour le middleware Prisma
 * Doit être défini par le middleware Next.js ou l'API route
 */
let currentTenantId: string | null = null;

/**
 * Définir le tenantId actuel pour le contexte de la requête
 */
export function setTenantContext(tenantId: string | null): void {
  currentTenantId = tenantId;
}

/**
 * Obtenir le tenantId actuel
 */
export function getTenantContext(): string | null {
  return currentTenantId;
}

/**
 * Middleware Prisma pour isolation tenant
 */
export function tenantIsolationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const { model, action, args } = params;

    // Vérifier l'isolation tenant avec le guard (peut lancer une erreur pour les opérations critiques)
    // Ignorer les erreurs du guard pour les modèles qui ne nécessitent pas d'isolation
    if (model && requiresTenantIsolation(model)) {
      try {
        guardTenantIsolation(model, action, args);
      } catch (error) {
        // Si le guard lance une erreur, la propager (opération critique sans tenant context)
        enhancedLogger.error("Tenant guard failed", error as Error, {
          model,
          action,
        });
        throw error;
      }
    }

    // Si pas de modèle, laisser passer (opérations système Prisma)
    if (!model) {
      return await next(params);
    }

    // Si le modèle nécessite l'isolation et qu'on a un tenantId
    if (model && requiresTenantIsolation(model) && currentTenantId) {
      // Pour les opérations de lecture (findMany, findUnique, etc.)
      if (action.startsWith("find") || action === "count" || action === "aggregate") {
        if (!args.where) {
          args.where = {};
        }

        // Ajouter le filtre tenantId seulement si le modèle nécessite l'isolation
        try {
          args.where.tenantId = currentTenantId;
        } catch (error) {
          // Si le modèle n'a pas de champ tenantId, ignorer l'erreur
          enhancedLogger.warn("Cannot add tenantId filter - model may not have tenantId field", {
            model,
            action,
          });
        }

        enhancedLogger.prisma("debug", action, model, {
          tenantId: currentTenantId,
          action: "tenant-filter-applied",
        });
      }

      // Pour les opérations d'écriture (create, update, delete)
      if (action === "create" || action === "createMany") {
        if (!args.data) {
          args.data = {};
        }

        // Si c'est un tableau (createMany)
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item: Prisma.InputJsonValue) => ({
            ...item,
            tenantId: currentTenantId,
          }));
        } else {
          // Si c'est un objet unique
          args.data.tenantId = currentTenantId;
        }

        enhancedLogger.prisma("debug", action, model, {
          tenantId: currentTenantId,
          action: "tenant-id-set",
        });
      }

      if (action === "update" || action === "updateMany") {
        if (!args.where) {
          args.where = {};
        }

        // Ajouter le filtre tenantId pour la sécurité
        args.where.tenantId = currentTenantId;

        enhancedLogger.prisma("debug", action, model, {
          tenantId: currentTenantId,
          action: "tenant-filter-applied-for-update",
        });
      }

      if (action === "delete" || action === "deleteMany") {
        if (!args.where) {
          args.where = {};
        }

        // Ajouter le filtre tenantId pour la sécurité
        args.where.tenantId = currentTenantId;

        enhancedLogger.prisma("debug", action, model, {
          tenantId: currentTenantId,
          action: "tenant-filter-applied-for-delete",
        });
      }
    }

    // Exécuter la requête
    try {
      const result = await next(params);
      return result;
    } catch (error) {
      enhancedLogger.prisma("error", action, model, {
        tenantId: currentTenantId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}

/**
 * Initialiser le middleware Prisma
 */
export function initializePrismaMiddleware(): void {
  prisma.$use(tenantIsolationMiddleware());
  enhancedLogger.info("Prisma middleware initialized for tenant isolation");
}

