"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, RefreshCw } from "lucide-react";

interface RealClientPreviewProps {
  className?: string;
}

export default function RealClientPreview({ className = "" }: RealClientPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return 'w-80';
      case 'tablet': return 'w-96';
      case 'desktop': return 'w-full';
      default: return 'w-full';
    }
  };

  const getDeviceHeight = () => {
    switch (device) {
      case 'mobile': return 'h-[600px]';
      case 'tablet': return 'h-[700px]';
      case 'desktop': return 'h-[600px]';
      default: return 'h-[600px]';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    // Forcer le rechargement de l'iframe
    const iframe = document.getElementById('client-preview') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Prévisualisation du Vrai Site Client</h3>
        
        <div className="flex items-center gap-2">
          {/* Sélecteur d'appareil */}
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-md transition-colors ${
              device === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Tablette"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Bouton de rafraîchissement */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prévisualisation avec iframe du vrai site */}
      <div className={`mx-auto ${getDeviceWidth()} border border-gray-300 rounded-lg overflow-hidden bg-white`}>
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <iframe
          id="client-preview"
          src="http://localhost:3000"
          className={`w-full ${getDeviceHeight()} border-0`}
          onLoad={handleIframeLoad}
          title="Prévisualisation du site client"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>

      {/* Informations */}
      <div className="mt-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Prévisualisation du vrai site client</span>
        </div>
        
        <div className="text-xs text-gray-500">
          Dernier rafraîchissement : {lastRefresh.toLocaleTimeString()}
        </div>

        <div className="text-xs text-gray-400">
          Modifiez le contenu dans l'admin puis cliquez sur "Rafraîchir" pour voir les changements
        </div>
      </div>
    </div>
  );
}
