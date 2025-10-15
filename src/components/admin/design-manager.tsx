"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Type,
  Ruler,
  Image,
  Settings,
  Save,
  Undo,
  Eye,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { useDesignSync } from "@/hooks/use-design-sync";
import ColorManager from "./design/color-manager";
import TypographyManager from "./design/typography-manager";
import SpacingManager from "./design/spacing-manager";
import BackgroundManager from "./design/background-manager";
import ThemeManager from "./design/theme-manager";
import LivePreview from "./design/live-preview";

interface DesignManagerProps {
  sectionId?: string;
  pageId?: string;
  onClose: () => void;
}

type DesignTab = "colors" | "typography" | "spacing" | "backgrounds" | "themes";

export default function DesignManager({
  sectionId,
  pageId,
  onClose,
}: DesignManagerProps) {
  const [activeTab, setActiveTab] = useState<DesignTab>("colors");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const {
    designSettings,
    loading,
    error,
    lastUpdate,
    refreshDesignSettings,
    saveDesignSettings,
  } = useDesignSync();

  const tabs = [
    { id: "colors", label: "Couleurs", icon: Palette },
    { id: "typography", label: "Typographie", icon: Type },
    { id: "spacing", label: "Espacements", icon: Ruler },
    { id: "backgrounds", label: "Arrière-plans", icon: Image },
    { id: "themes", label: "Thèmes", icon: Settings },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sauvegarder les modifications selon le contexte
      if (sectionId) {
        // Sauvegarder les styles de section
        await saveSectionStyles(sectionId);
      } else if (pageId) {
        // Sauvegarder les styles de page
        await savePageStyles(pageId);
      } else {
        // Sauvegarder les paramètres globaux avec synchronisation
        const result = await saveDesignSettings(designSettings || {});
        if (result.success) {
          console.log("Design sauvegardé et synchronisé avec succès");
        } else {
          throw new Error(result.error);
        }
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveSectionStyles = async (sectionId: string) => {
    // TODO: Implémenter la sauvegarde des styles de section
    console.log("Sauvegarde des styles de section:", sectionId);
  };

  const savePageStyles = async (pageId: string) => {
    // TODO: Implémenter la sauvegarde des styles de page
    console.log("Sauvegarde des styles de page:", pageId);
  };

  const saveGlobalSettings = async () => {
    // TODO: Implémenter la sauvegarde des paramètres globaux
    console.log("Sauvegarde des paramètres globaux");
  };

  const handleTabChange = (tab: DesignTab) => {
    if (hasChanges) {
      const confirmed = confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous continuer ?"
      );
      if (!confirmed) return;
    }
    setActiveTab(tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "colors":
        return <ColorManager onChanges={() => setHasChanges(true)} />;
      case "typography":
        return <TypographyManager onChanges={() => setHasChanges(true)} />;
      case "spacing":
        return <SpacingManager onChanges={() => setHasChanges(true)} />;
      case "backgrounds":
        return <BackgroundManager onChanges={() => setHasChanges(true)} />;
      case "themes":
        return <ThemeManager onChanges={() => setHasChanges(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestionnaire de Design
            </h2>
            <p className="text-gray-600 mt-1">
              {sectionId
                ? "Personnalisation de la section"
                : pageId
                ? "Personnalisation de la page"
                : "Paramètres globaux"}
            </p>
            {!sectionId && !pageId && (
              <div className="flex items-center space-x-2 mt-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-xs text-blue-600 font-medium">
                  Synchronisation en temps réel
                </span>
                {lastUpdate && (
                  <span className="text-xs text-gray-500">
                    Dernière mise à jour:{" "}
                    {lastUpdate.toLocaleTimeString("fr-FR")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLivePreview(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Prévisualiser
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as DesignTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="flex-1 overflow-auto p-6">{renderActiveTab()}</div>

        {/* Footer avec indicateur de changements */}
        {hasChanges && (
          <div className="border-t border-gray-200 p-4 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Modifications non sauvegardées
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHasChanges(false)}
                  className="text-sm text-yellow-700 hover:text-yellow-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prévisualisation temps réel */}
        {showLivePreview && (
          <LivePreview
            sectionId={sectionId}
            pageId={pageId}
            onClose={() => setShowLivePreview(false)}
          />
        )}
      </div>
    </div>
  );
}
