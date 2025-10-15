import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

interface ReservationData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectDescription: string;
  communicationMethod: "VISIO" | "PHONE";
  reservationType: "DISCOVERY" | "CONSULTATION" | "PRESENTATION" | "FOLLOWUP";
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  userId: string;
}

class NotificationService {
  private io: SocketIOServer | null = null;
  private isInitialized = false;

  initialize(server: NetServer) {
    if (this.isInitialized) {
      console.log("🔔 NotificationService déjà initialisé");
      return;
    }

    try {
      this.io = new SocketIOServer(server, {
        cors: {
          origin: process.env.NODE_ENV === "production" 
            ? "https://www.kairo-digital.fr" 
            : "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
        path: "/api/socketio",
      });

      this.io.on("connection", (socket) => {
        console.log(`🔔 Client connecté: ${socket.id}`);
        
        // Rejoindre la room admin pour recevoir les notifications
        socket.join("admin");
        
        socket.on("disconnect", () => {
          console.log(`🔔 Client déconnecté: ${socket.id}`);
        });
      });

      this.isInitialized = true;
      console.log("✅ NotificationService initialisé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation du NotificationService:", error);
      throw error;
    }
  }

  sendNewReservationNotification(reservation: ReservationData) {
    if (!this.io || !this.isInitialized) {
      console.warn("⚠️ NotificationService non initialisé, notification ignorée");
      return;
    }

    try {
      const notification = {
        type: "NEW_RESERVATION",
        data: reservation,
        timestamp: new Date().toISOString(),
        message: `Nouvelle réservation de ${reservation.clientName}`,
      };

      this.io.to("admin").emit("notification", notification);
      console.log(`🔔 Notification envoyée pour la réservation ${reservation.id}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la notification:", error);
    }
  }

  sendReservationUpdate(reservationId: string, status: string) {
    if (!this.io || !this.isInitialized) {
      console.warn("⚠️ NotificationService non initialisé, notification ignorée");
      return;
    }

    try {
      const notification = {
        type: "RESERVATION_UPDATE",
        data: { reservationId, status },
        timestamp: new Date().toISOString(),
        message: `Réservation ${reservationId} mise à jour: ${status}`,
      };

      this.io.to("admin").emit("notification", notification);
      console.log(`🔔 Notification de mise à jour envoyée pour ${reservationId}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la notification de mise à jour:", error);
    }
  }

  getConnectionStatus() {
    return {
      isInitialized: this.isInitialized,
      connectedClients: this.io ? this.io.engine.clientsCount : 0,
    };
  }
}

export const notificationService = new NotificationService();
