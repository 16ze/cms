"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTempAdmin } from "@/hooks/use-temp-admin";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { useDashboardContent } from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import KeywordAlertsWidget from "@/components/admin/KeywordAlertsWidget";

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

// Composant pour le contenu du dashboard
function DashboardContent() {
  const dashboardContent = useDashboardContent();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useTempAdmin(); // Utilisation du hook temporaire
  const [showAccessDeniedAlert, setShowAccessDeniedAlert] = useState(false);
  const [attemptedPage, setAttemptedPage] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Vérifier le type d'utilisateur et rediriger si nécessaire
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Important pour inclure les cookies
        });

        // Ignorer les erreurs 401/403 (utilisateur non connecté)
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return; // Utilisateur non connecté, continuer normalement
          }
          console.error("Erreur vérification utilisateur:", response.status);
          return;
        }

        const data = await response.json();

        if (data.success && data.user.type === "SUPER_ADMIN") {
          // Rediriger les Super Admins vers leur dashboard
          router.push("/super-admin/dashboard");
          return;
        }
      } catch (error) {
        // Ignorer les erreurs de réseau
        console.error("Erreur vérification utilisateur:", error);
      }
    };

    checkUserType();
  }, [router]);

  // Vérifier les paramètres d'erreur et charger les stats
  useEffect(() => {
    // Vérifier s'il y a un message d'accès refusé
    const error = searchParams?.get("error");
    const attempted = searchParams?.get("attempted_page");

    if (error === "access_denied" && attempted) {
      setShowAccessDeniedAlert(true);
      setAttemptedPage(attempted);

      // Nettoyer l'URL des paramètres d'erreur
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      newUrl.searchParams.delete("attempted_page");
      window.history.replaceState({}, "", newUrl.toString());
    }

    // Charger les stats une fois que l'utilisateur est défini
    if (user && !loading) {
      loadStats();
    }
  }, [searchParams, user, loading]);

  // Actualisation automatique des statistiques toutes les 30 secondes
  useEffect(() => {
    if (!user || !stats) return;

    const interval = setInterval(() => {
      loadStats();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [user, stats]);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error(dashboardContent.messages.errorLoadingStats);
      }

      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error(dashboardContent.messages.errorLoadingStats, error);
      // En cas d'erreur, on peut afficher des valeurs par défaut
      setStats({
        reservations: {
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          thisWeek: 0,
        },
        users: { total: 0, admins: 0, superAdmins: 0 },
        recentActivity: [],
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Rediriger vers la page de connexion après déconnexion
      router.push("/login");
    } catch (error) {
      console.error(dashboardContent.messages.errorLogout, error);
    }
  };

  // Afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Alerte d'accès refusé */}
        {showAccessDeniedAlert && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {dashboardContent.messages.accessDenied}
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {dashboardContent.messages.accessDeniedMessage.replace(
                    "{page}",
                    attemptedPage
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowAccessDeniedAlert(false)}
                className="ml-3 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900">
              {dashboardContent.header.title}
            </h1>
            <p className="text-slate-600 font-medium">
              {dashboardContent.header.welcome}, {user?.name || "Admin"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={statsLoading}
            className="ml-4 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${statsLoading ? "animate-spin" : ""}`}
            />
            {dashboardContent.header.refresh}
          </Button>
        </header>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold mb-3 text-slate-600 uppercase tracking-wide">
              {dashboardContent.stats.reservations.titleFull}
            </h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {statsLoading ? "..." : stats?.reservations.total || 0}
            </p>
            <p className="text-sm text-slate-500">
              +{statsLoading ? "..." : stats?.reservations.thisWeek || 0}{" "}
              {dashboardContent.stats.reservations.thisWeek.toLowerCase()}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold mb-3 text-slate-600 uppercase tracking-wide">
              {dashboardContent.stats.reservations.pending}
            </h3>
            <p className="text-3xl font-bold text-amber-600 mb-2">
              {statsLoading ? "..." : stats?.reservations.pending || 0}
            </p>
            <p className="text-sm text-slate-500">
              {dashboardContent.stats.reservations.toConfirm}
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-semibold mb-3 text-slate-600 uppercase tracking-wide">
              {dashboardContent.stats.reservations.confirmed}
            </h3>
            <p className="text-3xl font-bold text-emerald-600 mb-2">
              {statsLoading ? "..." : stats?.reservations.confirmed || 0}
            </p>
            <p className="text-sm text-slate-500">
              {dashboardContent.stats.clients.activeLabel}
            </p>
          </div>

          {user?.role === "super_admin" && (
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-semibold mb-3 text-slate-600 uppercase tracking-wide">
                {dashboardContent.stats.users.title}
              </h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {statsLoading ? "..." : stats?.users.total || 0}
              </p>
              <p className="text-sm text-slate-500">
                {statsLoading ? "..." : stats?.users.superAdmins || 0}{" "}
                {dashboardContent.stats.users.superAdmins.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        {/* Widget Alertes SEO */}
        {user?.role === "super_admin" && (
          <div className="mb-8">
            <KeywordAlertsWidget />
          </div>
        )}

        {/* Activité récente */}
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm">
          <header className="px-8 py-6">
            <h2 className="text-xl font-bold text-slate-900">
              {dashboardContent.recentActivity.title}
            </h2>
          </header>

          <div className="px-8 pb-8">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-600 font-medium">
                  {dashboardContent.messages.loadingActivity}
                </span>
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <>
                <ul className="space-y-6">
                  {stats.recentActivity.map((activity) => {
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case "reservation_created":
                          return "bg-blue-500";
                        case "reservation_confirmed":
                          return "bg-emerald-500";
                        case "reservation_cancelled":
                          return "bg-red-500";
                        case "user_created":
                          return "bg-purple-500";
                        default:
                          return "bg-slate-500";
                      }
                    };

                    return (
                      <li key={activity.id} className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mr-4">
                          <span
                            className={`w-3 h-3 rounded-full ${getActivityColor(
                              activity.type
                            )}`}
                          ></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-medium text-sm leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {activity.relativeTime}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  variant="outline"
                  className="mt-8 w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                  asChild
                >
                  <Link href="/admin/reservations">
                    {dashboardContent.recentActivity.viewAll}
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium mb-6">
                  {dashboardContent.messages.noActivity}
                </p>
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  asChild
                >
                  <Link href="/admin/reservations">
                    {dashboardContent.quickActions.manageReservations}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Composant principal qui encapsule la logique d'authentification avec Suspense
export default function AdminDashboardPage() {
  return (
    <AdminErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Chargement...
              </p>
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </AdminErrorBoundary>
  );
}
