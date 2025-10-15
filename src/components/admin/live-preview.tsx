"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface LivePreviewProps {
  className?: string;
}

export default function LivePreview({ className = "" }: LivePreviewProps) {
  const [siteContent, setSiteContent] = useState<any>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);

  // Charger le contenu du site
  const loadSiteContent = async () => {
    try {
      const response = await fetch('/api/public/content');
      if (response.ok) {
        const data = await response.json();
        setSiteContent(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
    } finally {
      setLoading(false);
    }
  };

  // CHARGEMENT UNIQUE - PAS DE SYNCHRONISATION AUTOMATIQUE
  useEffect(() => {
    loadSiteContent();
    // SUPPRIMÉ : setInterval pour éviter les boucles de Fast Refresh
  }, []);

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!siteContent) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Aucun contenu disponible
        </div>
      </div>
    );
  }

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return 'w-80';
      case 'tablet': return 'w-96';
      case 'desktop': return 'w-full';
      default: return 'w-full';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Prévisualisation en Temps Réel</h3>
        
        {/* Sélecteur d'appareil */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-md transition-colors ${
              device === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prévisualisation */}
      <div className={`mx-auto ${getDeviceWidth()} border border-gray-300 rounded-lg overflow-hidden`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              {siteContent.header?.logo || 'KAIRO Digital'}
            </div>
            <div className="flex items-center gap-4">
              {siteContent.header?.navigation?.slice(0, 3).map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {item.name}
                </a>
              ))}
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md">
                {siteContent.header?.buttons?.contact || 'Contact'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6 bg-gray-50 min-h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {siteContent.homepage?.hero?.title || 'Bienvenue'}
            </h1>
            <p className="text-gray-600 mb-4">
              {siteContent.homepage?.hero?.subtitle || 'Votre site en temps réel'}
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {siteContent.homepage?.hero?.ctaButton || 'En savoir plus'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white p-4">
          <div className="text-center">
            <div className="text-sm font-medium mb-2">
              {siteContent.footer?.company || 'KAIRO Digital'}
            </div>
            <div className="text-xs text-gray-300">
              {siteContent.footer?.description || 'Agence de développement web'}
            </div>
          </div>
        </div>
      </div>

      {/* Informations de synchronisation */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Prévisualisation synchronisée en temps réel</span>
        </div>
      </div>
    </div>
  );
}
