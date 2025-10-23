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
  LogIn,
  ExternalLink,
  Calendar,
  ShoppingCart,
  FileText,
  Sparkles,
  Mail,
  Plus,
  X,
  Check,
  AlertCircle,
  Layout,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  domain: string | null;
  templateId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    displayName: string;
    category: string;
  };
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }[];
  stats: {
    totalUsers: number;
    totalBeautyAppointments: number;
    totalWellnessBookings: number;
    totalProducts: number;
    totalOrders: number;
    totalArticles: number;
    totalRestaurantReservations: number;
    totalProjects: number;
  };
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  
  // Formulaire de création
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    slug: "",
    templateId: "",
    domain: "",
    userPassword: "",
  });

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

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Erreur chargement templates:", error);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.slug || !formData.templateId) {
        alert("Veuillez remplir tous les champs obligatoires");
        setCreating(false);
        return;
      }

      // Créer le tenant
      const response = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          slug: formData.slug,
          templateId: formData.templateId,
          domain: formData.domain || null,
          userPassword: formData.userPassword || "demo2025",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`Erreur: ${data.error || "Impossible de créer le tenant"}`);
        setCreating(false);
        return;
      }

      // Succès - afficher les identifiants
      const loginInfo = `✅ Client "${formData.name}" créé avec succès !

📧 Email: ${data.user.email}
🔑 Mot de passe: ${data.user.password}

⚠️ Communiquez ces identifiants au client.
Il pourra se connecter sur: ${window.location.origin}/login`;

      alert(loginInfo);
      
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        slug: "",
        templateId: "",
        domain: "",
        userPassword: "",
      });
      
      // Fermer la modal
      setShowCreateModal(false);
      
      // Recharger la liste
      await loadTenants();
      
    } catch (error) {
      console.error("Erreur création tenant:", error);
      alert("Erreur lors de la création du tenant");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreateModal = () => {
    loadTemplates();
    setShowCreateModal(true);
  };

  /**
   * Fonction pour se connecter en tant qu'un tenant (impersonation)
   */
  const handleImpersonate = async (tenantId: string, tenantName: string) => {
    try {
      const confirmation = confirm(
        `Voulez-vous accéder à l'espace admin de "${tenantName}" ?\n\nVous serez redirigé vers leur dashboard.`
      );

      if (!confirmation) return;

      const response = await fetch("/api/super-admin/impersonate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`Erreur: ${data.error || "Impossible de se connecter en tant que ce tenant"}`);
        return;
      }

      // Rediriger vers le dashboard admin du tenant
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Erreur impersonation:", error);
      alert("Erreur lors de la connexion en tant que tenant");
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-purple-400" />
              Liste des Clients
              <span className="text-sm font-normal text-purple-300">
                {tenants.length} client{tenants.length > 1 ? "s" : ""}
              </span>
            </h2>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nouveau Client
            </button>
          </div>

          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg">Aucun client</p>
              <p className="text-purple-300 text-sm mt-2">
                Les clients apparaîtront ici une fois créés
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {tenant.name}
                        </h3>
                        {tenant.isActive ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/30 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Actif
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full border border-red-500/30">
                            Inactif
                          </span>
                        )}
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                          {tenant.template.displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-purple-200">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {tenant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          {tenant.slug}
                        </span>
                        {tenant.domain && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            {tenant.domain}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-300" />
                        <span className="text-xs text-blue-200">Utilisateurs</span>
                      </div>
                      <p className="text-lg font-bold text-white">{tenant.stats.totalUsers}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-300" />
                        <span className="text-xs text-purple-200">Réservations</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {tenant.stats.totalBeautyAppointments +
                          tenant.stats.totalWellnessBookings +
                          tenant.stats.totalRestaurantReservations}
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="w-4 h-4 text-green-300" />
                        <span className="text-xs text-green-200">Produits</span>
                      </div>
                      <p className="text-lg font-bold text-white">{tenant.stats.totalProducts}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-orange-300" />
                        <span className="text-xs text-orange-200">Articles</span>
                      </div>
                      <p className="text-lg font-bold text-white">{tenant.stats.totalArticles}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white font-medium rounded-lg border border-blue-500/30 transition-all flex items-center justify-center gap-2 group/btn"
                      onClick={() => handleImpersonate(tenant.id, tenant.name)}
                    >
                      <LogIn className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      Gérer cet espace admin
                      <Sparkles className="w-4 h-4 opacity-50" />
                    </button>
                    <button
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg border border-white/10 transition-all flex items-center gap-2 group/sidebar"
                      onClick={() => router.push(`/super-admin/tenants/${tenant.id}/sidebar`)}
                      title="Gérer la sidebar"
                    >
                      <Layout className="w-5 h-5 group-hover/sidebar:scale-110 transition-transform" />
                    </button>
                    <button
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg border border-white/10 transition-all flex items-center gap-2"
                      onClick={() => {
                        alert(`Paramètres de ${tenant.name} (à implémenter)`);
                      }}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de tenant */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Nouveau Client</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-200 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTenant} className="space-y-6">
              {/* Nom du client */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Nom du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Salon Élégance"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: contact@salon-elegance.fr"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Slug (identifiant unique) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="Ex: salon-elegance"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-500 focus:outline-none transition-colors"
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="text-xs text-purple-300/70 mt-1">
                  Lettres minuscules, chiffres et tirets uniquement
                </p>
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Template <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="" className="bg-slate-800">Sélectionner un template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id} className="bg-slate-800">
                      {template.displayName} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Domaine (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Domaine personnalisé (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="Ex: www.salon-elegance.fr"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Mot de passe premier utilisateur */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Mot de passe premier utilisateur
                </label>
                <input
                  type="text"
                  value={formData.userPassword}
                  onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  placeholder="Par défaut: demo2025"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-purple-300/70 mt-1">
                  Si vide, le mot de passe sera "demo2025"
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Créer le client
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

