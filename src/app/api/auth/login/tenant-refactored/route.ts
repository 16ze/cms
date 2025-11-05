/**
 * 🔒 API: LOGIN TENANT USER - REFACTORISÉE AVEC SAFE HANDLER
 * ===========================================================
 * Route: POST /api/auth/login/tenant
 * 
 * Route migrée vers safeHandler pour sécurité renforcée
 * - Rate limiting strict (5 req/min pour auth)
 * - Validation automatique
 * - Logs structurés
 * - Gestion d'erreurs centralisée
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { safeHandler, getValidatedBody, ApiContext } from "@/lib/safe-handler";
import { secureResponse, secureErrorResponse } from "@/lib/secure-headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getAdminSessionSecret,
  signAdminSession,
} from "@/lib/admin-session";
import { setSecureCookie } from "@/lib/cookie-utils";
import { commonSchemas } from "@/lib/validation";
import { authRateLimiter } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Mot de passe requis"),
});

/**
 * POST /api/auth/login/tenant
 * Connexion d'un utilisateur tenant
 */
export const POST = safeHandler(
  async (request: NextRequest, context: ApiContext) => {
    // Le body est déjà validé par safeHandler
    const { email, password } = getValidatedBody<z.infer<typeof loginSchema>>(request);

    // Chercher l'utilisateur tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        isActive: true,
      },
      include: {
        tenant: {
          include: {
            template: true,
          },
        },
      },
    });

    if (!tenantUser) {
      return secureErrorResponse(
        "Email ou mot de passe incorrect",
        401
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, tenantUser.password);
    if (!isValidPassword) {
      return secureErrorResponse(
        "Email ou mot de passe incorrect",
        401
      );
    }

    // Mettre à jour le lastLogin
    await prisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { lastLogin: new Date() },
    });

    // Créer une session unifiée
    const sessionData = {
      email: tenantUser.email,
      name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
      id: tenantUser.id,
      role: "TENANT_ADMIN",
      tenantId: tenantUser.tenantId,
      tenantSlug: tenantUser.tenant.slug,
      loginTime: new Date().toISOString(),
    };

    // Créer la response avec les informations utilisateur
    const response = secureResponse(
      {
        success: true,
        message: "Connexion réussie",
        user: {
          id: tenantUser.id,
          name: `${tenantUser.firstName} ${tenantUser.lastName}`.trim(),
          email: tenantUser.email,
          role: "TENANT_ADMIN",
          tenantId: tenantUser.tenantId,
          tenantSlug: tenantUser.tenant.slug,
        },
      },
      { status: 200 }
    );

    const token = signAdminSession(
      sessionData,
      getAdminSessionSecret(),
      ADMIN_SESSION_MAX_AGE_SECONDS
    );

    // Utiliser le helper standardisé pour définir le cookie
    setSecureCookie(response, ADMIN_SESSION_COOKIE, token, {
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  },
  {
    requireAuth: false, // Route publique (authentification)
    methods: ["POST"],
    schema: loginSchema,
    rateLimiter: authRateLimiter, // Rate limiting strict pour auth
  }
);

