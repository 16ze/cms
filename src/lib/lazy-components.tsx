/**
 * 🚀 OPTIMISATIONS PERFORMANCE
 * ==============================
 *
 * Composants optimisés avec lazy loading et code splitting
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Lazy load le composant LivePreview (chargé uniquement quand nécessaire)
 */
export const LivePreviewLazy = dynamic(
  () => import("@/components/admin/LivePreview"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Lazy load le composant SiteEditorSidebar
 */
export const SiteEditorSidebarLazy = dynamic(
  () => import("@/components/admin/SiteEditorSidebar"),
  {
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Lazy load le composant AdminAssistant
 */
export const AdminAssistantLazy = dynamic(
  () => import("@/components/admin/admin-assistant"),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-10 w-10 rounded" />
    ),
    ssr: false,
  }
);

/**
 * Lazy load le composant GoogleAnalytics
 */
export const GoogleAnalyticsLazy = dynamic(
  () => import("@/components/GoogleAnalytics"),
  {
    ssr: false,
  }
);

/**
 * Lazy load le composant ConditionalChatbot
 */
export const ConditionalChatbotLazy = dynamic(
  () => import("@/components/conditional-chatbot"),
  {
    ssr: false,
  }
);

/**
 * Wrapper Suspense pour les composants lazy
 */
export function LazyComponentWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

