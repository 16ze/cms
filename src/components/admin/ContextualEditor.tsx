"use client";

import { useState, useEffect } from "react";
import { Save, X, Type, Image, Palette, MousePointer } from "lucide-react";

interface EditableField {
  id: string;
  label: string;
  type: "text" | "textarea" | "image" | "button" | "color";
  value: any;
}

interface ContextualEditorProps {
  section: string;
  content: any;
  onSave: (data: any) => Promise<void>;
}

export default function ContextualEditor({
  section,
  content,
  onSave,
}: ContextualEditorProps) {
  const [fields, setFields] = useState<EditableField[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Générer les champs selon la section
    generateFields(section, content);
  }, [section, content]);

  const generateFields = (sectionId: string, data: any) => {
    let newFields: EditableField[] = [];

    switch (sectionId) {
      case "hero":
        newFields = [
          {
            id: "title",
            label: "Titre Principal",
            type: "text",
            value: data?.title || "",
          },
          {
            id: "subtitle",
            label: "Sous-titre",
            type: "textarea",
            value: data?.subtitle || "",
          },
          {
            id: "primaryButton",
            label: "Bouton Principal",
            type: "button",
            value: data?.primaryButton || { text: "", url: "" },
          },
          {
            id: "secondaryButton",
            label: "Bouton Secondaire",
            type: "button",
            value: data?.secondaryButton || { text: "", url: "" },
          },
        ];
        break;

      case "services":
        newFields = [
          {
            id: "title",
            label: "Titre de la Section",
            type: "text",
            value: data?.title || "",
          },
          {
            id: "subtitle",
            label: "Sous-titre",
            type: "textarea",
            value: data?.subtitle || "",
          },
        ];
        break;

      case "team":
        newFields = [
          {
            id: "title",
            label: "Titre de la Section",
            type: "text",
            value: data?.title || "",
          },
          {
            id: "subtitle",
            label: "Sous-titre",
            type: "textarea",
            value: data?.subtitle || "",
          },
        ];
        break;

      case "contact":
        newFields = [
          {
            id: "title",
            label: "Titre de la Section",
            type: "text",
            value: data?.title || "",
          },
          {
            id: "subtitle",
            label: "Sous-titre",
            type: "textarea",
            value: data?.subtitle || "",
          },
          {
            id: "phone",
            label: "Téléphone",
            type: "text",
            value: data?.phone || "",
          },
          {
            id: "email",
            label: "Email",
            type: "text",
            value: data?.email || "",
          },
          {
            id: "address",
            label: "Adresse",
            type: "textarea",
            value: data?.address || "",
          },
        ];
        break;

      default:
        newFields = [];
    }

    setFields(newFields);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, value } : field))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave: any = {};
      fields.forEach((field) => {
        dataToSave[field.id] = field.value;
      });
      await onSave(dataToSave);
      alert("✅ Contenu sauvegardé avec succès !");
    } catch (error) {
      alert("❌ Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "text":
      case "textarea":
        return <Type className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      case "button":
        return <MousePointer className="w-4 h-4" />;
      case "color":
        return <Palette className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Éditeur - {section}
        </h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {getFieldIcon(field.type)}
              {field.label}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            )}

            {field.type === "textarea" && (
              <textarea
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            )}

            {field.type === "button" && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Texte du bouton"
                  value={field.value?.text || ""}
                  onChange={(e) =>
                    handleFieldChange(field.id, {
                      ...field.value,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={field.value?.url || ""}
                  onChange={(e) =>
                    handleFieldChange(field.id, {
                      ...field.value,
                      url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
