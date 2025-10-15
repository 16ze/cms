"use client";

import { useRouter } from "next/navigation";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { useAdminSession } from "@/hooks/use-admin-session";
import { Shield } from "lucide-react";

interface ProtectedAdminPageProps {
  children: React.ReactNode;
  page: string;
  requireEdit?: boolean;
  requireDelete?: boolean;
}

/**
 * Composant pour protéger les pages admin selon les permissions
 * Vérifie que l'utilisateur a les permissions nécessaires
 */
export function ProtectedAdminPage({
  children,
  page,
  requireEdit = false,
  requireDelete = false,
}: ProtectedAdminPageProps) {
  const router = useRouter();
  const { user, loading: sessionLoading } = useAdminSession();
  const {
    hasPageAccess,
    canEdit,
    canDelete,
    loading: permissionsLoading,
  } = useAdminPermissions();

  // Afficher le loader pendant le chargement
  if (sessionLoading || permissionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Vérifier les permissions
  const hasAccess = hasPageAccess(page);
  const hasEditPermission = requireEdit ? canEdit(page) : true;
  const hasDeletePermission = requireDelete ? canDelete(page) : true;

  // Si l'utilisateur n'a pas accès, afficher un message
  if (!hasAccess || !hasEditPermission || !hasDeletePermission) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Accès Refusé
          </h2>
          <p className="text-slate-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="space-y-2 text-sm text-slate-500">
            {!hasAccess && (
              <p>❌ Permission de visualisation requise</p>
            )}
            {requireEdit && !hasEditPermission && (
              <p>❌ Permission d'édition requise</p>
            )}
            {requireDelete && !hasDeletePermission && (
              <p>❌ Permission de suppression requise</p>
            )}
          </div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  // L'utilisateur a accès, afficher le contenu
  return <>{children}</>;
}

