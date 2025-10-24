"use client";

import { useState, useEffect } from "react";
import {
  Image,
  Video,
  FileText,
  Layout,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { useRealtimeContent } from "@/hooks/use-realtime-content";
import AddTextModal from "@/components/admin/modals/AddTextModal";
import AddSectionModal from "@/components/admin/modals/AddSectionModal";
import AddButtonModal from "@/components/admin/modals/AddButtonModal";

type ContentTab = "medias" | "textes" | "sections" | "boutons";

export default function ContenuPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("medias");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<
    "text" | "section" | "button"
  >("text");

  // Hooks de synchronisation temps réel
  const textesHook = useRealtimeContent({ type: "text", autoSync: true });
  const sectionsHook = useRealtimeContent({ type: "section", autoSync: true });
  const boutonsHook = useRealtimeContent({ type: "button", autoSync: true });

  // Détecter les ancres dans l'URL pour activer le bon onglet
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ["medias", "textes", "sections", "boutons"].includes(hash)) {
      setActiveTab(hash as ContentTab);
    }
  }, []);

  // Handler pour ouvrir le modal d'ajout
  const handleAddClick = (type: string) => {
    setAddModalType(type as any);
    setShowAddModal(true);
  };

  // Handler pour sauvegarder depuis le modal
  const handleSaveFromModal = async (data: any) => {
    try {
      if (addModalType === "text") await textesHook.saveData(data);
      else if (addModalType === "section") await sectionsHook.saveData(data);
      else if (addModalType === "button") await boutonsHook.saveData(data);

      setShowAddModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm(`Supprimer cet élément ?`)) return;

    try {
      if (type === "texte") await textesHook.deleteData(id);
      else if (type === "section") await sectionsHook.deleteData(id);
      else if (type === "bouton") await boutonsHook.deleteData(id);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleEdit = (item: any, type: string) => {
    console.log("🔧 Édition de l'élément:", item, "Type:", type);
    setEditingItem({ ...item, type });
    setShowModal(true);
  };

  // Fonction pour formater la dernière synchronisation
  const formatLastSync = (date: Date | null) => {
    if (!date) return "Jamais";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `Il y a ${diff}s`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    return `Il y a ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion du Contenu
            </h1>
            <p className="text-gray-600">
              Gérez les photos, vidéos, textes, sections et boutons de votre
              site
            </p>
          </div>
          {/* Indicateur de synchronisation */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`w-4 h-4 ${
                  textesHook.loading ||
                  sectionsHook.loading ||
                  boutonsHook.loading
                    ? "animate-spin"
                    : ""
                }`}
              />
              <span>Sync: {formatLastSync(textesHook.lastSync)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "medias", label: "Médias", icon: Image },
            { id: "textes", label: "Textes", icon: FileText },
            { id: "sections", label: "Sections", icon: Layout },
            { id: "boutons", label: "Boutons", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ContentTab)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Médias */}
        {activeTab === "medias" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Photos & Vidéos
                </h3>
                <button
                  onClick={() => alert("Modal Médias à créer")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Ajouter un média
                </button>
              </div>
              <p className="text-gray-500 text-center py-8">
                Aucun média disponible. Cliquez sur "Ajouter un média" pour
                commencer.
              </p>
            </div>
          </div>
        )}

        {/* Onglet Textes */}
        {activeTab === "textes" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Textes du Site
                </h3>
                <button
                  onClick={() => handleAddClick("text")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un texte
                </button>
              </div>

              {/* Liste des textes */}
              {textesHook.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun texte disponible. Cliquez sur "Ajouter un texte" pour
                  commencer.
                </p>
              ) : (
                <div className="space-y-4">
                  {textesHook.data.map((texte) => (
                    <div
                      key={texte.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {texte.title || "Texte sans titre"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Page: {texte.pageSlug || "N/A"} - Section:{" "}
                            {texte.sectionId || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(texte, "texte")}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(texte.id, "texte")}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {texte.content || "Aucun contenu"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Sections */}
        {activeTab === "sections" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sections de Pages
                </h3>
                <button
                  onClick={() => handleAddClick("section")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une section
                </button>
              </div>

              {/* Liste des sections */}
              {sectionsHook.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucune section disponible. Cliquez sur "Ajouter une section"
                  pour commencer.
                </p>
              ) : (
                <div className="space-y-4">
                  {sectionsHook.data.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {section.sectionId || "Section sans ID"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Page: {section.pageSlug || "N/A"} - Ordre:{" "}
                            {section.orderIndex || 0}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(section, "section")}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(section.id, "section")}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            section.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Boutons */}
        {activeTab === "boutons" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Boutons d'Action
                </h3>
                <button
                  onClick={() => handleAddClick("button")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un bouton
                </button>
              </div>

              {/* Liste des boutons */}
              {boutonsHook.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun bouton disponible. Cliquez sur "Ajouter un bouton" pour
                  commencer.
                </p>
              ) : (
                <div className="space-y-4">
                  {boutonsHook.data.map((bouton) => (
                    <div
                      key={bouton.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {bouton.label || "Bouton sans label"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Style: {bouton.style || "N/A"} - Couleur:{" "}
                            {bouton.color || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(bouton, "bouton")}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bouton.id, "bouton")}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-lg inline-block`}
                        style={{
                          background: bouton.color || "#9333ea",
                          color: "white",
                        }}
                      >
                        {bouton.label || "Bouton"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals d'ajout */}
      {showAddModal && addModalType === "text" && (
        <AddTextModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveFromModal}
        />
      )}

      {showAddModal && addModalType === "section" && (
        <AddSectionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveFromModal}
        />
      )}

      {showAddModal && addModalType === "button" && (
        <AddButtonModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveFromModal}
        />
      )}

      {/* Modal d'édition */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Éditer l'élément</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Mode édition pour: <strong>{editingItem.type}</strong>
              </p>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(editingItem, null, 2)}
              </pre>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert("Fonctionnalité de sauvegarde à implémenter");
                  }}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
