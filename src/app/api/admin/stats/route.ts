import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  try {
    console.log("📊 API: Récupération des statistiques du dashboard");

    // Vérifier l'authentification (système unifié)
    const sessionResult = verifyAdminSessionFromRequest(request);
    if (!sessionResult.success) {
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
      "📊 API: Récupération des statistiques du dashboard pour:",
      sessionData.email,
      "Type:",
      sessionData.role
    );

    // Si c'est un Super Admin, rediriger vers son dashboard
    if (sessionData.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super Admin doit utiliser /super-admin/dashboard" },
        { status: 403 }
      );
    }

    // Récupérer le tenantId pour filtrer les données
    const tenantId = sessionData.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID requis" }, { status: 400 });
    }

    console.log("🔒 Tenant ID:", tenantId);

    // Pour l'instant, utiliser des stats de démonstration pour les tenants
    // TODO: Migrer vers Prisma avec filtrage par tenantId
    // En attendant, on génère des stats factices isolées par tenant
    const reservationStats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      thisWeek: 0,
    };

    // Stats utilisateurs pour les tenants (uniquement leurs propres utilisateurs)
    const userStats = {
      total: 1, // Le tenant lui-même
      admins: 1,
      superAdmins: 0, // Les tenants ne sont jamais super admins
    };

    // Activité récente vide pour les tenants (pour l'instant)
    // TODO: Implémenter avec les vraies données du tenant
    const sortedActivity: Array<{
      id: string;
      type:
        | "reservation_created"
        | "reservation_confirmed"
        | "reservation_cancelled"
        | "user_created";
      message: string;
      timestamp: string;
      relativeTime: string;
    }> = [];

    const stats: DashboardStats = {
      reservations: reservationStats,
      users: userStats,
      recentActivity: sortedActivity,
    };

    console.log(
      "✅ API: Statistiques du dashboard (Tenant) récupérées avec succès"
    );
    console.log("🔒 Tenant ID:", tenantId);
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
