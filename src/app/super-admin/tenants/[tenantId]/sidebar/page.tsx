"use client";

/**
 * PAGE: GESTION SIDEBAR PERSONNALISÉE PAR TENANT
 * ==============================================
 * Permet au super-admin d'ajouter/retirer des éléments sidebar
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Layout,
  Check,
  X,
  Loader2,
  AlertCircle,
  Briefcase,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Tag,
  UserCheck,
  Utensils,
  Grid,
  Dumbbell,
  Sparkles,
  Calendar,
  CreditCard,
  Image,
} from "lucide-react";

interface SidebarElement {
  id: string;
  label: string;
  icon: string;
  href: string;
  category: string | null;
  orderIndex?: number;
  isFromTemplate?: boolean;
}

interface TenantInfo {
  id: string;
  name: string;
  email: string;
  template: string;
}

const iconMap: Record<string, any> = {
  Briefcase,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Tag,
  UserCheck,
  Utensils,
  Grid,
  Dumbbell,
  Sparkles,
  Calendar,
  CreditCard,
  Image,
  Layout,
};

export default function ManageTenantSidebar() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [currentElements, setCurrentElements] = useState<SidebarElement[]>([]);
  const [availableElements, setAvailableElements] = useState<SidebarElement[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    loadSidebarData();
  }, [tenantId]);

  const loadSidebarData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/tenants/${tenantId}/sidebar`);
      const data = await response.json();

      if (data.success) {
        setTenant(data.data.tenant);
        setCurrentElements(data.data.currentElements);
        setAvailableElements(data.data.availableElements);
      } else {
        alert("Erreur: " + data.error);
        router.push("/super-admin/dashboard");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement");
      router.push("/super-admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAddElement = async () => {
    if (!selectedElement) {
      alert("Veuillez sélectionner un élément");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/super-admin/tenants/${tenantId}/sidebar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementId: selectedElement }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setShowAddModal(false);
        setSelectedElement(null);
        await loadSidebarData();
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveElement = async (elementId: string, label: string) => {
    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir retirer "${label}" de la sidebar de ce client ?`
    );
    if (!confirm) return;

    try {
      const response = await fetch(
        `/api/super-admin/tenants/${tenantId}/sidebar?elementId=${elementId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await loadSidebarData();
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/super-admin/dashboard")}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <Layout className="w-8 h-8 text-purple-400" />
                  <h1 className="text-2xl font-bold text-white">
                    Gérer la Sidebar
                  </h1>
                </div>
                {tenant && (
                  <p className="mt-1 text-purple-200">
                    {tenant.name} • {tenant.template}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Ajouter un élément
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Éléments actuels */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <Layout className="w-6 h-6 text-purple-400" />
            Éléments de la sidebar
            <span className="text-sm font-normal text-purple-300">
              ({currentElements.length} éléments)
            </span>
          </h2>

          {currentElements.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-200">Aucun élément dans la sidebar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentElements.map((element) => {
                const IconComponent = iconMap[element.icon] || Layout;
                return (
                  <div
                    key={element.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <IconComponent className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {element.label}
                        </h3>
                        <p className="text-sm text-purple-300">
                          {element.href}
                          {element.category && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-500/20 rounded text-xs">
                              {element.category}
                            </span>
                          )}
                        </p>
                      </div>
                      {element.isFromTemplate && (
                        <span className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Template par défaut
                        </span>
                      )}
                    </div>

                    {!element.isFromTemplate && (
                      <button
                        onClick={() =>
                          handleRemoveElement(element.id, element.label)
                        }
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Éléments disponibles (info) */}
        {availableElements.length > 0 && (
          <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Éléments disponibles à ajouter
              <span className="text-sm font-normal text-purple-300">
                ({availableElements.length} disponibles)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableElements.map((element) => {
                const IconComponent = iconMap[element.icon] || Layout;
                return (
                  <div
                    key={element.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="p-2 bg-purple-500/10 rounded">
                      <IconComponent className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {element.label}
                      </p>
                      <p className="text-xs text-purple-300">{element.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Plus className="w-7 h-7 text-green-400" />
                  Ajouter un élément à la sidebar
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedElement(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {availableElements.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-purple-200">
                    Tous les éléments sont déjà ajoutés !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableElements.map((element) => {
                    const IconComponent = iconMap[element.icon] || Layout;
                    const isSelected = selectedElement === element.id;

                    return (
                      <button
                        key={element.id}
                        onClick={() => setSelectedElement(element.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-green-500/20 border-green-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            isSelected ? "bg-green-500/30" : "bg-purple-500/20"
                          }`}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${
                              isSelected ? "text-green-300" : "text-purple-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-white">
                            {element.label}
                          </h4>
                          <p className="text-sm text-purple-300">
                            {element.href}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                            {element.category}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-6 h-6 text-green-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {availableElements.length > 0 && (
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedElement(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddElement}
                  disabled={!selectedElement || saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

