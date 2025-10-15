'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  theme: {
    darkMode: boolean;
  };
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

const BASE_POLLING_INTERVAL = 120_000; // 2 minutes
const MAX_POLLING_INTERVAL = 600_000; // 10 minutes
const isDev = process.env.NODE_ENV !== 'production';

export function useSettingsSync() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const retryIntervalRef = useRef(BASE_POLLING_INTERVAL);
  const pollingTimeoutRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);
  const isMountedRef = useRef(true);

  const clearScheduledFetch = useCallback(() => {
    if (pollingTimeoutRef.current !== null) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const fetchSettings = useCallback(
    async (showSpinner = false) => {
      const shouldShowLoading = showSpinner || isInitialLoadRef.current;

      if (shouldShowLoading) {
        setLoading(true);
      }

      try {
        setError(null);
        const response = await fetch('/api/settings', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des paramètres');
        }

        const data = await response.json();

        const transformedSettings: SiteSettings = {
          general: {
            siteName: data.general?.siteName || 'KAIRO Digital',
            tagline:
              data.general?.tagline ||
              'Agence de développement web et consulting digital',
            contactEmail:
              data.general?.contactEmail || 'contact.kairodigital@gmail.com',
            phoneNumber: data.general?.phoneNumber || '+33766121696',
            address: data.general?.address || 'Belfort, France',
          },
          social: {
            facebook: data.social?.facebook || '',
            twitter: data.social?.twitter || '',
            instagram: data.social?.instagram || '',
            linkedin: data.social?.linkedin || '',
          },
          theme: {
            darkMode: data.theme?.darkMode || false,
          },
          system: {
            maintenanceMode: data.system?.maintenanceMode || false,
            maintenanceMessage:
              data.system?.maintenanceMessage ||
              'Site en maintenance. Nous serons de retour bientôt !',
          },
        };

        setSettings(transformedSettings);
        retryIntervalRef.current = BASE_POLLING_INTERVAL;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        if (isDev) {
          console.error('Erreur lors du chargement des paramètres:', err);
        }

        retryIntervalRef.current = Math.min(
          retryIntervalRef.current * 2,
          MAX_POLLING_INTERVAL
        );
      } finally {
        isInitialLoadRef.current = false;
        setLoading(false);

        if (isMountedRef.current && typeof window !== 'undefined') {
          clearScheduledFetch();
          pollingTimeoutRef.current = window.setTimeout(() => {
            void fetchSettings();
          }, retryIntervalRef.current);
        }
      }
    },
    [clearScheduledFetch]
  );

  useEffect(() => {
    isMountedRef.current = true;
    void fetchSettings(true);

    return () => {
      isMountedRef.current = false;
      clearScheduledFetch();
    };
  }, [fetchSettings, clearScheduledFetch]);

  const refreshSettings = useCallback(() => {
    retryIntervalRef.current = BASE_POLLING_INTERVAL;
    clearScheduledFetch();
    void fetchSettings(true);
  }, [clearScheduledFetch, fetchSettings]);

  return {
    settings,
    loading,
    error,
    refreshSettings,
  };
}
