/**
 * API: LOGIN TENANT USER
 * Route: POST /api/auth/login/tenant
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getAdminSessionSecret,
  signAdminSession,
} from "@/lib/admin-session";
import { setSecureCookie } from "@/lib/cookie-utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email et mot de passe requis",
        },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        {
          success: false,
          error: "Email ou mot de passe incorrect",
        },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, tenantUser.password);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ou mot de passe incorrect",
        },
        { status: 401 }
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
      role: "TENANT_ADMIN", // Les utilisateurs tenant sont des admins de leur tenant
      tenantId: tenantUser.tenantId,
      tenantSlug: tenantUser.tenant.slug,
      loginTime: new Date().toISOString(),
    };

    // Créer la response avec les informations utilisateur
    const response = NextResponse.json({
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
    });

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
  } catch (error) {
    console.error("❌ Erreur /api/auth/login/tenant:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la connexion",
      },
      { status: 500 }
    );
  }
}
