import { useState, useEffect, useCallback } from "react";

interface RealtimeContentOptions {
  type: "media" | "text" | "section" | "button";
  autoSync?: boolean;
  syncInterval?: number;
}

export function useRealtimeContent(options: RealtimeContentOptions) {
  const { type, autoSync = true, syncInterval = 5000 } = options;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction de chargement des données
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Mapper les types aux endpoints API corrects
      const endpointMap: Record<string, string> = {
        text: "textes",
        section: "sections",
        button: "boutons",
        media: "medias",
      };

      const endpoint = endpointMap[type] || `${type}s`;
      const response = await fetch(`/api/admin/contenu/${endpoint}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastSync(new Date());
        setHasChanges(false);
      } else {
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error(`Erreur chargement ${type}:`, err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Synchronisation automatique
  useEffect(() => {
    if (!autoSync) return;

    loadData(); // Chargement initial

    const interval = setInterval(() => {
      if (!hasChanges) {
        loadData();
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, loadData, hasChanges]);

  // Fonction de sauvegarde avec synchronisation
  const saveData = useCallback(
    async (newData: any) => {
      setLoading(true);
      setError(null);

      try {
        // Mapper les types aux endpoints API corrects
        const endpointMap: Record<string, string> = {
          text: "textes",
          section: "sections",
          button: "boutons",
          media: "medias",
        };

        const endpoint = endpointMap[type] || `${type}s`;
        const response = await fetch(`/api/admin/contenu/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        const result = await response.json();

        if (result.success) {
          setHasChanges(true);
          await loadData(); // Recharger immédiatement
          return result.data;
        } else {
          throw new Error(result.error || "Erreur lors de la sauvegarde");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error(`Erreur sauvegarde ${type}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type, loadData]
  );

  // Fonction de mise à jour
  const updateData = useCallback(
    async (id: string, updatedData: any) => {
      setLoading(true);
      setError(null);

      try {
        // Mapper les types aux endpoints API corrects
        const endpointMap: Record<string, string> = {
          text: "textes",
          section: "sections",
          button: "boutons",
          media: "medias",
        };

        const endpoint = endpointMap[type] || `${type}s`;
        const response = await fetch(`/api/admin/contenu/${endpoint}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        const result = await response.json();

        if (result.success) {
          setHasChanges(true);
          await loadData(); // Recharger immédiatement
          return result.data;
        } else {
          throw new Error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error(`Erreur mise à jour ${type}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type, loadData]
  );

  // Fonction de suppression
  const deleteData = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        // Mapper les types aux endpoints API corrects
        const endpointMap: Record<string, string> = {
          text: "textes",
          section: "sections",
          button: "boutons",
          media: "medias",
        };

        const endpoint = endpointMap[type] || `${type}s`;
        const response = await fetch(`/api/admin/contenu/${endpoint}/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          setHasChanges(true);
          await loadData(); // Recharger immédiatement
          return true;
        } else {
          throw new Error(result.error || "Erreur lors de la suppression");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error(`Erreur suppression ${type}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type, loadData]
  );

  return {
    data,
    loading,
    lastSync,
    hasChanges,
    error,
    loadData,
    saveData,
    updateData,
    deleteData,
  };
}
