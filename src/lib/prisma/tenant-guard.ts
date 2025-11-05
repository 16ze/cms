/**
 * 🔒 PRISMA TENANT GUARD
 * ======================
 *
 * Guard centralisé pour l'isolation multi-tenant
 * Vérifie et applique l'isolation tenant sur toutes les opérations Prisma
 */

import { Prisma } from "@prisma/client";
import { getTenantContext } from "./prisma-middleware";
import { enhancedLogger } from "./logger";

/**
 * Modèles qui nécessitent l'isolation tenant
 * Cette liste doit être synchronisée avec le schéma Prisma
 */
export const TENANT_ISOLATED_MODELS = [
  "Client",
  "BeautyBusiness",
  "BeautyTreatment",
  "BeautyAppointment",
  "BeautyProfessional",
  "BeautyClient",
  "BeautyProfessionalSchedule",
  "BeautyProduct",
  "TenantUser",
  "FrontendContent",
  "SiteSection",
  "SiteMedia",
  "SiteButton",
  "RestaurantReservation",
  "Reservation",
  "Project",
  "WellnessCourse",
  "WellnessCoach",
  "RestaurantTable",
  "MenuItem",
  "Patient",
  "Therapist",
  "Order",
  "Command",
] as const;

/**
 * Vérifier si un modèle nécessite l'isolation tenant
 */
export function requiresTenantIsolation(model: string): boolean {
  return TENANT_ISOLATED_MODELS.includes(model as any);
}

/**
 * Vérifier que le tenantId est présent dans le contexte
 */
export function assertTenantContext(): string {
  const tenantId = getTenantContext();
  
  if (!tenantId) {
    throw new Error("Tenant context is required but not set");
  }
  
  return tenantId;
}

/**
 * Appliquer le filtre tenant sur une clause WHERE
 */
export function applyTenantFilter<T extends Record<string, unknown>>(
  where: T | undefined,
  tenantId: string
): T & { tenantId: string } {
  return {
    ...(where || {}),
    tenantId,
  } as T & { tenantId: string };
}

/**
 * Vérifier que les données contiennent le tenantId correct
 */
export function validateTenantData(
  data: Record<string, unknown>,
  tenantId: string
): void {
  // Si un tenantId est fourni dans les données, il doit correspondre au contexte
  if (data.tenantId && data.tenantId !== tenantId) {
    throw new Error(
      `Tenant ID mismatch: expected ${tenantId}, got ${data.tenantId}`
    );
  }
}

/**
 * Enrichir les données avec le tenantId si nécessaire
 */
export function enrichWithTenantId<T extends Record<string, unknown>>(
  data: T,
  tenantId: string
): T & { tenantId: string } {
  return {
    ...data,
    tenantId,
  };
}

/**
 * Guard pour vérifier l'isolation tenant avant une opération Prisma
 */
export function guardTenantIsolation(
  model: string,
  action: string,
  args: Prisma.MiddlewareParams["args"]
): void {
  if (!requiresTenantIsolation(model)) {
    return; // Pas besoin d'isolation pour ce modèle
  }

  const tenantId = getTenantContext();
  
  if (!tenantId) {
    enhancedLogger.warn("Tenant isolation guard failed - no tenant context", {
      model,
      action,
    });
    throw new Error(
      `Tenant isolation required for model ${model} but no tenant context set`
    );
  }

  // Log pour audit
  enhancedLogger.prisma("debug", action, model, {
    tenantId,
    action: "tenant-isolation-guard-passed",
  });
}

