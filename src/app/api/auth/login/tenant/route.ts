/**
 * API: LOGIN TENANT USER
 * Route: POST /api/auth/login/tenant
 */

import { NextRequest, NextResponse } from "next/server";
import { loginTenantUser } from "@/lib/tenant-auth";

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

    const result = await loginTenantUser(email, password);

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
        type: "TENANT_USER",
        email,
        tenantSlug: result.tenantSlug,
      },
    });

    // Définir le cookie de session
    response.cookies.set("auth_session", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
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

