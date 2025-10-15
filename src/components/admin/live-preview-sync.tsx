"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, RefreshCw, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

interface LivePreviewSyncProps {
  pageSlug: string;
  onClose: () => void;
}

export default function LivePreviewSync({ pageSlug, onClose }: LivePreviewSyncProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = `/${pageSlug === 'home' ? '' : pageSlug}`;

  // Charger la prévisualisation
  const loadPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Attendre un peu pour que les changements soient appliqués
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recharger l'iframe
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError('Erreur lors du chargement de la prévisualisation');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronisation automatique
  useEffect(() => {
    const interval = setInterval(() => {
      loadPreview();
    }, 10000); // Mise à jour toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  // Chargement initial
  useEffect(() => {
    loadPreview();
  }, [pageSlug]);

  // Gestion du plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Ouvrir dans un nouvel onglet
  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[90vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Prévisualisation en temps réel
              </h3>
              <p className="text-sm text-gray-600">
                {pageSlug === 'home' ? 'Page d\'accueil' : `Page ${pageSlug}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicateur de synchronisation */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>En direct</span>
            </div>

            {/* Boutons d'action */}
            <button
              onClick={loadPreview}
              disabled={isLoading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openInNewTab}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Fermer"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Contenu de la prévisualisation */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Chargement de la prévisualisation...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={loadPreview}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Iframe de prévisualisation */}
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title={`Prévisualisation de ${pageSlug}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer avec informations */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>URL: {previewUrl}</span>
              {lastUpdate && (
                <span>Dernière mise à jour: {lastUpdate.toLocaleTimeString()}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Synchronisation automatique active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
