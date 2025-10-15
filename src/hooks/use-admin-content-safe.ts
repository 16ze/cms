"use client";

import { useMemo } from "react";
import adminContentRaw from "@/config/admin-content.json";
import { AdminContentSchema, type AdminContent } from "@/types/admin-content.schema";

/**
 * 🛡️ HOOK TYPE-SAFE POUR ADMIN-CONTENT.JSON
 * 
 * Ce hook garantit :
 * - ✅ Validation runtime via Zod
 * - ✅ Type-safety totale TypeScript
 * - ✅ Détection précoce des erreurs
 * - ✅ Autocomplétion IDE complète
 * - ✅ Cache de validation (useMemo)
 * - ✅ Logs détaillés en cas d'erreur
 * 
 * @example
 * ```tsx
 * const adminContent = useAdminContentSafe();
 * const title = adminContent.dashboard.header.title; // Type-safe ✅
 * ```
 * 
 * @throws {Error} Si admin-content.json est invalide
 * @returns {AdminContent} Contenu admin validé et typé
 * 
 * @author KAIRO Digital - Senior Developer Team
 * @version 1.0.0
 */
export function useAdminContentSafe(): AdminContent {
  const validatedContent = useMemo(() => {
    try {
      // Validation Zod avec détails d'erreur
      const result = AdminContentSchema.safeParse(adminContentRaw);

      if (!result.success) {
        // Log détaillé des erreurs de validation
        console.error("❌ ERREUR CRITIQUE : admin-content.json est invalide !");
        console.error("📋 Détails des erreurs de validation :");
        
        result.error.issues.forEach((issue, index) => {
          console.error(`\n🔸 Erreur ${index + 1}:`);
          console.error(`   Chemin : ${issue.path.join(".")}`);
          console.error(`   Message : ${issue.message}`);
          console.error(`   Code : ${issue.code}`);
        });

        // Créer une erreur lisible
        const errorMessage = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("\n");

        throw new Error(
          `❌ admin-content.json invalide !\n\n${errorMessage}\n\n` +
          `💡 Vérifiez le fichier src/config/admin-content.json`
        );
      }

      console.log("✅ admin-content.json validé avec succès !");
      return result.data;
    } catch (error) {
      console.error("❌ Erreur fatale lors de la validation :", error);
      throw error;
    }
  }, []); // Validation une seule fois au montage

  return validatedContent;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Dashboard
 * 
 * @example
 * ```tsx
 * const dashboard = useDashboardContent();
 * return <h1>{dashboard.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useDashboardContent() {
  const content = useAdminContentSafe();
  return content.dashboard;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Reservations
 * 
 * @example
 * ```tsx
 * const reservations = useReservationsContent();
 * return <h1>{reservations.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useReservationsContent() {
  const content = useAdminContentSafe();
  return content.reservations;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Clients
 * 
 * @example
 * ```tsx
 * const clients = useClientsContent();
 * return <h1>{clients.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useClientsContent() {
  const content = useAdminContentSafe();
  return content.clients;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Users
 * 
 * @example
 * ```tsx
 * const users = useUsersContent();
 * return <h1>{users.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useUsersContent() {
  const content = useAdminContentSafe();
  return content.users;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Settings
 * 
 * @example
 * ```tsx
 * const settings = useSettingsContent();
 * return <h1>{settings.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useSettingsContent() {
  const content = useAdminContentSafe();
  return content.settings;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Content Management
 * 
 * @example
 * ```tsx
 * const content = useContentManagementContent();
 * return <h1>{content.header.title}</h1>; // Type-safe ✅
 * ```
 */
export function useContentManagementContent() {
  const content = useAdminContentSafe();
  return content.content;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Common (buttons, messages, labels)
 * 
 * @example
 * ```tsx
 * const common = useCommonContent();
 * return <button>{common.buttons.save}</button>; // Type-safe ✅
 * ```
 */
export function useCommonContent() {
  const content = useAdminContentSafe();
  return content.common;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Navigation
 * 
 * @example
 * ```tsx
 * const nav = useNavigationContent();
 * return <a>{nav.main.dashboard}</a>; // Type-safe ✅
 * ```
 */
export function useNavigationContent() {
  const content = useAdminContentSafe();
  return content.navigation;
}

/**
 * 🎯 HOOK SPÉCIFIQUE : Layout
 * 
 * @example
 * ```tsx
 * const layout = useLayoutContent();
 * return <h1>{layout.sidebar.logo}</h1>; // Type-safe ✅
 * ```
 */
export function useLayoutContent() {
  const content = useAdminContentSafe();
  return content.layout;
}

/**
 * 🔍 HELPER : Obtenir un texte safe avec fallback
 * 
 * @param getter - Fonction pour récupérer le texte
 * @param fallback - Texte par défaut si erreur
 * @param context - Contexte pour le log d'erreur
 * 
 * @example
 * ```tsx
 * const title = getSafeText(
 *   () => adminContent.dashboard.header.title,
 *   "Dashboard",
 *   "dashboard.header.title"
 * );
 * ```
 */
export function getSafeText(
  getter: () => string,
  fallback: string = "",
  context?: string
): string {
  try {
    const value = getter();
    if (!value || typeof value !== "string") {
      console.warn(
        `⚠️ Texte invalide${context ? ` dans ${context}` : ""}, utilisation du fallback: "${fallback}"`
      );
      return fallback;
    }
    return value;
  } catch (error) {
    console.error(
      `❌ Erreur lors de l'accès au texte${context ? ` dans ${context}` : ""}:`,
      error
    );
    return fallback;
  }
}

