/**
 * API: LOGIN SUPER ADMIN
 * Route: POST /api/auth/login/super-admin
 */

import { NextRequest, NextResponse } from "next/server";
import { loginSuperAdmin } from "@/lib/tenant-auth";
import { setSecureCookie } from "@/lib/cookie-utils";
import { validateRequest, commonSchemas } from "@/lib/validation";
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

    // Créer la response avec le cookie de session
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        type: "SUPER_ADMIN",
        email,
      },
    });

    // Définir le cookie de session avec les paramètres sécurisés standardisés
    setSecureCookie(response, "auth_session", result.token!, {
      maxAge: 60 * 60 * 24 * 7, // 7 jours
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

