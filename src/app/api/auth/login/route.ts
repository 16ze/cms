import { NextRequest, NextResponse } from "next/server";
import { adminUserService } from "@/lib/admin-user-service";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getAdminSessionSecret,
  signAdminSession,
} from "@/lib/admin-session";
import { setSecureCookie } from "@/lib/cookie-utils";

// Interface pour les données de connexion
interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 API: Début de traitement POST /api/auth/login");

    // Parser les données de la requête
    const body: LoginRequest = await request.json();
    const email = body.email?.trim();
    const password = body.password;

    console.log(`📝 Tentative de connexion pour: ${email}`);

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et mot de passe requis",
        },
        { status: 400 }
      );
    }

    const user = await adminUserService.validateCredentials(email, password);

    if (!user) {
      console.log(`❌ Identifiants invalides pour: ${email}`);
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect",
        },
        { status: 401 }
      );
    }

    console.log(`✅ Authentification réussie pour: ${email} (${user.name})`);

    // Créer une session
    const sessionData = {
      email: user.email,
      name: user.name,
      id: user.id,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    // Créer la réponse avec les informations utilisateur
    const response = NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

    console.log("📝 API: Fin de traitement POST /api/auth/login");
    return response;
  } catch (error) {
    console.error("❌ Erreur lors de l'authentification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
