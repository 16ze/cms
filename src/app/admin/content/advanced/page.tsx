"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Settings,
  FileText,
  Image,
  Grid,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useContentManagementContent } from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "ARCHIVED";
  isActive: boolean;
  orderIndex: number;
  sections: ContentSection[];
}

interface ContentSection {
  id: string;
  sectionName: string;
  sectionType: string;
  orderIndex: number;
  isActive: boolean;
  contentJson?: Record<string, unknown>;
}

export default function AdvancedContentManagement() {
  const contentMgmt = useContentManagementContent();
  const router = useRouter();
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [deletingSection, setDeletingSection] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<{
    id: string;
    name: string;
    pageTitle: string;
  } | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/admin/content/pages");
      const data = await response.json();

      if (data.success) {
        setPages(data.data);
        console.log(contentMgmt.messages.loadSuccess, data.data.length);
        console.log(
          "📄 Sections totales:",
          data.data.reduce(
            (acc: number, page: ContentPage) => acc + page.sections.length,
            0
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Publié";
      case "PENDING":
        return "En attente";
      case "DRAFT":
        return "Brouillon";
      case "ARCHIVED":
        return "Archivé";
      default:
        return status;
    }
  };

  const getSectionTypeIcon = (sectionType: string) => {
    switch (sectionType) {
      case "HERO":
        return <Image className="w-4 h-4" />;
      case "TEXT":
        return <FileText className="w-4 h-4" />;
      case "SERVICES":
        return <Settings className="w-4 h-4" />;
      case "GRID":
        return <Grid className="w-4 h-4" />;
      case "CONTACT":
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSectionTypeLabel = (sectionType: string) => {
    switch (sectionType) {
      case "HERO":
        return "Hero";
      case "TEXT":
        return "Texte";
      case "SERVICES":
        return "Services";
      case "GRID":
        return "Grille";
      case "CONTACT":
        return "Contact";
      default:
        return sectionType;
    }
  };

  const togglePageExpansion = (pageId: string) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const handleEditPage = (slug: string) => {
    router.push(`/admin/content/edit/${slug}`);
  };

  const handlePreviewPage = (slug: string) => {
    // Ouvrir la page dans un nouvel onglet
    window.open(`/${slug}`, "_blank");
  };

  const handleBackToDashboard = () => {
    router.push("/admin");
  };

  const handleDeleteSection = (section: ContentSection, pageTitle: string) => {
    setSectionToDelete({
      id: section.id,
      name: section.sectionName,
      pageTitle: pageTitle,
    });
    setShowDeleteModal(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
      setDeletingSection(sectionToDelete.id);
      
      const response = await fetch(
        `/api/admin/content/sections?id=${sectionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Rafraîchir la liste des pages
        await fetchPages();
        
        // Fermer le modal
        setShowDeleteModal(false);
        setSectionToDelete(null);
        
        console.log(`${contentMgmt.messages.deleteSuccess}: "${sectionToDelete.name}"`);
      } else {
        console.error("❌ Erreur lors de la suppression:", data.error);
        alert(`Erreur lors de la suppression: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la section:", error);
      alert("Erreur lors de la suppression de la section");
    } finally {
      setDeletingSection(null);
    }
  };

  const cancelDeleteSection = () => {
    setShowDeleteModal(false);
    setSectionToDelete(null);
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedAdminPage page="content">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {/* Bouton retour */}
        <div className="mb-3 sm:mb-4">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour au dashboard</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Gestion Avancée du Contenu
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Gérez toutes les pages et sections de votre site avec
              prévisualisation en temps réel
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              📊 Pages chargées: {pages.length}, Sections totales:{" "}
              {pages.reduce((acc, page) => acc + page.sections.length, 0)}
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nouvelle page</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Rechercher une page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Liste des pages */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Pages du site ({filteredPages.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPages.map((page) => (
            <div key={page.id} className="hover:bg-gray-50 transition-colors">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => togglePageExpansion(page.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedPages.has(page.id) ? (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {page.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            page.status
                          )}`}
                        >
                          {getStatusLabel(page.status)}
                        </span>
                        {!page.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 ml-6 sm:ml-8">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />/
                        {page.slug}
                      </span>
                      <span className="flex items-center gap-1">
                        <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                        {page.sections.length} sections
                      </span>
                      {page.metaTitle && (
                        <span className="flex items-center gap-1">
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                          SEO configuré
                        </span>
                      )}
                    </div>

                    {page.metaDescription && (
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 ml-6 sm:ml-8">
                        {page.metaDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handlePreviewPage(page.slug)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 sm:p-2"
                      title="Prévisualiser la page"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleEditPage(page.slug)}
                      className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Modifier</span>
                      <span className="sm:hidden">Modif.</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sections de la page */}
              {expandedPages.has(page.id) && (
                <div className="bg-gray-50 border-t border-gray-200">
                  <div className="px-4 sm:px-6 py-3 sm:py-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                      Sections de la page &quot;{page.title}&quot;
                    </h4>
                    <div className="space-y-2">
                      {page.sections.length > 0 ? (
                        page.sections
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((section) => (
                            <div
                              key={section.id}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {getSectionTypeIcon(section.sectionType)}
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                      <span className="font-medium text-gray-900 text-sm">
                                        {section.sectionName}
                                      </span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {getSectionTypeLabel(
                                          section.sectionType
                                        )}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        #{section.orderIndex}
                                      </span>
                                    </div>
                                    {section.contentJson && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {
                                          Object.keys(section.contentJson)
                                            .length
                                        }{" "}
                                        propriétés
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!section.isActive && (
                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                      Inactive
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleEditPage(page.slug)}
                                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSection(section, page.title)}
                                    disabled={deletingSection === section.id}
                                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    title="Supprimer cette section"
                                  >
                                    {deletingSection === section.id ? (
                                      <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                    <span className="hidden sm:inline">Supprimer</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Aucune section pour cette page
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Aucune page trouvée
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {searchTerm
                ? contentMgmt.emptyStates.noResults
                : contentMgmt.emptyStates.noPages}
            </p>
            {!searchTerm && (
              <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                Créer une page
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Supprimer la section
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir supprimer la section :
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    "{sectionToDelete.name}"
                  </p>
                  <p className="text-sm text-gray-600">
                    de la page "{sectionToDelete.pageTitle}"
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ Cette action supprimera définitivement la section et son contenu.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteSection}
                  disabled={deletingSection !== null}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteSection}
                  disabled={deletingSection !== null}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingSection && (
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedAdminPage>
  );
}
