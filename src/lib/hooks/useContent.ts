"use client";

import { useState, useEffect, useCallback } from "react";

export interface PageContent {
  [key: string]: unknown;
}

export interface SiteContent {
  home: PageContent;
  about: PageContent;
  services: PageContent;
  freelance: PageContent;
  contact: PageContent;

  [key: string]: PageContent;
}

/**
 * Hook simplifié pour charger le contenu depuis JSON
 * Plus de WebSocket, plus de fallback hardcodé - charge directement depuis l'API JSON
 */
export function useContent(
  pageName?: string,
  options: { realtime?: boolean } = {}
) {
  const [content, setContent] = useState<SiteContent | PageContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = pageName
        ? `/api/public/content?page=${encodeURIComponent(pageName)}`
        : "/api/public/content";

      const response = await fetch(url, {
        headers: {
          "cache-control": "no-cache",
        },
      });

      if (response.status === 304) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (pageName) {
        if (data[pageName]) {
          setContent(data[pageName]);
        } else {
          setContent(null);
        }
      } else {
        setContent(data);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement du contenu:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [pageName]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    isConnected: false,
    lastUpdate: null,
    refresh: fetchContent,
  };
}
