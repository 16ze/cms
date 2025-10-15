import { useState, useEffect } from 'react';

interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    footerText: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    fontWeight: string;
  };
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
  backgrounds: {
    header: string;
    footer: string;
    sections: string;
  };
  theme: {
    name: string;
    isActive: boolean;
    config: any;
  };
}

export function useDesignSync() {
  const [designSettings, setDesignSettings] = useState<DesignSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDesignSettings = async () => {
    try {
      setLoading(true);
      
      // Récupérer les paramètres de thème depuis l'API
      const themeResponse = await fetch('/api/admin/themes');
      const themeData = await themeResponse.json();
      
      // Récupérer les paramètres de couleurs depuis l'API
      const colorsResponse = await fetch('/api/admin/colors');
      const colorsData = await colorsResponse.json();
      
      // Transformer les données en format DesignSettings
      const transformedSettings: DesignSettings = {
        colors: {
          primary: colorsData?.primary || '#3B82F6',
          secondary: colorsData?.secondary || '#8B5CF6',
          accent: colorsData?.accent || '#F59E0B',
          background: colorsData?.background || '#FFFFFF',
          text: colorsData?.text || '#1F2937',
          footerText: colorsData?.footerText || '#6B7280',
        },
        typography: {
          fontFamily: themeData?.fontFamily || 'Inter',
          fontSize: themeData?.fontSize || '16px',
          lineHeight: themeData?.lineHeight || '1.5',
          fontWeight: themeData?.fontWeight || '400',
        },
        spacing: {
          padding: themeData?.padding || '1rem',
          margin: themeData?.margin || '1rem',
          gap: themeData?.gap || '1rem',
        },
        backgrounds: {
          header: themeData?.headerBackground || '#FFFFFF',
          footer: themeData?.footerBackground || '#F9FAFB',
          sections: themeData?.sectionsBackground || '#FFFFFF',
        },
        theme: {
          name: themeData?.name || 'default',
          isActive: themeData?.isActive || true,
          config: themeData?.config || {},
        },
      };

      setDesignSettings(transformedSettings);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des paramètres de design:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetchDesignSettings();
  }, []);

  // Polling pour la synchronisation en temps réel (toutes les 15 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDesignSettings();
    }, 15000); // 15 secondes

    return () => clearInterval(interval);
  }, []);

  // Fonction pour forcer la synchronisation
  const refreshDesignSettings = () => {
    fetchDesignSettings();
  };

  // Fonction pour sauvegarder les paramètres de design
  const saveDesignSettings = async (settings: Partial<DesignSettings>) => {
    try {
      setLoading(true);
      
      // Sauvegarder les paramètres de thème
      if (settings.theme) {
        await fetch('/api/admin/themes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings.theme),
        });
      }
      
      // Sauvegarder les paramètres de couleurs
      if (settings.colors) {
        await fetch('/api/admin/colors', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings.colors),
        });
      }
      
      // Recharger les paramètres après sauvegarde
      await fetchDesignSettings();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    designSettings,
    loading,
    error,
    lastUpdate,
    refreshDesignSettings,
    saveDesignSettings,
  };
}
