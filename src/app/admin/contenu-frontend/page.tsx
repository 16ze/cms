"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
} from "lucide-react";

export default function ContenuFrontendPage() {
  const [activeTab, setActiveTab] = useState<
    "hero" | "services" | "team" | "contact" | "reviews"
  >("hero");
  const [loading, setLoading] = useState(false);
  const [frontendContent, setFrontendContent] = useState<any>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Charger le contenu
  useEffect(() => {
    loadContent();
    loadReviews();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/admin/frontend-content?pageSlug=accueil"
      );
      const data = await response.json();
      if (data.success) {
        const organized: any = {};
        data.data.forEach((item: any) => {
          if (!organized[item.sectionSlug]) {
            organized[item.sectionSlug] = {};
          }
          organized[item.sectionSlug][item.dataType] = item;
        });
        setFrontendContent(organized);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch("/api/admin/google-reviews");
      const data = await response.json();
      if (data.success) setReviews(data.data);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
    }
  };

  const handleSaveContent = async (
    sectionSlug: string,
    dataType: string,
    content: any
  ) => {
    try {
      await fetch("/api/admin/frontend-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: "accueil",
          sectionSlug,
          dataType,
          content,
        }),
      });
      await loadContent();
      alert("✅ Contenu sauvegardé avec succès !");
    } catch (error) {
      alert("❌ Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await fetch(`/api/admin/google-reviews/${id}`, { method: "DELETE" });
      await loadReviews();
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion du Contenu Frontend
        </h1>
        <p className="text-gray-600">
          Modifiez tout le contenu visible sur votre site
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "hero", label: "Hero", icon: Sparkles },
            { id: "services", label: "Services", icon: Calendar },
            { id: "team", label: "Équipe", icon: Users },
            { id: "contact", label: "Contact", icon: Phone },
            { id: "reviews", label: "Avis Google", icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Section Hero</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Titre Principal
                </label>
                <input
                  type="text"
                  defaultValue={
                    frontendContent?.hero?.text?.content?.title || ""
                  }
                  onChange={(e) => {
                    handleSaveContent("hero", "text", {
                      title: e.target.value,
                      subtitle:
                        frontendContent?.hero?.text?.content?.subtitle || "",
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Bienvenue dans votre salon de beauté"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sous-titre
                </label>
                <input
                  type="text"
                  defaultValue={
                    frontendContent?.hero?.text?.content?.subtitle || ""
                  }
                  onChange={(e) => {
                    handleSaveContent("hero", "text", {
                      title: frontendContent?.hero?.text?.content?.title || "",
                      subtitle: e.target.value,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Prenez soin de vous..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nos Services</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                <Plus className="w-4 h-4" />
                Ajouter un service
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">
              Gestion des services depuis l'espace admin à venir...
            </p>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notre Équipe</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                <Plus className="w-4 h-4" />
                Ajouter un membre
              </button>
            </div>
            <p className="text-gray-500 text-center py-8">
              Gestion de l'équipe depuis l'espace admin à venir...
            </p>
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Informations de Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="123 Rue de la Beauté, Paris"
                />
              </div>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Avis Google</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                <Plus className="w-4 h-4" />
                Ajouter un avis
              </button>
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun avis pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.authorName}</h4>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.text}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
