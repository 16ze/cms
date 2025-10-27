import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationCategory, NotificationPriority } from "@prisma/client";

export interface Notification {
  id: string;
  userId: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string | null;
  actionLabel?: string | null;
  metadata?: any;
  expiresAt?: Date | null;
  createdAt: Date;
  readAt?: Date | null;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  reservations: boolean;
  clients: boolean;
  seo: boolean;
  system: boolean;
  content: boolean;
  security: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  category?: NotificationCategory;
  onlyUnread?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 10000, // 10 secondes (plus rapide)
    category,
    onlyUnread = false,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchRef = useRef<number>(0);

  /**
   * Récupérer les notifications
   */
  const fetchNotifications = useCallback(async () => {
    // Éviter les requêtes multiples simultanées
    if (isFetchingRef.current) {
      console.log("⏭️ Requête déjà en cours, ignorée");
      return;
    }

    // Cache de 5 secondes pour éviter trop de requêtes
    const now = Date.now();
    if (now - lastFetchRef.current < 5000 && !loading) {
      console.log("⏭️ Cache encore valide, requête ignorée");
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchRef.current = now;
      const params = new URLSearchParams();

      if (category) {
        params.append("category", category);
      }

      if (onlyUnread) {
        params.append("read", "false");
      }

      const url = `/api/notifications?${params.toString()}`;
      console.log("📬 Fetching notifications from:", url);

      const response = await fetch(url, {
        credentials: "include",
        // Ajouter un timeout pour éviter les erreurs "Failed to fetch"
        signal: AbortSignal.timeout(5000),
      });

      console.log("📬 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("📬 Response data:", data);

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        setError(null);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err: any) {
      console.error("❌ Erreur récupération notifications:", err);

      // Si c'est une erreur de timeout ou de réseau, ne pas interrompre l'application
      if (err.name === "TimeoutError" || err.name === "TypeError") {
        console.warn(
          "⚠️ Connexion interrompue, utilisation de l'état existant"
        );
        setError(null); // Ne pas afficher d'erreur pour les problèmes réseau temporaires
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [category, onlyUnread, loading]);

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du marquage de la notification");
      }

      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Rafraîchir immédiatement pour synchroniser avec le serveur
      setTimeout(() => {
        fetchNotifications();
      }, 100);

      return true;
    } catch (err: any) {
      console.error("❌ Erreur marquage notification:", err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du marquage des notifications");
      }

      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );

      setUnreadCount(0);

      // Rafraîchir immédiatement pour synchroniser avec le serveur
      setTimeout(() => {
        fetchNotifications();
      }, 100);

      return true;
    } catch (err: any) {
      console.error("❌ Erreur marquage toutes notifications:", err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Supprimer une notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la notification");
      }

      // Mettre à jour localement
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      return true;
    } catch (err: any) {
      console.error("❌ Erreur suppression notification:", err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Rafraîchir les notifications
   */
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Charger les notifications au montage SEULEMENT - Plus de polling automatique
  useEffect(() => {
    fetchNotifications();

    // PLUS DE POLLING AUTOMATIQUE - suppression pour éviter les auto-refresh
    // L'auto-refresh peut être activé manuellement si nécessaire en appelant refresh()
    // if (autoRefresh) {
    //   const interval = setInterval(fetchNotifications, refreshInterval);
    //   return () => clearInterval(interval);
    // }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

/**
 * Hook pour les préférences de notification
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer les préférences
   */
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des préférences");
      }

      const data = await response.json();

      if (data.success) {
        setPreferences(data.data);
        setError(null);
      }
    } catch (err: any) {
      console.error("❌ Erreur récupération préférences:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour les préférences
   */
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      try {
        const response = await fetch("/api/notifications/preferences", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newPreferences),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour des préférences");
        }

        const data = await response.json();

        if (data.success) {
          setPreferences(data.data);
          setError(null);
          return true;
        }

        return false;
      } catch (err: any) {
        console.error("❌ Erreur mise à jour préférences:", err);
        setError(err.message);
        return false;
      }
    },
    []
  );

  // Charger les préférences au montage
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refresh: fetchPreferences,
  };
}
