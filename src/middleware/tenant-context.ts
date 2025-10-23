/**
 * MIDDLEWARE: TENANT CONTEXT
 * ===========================
 * 
 * Fournit un helper pour ajouter automatiquement tenantId aux requêtes Prisma
 * Évite la répétition de code et garantit l'isolation des données
 * 
 * @author KAIRO Digital
 * @date 23 Octobre 2025
 */

import { NextRequest } from "next/server";
import { getTenantContext, getAuthenticatedUser } from "@/lib/tenant-auth";

/**
 * Helper pour construire les filtres Prisma avec isolation tenant
 * 
 * Usage dans les APIs:
 * ```typescript
 * const { tenantFilter } = await getTenantFilter(request);
 * 
 * const treatments = await prisma.beautyTreatment.findMany({
 *   where: { ...tenantFilter, isActive: true }
 * });
 * ```
 */
export async function getTenantFilter(request: NextRequest): Promise<{
  tenantFilter: { tenantId?: string } | {};
  tenantId: string | null;
  isSuperAdmin: boolean;
}> {
  const user = await getAuthenticatedUser(request);
  const { tenantId } = await getTenantContext(request);

  const isSuperAdmin = user?.type === "SUPER_ADMIN";

  // SuperAdmin sans tenant spécifié = accès global (pas de filtre)
  if (isSuperAdmin && !tenantId) {
    return {
      tenantFilter: {},
      tenantId: null,
      isSuperAdmin: true,
    };
  }

  // SuperAdmin avec tenant spécifié OU TenantUser
  if (tenantId) {
    return {
      tenantFilter: { tenantId },
      tenantId,
      isSuperAdmin,
    };
  }

  // Utilisateur non authentifié ou sans tenant
  return {
    tenantFilter: {},
    tenantId: null,
    isSuperAdmin: false,
  };
}

/**
 * Helper pour CREATE avec tenantId automatique
 * 
 * Usage:
 * ```typescript
 * const { tenantId } = await requireTenant(request);
 * 
 * const treatment = await prisma.beautyTreatment.create({
 *   data: {
 *     ...data,
 *     tenantId, // 🔒 ISOLATION AUTOMATIQUE
 *   }
 * });
 * ```
 */
export async function requireTenant(request: NextRequest): Promise<{
  tenantId: string;
  tenantSlug: string;
}> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error("Authentification requise");
  }

  // TenantUser: Retourne automatiquement son tenant
  if (user.type === "TENANT_USER") {
    if (!user.tenantId || !user.tenantSlug) {
      throw new Error("Tenant non trouvé pour cet utilisateur");
    }
    return {
      tenantId: user.tenantId,
      tenantSlug: user.tenantSlug,
    };
  }

  // SuperAdmin: Doit spécifier explicitement le tenant
  if (user.type === "SUPER_ADMIN") {
    const { tenantId, tenantSlug } = await getTenantContext(request);

    if (!tenantId || !tenantSlug) {
      throw new Error(
        "SuperAdmin doit spécifier un tenant via ?tenantId=xxx ou ?tenantSlug=xxx"
      );
    }

    return { tenantId, tenantSlug };
  }

  throw new Error("Type d'utilisateur inconnu");
}

/**
 * Helper pour vérifier qu'un tenant peut accéder à une ressource
 * 
 * Évite qu'un TenantUser accède aux données d'un autre tenant
 */
export async function verifyTenantAccess(
  request: NextRequest,
  resourceTenantId: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return false;
  }

  // SuperAdmin: Accès global
  if (user.type === "SUPER_ADMIN") {
    return true;
  }

  // TenantUser: Doit correspondre au tenant de la ressource
  if (user.type === "TENANT_USER") {
    return user.tenantId === resourceTenantId;
  }

  return false;
}

