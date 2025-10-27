"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useContentEditor } from "@/context/ContentEditorContext";

interface LivePreviewProps {
  url: string;
  onSectionClick?: (sectionId: string) => void;
}

export default function LivePreview({ url, onSectionClick }: LivePreviewProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Récupérer les fonctions du Context (sans auto-refresh)
  const { triggerManualRefresh } = useContentEditor();

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
    setIsLoading(true);
  };

  // ✅ Écouter SEULEMENT l'événement de sauvegarde (contrairement au refresh sur chaque modification)
  useEffect(() => {
    const handleContentUpdate = () => {
      console.log("🔄 Contenu sauvegardé, rechargement de l'iframe...");
      handleReload();
    };

    window.addEventListener("content-updated", handleContentUpdate);

    return () => {
      window.removeEventListener("content-updated", handleContentUpdate);
    };
  }, []);

  const handleOpenNewTab = () => {
    window.open(url, "_blank");
  };

  return (
    <div className="relative h-full w-full bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Prévisualisation en direct
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Recharger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview - Prend tout l'espace restant */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        )}
        <iframe
          key={reloadKey}
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          title="Site Preview"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex-shrink-0">
        URL: {url}
      </div>
    </div>
  );
}
