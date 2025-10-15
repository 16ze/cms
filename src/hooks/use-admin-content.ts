/**
 * Hook personnalisé pour accéder au contenu de l'admin
 * Permet un accès typé et sécurisé au fichier admin-content.json
 */

import adminContentData from "@/config/admin-content.json";

// Types pour le contenu admin
export type AdminContentData = typeof adminContentData;

export type AdminSection = keyof Omit<AdminContentData, "meta">;

/**
 * Hook pour accéder au contenu admin
 * @returns Le contenu complet de l'admin
 */
export function useAdminContent() {
  return adminContentData;
}

/**
 * Hook pour accéder à une section spécifique du contenu admin
 * @param section - La section à récupérer (login, dashboard, reservations, etc.)
 * @returns Le contenu de la section demandée
 */
export function useAdminSection<T extends AdminSection>(
  section: T
): AdminContentData[T] {
  return adminContentData[section];
}

/**
 * Fonction utilitaire pour obtenir un texte avec fallback
 * @param path - Chemin vers le texte (ex: "login.header.title")
 * @param fallback - Texte de secours si le chemin n'existe pas
 * @returns Le texte demandé ou le fallback
 */
export function getAdminText(path: string, fallback: string = ""): string {
  const parts = path.split(".");
  let current: any = adminContentData;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }

  return typeof current === "string" ? current : fallback;
}

/**
 * Helper pour obtenir les labels communs
 */
export function useCommonLabels() {
  return adminContentData.common.labels;
}

/**
 * Helper pour obtenir les boutons communs
 */
export function useCommonButtons() {
  return adminContentData.common.buttons;
}

/**
 * Helper pour obtenir les messages communs
 */
export function useCommonMessages() {
  return adminContentData.common.messages;
}

/**
 * Helper pour obtenir les labels de navigation
 */
export function useNavigationLabels() {
  return adminContentData.navigation.main;
}

/**
 * Helper pour obtenir les tooltips
 */
export function useTooltips() {
  return adminContentData.tooltips;
}

/**
 * Helper pour obtenir les messages d'erreur
 */
export function useErrorMessages() {
  return adminContentData.errors;
}

/**
 * Helper pour obtenir les états vides
 */
export function useEmptyStates() {
  return adminContentData.emptyStates;
}

/**
 * Helper pour obtenir les confirmations
 */
export function useConfirmations() {
  return adminContentData.confirmations;
}

/**
 * Helper pour les labels de rôles
 */
export function useRoleLabels() {
  return adminContentData.permissions.roles;
}

/**
 * Helper pour formater les dates selon la locale de l'admin
 */
export function formatAdminDate(
  date: Date | string,
  format: "short" | "long" | "time" | "datetime" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formats = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    datetime: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return dateObj.toLocaleDateString(
    "fr-FR",
    formats[format] as Intl.DateTimeFormatOptions
  );
}

/**
 * Helper pour obtenir un label de rôle
 */
export function getRoleLabel(role: "admin" | "super_admin"): string {
  return role === "super_admin"
    ? adminContentData.permissions.roles.superAdmin
    : adminContentData.permissions.roles.admin;
}

/**
 * Export par défaut
 */
export default useAdminContent;
