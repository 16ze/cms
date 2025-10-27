/**
 * CONTEXT: Frontend Content Editor
 * ===============================
 * Gère le state global du contenu édité avec synchronisation temps réel
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ContentEditorContextType {
  // State actuel du contenu
  editedContent: Record<string, any>;

  // Mettre à jour le contenu d'une section
  updateSectionContent: (section: string, data: any) => void;

  // Obtenir le contenu d'une section
  getSectionContent: (section: string) => any;

  // Réinitialiser le contenu
  resetContent: () => void;

  // Vérifier si des changements ont été faits
  hasChanges: boolean;

  // Recharger depuis la source
  reloadFromSource: (newContent: Record<string, any>) => void;

  // ✅ NOUVEAU: Contrôle du refresh automatique
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;

  // ✅ NOUVEAU: Force un refresh manuel
  triggerManualRefresh: () => void;
}

const ContentEditorContext = createContext<
  ContentEditorContextType | undefined
>(undefined);

export function ContentEditorProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  initialContent?: Record<string, any>;
}) {
  const [editedContent, setEditedContent] = useState<Record<string, any>>(
    initialContent || {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ NOUVEAU: Contrôle du refresh automatique (désactivé par défaut)
  const [autoRefresh, setAutoRefresh] = useState(false);

  const updateSectionContent = useCallback(
    (section: string, data: any) => {
      setEditedContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          text: data, // Les données sont stockées sous "text" dans le schéma
        },
      }));
      setHasChanges(true);

      // ✅ Diffusion MANUELLE (seulement si autoRefresh = true)
      if (autoRefresh) {
        window.dispatchEvent(
          new CustomEvent("content-changed", {
            detail: {
              section,
              data,
            },
          })
        );
      }
    },
    [autoRefresh]
  );

  const getSectionContent = useCallback(
    (section: string) => {
      return editedContent[section]?.text || {};
    },
    [editedContent]
  );

  const resetContent = useCallback(() => {
    setEditedContent(initialContent || {});
    setHasChanges(false);
  }, [initialContent]);

  const reloadFromSource = useCallback((newContent: Record<string, any>) => {
    setEditedContent(newContent);
    setHasChanges(false);
  }, []);

  // ✅ NOUVEAU: Force un refresh manuel
  const triggerManualRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent("content-updated"));
  }, []);

  return (
    <ContentEditorContext.Provider
      value={{
        editedContent,
        updateSectionContent,
        getSectionContent,
        resetContent,
        hasChanges,
        reloadFromSource,
        autoRefresh,
        setAutoRefresh,
        triggerManualRefresh,
      }}
    >
      {children}
    </ContentEditorContext.Provider>
  );
}

export function useContentEditor() {
  const context = useContext(ContentEditorContext);
  if (!context) {
    throw new Error(
      "useContentEditor must be used within ContentEditorProvider"
    );
  }
  return context;
}
