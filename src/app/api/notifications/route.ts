import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { NotificationCategory, NotificationPriority } from "@prisma/client";

/**
 * GET /api/notifications
 * Récupérer les notifications de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    console.log("📬 API: Récupération des notifications");

    // Vérifier l'authentification (système unifié)
    const sessionResult = verifyAdminSessionFromRequest(request);
    if (!sessionResult.success) {
      console.log("📬 API: Authentification échouée");
      return NextResponse.json(
        {
          success: false,
          error: "Authentification requise.",
        },
        { status: 401 }
      );
    }

    const sessionData = sessionResult.data;
    console.log(
      "📬 API: Utilisateur authentifié:",
      sessionData.id,
      sessionData.email,
      sessionData.role
    );

    const { searchParams } = new URL(request.url);

    // Récupérer les paramètres de filtrage
    const category = searchParams.get(
      "category"
    ) as NotificationCategory | null;
    const read = searchParams.get("read");
    const priority = searchParams.get(
      "priority"
    ) as NotificationPriority | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const filters: any = {
      userId: sessionData.id,
      limit,
      offset,
    };

    if (category) {
      filters.category = category;
    }

    if (read !== null) {
      filters.read = read === "true";
    }

    if (priority) {
      filters.priority = priority;
    }

    console.log("📬 API: Filtres:", filters);

    console.log("📬 API: Appel getNotifications...");
    const notifications = await notificationService.getNotifications(filters);
    console.log("📬 API: Notifications récupérées:", notifications.length);

    console.log("📬 API: Appel getUnreadCount...");
    const unreadCount = await notificationService.getUnreadCount(
      sessionData.id
    );
    console.log("📬 API: Unread count:", unreadCount);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération notifications:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "N/A"
    );
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Créer une nouvelle notification (Admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    console.log("📬 API: Création d'une notification");

    // Vérifier l'authentification (multi-tenant)
    const authResult = await ensureAuthenticated(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;
    const body = await request.json();

    // Valider les données
    if (!body.title || !body.message || !body.category) {
      return NextResponse.json(
        { error: "Titre, message et catégorie requis" },
        { status: 400 }
      );
    }

    // Créer la notification
    const notification = await notificationService.create({
      userId: body.userId || user.id, // Par défaut, pour l'utilisateur connecté
      type: body.type || "INFO",
      category: body.category,
      title: body.title,
      message: body.message,
      priority: body.priority || "MEDIUM",
      actionUrl: body.actionUrl,
      actionLabel: body.actionLabel,
      metadata: body.metadata,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("❌ Erreur création notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la notification" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications
 * Marquer toutes les notifications comme lues
 */
export async function PUT(request: NextRequest) {
  try {
    console.log("📬 API: Marquer toutes les notifications comme lues");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    const result = await notificationService.markAllAsRead(user.id);

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("❌ Erreur marquage notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage des notifications" },
      { status: 500 }
    );
  }
}
