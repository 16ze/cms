"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Database, Globe } from "lucide-react";

export default function ContentSyncTest() {
  const [adminContent, setAdminContent] = useState<any>(null);
  const [publicContent, setPublicContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Charger le contenu admin
  const loadAdminContent = async () => {
    try {
      const response = await fetch('/api/admin/content/pages');
      if (!response.ok) throw new Error('Erreur API admin');
      
      const data = await response.json();
      if (data.success) {
        setAdminContent(data.data);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Erreur admin:', err);
    }
  };

  // Charger le contenu public
  const loadPublicContent = async () => {
    try {
      const response = await fetch('/api/public/content');
      if (!response.ok) throw new Error('Erreur API publique');
      
      const data = await response.json();
      setPublicContent(data);
    } catch (err) {
      console.error('Erreur publique:', err);
    }
  };

  // Test de synchronisation
  const testSync = async () => {
    try {
      setSyncStatus('syncing');
      setError(null);

      // Charger les deux contenus
      await Promise.all([loadAdminContent(), loadPublicContent()]);

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  // Chargement initial
  useEffect(() => {
    testSync().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Synchronisation...';
      case 'success':
        return 'Synchronisé';
      case 'error':
        return 'Erreur de synchronisation';
      default:
        return 'Prêt à synchroniser';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test de Synchronisation</h2>
          <p className="text-gray-600 mt-2">
            Vérifiez que le contenu admin et public sont synchronisés
          </p>
        </div>
        
        <button
          onClick={testSync}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {getSyncIcon()}
          {getSyncText()}
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Comparaison des contenus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contenu Admin */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Contenu Admin (Base de données)</h3>
          </div>
          
          {adminContent ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Pages: {adminContent.length}
              </div>
              
              {adminContent.map((page: any) => (
                <div key={page.id} className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-900">{page.title}</div>
                  <div className="text-sm text-gray-600">/{page.slug}</div>
                  <div className="text-xs text-gray-500">
                    Sections: {page.sections?.length || 0}
                  </div>
                  {page.sections?.map((section: any) => (
                    <div key={section.id} className="ml-3 text-xs text-gray-500">
                      • {section.sectionName} ({section.sectionType})
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Aucun contenu admin chargé</div>
          )}
        </div>

        {/* Contenu Public */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Contenu Public (Client)</h3>
          </div>
          
          {publicContent ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Sections: {Object.keys(publicContent).length}
              </div>
              
              {Object.entries(publicContent).map(([key, value]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-900">{key}</div>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(value) ? `${value.length} éléments` : 'Section'}
                  </div>
                  {typeof value === 'object' && value !== null && !Array.isArray(value) && (
                    <div className="text-xs text-gray-500">
                      {Object.keys(value).length} propriétés
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Aucun contenu public chargé</div>
          )}
        </div>
      </div>

      {/* Statut de synchronisation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Statut de la Synchronisation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${adminContent ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Admin: {adminContent ? 'Connecté' : 'Déconnecté'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${publicContent ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Public: {publicContent ? 'Connecté' : 'Déconnecté'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${adminContent && publicContent ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>Synchronisation: {adminContent && publicContent ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
