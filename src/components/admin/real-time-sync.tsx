"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";

interface RealTimeSyncProps {
  onContentUpdate?: (content: any) => void;
  autoSync?: boolean;
}

export default function RealTimeSync({ onContentUpdate, autoSync = true }: RealTimeSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fonction de synchronisation manuelle
  const syncContent = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      setErrorMessage(null);

      // Récupérer le contenu mis à jour depuis la base de données
      const response = await fetch('/api/admin/content/pages');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du contenu');
      }

      const result = await response.json();
      if (result.success) {
        // Notifier le composant parent du changement
        if (onContentUpdate) {
          onContentUpdate(result.data);
        }

        // Mettre à jour le statut
        setSyncStatus('success');
        setLastSync(new Date());
        
        // Réinitialiser le statut après 3 secondes
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      
      // Réinitialiser le statut après 5 secondes
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }, [onContentUpdate]);

  // PLUS DE SYNCHRONISATION AUTOMATIQUE - Polling désactivé pour éviter les auto-refresh
  // La synchronisation se fait uniquement manuellement ou après une action utilisateur
  useEffect(() => {
    if (!autoSync) return;

    // DÉSACTIVÉ - Le polling automatique cause des rafraîchissements constants
    // const interval = setInterval(() => {
    //   syncContent();
    // }, 30000);

    // return () => clearInterval(interval);
  }, [autoSync, syncStatus]);

  // Vérifier la connexion SEULEMENT au montage - plus de polling
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/admin/content/pages');
        setIsConnected(response.ok);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    // PLUS DE VÉRIFICATION PERIODIQUE - évite les requêtes inutiles
    // const interval = setInterval(checkConnection, 10000);
    // return () => clearInterval(interval);
  }, []);

  // Synchronisation immédiate au montage
  useEffect(() => {
    syncContent();
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Synchronisation...';
      case 'success':
        return 'Synchronisé';
      case 'error':
        return 'Erreur de synchronisation';
      default:
        return isConnected ? 'Connecté' : 'Déconnecté';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
          </div>
          
          {lastSync && (
            <span className="text-xs text-gray-500">
              Dernière sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncContent}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {errorMessage && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Indicateur de connexion */}
      <div className="mt-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Base de données accessible' : 'Base de données inaccessible'}
        </span>
      </div>
    </div>
  );
}
