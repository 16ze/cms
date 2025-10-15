"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseCrmNotificationsProps {
  userId?: string;
  enabled?: boolean;
}

export function useCrmNotifications({
  userId = "admin",
  enabled = true,
}: UseCrmNotificationsProps) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialiser la connexion WebSocket
    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000",
      {
        transports: ["websocket"],
      }
    );
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connecté au serveur WebSocket pour les notifications");
      newSocket.emit("register-user", userId);
    });

    // Simuler des notifications pour démonstration
    const simulateNotifications = () => {
      // Notification de nouveau contact
      setTimeout(() => {
        console.log("📨 Simulation: Nouveau contact ajouté");
      }, 5000);

      // Notification de mise à jour d'opportunité
      setTimeout(() => {
        console.log("📨 Simulation: Opportunité mise à jour");
      }, 10000);

      // Notification de rappel d'activité
      setTimeout(() => {
        console.log("📨 Simulation: Rappel d'activité");
      }, 15000);

      // Notification système
      setTimeout(() => {
        console.log("📨 Simulation: Notification système");
      }, 20000);
    };

    // Démarrer la simulation après un délai
    const timer = setTimeout(simulateNotifications, 2000);

    return () => {
      clearTimeout(timer);
      newSocket.disconnect();
    };
  }, [userId, enabled]);

  // Fonctions utilitaires pour déclencher des notifications
  const notifyNewContact = (contactData: any) => {
    // Envoyer une notification via l'API
    fetch("/api/admin/crm/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        data: contactData,
        userId,
      }),
    }).catch(console.error);
  };

  const notifyOpportunityUpdate = (opportunityData: any) => {
    // Envoyer une notification via l'API
    fetch("/api/admin/crm/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "opportunity",
        data: opportunityData,
        userId,
      }),
    }).catch(console.error);
  };

  const notifyActivityReminder = (activityData: any) => {
    // Envoyer une notification via l'API
    fetch("/api/admin/crm/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "activity",
        data: activityData,
        userId,
      }),
    }).catch(console.error);
  };

  const notifySystem = (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    // Envoyer une notification système via l'API
    fetch("/api/admin/crm/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "system",
        message,
        notificationType: type,
        userId,
      }),
    }).catch(console.error);
  };

  return {
    notifyNewContact,
    notifyOpportunityUpdate,
    notifyActivityReminder,
    notifySystem,
  };
}
