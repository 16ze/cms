"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, Tablet, Smartphone, RotateCcw, ExternalLink, Download } from "lucide-react";

interface LivePreviewProps {
  sectionId?: string;
  pageId?: string;
  onClose: () => void;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type PreviewOrientation = 'portrait' | 'landscape';

export default function LivePreview({ sectionId, pageId, onClose }: LivePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [orientation, setOrientation] = useState<PreviewOrientation>('portrait');
  const [currentCSS, setCurrentCSS] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewConfigs = {
    desktop: { width: '100%', height: '600px', scale: 1 },
    tablet: { width: '768px', height: '1024px', scale: 0.8 },
    mobile: { width: '375px', height: '667px', scale: 0.6 }
  };

  const currentConfig = previewConfigs[previewMode];

  // Charger le CSS initial
  useEffect(() => {
    loadPreviewCSS();
  }, [sectionId, pageId]);

  // Mettre à jour le CSS quand les paramètres changent
  const loadPreviewCSS = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (sectionId) {
        params.append('includeSectionStyles', 'true');
        params.append('sectionId', sectionId);
      }

      const response = await fetch(`/api/admin/design/generate-css?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du CSS');
      }

      const css = await response.text();
      setCurrentCSS(css);
      
      // Appliquer le CSS à l'iframe
      applyCSSToIframe(css);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const applyCSSToIframe = (css: string) => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument;
      
      // Supprimer l'ancien CSS s'il existe
      const existingStyle = iframeDoc.getElementById('dynamic-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Créer et ajouter le nouveau CSS
      const style = iframeDoc.createElement('style');
      style.id = 'dynamic-css';
      style.textContent = css;
      iframeDoc.head.appendChild(style);
    }
  };

  const handlePreviewModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
  };

  const handleOrientationChange = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const refreshPreview = () => {
    loadPreviewCSS();
  };

  const openInNewTab = () => {
    const url = sectionId ? `/${pageId || 'home'}#${sectionId}` : `/${pageId || 'home'}`;
    window.open(url, '_blank');
  };

  const downloadCSS = () => {
    const blob = new Blob([currentCSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-${sectionId || 'global'}-${Date.now()}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPreviewUrl = () => {
    if (sectionId) {
      return `/${pageId || 'home'}#${sectionId}`;
    }
    return `/${pageId || 'home'}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Prévisualisation Temps Réel
            </h2>
            <p className="text-gray-600 mt-1">
              {sectionId ? 'Section spécifique' : pageId ? 'Page complète' : 'Site global'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshPreview}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              title="Actualiser la prévisualisation"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
            
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
              Nouvel onglet
            </button>
            
            <button
              onClick={downloadCSS}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors"
              title="Télécharger le CSS"
            >
              <Download className="w-4 h-4" />
              CSS
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contrôles de prévisualisation */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Sélecteur de mode */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Mode :</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handlePreviewModeChange('desktop')}
                  className={`p-2 transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Desktop (1440px)"
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePreviewModeChange('tablet')}
                  className={`p-2 transition-colors ${
                    previewMode === 'tablet'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePreviewModeChange('mobile')}
                  className={`p-2 transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Orientation (pour mobile/tablet) */}
            {(previewMode === 'mobile' || previewMode === 'tablet') && (
              <button
                onClick={handleOrientationChange}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Changer l'orientation"
              >
                <RotateCcw className="w-4 h-4" />
                {orientation === 'portrait' ? 'Portrait' : 'Paysage'}
              </button>
            )}

            {/* URL de prévisualisation */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">URL :</span> {getPreviewUrl()}
            </div>
          </div>
        </div>

        {/* Zone de prévisualisation */}
        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          <div className="flex justify-center">
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{
                width: orientation === 'landscape' && (previewMode === 'mobile' || previewMode === 'tablet')
                  ? currentConfig.height
                  : currentConfig.width,
                height: orientation === 'landscape' && (previewMode === 'mobile' || previewMode === 'tablet')
                  ? currentConfig.width
                  : currentConfig.height,
                transform: `scale(${currentConfig.scale})`,
                transformOrigin: 'top center'
              }}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de la prévisualisation...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-red-600">
                    <p className="mb-2">Erreur lors du chargement :</p>
                    <p className="text-sm">{error}</p>
                    <button
                      onClick={refreshPreview}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={getPreviewUrl()}
                  className="w-full h-full border-0"
                  title="Prévisualisation en temps réel"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer avec informations */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Mode :</span> {previewMode} 
              {orientation && ` (${orientation})`}
            </div>
            <div>
              <span className="font-medium">CSS :</span> {currentCSS.length} caractères
            </div>
            <div>
              <span className="font-medium">Dernière mise à jour :</span> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
