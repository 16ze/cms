"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Palette,
  Navigation,
  FileText,
  Save,
  Plus,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import RealClientPreview from "./real-client-preview";
import ChangeNotifier from "./change-notifier";
import ButtonStylesManager from "./button-styles-manager";

interface HeaderConfig {
  logo: string;
  logoUrl?: string;
  navigation: Array<{ name: string; href: string }>;
  buttons: {
    [key: string]: string;
  };
  buttonUrls?: {
    [key: string]: string;
  };
}

interface FooterConfig {
  company: string;
  description: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  social: string[];
  links?: Array<{ name: string; url: string }>;
}

interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  isDefault: boolean;
  configJson: any;
}

type ActiveTab = "header" | "footer" | "themes" | "buttons";

export default function SiteManager() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("header");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // États pour les configurations
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    logo: "KAIRO Digital",
    navigation: [],
    buttons: { contact: "Contact", booking: "Réserver" },
    buttonUrls: { contact: "/contact", booking: "/consultation" },
  });

  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    company: "KAIRO Digital",
    description: "Agence de développement web",
    contact: { phone: "", email: "", address: "" },
    social: [],
  });

  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);

  // Charger les configurations avec synchronisation temps réel
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le header
      const headerResponse = await fetch("/api/admin/site/header");
      if (headerResponse.ok) {
        const headerData = await headerResponse.json();
        if (headerData.success) {
          setHeaderConfig(headerData.data);
        }
      }

      // Charger le footer
      const footerResponse = await fetch("/api/admin/site/footer");
      if (footerResponse.ok) {
        const footerData = await footerResponse.json();
        if (footerData.success) {
          setFooterConfig(footerData.data);
        }
      }

      // Charger les thèmes
      const themesResponse = await fetch("/api/admin/site/themes");
      if (themesResponse.ok) {
        const themesData = await themesResponse.json();
        if (themesData.success) {
          setThemes(themesData.data);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  // CHARGEMENT UNIQUE - PAS DE SYNCHRONISATION AUTOMATIQUE POUR ÉVITER LE FAST REFRESH
  useEffect(() => {
    loadConfigurations();
    // SUPPRIMÉ : setInterval pour éviter les boucles de Fast Refresh
  }, []);

  // Sauvegarder le header
  const saveHeader = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/site/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(headerConfig),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la sauvegarde du header");

      const result = await response.json();
      if (result.success) {
        console.log("✅ Header sauvegardé");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarder le footer
  const saveFooter = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/site/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerConfig),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la sauvegarde du footer");

      const result = await response.json();
      if (result.success) {
        console.log("✅ Footer sauvegardé");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarder un thème
  const saveTheme = async (theme: ThemeConfig) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/site/themes/${theme.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la sauvegarde du thème");

      const result = await response.json();
      if (result.success) {
        console.log("✅ Thème sauvegardé");
        loadConfigurations(); // Recharger pour mettre à jour la liste
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  // Définir un thème par défaut
  const setDefaultTheme = async (themeId: string) => {
    try {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return;

      const updatedTheme = { ...theme, isDefault: true };
      await saveTheme(updatedTheme);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la définition du thème par défaut"
      );
    }
  };

  // Fonction pour retourner au dashboard
  const handleBackToDashboard = () => {
    router.push("/admin");
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Gestionnaire du Site
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gérez le header, footer et les thèmes de votre site
          </p>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Gestionnaire de changements */}
      <ChangeNotifier
        onRefreshRequested={loadConfigurations}
        className="mb-6"
      />

      {/* Navigation des onglets */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {[
            { id: "header", label: "Header", icon: Navigation },
            { id: "footer", label: "Footer", icon: FileText },
            { id: "themes", label: "Thèmes", icon: Palette },
            { id: "buttons", label: "Boutons", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-1 sm:gap-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Prévisualisation du vrai site client */}
      <RealClientPreview className="mb-6" />

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Header */}
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuration du Header
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo
                  </label>
                  <input
                    type="text"
                    value={headerConfig.logo}
                    onChange={(e) =>
                      setHeaderConfig({ ...headerConfig, logo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="KAIRO Digital"
                  />
                </div>

                {/* URL du logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du logo (optionnel)
                  </label>
                  <input
                    type="url"
                    value={headerConfig.logoUrl || ""}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        logoUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="/images/logo.png"
                  />
                </div>

                {/* Navigation */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navigation
                  </label>
                  <div className="space-y-2">
                    {headerConfig.navigation.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newNav = [...headerConfig.navigation];
                            newNav[index] = { ...item, name: e.target.value };
                            setHeaderConfig({
                              ...headerConfig,
                              navigation: newNav,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Nom du lien"
                        />
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => {
                            const newNav = [...headerConfig.navigation];
                            newNav[index] = { ...item, href: e.target.value };
                            setHeaderConfig({
                              ...headerConfig,
                              navigation: newNav,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="/page"
                        />
                        <button
                          onClick={() => {
                            const newNav = headerConfig.navigation.filter(
                              (_, i) => i !== index
                            );
                            setHeaderConfig({
                              ...headerConfig,
                              navigation: newNav,
                            });
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newNav = [
                          ...headerConfig.navigation,
                          { name: "", href: "" },
                        ];
                        setHeaderConfig({
                          ...headerConfig,
                          navigation: newNav,
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un lien
                    </button>
                  </div>
                </div>

                {/* Boutons Dynamiques */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boutons du Header
                  </label>
                  <div className="space-y-3">
                    {Object.entries(headerConfig.buttons).map(
                      ([key, value], index) => (
                        <div key={key} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => {
                              const newButtons = { ...headerConfig.buttons };
                              delete newButtons[key];
                              newButtons[e.target.value] = value;
                              setHeaderConfig({
                                ...headerConfig,
                                buttons: newButtons,
                              });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Clé du bouton (ex: contact)"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newButtons = { ...headerConfig.buttons };
                              newButtons[key] = e.target.value;
                              setHeaderConfig({
                                ...headerConfig,
                                buttons: newButtons,
                              });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Texte du bouton"
                          />
                          <input
                            type="text"
                            value={headerConfig.buttonUrls?.[key] || ""}
                            onChange={(e) => {
                              const newUrls = { ...headerConfig.buttonUrls };
                              newUrls[key] = e.target.value;
                              setHeaderConfig({
                                ...headerConfig,
                                buttonUrls: newUrls,
                              });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="URL (ex: /contact)"
                          />
                          <button
                            onClick={() => {
                              const newButtons = { ...headerConfig.buttons };
                              delete newButtons[key];
                              const newUrls = { ...headerConfig.buttonUrls };
                              delete newUrls[key];
                              setHeaderConfig({
                                ...headerConfig,
                                buttons: newButtons,
                                buttonUrls: newUrls,
                              });
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                    <button
                      onClick={() => {
                        const newKey = `bouton_${
                          Object.keys(headerConfig.buttons).length + 1
                        }`;
                        const newButtons = {
                          ...headerConfig.buttons,
                          [newKey]: "Nouveau bouton",
                        };
                        setHeaderConfig({
                          ...headerConfig,
                          buttons: newButtons,
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un bouton
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={saveHeader}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder le Header"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Footer */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuration du Footer
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de l'entreprise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={footerConfig.company}
                    onChange={(e) =>
                      setFooterConfig({
                        ...footerConfig,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={footerConfig.description}
                    onChange={(e) =>
                      setFooterConfig({
                        ...footerConfig,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Informations de contact
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={footerConfig.contact.phone}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            contact: {
                              ...footerConfig.contact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={footerConfig.contact.email}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            contact: {
                              ...footerConfig.contact,
                              email: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <textarea
                        value={footerConfig.contact.address}
                        onChange={(e) =>
                          setFooterConfig({
                            ...footerConfig,
                            contact: {
                              ...footerConfig.contact,
                              address: e.target.value,
                            },
                          })
                        }
                        rows={2}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réseaux sociaux
                  </label>
                  <div className="space-y-2">
                    {footerConfig.social.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newSocial = [...footerConfig.social];
                            newSocial[index] = e.target.value;
                            setFooterConfig({
                              ...footerConfig,
                              social: newSocial,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => {
                            const newSocial = footerConfig.social.filter(
                              (_, i) => i !== index
                            );
                            setFooterConfig({
                              ...footerConfig,
                              social: newSocial,
                            });
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newSocial = [...footerConfig.social, ""];
                        setFooterConfig({ ...footerConfig, social: newSocial });
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un réseau social
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={saveFooter}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder le Footer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Thèmes */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gestion des Thèmes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {theme.name === "light" && (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        )}
                        {theme.name === "dark" && (
                          <Moon className="w-4 h-4 text-blue-500" />
                        )}
                        {theme.name === "auto" && (
                          <Monitor className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-medium text-gray-900">
                          {theme.displayName}
                        </span>
                      </div>
                      {theme.isDefault && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Par défaut
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => setDefaultTheme(theme.id)}
                        disabled={theme.isDefault}
                        className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                          theme.isDefault
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        Définir par défaut
                      </button>

                      <button
                        onClick={() => setSelectedTheme(theme)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Éditeur de thème */}
            {selectedTheme && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Modifier le thème : {selectedTheme.displayName}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'affichage
                    </label>
                    <input
                      type="text"
                      value={selectedTheme.displayName}
                      onChange={(e) =>
                        setSelectedTheme({
                          ...selectedTheme,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration JSON
                    </label>
                    <textarea
                      value={JSON.stringify(selectedTheme.configJson, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setSelectedTheme({
                            ...selectedTheme,
                            configJson: config,
                          });
                        } catch (err) {
                          // Ignorer les erreurs de parsing pendant la saisie
                        }
                      }}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveTheme(selectedTheme)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>

                    <button
                      onClick={() => setSelectedTheme(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Boutons */}
        {activeTab === "buttons" && <ButtonStylesManager />}
      </div>
    </div>
  );
}
