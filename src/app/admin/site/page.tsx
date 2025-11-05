"use client";

import { useEffect, Suspense } from "react";
import { LivePreviewLazy } from "@/lib/lazy-components";
import { useFrontendContent } from "@/hooks/use-frontend-content";
import { useRouter } from "next/navigation";
import { useContentEditor } from "@/context/ContentEditorContext";

export default function SitePage() {
  const router = useRouter();
  const { content: frontendContent, loading: contentLoading } =
    useFrontendContent({
      pageSlug: "accueil",
      autoSync: false, // ✅ Désactivé pour éviter le refresh permanent
    });

  // ✅ Utiliser le Context pour récupérer le contenu édité en temps réel
  const { editedContent } = useContentEditor();

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        }
      >
        <LivePreviewLazy url="/beaute" />
      </Suspense>
    </div>
  );
}
