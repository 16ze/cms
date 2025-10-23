"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  PlusCircle,
  Trash2,
  Edit,
  X,
  Shield,
  User,
  Crown,
  Key,
} from "lucide-react";
import {
  useUsersContent,
  useCommonContent,
} from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { useAdminSession } from "@/hooks/use-admin-session";
import { toast } from "sonner";
import { PermissionsModal } from "@/components/admin/PermissionsModal";

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

interface UserFormData {
  name?: string;
  email: string;
  password?: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

// Badge de rôle (extrait du composant principal)
const RoleBadge = ({ role }: { role: string }) => {
  const isSuperAdmin = role === "SUPER_ADMIN";
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
        isSuperAdmin
          ? "bg-purple-100 text-purple-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {isSuperAdmin ? (
        <Crown className="w-3 h-3" />
      ) : (
        <Shield className="w-3 h-3" />
      )}
      {isSuperAdmin ? "Super Admin" : "Administrateur"}
    </span>
  );
};

// Modal de formulaire (extrait du composant principal pour éviter les re-renders)
const UserModal = ({
  show,
  onClose,
  onSubmit,
  title,
  isEdit = false,
  formData,
  setFormData,
  actionLoading = false,
}: {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  isEdit?: boolean;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  actionLoading?: boolean;
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom complet
            </label>
            <Input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Jean Dupont"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isEdit}
              required={!isEdit}
              placeholder="admin@example.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {isEdit
                ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                : "Mot de passe"}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!isEdit}
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "ADMIN" | "SUPER_ADMIN",
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ADMIN">Administrateur</option>
              <option value="SUPER_ADMIN">Super Administrateur</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {formData.role === "SUPER_ADMIN"
                ? "✅ Accès complet à toutes les fonctionnalités"
                : "ℹ️ Accès limité (dashboard, réservations, clients)"}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={actionLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? "Modification..." : "Création..."}
                </>
              ) : isEdit ? (
                "Modifier"
              ) : (
                "Créer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const usersContent = useUsersContent();
  const common = useCommonContent();
  const router = useRouter();
  const { user: sessionUser, loading: sessionLoading } = useAdminSession();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  // Charger les utilisateurs depuis l'API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || data);
      setFilteredUsers(data.data || data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error(usersContent.messages.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser && !sessionLoading) {
      fetchUsers();
    }
  }, [sessionUser, sessionLoading]);

  // Protection contre les états de loading infinis
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Timeout de sécurité: arrêt du loading");
        setLoading(false);
      }
    }, 10000); // 10 secondes max

    return () => clearTimeout(timeout);
  }, [loading]);

  // Filtrer les utilisateurs en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Créer un nouvel utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Nom, email et mot de passe requis");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      toast.success("✅ Utilisateur créé avec succès");
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
    } catch (error) {
      console.error("Erreur création:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la création"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Modifier un utilisateur
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const updateData: Partial<UserFormData> = {
        name: formData.name,
        role: formData.role,
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }

      toast.success("✅ Utilisateur modifié avec succès");
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
    } catch (error) {
      console.error("Erreur modification:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la modification"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // Empêcher de se supprimer soi-même
    if (sessionUser?.email === userEmail) {
      toast.error("❌ Vous ne pouvez pas supprimer votre propre compte");
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      toast.success("✅ Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    }
  };

  // Ouvrir le modal de modification
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role as "ADMIN" | "SUPER_ADMIN",
    });
    setShowEditModal(true);
  };

  // Formater la date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Jamais";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {usersContent.header.title}
            </h1>
            <Button
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  role: "ADMIN",
                });
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {usersContent.header.addUser}
            </Button>
          </div>
          <p className="text-slate-600">{usersContent.header.subtitle}</p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={usersContent.filters.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-96"
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Administrateurs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Super Admins</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "SUPER_ADMIN").length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">
                              {(user.name || user.email)[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            {user.name && (
                              <p className="font-medium text-slate-900">
                                {user.name}
                              </p>
                            )}
                            <p
                              className={`text-sm ${
                                user.name
                                  ? "text-slate-600"
                                  : "font-medium text-slate-900"
                              }`}
                            >
                              {user.email}
                            </p>
                            {sessionUser?.email === user.email && (
                              <span className="text-xs text-blue-600 font-medium">
                                (Vous)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === "ADMIN" && (
                            <Button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPermissionsModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              disabled={actionLoading}
                              className="hover:bg-purple-50 hover:border-purple-300"
                              title="Gérer les permissions"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => openEditModal(user)}
                            variant="outline"
                            size="sm"
                            disabled={actionLoading}
                            className="hover:bg-blue-50 hover:border-blue-300"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteUser(user.id, user.email)
                            }
                            variant="outline"
                            size="sm"
                            disabled={
                              sessionUser?.email === user.email || actionLoading
                            }
                            className="hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <UserModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          title="Créer un nouvel utilisateur"
          formData={formData}
          setFormData={setFormData}
          actionLoading={actionLoading}
        />

        <UserModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
          title="Modifier l'utilisateur"
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          actionLoading={actionLoading}
        />

        {/* Modal de permissions */}
        {selectedUser && (
          <PermissionsModal
            show={showPermissionsModal}
            onClose={() => {
              setShowPermissionsModal(false);
              setSelectedUser(null);
            }}
            userId={selectedUser.id}
            userEmail={selectedUser.email}
            userRole={selectedUser.role}
            onSuccess={() => fetchUsers()}
          />
        )}
      </div>
    </AdminErrorBoundary>
  );
}
