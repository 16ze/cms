"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, Trash2, Settings } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCategory } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | "ALL">("ALL");
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
  });

  // Fermer le panel si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filtrer les notifications
  const filteredNotifications =
    filter === "ALL"
      ? notifications
      : notifications.filter((n) => n.category === filter);

  // Grouper les notifications par date
  const groupedNotifications = filteredNotifications.reduce(
    (acc: any, notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = "older";
      if (date.toDateString() === today.toDateString()) {
        key = "today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "yesterday";
      } else if (date.getTime() > yesterday.getTime() - 5 * 24 * 60 * 60 * 1000) {
        key = "week";
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(notification);
      return acc;
    },
    {}
  );

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "bg-green-50 border-green-200 text-green-800";
      case "WARNING":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "ERROR":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 animate-pulse";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    const labels: Record<NotificationCategory, string> = {
      RESERVATION: "Réservation",
      CLIENT: "Client",
      SEO: "SEO",
      SYSTEM: "Système",
      CONTENT: "Contenu",
      SECURITY: "Sécurité",
      USER: "Utilisateur",
    };
    return labels[category];
  };

  const handleNotificationClick = async (notification: any) => {
    // Marquer comme lue
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Naviguer si une URL d'action est définie
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refresh();
  };

  const handleDelete = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    refresh();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bouton Cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-white/20 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-3 h-3" />
                Tout lire
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/admin/settings?tab=notifications");
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Settings className="w-3 h-3" />
                Paramètres
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {["ALL", "RESERVATION", "CLIENT", "SEO", "SYSTEM", "CONTENT"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      filter === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat === "ALL" ? "Toutes" : getCategoryLabel(cat as any)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <>
                {Object.entries(groupedNotifications).map(([group, notifs]: [string, any]) => (
                  <div key={group}>
                    <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase">
                        {group === "today"
                          ? "Aujourd'hui"
                          : group === "yesterday"
                          ? "Hier"
                          : group === "week"
                          ? "Cette semaine"
                          : "Plus ancien"}
                      </h4>
                    </div>
                    {notifs.map((notification: any) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Indicateur de priorité */}
                          <div
                            className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${getPriorityDot(
                              notification.priority
                            )}`}
                          />

                          <div className="flex-1 min-w-0">
                            {/* Titre et catégorie */}
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">
                                {notification.title}
                              </h5>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getTypeStyles(
                                  notification.type
                                )}`}
                              >
                                {getCategoryLabel(notification.category)}
                              </span>
                            </div>

                            {/* Message */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {notification.message}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {notification.actionLabel && (
                                <span className="text-xs text-blue-600 font-medium">
                                  {notification.actionLabel} →
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bouton supprimer */}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/admin/notifications");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

