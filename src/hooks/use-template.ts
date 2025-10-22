import { useState, useEffect, useCallback } from 'react';

export function useTemplate() {
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.warn('Templates not loaded:', err);
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, []);

  const fetchCurrentTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/templates/active');
      const data = await response.json();
      if (data.success) {
        setCurrentTemplate(data.data);
      }
    } catch (err) {
      console.warn('Current template not loaded:', err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  const activateTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch('/api/admin/templates/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      const data = await response.json();
      if (data.success) {
        await fetchCurrentTemplate();
        window.location.reload();
      }
      return data.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [fetchCurrentTemplate]);

  useEffect(() => {
    fetchTemplates();
    fetchCurrentTemplate();
  }, [fetchTemplates, fetchCurrentTemplate]);

  return {
    currentTemplate,
    templates,
    loading,
    error,
    activateTemplate,
    refresh: fetchCurrentTemplate
  };
}
