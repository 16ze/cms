/**
 * API: LOGIN SUPER ADMIN
 * Route: POST /api/auth/login/super-admin
 */

import { NextRequest, NextResponse } from "next/server";
import { loginSuperAdmin } from "@/lib/tenant-auth";
import { setSecureCookie } from "@/lib/cookie-utils";
import { validateRequest, commonSchemas } from "@/lib/validation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getAdminSessionSecret,
  signAdminSession,
} from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(request: NextRequest) {
  try {
    // Validation avec Zod
    const validation = await validateRequest(request, loginSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email, password } = validation.data;

    const result = await loginSuperAdmin(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 }
      );
    }

    // Récupérer les informations complètes du SuperAdmin pour créer la session
    const normalizedEmail = email.trim().toLowerCase();
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!superAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 401 }
      );
    }

    // Créer les données de session (format unifié avec les autres routes)
    const sessionData = {
      email: superAdmin.email,
      name: superAdmin.name || superAdmin.email.split("@")[0],
      id: superAdmin.id,
      role: "SUPER_ADMIN" as const,
      loginTime: new Date().toISOString(),
    };

    // Créer le token signé avec signAdminSession (comme les autres routes)
    const token = signAdminSession(
      sessionData,
      getAdminSessionSecret(),
      ADMIN_SESSION_MAX_AGE_SECONDS
    );

    // Créer la response avec le cookie de session
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        type: "SUPER_ADMIN",
        email: superAdmin.email,
        name: superAdmin.name,
        id: superAdmin.id,
      },
    });

    // Définir le cookie de session avec le nom correct (ADMIN_SESSION_COOKIE)
    setSecureCookie(response, ADMIN_SESSION_COOKIE, token, {
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("❌ Erreur /api/auth/login/super-admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la connexion",
      },
      { status: 500 }
    );
  }
}

