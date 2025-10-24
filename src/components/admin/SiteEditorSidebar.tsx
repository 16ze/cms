"use client";

import { useState, useEffect } from "react";
import {
  Save,
  ArrowLeft,
  Sparkles,
  Users,
  Phone,
  Calendar,
} from "lucide-react";

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

  const sections = [
    { id: "hero", label: "Hero", icon: Sparkles },
    { id: "services", label: "Services", icon: Calendar },
    { id: "team", label: "Équipe", icon: Users },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  // Initialiser les champs selon la section active
  const initializeFields = (sectionId: string) => {
    const sectionContent = content?.[sectionId]?.text?.content || {};

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

  // Initialiser au premier rendu et quand activeSection change
  useEffect(() => {
    initializeFields(activeSection);
  }, [activeSection]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFields((prev: any) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(activeSection, fields);
      alert("✅ Contenu sauvegardé avec succès !");
    } catch (error) {
      alert("❌ Erreur lors de la sauvegarde");
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
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
