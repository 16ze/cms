/**
 * Hook pour récupérer et vérifier les permissions de l'utilisateur admin connecté
 */

import { useState, useEffect } from "react";
import { useAdminSession } from "./use-admin-session";

export interface UserPermission {
  page: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function useAdminPermissions() {
  const { user, loading: sessionLoading } = useAdminSession();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Super admin a tous les accès automatiquement
      if (user.role === "SUPER_ADMIN") {
        setPermissions([
          { page: "dashboard", canView: true, canEdit: true, canDelete: true },
          { page: "reservations", canView: true, canEdit: true, canDelete: true },
          { page: "clients", canView: true, canEdit: true, canDelete: true },
          { page: "content", canView: true, canEdit: true, canDelete: true },
          { page: "site", canView: true, canEdit: true, canDelete: true },
          { page: "users", canView: true, canEdit: true, canDelete: true },
          { page: "settings", canView: true, canEdit: true, canDelete: true },
        ]);
        setLoading(false);
        return;
      }

      // Pour les admins, récupérer les permissions depuis l'API
      try {
        const response = await fetch("/api/auth/my-permissions", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setPermissions(data.data.permissions || []);
        } else {
          console.error("Erreur lors de la récupération des permissions");
          setPermissions([]);
        }
      } catch (error) {
        console.error("Erreur permissions:", error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    if (!sessionLoading) {
      fetchPermissions();
    }
  }, [user, sessionLoading]);

  // Vérifier si l'utilisateur a accès à une page
  const hasPageAccess = (page: string): boolean => {
    if (user?.role === "SUPER_ADMIN") return true;
    const permission = permissions.find((p) => p.page === page);
    return permission?.canView ?? false;
  };

  // Vérifier si l'utilisateur peut éditer sur une page
  const canEdit = (page: string): boolean => {
    if (user?.role === "SUPER_ADMIN") return true;
    const permission = permissions.find((p) => p.page === page);
    return permission?.canEdit ?? false;
  };

  // Vérifier si l'utilisateur peut supprimer sur une page
  const canDelete = (page: string): boolean => {
    if (user?.role === "SUPER_ADMIN") return true;
    const permission = permissions.find((p) => p.page === page);
    return permission?.canDelete ?? false;
  };

  // Obtenir toutes les pages accessibles
  const getAccessiblePages = (): string[] => {
    if (user?.role === "SUPER_ADMIN") {
      return ["dashboard", "reservations", "clients", "content", "site", "users", "settings"];
    }
    return permissions.filter((p) => p.canView).map((p) => p.page);
  };

  return {
    permissions,
    loading,
    hasPageAccess,
    canEdit,
    canDelete,
    getAccessiblePages,
  };
}

