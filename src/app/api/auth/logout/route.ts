import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Créer la réponse de déconnexion
    const response = NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    });

    // Supprimer le cookie de session en le définissant avec une date d'expiration passée
    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/admin",
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
