"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  Check,
  Trash2,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationCategory | "ALL">("ALL");
  const [hoveredNotif, setHoveredNotif] = useState<string | null>(null);
  const [deletingNotif, setDeletingNotif] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const notificationListRef = useRef<HTMLDivElement>(null);
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
      } else if (
        date.getTime() >
        yesterday.getTime() - 5 * 24 * 60 * 60 * 1000
      ) {
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
    const success = await markAllAsRead();
    if (success) {
      toast.success("Toutes les notifications ont été marquées comme lues");
      refresh();
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setDeletingNotif(notificationId);

    setTimeout(async () => {
      const success = await deleteNotification(notificationId);
      if (success) {
        toast.success("Notification supprimée");
        refresh();
      }
      setDeletingNotif(null);
    }, 300);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "RESERVATION":
        return Clock;
      case "CLIENT":
      case "USER":
        return Info;
      case "SEO":
      case "CONTENT":
        return CheckCircle;
      case "SYSTEM":
      case "SECURITY":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return CheckCircle;
      case "WARNING":
        return AlertCircle;
      case "ERROR":
        return AlertCircle;
      default:
        return Info;
    }
  };

  // Auto-scroll vers les nouvelles notifications
  useEffect(() => {
    if (isOpen && notificationListRef.current && notifications.length > 0) {
      notificationListRef.current.scrollTop = 0;
    }
  }, [isOpen, notifications.length]);

  // Empêcher le focus automatique sur la popup
  useEffect(() => {
    if (isOpen) {
      // Empêcher le focus automatique sur la popup
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-notification-panel]')) {
          e.preventDefault();
          target.blur();
        }
      };
      
      document.addEventListener('focusin', handleFocus);
      
      return () => {
        document.removeEventListener('focusin', handleFocus);
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Bouton Cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        title={
          unreadCount > 0
            ? `${unreadCount} notification(s) non lue(s)`
            : "Notifications"
        }
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-12" : ""
          } ${unreadCount > 0 ? "animate-wiggle" : ""}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-bounce-subtle ring-2 ring-white">
            {unreadCount > 99 ? "99" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay et Panel - Portal pour garantir le premier plan */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <>
             {/* Overlay */}
             <div
               className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[99999999] animate-fadeIn"
               onClick={() => setIsOpen(false)}
               style={{ zIndex: 99999999 }}
               tabIndex={-1}
             />

            {/* Panel de notifications */}
            <div
              className="fixed right-4 top-20 w-[420px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideDown"
              style={{ zIndex: 99999999 }}
              tabIndex={-1}
              onFocus={(e) => e.preventDefault()}
              data-notification-panel="true"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-5 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <p className="text-xs text-blue-100">
                          Centre de notifications
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="px-2.5 py-1 text-xs font-bold bg-white/25 backdrop-blur-sm rounded-full ring-2 ring-white/30">
                          {unreadCount}{" "}
                          {unreadCount > 1 ? "nouvelles" : "nouvelle"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-white/20 p-2 rounded-lg transition-all duration-200 active:scale-90"
                      aria-label="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllRead}
                      disabled={unreadCount === 0}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border border-white/30 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Tout marquer lu
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/admin/settings?tab=notifications");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 active:scale-95 border border-white/30 shadow-sm"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Paramètres
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {[
                    "ALL",
                    "RESERVATION",
                    "CLIENT",
                    "SEO",
                    "SYSTEM",
                    "CONTENT",
                  ].map((cat) => {
                    const isActive = filter === cat;
                    const catCount =
                      cat === "ALL"
                        ? notifications.length
                        : notifications.filter((n) => n.category === cat)
                            .length;

                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-200"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span>
                          {cat === "ALL"
                            ? "Toutes"
                            : getCategoryLabel(cat as any)}
                        </span>
                        {catCount > 0 && (
                          <span
                            className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                              isActive
                                ? "bg-white/25"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {catCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

               {/* Liste des notifications */}
               <div
                 ref={notificationListRef}
                 className="overflow-y-auto max-h-[450px] custom-scrollbar"
                 tabIndex={-1}
               >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-sm text-gray-500 font-medium">
                      Chargement...
                    </p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">
                      Aucune notification
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      {filter === "ALL"
                        ? "Vous êtes à jour !"
                        : `Pas de notifications ${getCategoryLabel(
                            filter as any
                          ).toLowerCase()}`}
                    </p>
                  </div>
                ) : (
                  <>
                    {Object.entries(groupedNotifications).map(
                      ([group, notifs]: [string, any]) => (
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
                          {notifs.map((notification: any, index: number) => {
                            const TypeIcon = getTypeIcon(notification.type);
                            const CategoryIcon = getCategoryIcon(
                              notification.category
                            );
                            const isHovered = hoveredNotif === notification.id;
                            const isDeleting =
                              deletingNotif === notification.id;

                            return (
                              <div
                                key={notification.id}
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                                onMouseEnter={() =>
                                  setHoveredNotif(notification.id)
                                }
                                onMouseLeave={() => setHoveredNotif(null)}
                                style={{
                                  animationDelay: `${index * 0.05}s`,
                                }}
                                className={`relative p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 animate-fadeIn ${
                                  isDeleting
                                    ? "opacity-0 translate-x-full"
                                    : isHovered
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md scale-[1.02] -translate-x-1"
                                    : !notification.read
                                    ? "bg-blue-50"
                                    : "bg-white hover:bg-gray-50"
                                }`}
                              >
                                {/* Indicateur non lu */}
                                {!notification.read && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
                                )}

                                <div className="flex items-start gap-3">
                                  {/* Icône de catégorie */}
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                      notification.type === "SUCCESS"
                                        ? "bg-green-100 text-green-600"
                                        : notification.type === "WARNING"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : notification.type === "ERROR"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"
                                    } ${isHovered ? "scale-110" : ""}`}
                                  >
                                    <CategoryIcon className="w-5 h-5" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {/* Titre et priorité */}
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <h5 className="font-semibold text-sm text-gray-900 flex-1 truncate">
                                        {notification.title}
                                      </h5>
                                      {notification.priority === "URGENT" && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full animate-pulse">
                                          <AlertCircle className="w-3 h-3" />
                                          Urgent
                                        </span>
                                      )}
                                    </div>

                                    {/* Catégorie badge */}
                                    <div className="mb-2">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${getTypeStyles(
                                          notification.type
                                        )}`}
                                      >
                                        <TypeIcon className="w-3 h-3" />
                                        {getCategoryLabel(
                                          notification.category
                                        )}
                                      </span>
                                    </div>

                                    {/* Message */}
                                    <p className="text-sm text-gray-700 line-clamp-2 mb-2 leading-relaxed">
                                      {notification.message}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(
                                          notification.createdAt
                                        ).toLocaleTimeString("fr-FR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>

                                      {notification.actionLabel && (
                                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                                          {notification.actionLabel}
                                          <span className="text-lg">→</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bouton supprimer */}
                                  <button
                                    onClick={(e) =>
                                      handleDelete(e, notification.id)
                                    }
                                    className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-90 ${
                                      isHovered ? "opacity-100" : "opacity-0"
                                    }`}
                                    title="Supprimer"
                                    aria-label="Supprimer la notification"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/admin/notifications");
                    }}
                    className="w-full px-4 py-2.5 text-sm text-blue-600 hover:text-white font-semibold bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 hover:shadow-md"
                  >
                    Voir toutes les notifications ({notifications.length})
                  </button>
                </div>
              )}

              {/* Info message si vide */}
              {!loading &&
                filteredNotifications.length === 0 &&
                notifications.length > 0 &&
                filter !== "ALL" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      Aucune notification dans cette catégorie
                    </p>
                    <button
                      onClick={() => setFilter("ALL")}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir toutes les catégories
                    </button>
                  </div>
                )}
            </div>

            <style jsx>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateX(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }

              @keyframes wiggle {
                0%,
                100% {
                  transform: rotate(0deg);
                }
                25% {
                  transform: rotate(-10deg);
                }
                75% {
                  transform: rotate(10deg);
                }
              }

              @keyframes bounce-subtle {
                0%,
                100% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.05);
                }
              }

              .animate-slideDown {
                animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              }

              .animate-fadeIn {
                animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              }

              .animate-wiggle {
                animation: wiggle 0.5s ease-in-out;
              }

              .animate-bounce-subtle {
                animation: bounce-subtle 2s ease-in-out infinite;
              }

              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
              }

              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }

              .custom-scrollbar::-webkit-scrollbar-track {
                background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
                border-radius: 4px;
              }

              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
                border-radius: 4px;
                border: 2px solid #f1f5f9;
              }

              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(to bottom, #94a3b8, #64748b);
              }

              .custom-scrollbar::-webkit-scrollbar-thumb:active {
                background: linear-gradient(to bottom, #64748b, #475569);
              }
            `}</style>
          </>,
          document.body
        )}
    </>
  );
}
