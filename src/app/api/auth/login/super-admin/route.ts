/**
 * API: LOGIN SUPER ADMIN
 * Route: POST /api/auth/login/super-admin
 */

import { NextRequest, NextResponse } from "next/server";
import { loginSuperAdmin } from "@/lib/tenant-auth";
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

