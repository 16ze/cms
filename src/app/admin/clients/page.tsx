"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Eye,
  Download,
  FileText,
  Building,
  ExternalLink,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  useClientsContent,
  useCommonContent,
} from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  status: "PROSPECT" | "CLIENT" | "INACTIVE";
  source: "WEBSITE" | "REFERRAL" | "SOCIAL" | "DIRECT";
  notes?: string;
  projects: Project[];
  interactions: Interaction[];
  createdAt: string;
  lastContact?: string;
}

interface Project {
  id: string;
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  budget?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Interaction {
  id: string;
  type: "EMAIL" | "PHONE" | "MEETING" | "QUOTE";
  date: string;
  description: string;
  outcome?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

function ClientsContent() {
  const clientsContent = useClientsContent();
  const common = useCommonContent();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "PROSPECT" as "PROSPECT" | "CLIENT" | "INACTIVE",
    source: "WEBSITE" as "WEBSITE" | "REFERRAL" | "SOCIAL" | "DIRECT",
    notes: "",
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    clients: 0,
    prospects: 0,
    projects: 0,
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (sourceFilter !== "ALL") params.append("source", sourceFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const response = await fetch(`/api/admin/clients?${params}`);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des clients");

      const result = await response.json();
      if (result.success) {
        setClients(result.data);
        setFilteredClients(result.data);
        const totalProjects = result.data.reduce(
          (acc: number, client: any) =>
            acc + (client.projects ? client.projects.length : 0),
          0
        );
        setStats({
          total: result.stats.total,
          clients: result.stats.clients,
          prospects: result.stats.prospects,
          projects: totalProjects,
        });
        console.log(clientsContent.messages.loadSuccess, result.data.length);
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowEditClientModal(true);
  };

  const handleSaveClientEdit = async () => {
    if (!editingClient) return;
    try {
      setIsEditingClient(true);
      setError(null);
      const response = await fetch(`/api/admin/clients/${editingClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingClient),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }
      const result = await response.json();
      if (result.success) {
        setShowEditClientModal(false);
        setEditingClient(null);
        await loadClients();
        console.log(clientsContent.messages.updateSuccess);
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la modification"
      );
    } finally {
      setIsEditingClient(false);
    }
  };

  const handleCloseEditClientModal = () => {
    setShowEditClientModal(false);
    setEditingClient(null);
    setError(null);
  };

  const handleCreateClient = async () => {
    try {
      setIsCreatingClient(true);
      setError(null);
      if (
        !newClientData.firstName.trim() ||
        !newClientData.lastName.trim() ||
        !newClientData.email.trim()
      ) {
        setError("Prénom, nom et email sont requis");
        return;
      }
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || clientsContent.messages.createError);
      }
      const result = await response.json();
      if (result.success) {
        setShowNewClientModal(false);
        setNewClientData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          status: "PROSPECT",
          source: "WEBSITE",
          notes: "",
        });
        await loadClients();
        console.log(clientsContent.messages.createSuccess);
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(
        err instanceof Error ? err.message : clientsContent.messages.createError
      );
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleCloseNewClientModal = () => {
    setShowNewClientModal(false);
    setNewClientData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      status: "PROSPECT",
      source: "WEBSITE",
      notes: "",
    });
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/admin");
  };

  // SOLUTION TEMPORAIRE : Bypass de l'authentification pour le développement
  // TODO: Réactiver l'authentification complète plus tard
  useEffect(() => {
    console.log("🔓 Mode développement : authentification bypassée");
    // Simuler un utilisateur admin temporaire
    setAdminUser({
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
      role: "super_admin",
    });
    loadClients();
  }, []);

  useEffect(() => {
    if (adminUser) loadClients();
  }, [statusFilter, sourceFilter, adminUser]);

  useEffect(() => {
    let filtered = clients;

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.firstName.toLowerCase().includes(searchLower) ||
          client.lastName.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          (client.company && client.company.toLowerCase().includes(searchLower))
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-4">
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour au dashboard</span>
        </button>
      </div>

      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {clientsContent.header.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {clientsContent.header.subtitle}
            </p>
          </div>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau client
          </button>
        </div>
      </header>

      <div className="admin-stats-mobile grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Contacts
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clients
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.clients}
              </p>
            </div>
            <Building className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Prospects
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.prospects}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Projets
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.projects}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="admin-filters-mobile bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={clientsContent.filters.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-slate-900 shadow-sm"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-slate-900 shadow-sm"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="CLIENT">Clients</option>
              <option value="PROSPECT">Prospects</option>
              <option value="INACTIVE">Inactifs</option>
            </select>
          </div>
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-slate-900 shadow-sm"
            >
              <option value="ALL">Toutes les sources</option>
              <option value="WEBSITE">Site Web</option>
              <option value="REFERRAL">Recommandation</option>
              <option value="SOCIAL">Réseaux Sociaux</option>
              <option value="DIRECT">Contact Direct</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Clients ({filteredClients.length})
          </h2>
        </div>

        <div className="admin-table-container overflow-x-auto">
          <table className="admin-table-mobile min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dernier contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {client.firstName.charAt(0)}
                            {client.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    {client.phone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === "CLIENT"
                          ? "bg-green-100 text-green-800"
                          : client.status === "PROSPECT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {client.status === "CLIENT"
                        ? "Client"
                        : client.status === "PROSPECT"
                        ? "Prospect"
                        : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {client.source === "WEBSITE"
                        ? "Site Web"
                        : client.source === "REFERRAL"
                        ? "Recommandation"
                        : client.source === "SOCIAL"
                        ? "Réseaux Sociaux"
                        : "Contact Direct"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {client.lastContact
                      ? new Date(client.lastContact).toLocaleDateString("fr-FR")
                      : "Jamais"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowClientDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          console.log("Supprimer client:", client.id)
                        }
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création nouveau client */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={handleCloseNewClientModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Ajouter un nouveau client
                  </h3>
                  <button
                    onClick={handleCloseNewClientModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={newClientData.firstName}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={newClientData.lastName}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newClientData.email}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={newClientData.company}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          company: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={newClientData.status}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            status: e.target.value as
                              | "PROSPECT"
                              | "CLIENT"
                              | "INACTIVE",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PROSPECT">Prospect</option>
                        <option value="CLIENT">Client</option>
                        <option value="INACTIVE">Inactif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select
                        value={newClientData.source}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            source: e.target.value as
                              | "WEBSITE"
                              | "REFERRAL"
                              | "SOCIAL"
                              | "DIRECT",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WEBSITE">Site Web</option>
                        <option value="REFERRAL">Recommandation</option>
                        <option value="SOCIAL">Réseaux Sociaux</option>
                        <option value="DIRECT">Contact Direct</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      value={newClientData.address}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          address: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newClientData.notes}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notes ou informations supplémentaires..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={isCreatingClient}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingClient ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    "Créer le client"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseNewClientModal}
                  disabled={isCreatingClient}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition client */}
      {showEditClientModal && editingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={handleCloseEditClientModal}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {clientsContent.modal.edit.title}
                  </h3>
                  <button
                    onClick={handleCloseEditClientModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={editingClient.firstName}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={editingClient.lastName}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editingClient.email}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={editingClient.phone || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={editingClient.company || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          company: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={editingClient.status}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            status: e.target.value as
                              | "PROSPECT"
                              | "CLIENT"
                              | "INACTIVE",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PROSPECT">Prospect</option>
                        <option value="CLIENT">Client</option>
                        <option value="INACTIVE">Inactif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select
                        value={editingClient.source}
                        onChange={(e) =>
                          setEditingClient({
                            ...editingClient,
                            source: e.target.value as
                              | "WEBSITE"
                              | "REFERRAL"
                              | "SOCIAL"
                              | "DIRECT",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="WEBSITE">Site Web</option>
                        <option value="REFERRAL">Recommandation</option>
                        <option value="SOCIAL">Réseaux Sociaux</option>
                        <option value="DIRECT">Contact Direct</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      value={editingClient.address || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          address: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingClient.notes || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveClientEdit}
                  disabled={isEditingClient}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditingClient ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseEditClientModal}
                  disabled={isEditingClient}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails client */}
      {showClientDetailsModal && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowClientDetailsModal(false)}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails du client
                  </h3>
                  <button
                    onClick={() => setShowClientDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                      <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                        {selectedClient.firstName.charAt(0)}
                        {selectedClient.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedClient.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <p className="text-gray-900">
                        {selectedClient.phone || "Non renseigné"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entreprise
                      </label>
                      <p className="text-gray-900">
                        {selectedClient.company || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedClient.status === "CLIENT"
                            ? "bg-green-100 text-green-800"
                            : selectedClient.status === "PROSPECT"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedClient.status === "CLIENT"
                          ? "Client"
                          : selectedClient.status === "PROSPECT"
                          ? "Prospect"
                          : "Inactif"}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {selectedClient.source === "WEBSITE"
                          ? "Site Web"
                          : selectedClient.source === "REFERRAL"
                          ? "Recommandation"
                          : selectedClient.source === "SOCIAL"
                          ? "Réseaux Sociaux"
                          : "Contact Direct"}
                      </span>
                    </div>
                  </div>

                  {selectedClient.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <p className="text-gray-900">{selectedClient.address}</p>
                    </div>
                  )}

                  {selectedClient.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <p className="text-gray-900">{selectedClient.notes}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de création
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedClient.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientDetailsModal(false);
                    handleEditClient(selectedClient);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setShowClientDetailsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminClientsPage() {
  return (
    <ProtectedAdminPage page="clients">
      <AdminErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                  Chargement...
                </p>
              </div>
            </div>
          }
        >
          <ClientsContent />
        </Suspense>
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
