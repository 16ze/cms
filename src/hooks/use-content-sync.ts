"use client";

import { useState, useEffect, useCallback } from 'react';

interface ContentSyncOptions {
  interval?: number; // Intervalle de synchronisation en millisecondes
  enabled?: boolean; // Activer/désactiver la synchronisation
}

export function useContentSync(options: ContentSyncOptions = {}) {
  const { interval = 5000, enabled = true } = options;
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);

  const checkForUpdates = useCallback(async () => {
    if (!enabled) return;

    try {
      // Vérifier si le serveur est accessible
      const response = await fetch('/api/admin/content/pages', {
        method: 'HEAD', // Utiliser HEAD pour juste vérifier la connectivité
      });

      if (response.ok) {
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.warn('⚠️ Problème de connectivité:', error);
      setIsConnected(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Vérification initiale
    checkForUpdates();

    // Configuration de l'intervalle de synchronisation
    const syncInterval = setInterval(checkForUpdates, interval);

    return () => {
      clearInterval(syncInterval);
    };
  }, [checkForUpdates, interval, enabled]);

  // Fonction pour forcer une vérification manuelle
  const forceUpdate = useCallback(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    lastUpdate,
    isConnected,
    forceUpdate,
  };
}
