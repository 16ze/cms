"use client";

import { useState } from "react";
import { useTemplate } from "@/hooks/use-template";
import { Layout, Check, Eye, Settings as SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const { templates, currentTemplate, loading, activateTemplate } = useTemplate();
  const router = useRouter();
  const [activating, setActivating] = useState<string | null>(null);

  const handleActivate = async (templateId: string) => {
    setActivating(templateId);
    await activateTemplate(templateId);
    setActivating(null);
  };

  const templateCategories: Record<string, { label: string; color: string }> = {
    CORPORATE: { label: "Corporate", color: "blue" },
    ECOMMERCE: { label: "E-commerce", color: "green" },
    PORTFOLIO: { label: "Portfolio", color: "purple" },
    BLOG: { label: "Blog", color: "orange" },
    RESTAURANT: { label: "Restaurant", color: "red" },
    WELLNESS: { label: "Bien-être", color: "teal" },
    BEAUTY: { label: "Beauté", color: "pink" },
    CONSULTATION: { label: "Consultation", color: "blue" },
    SERVICES: { label: "Prestations Pro", color: "indigo" }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Templates</h1>
        <p className="text-gray-600">
          Sélectionnez et personnalisez le template de votre site
        </p>
      </div>

      {currentTemplate && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Template Actuel
              </h2>
              <p className="text-lg text-blue-600 font-medium">
                {currentTemplate.displayName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentTemplate.description}
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/templates/customize/${currentTemplate.id}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <SettingsIcon className="w-5 h-5" />
              Personnaliser
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => {
          const isActive = currentTemplate?.id === template.id;
          const category = templateCategories[template.category];
          
          return (
            <div
              key={template.id}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    <Check className="w-3 h-3" />
                    Actif
                  </span>
                </div>
              )}

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 bg-${category.color}-100 text-${category.color}-700 text-xs font-medium rounded-full mb-3`}>
                  {category.label}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.displayName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
              </div>

              <div className="flex gap-2">
                {!isActive && (
                  <button
                    onClick={() => handleActivate(template.id)}
                    disabled={activating === template.id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {activating === template.id ? "Activation..." : "Activer"}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/admin/templates/preview/${template.id}`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
