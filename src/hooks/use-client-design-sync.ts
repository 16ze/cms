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

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-footer-text", colors.footerText);

    // Appliquer les couleurs aux éléments spécifiques
    applyThemeColors(colors);
  };

  const applyThemeColors = (colors: ClientDesignSettings["colors"]) => {
    // Appliquer les couleurs aux éléments du header
    const header = document.querySelector("header");
    if (header) {
      header.style.setProperty("--header-background", colors.background);
      header.style.setProperty("--header-text", colors.text);
    }

    // Appliquer les couleurs aux éléments du footer
    const footer = document.querySelector("footer");
    if (footer) {
      footer.style.setProperty("--footer-background", colors.background);
      footer.style.setProperty("--footer-text", colors.footerText);
    }

    // Appliquer les couleurs aux boutons
    const buttons = document.querySelectorAll("button, .btn");
    buttons.forEach((button) => {
      if (button.classList.contains("bg-blue-600")) {
        button.style.backgroundColor = colors.primary;
      }
      if (button.classList.contains("bg-purple-600")) {
        button.style.backgroundColor = colors.secondary;
      }
    });

    // Appliquer les couleurs aux liens
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      if (
        link.style.color === "rgb(59, 130, 246)" ||
        link.classList.contains("text-blue-600")
      ) {
        link.style.color = colors.primary;
      }
    });
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetchDesignSettings();
  }, []);

  // Polling pour la synchronisation en temps réel (toutes les 20 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDesignSettings();
    }, 20000); // 20 secondes

    return () => clearInterval(interval);
  }, []);

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
