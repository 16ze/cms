"use client";

/**
 * DASHBOARD SUPER ADMIN (KAIRO DIGITAL)
 * ======================================
 * Vue d'ensemble pour gérer tous les tenants
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  Eye,
  Settings,
  Shield,
  Loader2,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  templateId: string;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok || !data.success) {
        router.push("/super-admin/login");
        return;
      }

      // Vérifier que c'est bien un Super Admin
      if (data.user.type !== "SUPER_ADMIN") {
        router.push("/admin/dashboard");
        return;
      }

      setUser(data.user);
      loadTenants();
    } catch (error) {
      console.error("Erreur auth:", error);
      router.push("/super-admin/login");
    }
  };

  const loadTenants = async () => {
    try {
      const response = await fetch("/api/super-admin/tenants");
      const data = await response.json();

      if (data.success) {
        setTenants(data.data);
      }
    } catch (error) {
      console.error("Erreur chargement tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Dashboard Super Admin
                </h1>
                <p className="text-purple-200 mt-1">
                  Bienvenue, {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/super-admin/login");
                } catch (error) {
                  console.error("Erreur déconnexion:", error);
                  router.push("/super-admin/login");
                }
              }}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg border border-red-500/50 transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {tenants.length}
          </p>
          <p className="text-purple-200 text-sm">Tenants actifs</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-300" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {tenants.filter((t) => t.isActive).length}
          </p>
          <p className="text-purple-200 text-sm">Comptes actifs</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {tenants.filter((t) => t.isActive).length}
          </p>
          <p className="text-purple-200 text-sm">Activité</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-300" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            +
            {
              tenants.filter(
                (t) =>
                  new Date(t.createdAt) >
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length
            }
          </p>
          <p className="text-purple-200 text-sm">Nouveaux (30j)</p>
        </div>
      </div>

      {/* Tenants List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-400" />
            Liste des Tenants
          </h2>

          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg">Aucun tenant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {tenant.name}
                        </h3>
                        {tenant.isActive ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            Actif
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-purple-200">
                        <span>📧 {tenant.email}</span>
                        <span>🔗 {tenant.slug}</span>
                        <span>
                          📅{" "}
                          {new Date(tenant.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg border border-purple-500/30 transition-all flex items-center gap-2"
                        onClick={() => {
                          alert(`Voir détails de ${tenant.name}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg border border-blue-500/30 transition-all flex items-center gap-2"
                        onClick={() => {
                          alert(`Gérer ${tenant.name}`);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Gérer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

