import { prisma } from "@/lib/prisma";
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from "@prisma/client";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
  expiresAt?: Date;
}

export interface NotificationFilters {
  userId: string;
  category?: NotificationCategory;
  read?: boolean;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  async create(input: CreateNotificationInput) {
    try {
      // Vérifier les préférences de l'utilisateur
      const preferences = await this.getUserPreferences(input.userId);

      // Vérifier si la catégorie est activée
      if (preferences && !this.isCategoryEnabled(preferences, input.category)) {
        console.log(
          `📭 Notification ignorée - catégorie ${input.category} désactivée pour l'utilisateur ${input.userId}`
        );
        return null;
      }

      // Vérifier les heures calmes
      if (preferences && this.isInQuietHours(preferences)) {
        console.log(
          `🤫 Notification ignorée - heures calmes actives pour l'utilisateur ${input.userId}`
        );
        return null;
      }

      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          category: input.category,
          title: input.title,
          message: input.message,
          priority: input.priority || NotificationPriority.MEDIUM,
          actionUrl: input.actionUrl,
          actionLabel: input.actionLabel,
          metadata: input.metadata,
          expiresAt: input.expiresAt,
        },
      });

      // Créer l'historique
      await this.createHistory(notification.id, input.userId, "sent", {
        category: input.category,
        priority: input.priority,
      });

      console.log(
        `✅ Notification créée: ${notification.id} pour ${input.userId}`
      );

      return notification;
    } catch (error) {
      console.error("❌ Erreur création notification:", error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getNotifications(filters: NotificationFilters) {
    try {
      const where: any = {
        userId: filters.userId,
      };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.read !== undefined) {
        where.read = filters.read;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      // Exclure les notifications expirées
      where.OR = [{ expiresAt: null }, { expiresAt: { gte: new Date() } }];

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: filters.limit || 50,
        skip: filters.offset || 0,
      });

      return notifications;
    } catch (error) {
      console.error("❌ Erreur récupération notifications:", error);
      throw error;
    }
  }

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
      });

      return count;
    } catch (error) {
      console.error("❌ Erreur comptage notifications:", error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Sécurité : vérifier que la notification appartient à l'utilisateur
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      // Créer l'historique
      await this.createHistory(notificationId, userId, "read");

      return notification;
    } catch (error) {
      console.error("❌ Erreur marquage notification comme lue:", error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      console.log(
        `✅ ${result.count} notifications marquées comme lues pour ${userId}`
      );

      return result;
    } catch (error) {
      console.error(
        "❌ Erreur marquage toutes notifications comme lues:",
        error
      );
      throw error;
    }
  }

  /**
   * Supprimer une notification
   */
  async delete(notificationId: string, userId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Sécurité
        },
      });

      console.log(`✅ Notification ${notificationId} supprimée`);
    } catch (error) {
      console.error("❌ Erreur suppression notification:", error);
      throw error;
    }
  }

  /**
   * Supprimer les notifications expirées
   */
  async cleanupExpired() {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`🧹 ${result.count} notifications expirées supprimées`);

      return result;
    } catch (error) {
      console.error("❌ Erreur nettoyage notifications:", error);
      throw error;
    }
  }

  /**
   * Récupérer les préférences d'un utilisateur
   */
  async getUserPreferences(userId: string) {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      // Créer les préférences par défaut si elles n'existent pas
      if (!preferences) {
        preferences = await prisma.notificationPreference.create({
          data: {
            userId,
            emailEnabled: true,
            pushEnabled: true,
            soundEnabled: true,
            reservations: true,
            clients: true,
            seo: true,
            system: true,
            content: true,
            security: true,
            quietHoursEnabled: false,
          },
        });
      }

      return preferences;
    } catch (error) {
      console.error("❌ Erreur récupération préférences:", error);
      return null;
    }
  }

  /**
   * Mettre à jour les préférences d'un utilisateur
   */
  async updateUserPreferences(userId: string, preferences: any) {
    try {
      const updated = await prisma.notificationPreference.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences,
        },
      });

      console.log(`✅ Préférences mises à jour pour ${userId}`);

      return updated;
    } catch (error) {
      console.error("❌ Erreur mise à jour préférences:", error);
      throw error;
    }
  }

  /**
   * Créer une entrée dans l'historique
   */
  private async createHistory(
    notificationId: string,
    userId: string,
    action: string,
    metadata?: any
  ) {
    try {
      await prisma.notificationHistory.create({
        data: {
          notificationId,
          userId,
          action,
          metadata,
        },
      });
    } catch (error) {
      console.error("❌ Erreur création historique:", error);
      // Ne pas bloquer si l'historique échoue
    }
  }

  /**
   * Vérifier si une catégorie est activée pour l'utilisateur
   */
  private isCategoryEnabled(
    preferences: any,
    category: NotificationCategory
  ): boolean {
    const categoryMap: Record<NotificationCategory, keyof typeof preferences> =
      {
        RESERVATION: "reservations",
        CLIENT: "clients",
        SEO: "seo",
        SYSTEM: "system",
        CONTENT: "content",
        SECURITY: "security",
        USER: "system", // Utiliser 'system' pour USER
      };

    const key = categoryMap[category];
    return preferences[key] !== false;
  }

  /**
   * Vérifier si on est dans les heures calmes
   */
  private isInQuietHours(preferences: any): boolean {
    if (!preferences.quietHoursEnabled) {
      return false;
    }

    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Si les heures calmes passent minuit
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    return currentTime >= start && currentTime <= end;
  }

  /**
   * Méthodes de création rapide pour différents types de notifications
   */

  // Nouvelle réservation
  async notifyNewReservation(
    userId: string,
    reservation: any
  ): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.INFO,
      category: NotificationCategory.RESERVATION,
      title: "Nouvelle réservation",
      message: `${
        reservation.clientName
      } a réservé un créneau pour le ${new Date(
        reservation.startTime
      ).toLocaleString("fr-FR")}`,
      priority: NotificationPriority.HIGH,
      actionUrl: "/admin/reservations",
      actionLabel: "Voir la réservation",
      metadata: { reservationId: reservation.id },
    });
  }

  // Réservation confirmée
  async notifyReservationConfirmed(
    userId: string,
    reservation: any
  ): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.RESERVATION,
      title: "Réservation confirmée",
      message: `La réservation de ${reservation.clientName} a été confirmée`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: "/admin/reservations",
      actionLabel: "Voir les détails",
      metadata: { reservationId: reservation.id },
    });
  }

  // Réservation annulée
  async notifyReservationCancelled(
    userId: string,
    reservation: any
  ): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.WARNING,
      category: NotificationCategory.RESERVATION,
      title: "Réservation annulée",
      message: `${reservation.clientName} a annulé sa réservation`,
      priority: NotificationPriority.HIGH,
      actionUrl: "/admin/reservations",
      actionLabel: "Voir les détails",
      metadata: { reservationId: reservation.id },
    });
  }

  // Nouveau client
  async notifyNewClient(userId: string, client: any): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.CLIENT,
      title: "Nouveau client",
      message: `${client.firstName} ${client.lastName} a été ajouté à la base clients`,
      priority: NotificationPriority.MEDIUM,
      actionUrl: "/admin/clients",
      actionLabel: "Voir le client",
      metadata: { clientId: client.id },
    });
  }

  // Client mis à jour
  async notifyClientUpdated(userId: string, client: any): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.INFO,
      category: NotificationCategory.CLIENT,
      title: "Client mis à jour",
      message: `Les informations de ${client.firstName} ${client.lastName} ont été modifiées`,
      priority: NotificationPriority.LOW,
      actionUrl: "/admin/clients",
      actionLabel: "Voir le client",
      metadata: { clientId: client.id },
    });
  }

  // Alerte SEO
  async notifySEOAlert(
    userId: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.WARNING,
      category: NotificationCategory.SEO,
      title: "Alerte SEO",
      message,
      priority,
      actionUrl: "/admin/seo/analysis",
      actionLabel: "Voir l'analyse",
    });
  }

  // Erreur système
  async notifySystemError(userId: string, error: string): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.ERROR,
      category: NotificationCategory.SYSTEM,
      title: "Erreur système",
      message: error,
      priority: NotificationPriority.URGENT,
      actionUrl: "/admin/settings",
      actionLabel: "Paramètres système",
    });
  }

  // Contenu publié
  async notifyContentPublished(
    userId: string,
    content: any
  ): Promise<any | null> {
    return this.create({
      userId,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.CONTENT,
      title: "Contenu publié",
      message: `La page "${content.title}" a été publiée avec succès`,
      priority: NotificationPriority.LOW,
      actionUrl: `/admin/content/edit/${content.slug}`,
      actionLabel: "Voir la page",
      metadata: { contentId: content.id },
    });
  }
}

// Export d'une instance singleton
export const notificationService = new NotificationService();
