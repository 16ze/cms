"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Eye, Settings } from "lucide-react";
import SectionEditor from "@/components/admin/section-editor";

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
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
  contentJson: any;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/content/pages/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setPage(data.data);
      } else {
        console.error('Erreur lors du chargement de la page:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSave = async (sectionId: string, content: any) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/content/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentJson: content }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour l'état local
        setPage(prevPage => {
          if (!prevPage) return null;
          
          return {
            ...prevPage,
            sections: prevPage.sections.map(section =>
              section.id === sectionId
                ? { ...section, contentJson: content }
                : section
            )
          };
        });
        
        console.log('Section sauvegardée avec succès');
      } else {
        console.error('Erreur lors de la sauvegarde:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePageSave = async () => {
    if (!page) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/content/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: page.title,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          status: page.status,
          isActive: page.isActive,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Page sauvegardée avec succès');
      } else {
        console.error('Erreur lors de la sauvegarde:', data.error);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Page non trouvée
            </h1>
            <p className="text-gray-600 mb-6">
              La page que vous recherchez n'existe pas.
            </p>
            <button
              onClick={() => router.push('/admin/content/advanced')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/content/advanced')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Édition : {page.title}
                </h1>
                <p className="text-sm text-gray-600">
                  /{page.slug} • {page.sections.length} sections
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Masquer' : 'Prévisualiser'}
              </button>
              
              <button
                onClick={handlePageSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder la page'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau d'édition des sections */}
          <div className="lg:col-span-2 space-y-6">
            {page.sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onSave={handleSectionSave}
              />
            ))}
          </div>

          {/* Panneau latéral - Métadonnées et SEO */}
          <div className="space-y-6">
            {/* Informations de la page */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Informations de la page
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la page
                  </label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={page.slug}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'URL de la page (non modifiable)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={page.status}
                    onChange={(e) => setPage({ ...page, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PENDING">En attente</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={page.isActive}
                    onChange={(e) => setPage({ ...page, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Page active
                  </label>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Optimisation SEO
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre SEO
                  </label>
                  <input
                    type="text"
                    value={page.metaTitle || ''}
                    onChange={(e) => setPage({ ...page, metaTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description SEO
                  </label>
                  <textarea
                    value={page.metaDescription || ''}
                    onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description pour les moteurs de recherche"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
