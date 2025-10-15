"use client";

import { useState, useEffect } from "react";
import { X, Check, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Permission {
  page: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface AvailablePage {
  id: string;
  name: string;
  description: string;
}

interface PermissionsModalProps {
  show: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userRole: string;
  onSuccess?: () => void;
}

export function PermissionsModal({
  show,
  onClose,
  userId,
  userEmail,
  userRole,
  onSuccess,
}: PermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [availablePages, setAvailablePages] = useState<AvailablePage[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    {}
  );

  // Charger les permissions existantes
  useEffect(() => {
    if (show && userId) {
      fetchPermissions();
    }
  }, [show, userId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/permissions`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des permissions");
      }

      const data = await response.json();
      setAvailablePages(data.data.availablePages);

      // Convertir les permissions en objet pour faciliter l'accès
      const permsObj: Record<string, Permission> = {};
      data.data.permissions.forEach((p: Permission) => {
        permsObj[p.page] = p;
      });

      // Initialiser les permissions manquantes avec false
      data.data.availablePages.forEach((page: AvailablePage) => {
        if (!permsObj[page.id]) {
          permsObj[page.id] = {
            page: page.id,
            canView: false,
            canEdit: false,
            canDelete: false,
          };
        }
      });

      setPermissions(permsObj);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (pageId: string, field: keyof Permission) => {
    if (field === "page") return;

    setPermissions((prev) => {
      const updated = { ...prev };
      if (!updated[pageId]) {
        updated[pageId] = {
          page: pageId,
          canView: false,
          canEdit: false,
          canDelete: false,
        };
      }

      // Si on désactive canView, désactiver aussi canEdit et canDelete
      if (field === "canView" && updated[pageId].canView) {
        updated[pageId] = {
          ...updated[pageId],
          canView: false,
          canEdit: false,
          canDelete: false,
        };
      }
      // Si on active canEdit ou canDelete, activer automatiquement canView
      else if (
        (field === "canEdit" || field === "canDelete") &&
        !updated[pageId].canView
      ) {
        updated[pageId] = {
          ...updated[pageId],
          canView: true,
          [field]: !updated[pageId][field],
        };
      } else {
        updated[pageId] = {
          ...updated[pageId],
          [field]: !updated[pageId][field],
        };
      }

      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Convertir l'objet en tableau
      const permissionsArray = Object.values(permissions).filter(
        (p) => p.canView || p.canEdit || p.canDelete
      );

      const response = await fetch(`/api/users/${userId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ permissions: permissionsArray }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success("✅ Permissions mises à jour avec succès");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de sauvegarder les permissions");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  // Si l'utilisateur est un super admin, afficher un message
  if (userRole === "SUPER_ADMIN") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Permissions</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center py-8">
            <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Super Administrateur
            </h3>
            <p className="text-slate-600">
              Les super administrateurs ont automatiquement accès à toutes les
              fonctionnalités. Les permissions personnalisées ne s'appliquent
              qu'aux administrateurs standard.
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Gérer les permissions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {userEmail} - Administrateur
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">
                    Contrôle d'accès granulaire
                  </p>
                  <ul className="text-xs space-y-1 text-blue-800">
                    <li>
                      • <strong>Voir</strong> : Peut accéder à la page
                    </li>
                    <li>
                      • <strong>Éditer</strong> : Peut modifier les données
                    </li>
                    <li>
                      • <strong>Supprimer</strong> : Peut supprimer les données
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {availablePages.map((page) => {
                const perm = permissions[page.id] || {
                  page: page.id,
                  canView: false,
                  canEdit: false,
                  canDelete: false,
                };

                return (
                  <div
                    key={page.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {page.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          {page.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            perm.canView
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300 group-hover:border-blue-400"
                          }`}
                          onClick={() => handleToggle(page.id, "canView")}
                        >
                          {perm.canView && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700">Voir</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            perm.canEdit
                              ? "bg-emerald-600 border-emerald-600"
                              : "border-slate-300 group-hover:border-emerald-400"
                          }`}
                          onClick={() => handleToggle(page.id, "canEdit")}
                        >
                          {perm.canEdit && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700">Éditer</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            perm.canDelete
                              ? "bg-red-600 border-red-600"
                              : "border-slate-300 group-hover:border-red-400"
                          }`}
                          onClick={() => handleToggle(page.id, "canDelete")}
                        >
                          {perm.canDelete && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700">
                          Supprimer
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer les permissions"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
