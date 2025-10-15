import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  verifyAdminSession,
} from "@/lib/admin-session";

/**
 * API pour vérifier la session de l'utilisateur admin
 * Retourne les informations de l'utilisateur si la session est valide
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔐 API: Vérification de session admin");

    // Récupérer le cookie de session
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      console.log("❌ Pas de cookie de session trouvé");
      return NextResponse.json(
        {
          authenticated: false,
          message: "Non authentifié",
        },
        { status: 401 }
      );
    }

    // Vérifier le token
    const verification = verifyAdminSession(token, getAdminSessionSecret());

    if (!verification.valid) {
      const reason =
        "reason" in verification
          ? verification.reason
          : "INVALID_SIGNATURE";
      
      console.log("❌ Session invalide:", reason);
      
      return NextResponse.json(
        {
          authenticated: false,
          message:
            reason === "EXPIRED_TOKEN"
              ? "Session expirée"
              : "Session invalide",
        },
        { status: 401 }
      );
    }

    // Session valide, retourner les informations utilisateur
    const { id, email, name, role } = verification.claims;
    
    console.log("✅ Session valide pour:", email);

    return NextResponse.json({
      authenticated: true,
      user: {
        id,
        email,
        name,
        role,
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la vérification de session:", error);
    return NextResponse.json(
      {
        authenticated: false,
        message: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
