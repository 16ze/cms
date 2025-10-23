"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import AdminSidebar from "../../../components/AdminSidebar";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  role: "admin" | "super_admin";
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  });

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify");
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          router.push("/login");
          return;
        }

        setAdminUser(data.user);
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      if (!adminUser || !userId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Utilisateur non trouvé");
            router.push("/admin/users");
            return;
          }
          throw new Error(`Erreur: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          password: "", // Ne pas précharger le mot de passe
          role: userData.role,
        });
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        toast.error("Impossible de charger les données de l'utilisateur");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [adminUser, userId, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Préparer les données à envoyer (seulement les champs modifiés)
      const updateData: any = {};

      if (formData.name !== user?.name) {
        updateData.name = formData.name;
      }

      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }

      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      if (formData.role !== user?.role) {
        updateData.role = formData.role;
      }

      // Si aucun changement, ne pas envoyer de requête
      if (Object.keys(updateData).length === 0) {
        toast.info("Aucune modification détectée");
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, password: "" })); // Vider le champ mot de passe

      toast.success("Utilisateur mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      {/* Sidebar */}
      <AdminSidebar
        activePage="users"
        onLogout={handleLogout}
        user={adminUser}
      />

      {/* Contenu principal */}
      <main className="flex-1 px-3 sm:px-4 md:px-6 pt-14 pb-6 lg:pt-6 lg:ml-64 transition-all duration-300 ease-in-out">
        <div className="max-w-4xl mx-auto">
          {/* En-tête avec bouton retour */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux utilisateurs
            </Button>

            <h1 className="text-2xl font-bold mb-2">Modifier l'utilisateur</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Modifiez les informations de l'utilisateur
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire d'édition */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">
                Informations de l'utilisateur
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Nouveau mot de passe (laisser vide pour ne pas changer)
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="mt-1 pr-10"
                      placeholder="Nouveau mot de passe..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as "admin" | "super_admin",
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="super_admin">Super Administrateur</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/users")}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>

            {/* Informations de l'utilisateur */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Informations système
              </h2>

              {user && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      ID:
                    </span>
                    <div className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1">
                      {user.id}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      Créé le:
                    </span>
                    <div className="mt-1">{formatDate(user.createdAt)}</div>
                  </div>

                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      Modifié le:
                    </span>
                    <div className="mt-1">{formatDate(user.updatedAt)}</div>
                  </div>

                  {user.lastLogin && (
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Dernière connexion:
                      </span>
                      <div className="mt-1">{formatDate(user.lastLogin)}</div>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      Rôle:
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "super_admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : "Administrateur"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
