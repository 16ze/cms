import { useState, useEffect } from "react";

interface ClientDesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    footerText: string;
  };
  theme: {
    name: string;
    config: any;
  };
}

export function useClientDesignSync() {
  const [designSettings, setDesignSettings] =
    useState<ClientDesignSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesignSettings = async () => {
    try {
      setLoading(true);

      // Récupérer les paramètres de design depuis l'API publique
      const designResponse = await fetch("/api/public/design");
      const designData = await designResponse.json();

      if (designData.success) {
        const transformedSettings: ClientDesignSettings = {
          colors: {
            primary: designData.colors?.primary || "#3B82F6",
            secondary: designData.colors?.secondary || "#8B5CF6",
            accent: designData.colors?.accent || "#F59E0B",
            background: designData.colors?.background || "#FFFFFF",
            text: designData.colors?.text || "#1F2937",
            footerText: designData.colors?.textSecondary || "#6B7280",
          },
          theme: {
            name: designData.theme?.name || "default",
            config: designData.theme?.config || {},
          },
        };

        setDesignSettings(transformedSettings);
        setError(null);

        // Appliquer les couleurs au CSS personnalisé
        applyColorsToCSS(transformedSettings.colors);
      } else {
        throw new Error(
          "Erreur lors de la récupération des paramètres de design"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.error("Erreur lors du chargement des paramètres de design:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyColorsToCSS = (colors: ClientDesignSettings["colors"]) => {
    // Créer ou mettre à jour les variables CSS personnalisées
    const root = document.documentElement;

    // Vérifier si les valeurs ont vraiment changé pour éviter les effets flash
    const currentPrimary = root.style.getPropertyValue("--color-primary");
    const currentSecondary = root.style.getPropertyValue("--color-secondary");
    const currentAccent = root.style.getPropertyValue("--color-accent");

    // Ne mettre à jour que si les valeurs ont changé
    if (currentPrimary !== colors.primary) {
      root.style.setProperty("--color-primary", colors.primary);
    }
    if (currentSecondary !== colors.secondary) {
      root.style.setProperty("--color-secondary", colors.secondary);
    }
    if (currentAccent !== colors.accent) {
      root.style.setProperty("--color-accent", colors.accent);
    }

    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-footer-text", colors.footerText);

    // DÉSACTIVÉ - L'application manuelle des couleurs causaient des effets flash
    // Les styles sont maintenant gérés via les CSS variables globales uniquement
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetchDesignSettings();
  }, []);

  // PLUS DE POLLING AUTOMATIQUE - suppression pour éviter les auto-refresh
  // La synchronisation se fait uniquement après une action utilisateur

  // Fonction pour forcer la synchronisation
  const refreshDesignSettings = () => {
    fetchDesignSettings();
  };

  return {
    designSettings,
    loading,
    error,
    refreshDesignSettings,
  };
}
