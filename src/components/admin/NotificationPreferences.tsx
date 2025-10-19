"use client";

import { useState, useEffect } from "react";
import { useNotificationPreferences } from "@/hooks/use-notifications";
import { Bell, Save, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const { preferences, loading, updatePreferences } =
    useNotificationPreferences();

  const [formData, setFormData] = useState({
    emailEnabled: true,
    pushEnabled: true,
    soundEnabled: true,
    reservations: true,
    clients: true,
    seo: true,
    system: true,
    content: true,
    security: true,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
        soundEnabled: preferences.soundEnabled,
        reservations: preferences.reservations,
        clients: preferences.clients,
        seo: preferences.seo,
        system: preferences.system,
        content: preferences.content,
        security: preferences.security,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart || "22:00",
        quietHoursEnd: preferences.quietHoursEnd || "08:00",
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const success = await updatePreferences(formData);

      if (success) {
        toast.success("Préférences de notification enregistrées");
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Préférences de notifications
              </h2>
              <p className="text-sm text-gray-600">
                Gérez comment et quand vous recevez des notifications
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6">
          {/* Canaux de notification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Canaux de notification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Notifications par email
                  </h4>
                  <p className="text-sm text-gray-600">
                    Recevoir les notifications importantes par email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, emailEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Notifications push
                  </h4>
                  <p className="text-sm text-gray-600">
                    Recevoir des notifications en temps réel dans le navigateur
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pushEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, pushEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Son</h4>
                  <p className="text-sm text-gray-600">
                    Jouer un son lors de la réception d'une notification
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.soundEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, soundEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Catégories de notifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: "reservations",
                  label: "Réservations",
                  description: "Nouvelles réservations, modifications, annulations",
                },
                {
                  key: "clients",
                  label: "Clients",
                  description: "Nouveaux clients, mises à jour",
                },
                {
                  key: "seo",
                  label: "SEO",
                  description: "Alertes SEO, performances, analyses",
                },
                {
                  key: "system",
                  label: "Système",
                  description: "Erreurs, maintenances, mises à jour",
                },
                {
                  key: "content",
                  label: "Contenu",
                  description: "Publications, modifications de contenu",
                },
                {
                  key: "security",
                  label: "Sécurité",
                  description: "Alertes de sécurité, accès suspects",
                },
              ].map((category) => (
                <div
                  key={category.key}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {category.label}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData[category.key as keyof typeof formData] as boolean}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [category.key]: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Heures calmes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Heures calmes
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Activer les heures calmes
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ne pas recevoir de notifications pendant certaines heures
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.quietHoursEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quietHoursEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Début
                    </label>
                    <input
                      type="time"
                      value={formData.quietHoursStart}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quietHoursStart: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={formData.quietHoursEnd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quietHoursEnd: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Les modifications seront appliquées immédiatement
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

