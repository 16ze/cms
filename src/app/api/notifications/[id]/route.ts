import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";
import { ensureAdmin } from "@/lib/require-admin";

/**
 * GET /api/notifications/[id]
 * Récupérer une notification spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📬 API: Récupération de la notification ${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    const notifications = await notificationService.getNotifications({
      userId: user.id,
      limit: 1,
    });

    const notification = notifications.find((n) => n.id === id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("❌ Erreur récupération notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la notification" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/[id]
 * Marquer une notification comme lue
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📬 API: Marquage notification ${id} comme lue`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    const notification = await notificationService.markAsRead(id, user.id);

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("❌ Erreur marquage notification:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage de la notification" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Supprimer une notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📬 API: Suppression notification ${id}`);

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    await notificationService.delete(id, user.id);

    return NextResponse.json({
      success: true,
      message: "Notification supprimée avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur suppression notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
}

