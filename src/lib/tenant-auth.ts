/**
 * SYSTÈME D'AUTHENTIFICATION MULTI-TENANT
 * ========================================
 * 
 * Ce fichier gère l'authentification pour 2 types d'utilisateurs:
 * 1. SuperAdmin (KAIRO Digital) - Accès global à tous les tenants
 * 2. TenantUser (Clients) - Accès limité à leur propre tenant
 * 
 * @author KAIRO Digital
 * @date 23 Octobre 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Types d'utilisateurs
export type UserType = "SUPER_ADMIN" | "TENANT_USER";

export interface AuthenticatedUser {
  id: string;
  email: string;
  type: UserType;
  tenantId?: string; // Uniquement pour TENANT_USER
  tenantSlug?: string;
  role?: string; // OWNER, ADMIN, EDITOR, VIEWER (pour TENANT_USER)
}

/**
 * RÉCUPÉRER L'UTILISATEUR DEPUIS LA SESSION
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("auth_session")?.value;

    if (!sessionToken) {
      return null;
    }

    // Parser le token (format: type:id)
    const [type, userId] = sessionToken.split(":");

    if (!type || !userId) {
      return null;
    }

    // Vérifier le type d'utilisateur
    if (type === "SUPER_ADMIN") {
      const superAdmin = await prisma.superAdmin.findUnique({
        where: { id: userId, isActive: true },
      });

      if (!superAdmin) {
        return null;
      }

      return {
        id: superAdmin.id,
        email: superAdmin.email,
        type: "SUPER_ADMIN",
      };
    } else if (type === "TENANT_USER") {
      const tenantUser = await prisma.tenantUser.findUnique({
        where: { id: userId, isActive: true },
        include: {
          tenant: true,
        },
      });

      if (!tenantUser) {
        return null;
      }

      return {
        id: tenantUser.id,
        email: tenantUser.email,
        type: "TENANT_USER",
        tenantId: tenantUser.tenantId,
        tenantSlug: tenantUser.tenant.slug,
        role: tenantUser.role,
      };
    }

    return null;
  } catch (error) {
    console.error("❌ Erreur getAuthenticatedUser:", error);
    return null;
  }
}

/**
 * OBTENIR LE CONTEXTE TENANT (SUPER IMPORTANT POUR L'ISOLATION)
 * 
 * - Si SuperAdmin: Peut spécifier un tenant via query param ?tenantId=xxx
 * - Si TenantUser: Retourne automatiquement son tenantId
 */
export async function getTenantContext(
  request: NextRequest
): Promise<{ tenantId: string | null; tenantSlug: string | null }> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { tenantId: null, tenantSlug: null };
  }

  // SuperAdmin: Peut accéder à n'importe quel tenant via query param
  if (user.type === "SUPER_ADMIN") {
    const { searchParams } = new URL(request.url);
    const requestedTenantId = searchParams.get("tenantId");
    const requestedTenantSlug = searchParams.get("tenantSlug");

    if (requestedTenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: requestedTenantId },
      });
      return {
        tenantId: tenant?.id || null,
        tenantSlug: tenant?.slug || null,
      };
    }

    if (requestedTenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: requestedTenantSlug },
      });
      return {
        tenantId: tenant?.id || null,
        tenantSlug: tenant?.slug || null,
      };
    }

    // SuperAdmin sans tenant spécifié = accès global (null)
    return { tenantId: null, tenantSlug: null };
  }

  // TenantUser: TOUJOURS limité à son propre tenant
  return {
    tenantId: user.tenantId || null,
    tenantSlug: user.tenantSlug || null,
  };
}

/**
 * MIDDLEWARE D'AUTHENTIFICATION: SUPER ADMIN
 * 
 * Bloque l'accès si l'utilisateur n'est pas un SuperAdmin
 */
export async function ensureSuperAdmin(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser(request);

  if (!user || user.type !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: "Accès refusé. Super Admin requis.",
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * MIDDLEWARE D'AUTHENTIFICATION: TENANT USER (ou Super Admin)
 * 
 * Autorise SuperAdmin ET TenantUser
 */
export async function ensureAuthenticated(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentification requise.",
      },
      { status: 401 }
    );
  }

  return user;
}

/**
 * MIDDLEWARE D'AUTHENTIFICATION: TENANT ADMIN
 * 
 * Autorise SuperAdmin et TenantUser avec role OWNER ou ADMIN
 */
export async function ensureTenantAdmin(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentification requise.",
      },
      { status: 401 }
    );
  }

  // SuperAdmin a tous les droits
  if (user.type === "SUPER_ADMIN") {
    return user;
  }

  // TenantUser: Doit être OWNER ou ADMIN
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        error: "Droits administrateur requis.",
      },
      { status: 403 }
    );
  }

  return user;
}

/**
 * LOGIN: SUPER ADMIN
 */
export async function loginSuperAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email, isActive: true },
    });

    if (!superAdmin) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);

    if (!isPasswordValid) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // Mettre à jour le lastLogin
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: { lastLogin: new Date() },
    });

    // Créer le token (format: type:id)
    const token = `SUPER_ADMIN:${superAdmin.id}`;

    return { success: true, token };
  } catch (error) {
    console.error("❌ Erreur loginSuperAdmin:", error);
    return { success: false, error: "Erreur lors de la connexion" };
  }
}

/**
 * LOGIN: TENANT USER
 */
export async function loginTenantUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  token?: string;
  tenantSlug?: string;
  error?: string;
}> {
  try {
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { email, isActive: true },
      include: {
        tenant: true,
      },
    });

    if (!tenantUser) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    const isPasswordValid = await bcrypt.compare(password, tenantUser.password);

    if (!isPasswordValid) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // Vérifier que le tenant est actif
    if (!tenantUser.tenant.isActive) {
      return { success: false, error: "Compte désactivé. Contactez le support." };
    }

    // Mettre à jour le lastLogin
    await prisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { lastLogin: new Date() },
    });

    // Créer le token (format: type:id)
    const token = `TENANT_USER:${tenantUser.id}`;

    return {
      success: true,
      token,
      tenantSlug: tenantUser.tenant.slug,
    };
  } catch (error) {
    console.error("❌ Erreur loginTenantUser:", error);
    return { success: false, error: "Erreur lors de la connexion" };
  }
}

/**
 * LOGOUT
 */
export function logout(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: "Déconnexion réussie",
  });

  response.cookies.delete("auth_session");

  return response;
}

