import { useState, useEffect, useCallback } from "react";

interface UseFrontendContentOptions {
  pageSlug: string;
  autoSync?: boolean;
  syncInterval?: number;
}

/**
 * Hook pour charger le contenu frontend dynamique
 */
export function useFrontendContent(options: UseFrontendContentOptions) {
  const { pageSlug, autoSync = true, syncInterval = 10000 } = options;

  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fonction de chargement des valeurs par défaut
  const loadDefaultContent = useCallback(() => {
    // Charger le contenu par défaut depuis les fichiers de config
    try {
      const defaultContent = require("@/config/default-content/beauty.json");
      const pageContent = defaultContent.pages[pageSlug] || {};
      return pageContent;
    } catch (err) {
      console.warn("Impossible de charger le contenu par défaut:", err);
      // ✅ Retourner des valeurs par défaut hardcodées
      return {
        hero: {
          title: "Bienvenue dans votre salon de beauté",
          subtitle: "Prenez soin de vous avec nos prestations professionnelles",
          primaryButton: {
            text: "Réserver un rendez-vous",
            url: "/reservation",
          },
          secondaryButton: { text: "En savoir plus", url: "/prestations" },
        },
        services: {
          title: "Nos Prestations",
          subtitle: "Découvrez notre gamme de services professionnels",
          services: [
            {
              name: "Soins Visage",
              description:
                "Prestation professionnelle réalisée par nos experts",
            },
            {
              name: "Pose d'Ongles",
              description:
                "Prestation professionnelle réalisée par nos experts",
            },
            {
              name: "Maquillage",
              description:
                "Prestation professionnelle réalisée par nos experts",
            },
          ],
        },
        team: {
          title: "Notre Équipe",
          subtitle: "Des professionnels à votre service",
          members: [
            {
              name: "Sophie",
              role: "Esthéticienne professionnelle",
              rating: 5,
            },
            { name: "Marie", role: "Esthéticienne professionnelle", rating: 5 },
            { name: "Julie", role: "Esthéticienne professionnelle", rating: 5 },
          ],
        },
        contact: {
          title: "Contactez-nous",
          subtitle: "Nous sommes là pour répondre à vos questions",
          phone: "01 23 45 67 89",
          email: "contact@example.com",
          address: "123 Rue de la Beauté, Paris",
        },
      };
    }
  }, [pageSlug]);

  // Fonction de chargement
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/frontend/content/${pageSlug}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // Organiser le contenu par section
        const organizedContent: any = {};
        result.data.forEach((item: any) => {
          if (!organizedContent[item.sectionSlug]) {
            organizedContent[item.sectionSlug] = {};
          }
          organizedContent[item.sectionSlug][item.dataType] = item.content;
        });

        setContent(organizedContent);
        setLastSync(new Date());
      } else {
        // ✅ CHARGER LE CONTENU PAR DÉFAUT si l'API ne retourne rien
        console.log(
          "⚠️ Aucun contenu en base, chargement des valeurs par défaut..."
        );
        const defaultContent = loadDefaultContent();
        setContent(defaultContent);
        setLastSync(new Date());
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";

      // ✅ En cas d'erreur, charger quand même les valeurs par défaut
      console.warn(
        "⚠️ Erreur chargement API, utilisation du contenu par défaut:",
        errorMessage
      );
      const defaultContent = loadDefaultContent();
      setContent(defaultContent);
      setError(null); // Pas d'erreur fatale, on a le fallback
    } finally {
      setLoading(false);
    }
  }, [pageSlug, loadDefaultContent]);

  // Synchronisation automatique
  useEffect(() => {
    if (!autoSync) return;

    loadContent(); // Chargement initial

    const interval = setInterval(() => {
      loadContent();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, loadContent]);

  return {
    content,
    loading,
    lastSync,
    error,
    reload: loadContent,
  };
}

/**
 * Hook pour charger les avis Google
 */
export function useGoogleReviews(options: { autoSync?: boolean } = {}) {
  const { autoSync = true } = options;

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/frontend/google-reviews");
      const result = await response.json();

      if (result.success) {
        setReviews(result.data);
        setLastSync(new Date());
      } else {
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur chargement avis Google:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoSync) return;

    loadReviews();

    const interval = setInterval(() => {
      loadReviews();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [autoSync, loadReviews]);

  return {
    reviews,
    loading,
    lastSync,
    error,
    reload: loadReviews,
  };
}
