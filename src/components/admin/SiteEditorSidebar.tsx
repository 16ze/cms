"use client";

import { useState, useEffect } from "react";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Users,
  Phone,
  Calendar,
  Image as ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import { useContentEditor } from "@/context/ContentEditorContext";
import { useDebounce } from "@/hooks/use-debounce";
import { validateContent } from "@/lib/sanitize";
import { captureClientError } from "@/lib/errors";
import { toast } from "sonner";
import MediaPicker from "./MediaPicker";
import ColorPicker from "./ColorPicker";

interface SiteEditorSidebarProps {
  content: any;
  onSave: (section: string, data: any) => Promise<void>;
  onBack: () => void;
}

export default function SiteEditorSidebar({
  content,
  onSave,
  onBack,
}: SiteEditorSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [fields, setFields] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [showUndo, setShowUndo] = useState(false);

  // ✅ Utiliser le Context pour la gestion d'état global
  const { updateSectionContent, getSectionContent } = useContentEditor();

  const sections = [
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "services", label: "Services", icon: Calendar },
    { id: "team", label: "Équipe", icon: Users },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  // Initialiser les champs selon la section active
  const initializeFields = (sectionId: string) => {
    // Structure attendue: content.hero.text (données directes)
    // La structure est: { hero: { text: { title, subtitle, ... } } }
    const sectionContent = content?.[sectionId]?.text || {};

    switch (sectionId) {
      case "hero":
        setFields({
          title: sectionContent.title || "",
          subtitle: sectionContent.subtitle || "",
          primaryButton: sectionContent.primaryButton || { text: "", url: "" },
          secondaryButton: sectionContent.secondaryButton || {
            text: "",
            url: "",
          },
        });
        break;
      case "services":
        setFields({
          title: sectionContent.title || "",
          subtitle: sectionContent.subtitle || "",
        });
        break;
      case "team":
        setFields({
          title: sectionContent.title || "",
          subtitle: sectionContent.subtitle || "",
        });
        break;
      case "contact":
        setFields({
          title: sectionContent.title || "",
          subtitle: sectionContent.subtitle || "",
          phone: sectionContent.phone || "",
          email: sectionContent.email || "",
          address: sectionContent.address || "",
        });
        break;
      default:
        setFields({});
    }
  };

  // Initialiser les champs au chargement et quand la section change
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    initializeFields(sectionId);
  };

  // Initialiser au premier rendu et quand activeSection OU content change
  useEffect(() => {
    if (content && Object.keys(content).length > 0) {
      initializeFields(activeSection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, content]);

  // Debounce des champs pour sauvegarde automatique après 500ms d'inactivité
  const debouncedFields = useDebounce(fields, 500);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (debouncedFields && Object.keys(debouncedFields).length > 0) {
      // Valider le contenu avant sauvegarde
      if (!validateContent(debouncedFields)) {
        captureClientError(new Error("Contenu invalide détecté"), {
          component: "SiteEditorSidebar",
          action: "auto-save-validation-failed",
          metadata: { section: activeSection },
        });
        return;
      }

      // Sauvegarde automatique silencieuse
      onSave(activeSection, debouncedFields).catch((error) => {
        captureClientError(error, {
          component: "SiteEditorSidebar",
          action: "auto-save-error",
          metadata: { section: activeSection },
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFields]);

  const handleFieldChange = (fieldId: string, value: any) => {
    // Mise à jour du state local
    setFields((prev: any) => {
      const newFields = { ...prev, [fieldId]: value };

      // ✅ Mise à jour immédiate via le Context pour synchronisation globale
      updateSectionContent(activeSection, newFields);

      return newFields;
    });
  };

  const handleSave = async () => {
    // Valider le contenu avant sauvegarde manuelle
    if (!validateContent(fields)) {
      toast.error("Le contenu contient des erreurs. Veuillez vérifier.");
      captureClientError(new Error("Contenu invalide lors de la sauvegarde manuelle"), {
        component: "SiteEditorSidebar",
        action: "manual-save-validation-failed",
        metadata: { section: activeSection },
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(activeSection, fields);
      toast.success("Contenu sauvegardé avec succès");

      // Déclencher l'événement de mise à jour pour recharger l'iframe
      window.dispatchEvent(new CustomEvent("content-updated"));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
      toast.error(errorMessage);
      captureClientError(error, {
        component: "SiteEditorSidebar",
        action: "manual-save-error",
        metadata: { section: activeSection },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header avec bouton retour */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au menu</span>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Éditeur de Site</h2>
      </div>

      {/* Navigation des sections */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'éditeur */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre Principal
            </label>
            <input
              type="text"
              value={fields.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Bienvenue dans votre salon de beauté"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-titre
            </label>
            <textarea
              value={fields.subtitle || ""}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Prenez soin de vous..."
            />
          </div>

          {/* Image Hero */}
          {activeSection === "hero" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de fond
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fields.image || ""}
                  onChange={(e) => handleFieldChange("image", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="/images/hero.jpg"
                />
                <button
                  onClick={() => {
                    setMediaPickerField("image");
                    setShowMediaPicker(true);
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                  title="Sélectionner une image"
                >
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Boutons (Hero uniquement) */}
          {activeSection === "hero" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton Principal
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Texte du bouton"
                    value={fields.primaryButton?.text || ""}
                    onChange={(e) =>
                      handleFieldChange("primaryButton", {
                        ...fields.primaryButton,
                        text: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={fields.primaryButton?.url || ""}
                    onChange={(e) =>
                      handleFieldChange("primaryButton", {
                        ...fields.primaryButton,
                        url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ColorPicker
                    label="Couleur du bouton"
                    value={fields.primaryButton?.color || "#ec4899"}
                    onChange={(color) =>
                      handleFieldChange("primaryButton", {
                        ...fields.primaryButton,
                        color,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton Secondaire
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Texte du bouton"
                    value={fields.secondaryButton?.text || ""}
                    onChange={(e) =>
                      handleFieldChange("secondaryButton", {
                        ...fields.secondaryButton,
                        text: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={fields.secondaryButton?.url || ""}
                    onChange={(e) =>
                      handleFieldChange("secondaryButton", {
                        ...fields.secondaryButton,
                        url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <ColorPicker
                    label="Couleur du bouton"
                    value={fields.secondaryButton?.color || "#ffffff"}
                    onChange={(color) =>
                      handleFieldChange("secondaryButton", {
                        ...fields.secondaryButton,
                        color,
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Contact Info (Contact uniquement) */}
          {activeSection === "contact" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={fields.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={fields.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  value={fields.address || ""}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer avec bouton sauvegarder */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Boutons de contrôle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              previewMode === "desktop"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Mode Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode("tablet")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              previewMode === "tablet"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Mode Tablette"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              previewMode === "mobile"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Mode Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            handleFieldChange(mediaPickerField, url);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
          currentValue={fields[mediaPickerField]}
        />
      )}
    </div>
  );
}
