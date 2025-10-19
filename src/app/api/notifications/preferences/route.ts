import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";
import { ensureAdmin } from "@/lib/require-admin";

/**
 * GET /api/notifications/preferences
 * Récupérer les préférences de notification de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    console.log("⚙️ API: Récupération des préférences de notification");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    const preferences = await notificationService.getUserPreferences(user.id);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("❌ Erreur récupération préférences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des préférences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Mettre à jour les préférences de notification
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("⚙️ API: Mise à jour des préférences de notification");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;
    const body = await request.json();

    const preferences = await notificationService.updateUserPreferences(
      user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour préférences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des préférences" },
      { status: 500 }
    );
  }
}

