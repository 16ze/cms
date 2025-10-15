import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReservationsStore } from "@/lib/reservations-store";
import { usersStore } from "@/lib/users-store";
import { ensureAdmin } from "@/lib/require-admin";

// Interface pour les statistiques du dashboard
interface DashboardStats {
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    thisWeek: number;
  };
  users: {
    total: number;
    admins: number;
    superAdmins: number;
  };
  recentActivity: Array<{
    id: string;
    type:
      | "reservation_created"
      | "reservation_confirmed"
      | "reservation_cancelled"
      | "user_created";
    message: string;
    timestamp: string;
    relativeTime: string;
  }>;
}

// Fonction pour calculer le temps relatif
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return diffMinutes <= 1
      ? "Il y a quelques instants"
      : `Il y a ${diffMinutes} minutes`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "Il y a 1 heure" : `Il y a ${diffHours} heures`;
  } else {
    return diffDays === 1 ? "Hier" : `Il y a ${diffDays} jours`;
  }
}

// Fonction pour vérifier l'authentification admin
async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    if (!sessionData.email || !sessionData.name || !sessionData.id) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📊 API: Récupération des statistiques du dashboard");

    // Vérifier l'authentification
    const authResult = await ensureAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Erreur d'authentification
    }

    const adminUser = authResult;
    console.log(
      "📊 API: Récupération des statistiques du dashboard pour:",
      adminUser.email
    );

    // Récupérer toutes les réservations - utiliser la classe statique
    const allReservations = ReservationsStore.getAll();
    console.log("📊 Réservations récupérées du store:", allReservations.length);
    console.log("📊 Détails des réservations:", allReservations);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const reservationStats = {
      total: allReservations.length,
      pending: allReservations.filter((r) => r.status === "PENDING").length,
      confirmed: allReservations.filter((r) => r.status === "CONFIRMED").length,
      cancelled: allReservations.filter((r) => r.status === "CANCELLED").length,
      thisWeek: allReservations.filter((r) => {
        const reservationDate = new Date(r.createdAt);
        return reservationDate >= weekAgo;
      }).length,
    };

    // Récupérer toutes les utilisateurs
    const allUsers = await usersStore.getAll();

    const userStats = {
      total: allUsers.length,
      admins: allUsers.filter((u) => u.role === "admin").length,
      superAdmins: allUsers.filter((u) => u.role === "super_admin").length,
    };

    // Créer l'activité récente basée sur les vraies données
    const recentActivity = [];

    // Ajouter les réservations récentes (limitées aux 10 dernières)
    const recentReservations = allReservations
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    for (const reservation of recentReservations) {
      const createdDate = new Date(reservation.createdAt);

      // Activité de création
      recentActivity.push({
        id: `reservation_created_${reservation.id}`,
        type: "reservation_created" as const,
        message: `Nouvelle réservation: ${reservation.reservationType} par ${reservation.clientName}`,
        timestamp: reservation.createdAt,
        relativeTime: getRelativeTime(createdDate),
      });

      // Activité de changement de statut si applicable
      if (reservation.status === "CONFIRMED") {
        recentActivity.push({
          id: `reservation_confirmed_${reservation.id}`,
          type: "reservation_confirmed" as const,
          message: `Réservation confirmée: ${reservation.reservationType} pour ${reservation.clientName}`,
          timestamp: reservation.createdAt, // Pas de updatedAt dans l'interface actuelle
          relativeTime: getRelativeTime(new Date(reservation.createdAt)),
        });
      } else if (reservation.status === "CANCELLED") {
        recentActivity.push({
          id: `reservation_cancelled_${reservation.id}`,
          type: "reservation_cancelled" as const,
          message: `Réservation annulée: ${reservation.reservationType} pour ${reservation.clientName}`,
          timestamp: reservation.createdAt, // Pas de updatedAt dans l'interface actuelle
          relativeTime: getRelativeTime(new Date(reservation.createdAt)),
        });
      }
    }

    // Ajouter les nouveaux utilisateurs (si c'est un super admin)
    if (adminUser.role === "super_admin") {
      const recentUsers = allUsers
        .filter((u) => u.id !== "admin-1") // Exclure l'admin principal
        .sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        )
        .slice(0, 3);

      for (const user of recentUsers) {
        if (user.createdAt) {
          recentActivity.push({
            id: `user_created_${user.id}`,
            type: "user_created" as const,
            message: `Nouvel utilisateur créé: ${user.name} (${user.role})`,
            timestamp: user.createdAt,
            relativeTime: getRelativeTime(new Date(user.createdAt)),
          });
        }
      }
    }

    // Trier l'activité récente par date décroissante et limiter à 10 éléments
    const sortedActivity = recentActivity
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const stats: DashboardStats = {
      reservations: reservationStats,
      users: userStats,
      recentActivity: sortedActivity,
    };

    console.log("✅ API: Statistiques du dashboard récupérées avec succès");
    console.log("📈 Réservations:", reservationStats);
    console.log("👥 Utilisateurs:", userStats);
    console.log("🔄 Activités récentes:", sortedActivity.length, "éléments");

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
