import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";
import { ensureAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notifications/test
 * Créer une notification de test pour l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 API: Création d'une notification de test");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    // Vérifier que l'utilisateur existe dans la base
    const dbUser = await prisma.adminUser.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé dans la base de données" },
        { status: 404 }
      );
    }

    // Créer une notification de test
    const notification = await notificationService.create({
      userId: user.id,
      type: "INFO",
      category: "SYSTEM",
      title: "🧪 Notification de test",
      message: "Ceci est une notification de test pour vérifier que le système fonctionne correctement.",
      priority: "MEDIUM",
      actionUrl: "/admin/dashboard",
      actionLabel: "Voir le dashboard",
      metadata: { test: true, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: "Notification de test créée avec succès",
      data: {
        notification,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erreur création notification de test:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la notification de test",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

