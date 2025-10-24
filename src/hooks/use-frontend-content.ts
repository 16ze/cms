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

  // Fonction de chargement
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/frontend/content/${pageSlug}`);
      const result = await response.json();

      if (result.success) {
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
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error(`Erreur chargement contenu ${pageSlug}:`, err);
    } finally {
      setLoading(false);
    }
  }, [pageSlug]);

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
