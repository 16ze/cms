"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSettingsContent,
  useCommonContent,
} from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
import GoogleOAuthConnect from "@/components/admin/GoogleOAuthConnect";
import "@/styles/admin-settings-ux.css";
import {
  Sun,
  Moon,
  Save,
  Search,
  Globe,
  BarChart3,
  FileText,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  Clock,
  Info,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Check,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  booking: {
    minNoticeHours: number;
    maxAdvanceBookingDays: number;
    allowWeekendBookings: boolean;
    consultationDuration: number;
    shootingDuration: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    canonicalUrl: string;
    googleAnalyticsId: string;
    googleSearchConsole: string;
    googleTagManagerId: string;
    sitemapEnabled: boolean;
    robotsTxtEnabled: boolean;
    structuredData: boolean;
  };
  business: {
    sector: string;
    city: string;
    region: string;
    profession: string;
    mainServices: string;
    targetAudience: string;
  };
  theme: {
    darkMode: boolean;
  };
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

function SEOSettingsContent() {
  const settingsContent = useSettingsContent();
  const commonContent = useCommonContent();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    general: {
      siteName: "",
      tagline: "",
      contactEmail: "",
      phoneNumber: "",
      address: "",
    },
    social: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    booking: {
      minNoticeHours: 24,
      maxAdvanceBookingDays: 30,
      allowWeekendBookings: true,
      consultationDuration: 60,
      shootingDuration: 120,
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      canonicalUrl: "",
      googleAnalyticsId: "",
      googleSearchConsole: "",
      googleTagManagerId: "",
      sitemapEnabled: true,
      robotsTxtEnabled: true,
      structuredData: true,
    },
    business: {
      sector: "",
      city: "",
      region: "",
      profession: "",
      mainServices: "",
      targetAudience: "",
    },
    theme: {
      darkMode: false,
    },
    system: {
      maintenanceMode: false,
      maintenanceMessage: "",
    },
  });

  // Validation des IDs Google
  const [gaIdValid, setGaIdValid] = useState<boolean | null>(null);
  const [gtmIdValid, setGtmIdValid] = useState<boolean | null>(null);

  // SOLUTION TEMPORAIRE : Bypass de l'authentification pour le développement
  // TODO: Réactiver l'authentification complète plus tard
  useEffect(() => {
    console.log("Mode développement - Bypass authentification");
    // Simuler un utilisateur admin temporaire
    setAdminUser({
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
    });
  }, []);

  // Charger les paramètres depuis l'API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/settings");

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des paramètres: ${response.status}`
          );
        }

        const data = await response.json();

        const transformedSettings: SiteSettings = {
          general: {
            siteName: data.siteName || "KAIRO Digital",
            tagline:
              data.siteDescription || "Agence web & développement digital",
            contactEmail: data.contactEmail || "contact@kairodigital.com",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
          },
          social: {
            facebook: data.socialMedia?.facebook || "",
            twitter: data.socialMedia?.twitter || "",
            instagram: data.socialMedia?.instagram || "",
            linkedin: data.socialMedia?.linkedin || "",
          },
          booking: {
            minNoticeHours: data.bookingSettings?.minimumNoticeHours || 24,
            maxAdvanceBookingDays:
              data.bookingSettings?.maxAdvanceBookingDays || 30,
            allowWeekendBookings:
              data.bookingSettings?.allowWeekendBookings ?? true,
            consultationDuration:
              data.bookingSettings?.bookingTimeSlotMinutes || 60,
            shootingDuration: data.bookingSettings?.shootingDuration || 120,
          },
          seo: {
            metaTitle:
              data.seoSettings?.defaultMetaTitle ||
              data.seoSettings?.metaTitle ||
              "",
            metaDescription:
              data.seoSettings?.defaultMetaDescription ||
              data.seoSettings?.metaDescription ||
              "",
            keywords: data.seoSettings?.keywords || "",
            ogTitle: data.seoSettings?.ogTitle || "",
            ogDescription: data.seoSettings?.ogDescription || "",
            ogImage: data.seoSettings?.ogImage || "",
            twitterCard: data.seoSettings?.twitterCard || "summary_large_image",
            canonicalUrl: data.seoSettings?.canonicalUrl || "",
            googleAnalyticsId: data.seoSettings?.googleAnalyticsId || "",
            googleSearchConsole: data.seoSettings?.googleSearchConsole || "",
            googleTagManagerId: data.seoSettings?.googleTagManagerId || "",
            sitemapEnabled: data.seoSettings?.sitemapEnabled ?? true,
            robotsTxtEnabled: data.seoSettings?.robotsTxtEnabled ?? true,
            structuredData: data.seoSettings?.structuredData ?? true,
          },
          business: {
            sector: data.businessSettings?.sector || "",
            city: data.businessSettings?.city || "",
            region: data.businessSettings?.region || "",
            profession: data.businessSettings?.profession || "",
            mainServices: data.businessSettings?.mainServices || "",
            targetAudience: data.businessSettings?.targetAudience || "",
          },
          theme: {
            darkMode: darkMode,
          },
          system: {
            maintenanceMode: data.systemSettings?.maintenanceMode ?? false,
            maintenanceMessage: data.systemSettings?.maintenanceMessage || "",
          },
        };

        setSettings(transformedSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        setMessage({
          type: "error",
          text: "Erreur lors du chargement des paramètres",
        });
      } finally {
        setLoading(false);
      }
    };

    if (adminUser) {
      fetchSettings();
    }
  }, [adminUser, darkMode]);

  // Handle form changes
  const handleInputChange = (
    section: keyof SiteSettings,
    field: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Validation en temps réel des IDs Google
    if (field === "googleAnalyticsId" && typeof value === "string") {
      const demoIds = ["G-58FT91034E", "G-XXXXXXXXXX", "G-YOUR-GA-ID"];
      setGaIdValid(
        demoIds.includes(value)
          ? false
          : value.startsWith("G-") && value.length === 12
      );
    }

    if (field === "googleTagManagerId" && typeof value === "string") {
      const demoIds = ["GTM-T7G7LSDZ", "GTM-XXXXXXX", "GTM-YOUR-ID"];
      setGtmIdValid(
        demoIds.includes(value)
          ? false
          : value.startsWith("GTM-") && value.length >= 11
      );
    }
  };

  const handleSwitchChange = (
    section: keyof SiteSettings,
    field: string,
    checked: boolean
  ) => {
    handleInputChange(section, field, checked);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Préparer les données SEO avec valeurs par défaut si vides
      const seoData = {
        ...settings.seo,
        metaTitle:
          settings.seo?.metaTitle ||
          "KAIRO Digital | Agence web & consulting digital",
        metaDescription:
          settings.seo?.metaDescription ||
          "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale. Création de sites modernes, optimisation SEO et consulting digital.",
        canonicalUrl:
          settings.seo?.canonicalUrl || "https://www.kairo-digital.fr",
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seo: seoData,
          business: settings.business,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      // Mettre à jour l'état local avec les données sauvegardées
      setSettings((prev) => ({
        ...prev,
        seo: seoData,
      }));

      setMessage({
        type: "success",
        text: "Paramètres SEO sauvegardés avec succès",
      });
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de la sauvegarde des paramètres",
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonctions de validation
  const validateMetaTitle = (title: string) => {
    if (!title)
      return { valid: false, message: "Titre requis", color: "text-red-600" };
    if (title.length < 30)
      return {
        valid: false,
        message: "Titre trop court (min. 30 caractères)",
        color: "text-orange-600",
      };
    if (title.length > 60)
      return {
        valid: false,
        message: "Titre trop long (max. 60 caractères)",
        color: "text-orange-600",
      };
    return { valid: true, message: "Titre optimal", color: "text-green-600" };
  };

  const validateMetaDescription = (description: string) => {
    if (!description)
      return {
        valid: false,
        message: "Description requise",
        color: "text-red-600",
      };
    if (description.length < 120)
      return {
        valid: false,
        message: "Description trop courte (min. 120 caractères)",
        color: "text-orange-600",
      };
    if (description.length > 160)
      return {
        valid: false,
        message: "Description trop longue (max. 160 caractères)",
        color: "text-orange-600",
      };
    return {
      valid: true,
      message: "Description optimale",
      color: "text-green-600",
    };
  };

  const validateKeywords = (keywords: string) => {
    if (!keywords)
      return {
        valid: false,
        message: "Mots-clés requis",
        color: "text-red-600",
      };
    const keywordCount = keywords.split(",").length;
    if (keywordCount < 3)
      return {
        valid: false,
        message: "Minimum 3 mots-clés recommandés",
        color: "text-orange-600",
      };
    if (keywordCount > 10)
      return {
        valid: false,
        message: "Maximum 10 mots-clés recommandés",
        color: "text-orange-600",
      };
    return {
      valid: true,
      message: `${keywordCount} mots-clés configurés`,
      color: "text-green-600",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paramètres SEO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres SEO</h1>
          <p className="text-gray-600 mt-1">
            Configuration du référencement et des métadonnées
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/seo/keywords")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyse des mots-clés
          </Button>
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : message.type === "error" ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <Info className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - Configuration SEO */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>
                Configurez les informations de votre entreprise pour
                personnaliser l'analyse des mots-clés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Secteur d'activité</Label>
                  <Input
                    id="sector"
                    value={settings.business?.sector || ""}
                    onChange={(e) =>
                      handleInputChange("business", "sector", e.target.value)
                    }
                    placeholder="Ex: Agence web, E-commerce, Services locaux"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Votre secteur principal pour cibler les bons mots-clés
                  </p>
                </div>

                <div>
                  <Label htmlFor="city">Ville principale</Label>
                  <Input
                    id="city"
                    value={settings.business?.city || ""}
                    onChange={(e) =>
                      handleInputChange("business", "city", e.target.value)
                    }
                    placeholder="Ex: Paris, Lyon, Marseille"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ville où vous exercez principalement votre activité
                  </p>
                </div>

                <div>
                  <Label htmlFor="region">Région</Label>
                  <Input
                    id="region"
                    value={settings.business?.region || ""}
                    onChange={(e) =>
                      handleInputChange("business", "region", e.target.value)
                    }
                    placeholder="Ex: Île-de-France, Auvergne-Rhône-Alpes"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Région ou zone géographique élargie
                  </p>
                </div>

                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={settings.business?.profession || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "profession",
                        e.target.value
                      )
                    }
                    placeholder="Ex: Développeur web, Consultant, Photographe"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Votre profession ou métier principal
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="mainServices">Services principaux</Label>
                <Textarea
                  id="mainServices"
                  value={settings.business?.mainServices || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "business",
                      "mainServices",
                      e.target.value
                    )
                  }
                  placeholder="Listez vos services principaux (séparés par des virgules)"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ex: Création de sites web, Référencement SEO, E-commerce
                </p>
              </div>

              <div>
                <Label htmlFor="targetAudience">Public cible</Label>
                <Textarea
                  id="targetAudience"
                  value={settings.business?.targetAudience || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "business",
                      "targetAudience",
                      e.target.value
                    )
                  }
                  placeholder="Décrivez votre public cible"
                  className="mt-1"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ex: PME, artisans, entrepreneurs, particuliers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées & Open Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Métadonnées & Open Graph
              </CardTitle>
              <CardDescription>
                Configurez les métadonnées de base et les balises Open Graph
                pour les réseaux sociaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="metaTitle">
                    Titre principal (meta title)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Le titre qui apparaît dans les onglets du navigateur
                          et les résultats Google
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Optimal : 50-60 caractères. Incluez vos mots-clés
                          principaux.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="metaTitle"
                  value={settings.seo?.metaTitle || ""}
                  onChange={(e) =>
                    handleInputChange("seo", "metaTitle", e.target.value)
                  }
                  className="mt-1"
                  placeholder="KAIRO Digital | Agence web & consulting digital"
                />
                <p className="text-xs mt-1">
                  {(settings.seo?.metaTitle || "").length}/60 caractères
                </p>
                <p
                  className={`text-xs mt-1 ${
                    validateMetaTitle(settings.seo?.metaTitle || "").color
                  }`}
                >
                  {validateMetaTitle(settings.seo?.metaTitle || "").message}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="metaDescription">
                    Description (meta description)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Description affichée sous le titre dans les résultats
                          Google
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Optimal : 150-160 caractères. Résumez votre activité
                          de manière attractive.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="metaDescription"
                  value={settings.seo?.metaDescription || ""}
                  onChange={(e) =>
                    handleInputChange("seo", "metaDescription", e.target.value)
                  }
                  className="mt-1"
                  placeholder="KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale. Création de sites modernes, optimisation SEO et consulting digital."
                  rows={3}
                />
                <p className="text-xs mt-1">
                  {(settings.seo?.metaDescription || "").length}/160 caractères
                </p>
                <p
                  className={`text-xs mt-1 ${
                    validateMetaDescription(settings.seo?.metaDescription || "")
                      .color
                  }`}
                >
                  {
                    validateMetaDescription(settings.seo?.metaDescription || "")
                      .message
                  }
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="keywords">Mots-clés</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Mots-clés stratégiques pour votre référencement
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          3-10 mots-clés recommandés, séparés par des virgules.
                          Exemple : web, digital, marketing
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="keywords"
                  value={settings.seo?.keywords || ""}
                  onChange={(e) =>
                    handleInputChange("seo", "keywords", e.target.value)
                  }
                  className="mt-1"
                  placeholder="mots-clés, séparés, par, des, virgules"
                  rows={2}
                />
                <p
                  className={`text-xs mt-1 ${
                    validateKeywords(settings.seo?.keywords || "").color
                  }`}
                >
                  {validateKeywords(settings.seo?.keywords || "").message}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogTitle">Titre Open Graph</Label>
                  <Input
                    id="ogTitle"
                    value={settings.seo?.ogTitle || ""}
                    onChange={(e) =>
                      handleInputChange("seo", "ogTitle", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Titre pour les réseaux sociaux"
                  />
                </div>

                <div>
                  <Label htmlFor="ogDescription">Description Open Graph</Label>
                  <Textarea
                    id="ogDescription"
                    value={settings.seo?.ogDescription || ""}
                    onChange={(e) =>
                      handleInputChange("seo", "ogDescription", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Description pour les réseaux sociaux"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ogImage">Image Open Graph</Label>
                <Input
                  id="ogImage"
                  value={settings.seo?.ogImage || ""}
                  onChange={(e) =>
                    handleInputChange("seo", "ogImage", e.target.value)
                  }
                  className="mt-1"
                  placeholder="URL de l'image (1200x630px recommandé)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration avancée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuration avancée
              </CardTitle>
              <CardDescription>
                Paramètres techniques pour l'optimisation SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="canonicalUrl">URL canonique</Label>
                <Input
                  id="canonicalUrl"
                  value={settings.seo?.canonicalUrl || ""}
                  onChange={(e) =>
                    handleInputChange("seo", "canonicalUrl", e.target.value)
                  }
                  className="mt-1"
                  placeholder="https://www.votredomaine.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="googleAnalyticsId">
                      Google Analytics ID
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            Format : G-XXXXXXXXXX (10 caractères
                            alphanumériques)
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Trouvez votre ID dans Google Analytics → Admin →
                            Property Settings
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="googleAnalyticsId"
                      value={settings.seo?.googleAnalyticsId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "seo",
                          "googleAnalyticsId",
                          e.target.value
                        )
                      }
                      className={`mt-1 pr-10 ${
                        gaIdValid === true
                          ? "border-green-500 focus:ring-green-500"
                          : gaIdValid === false
                          ? "border-orange-500 focus:ring-orange-500"
                          : ""
                      }`}
                      placeholder="G-XXXXXXXXXX"
                    />
                    {gaIdValid === true && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {gaIdValid === false && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  {gaIdValid === true && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ ID valide - Configurez les variables d'environnement
                      pour activer l'intégration
                    </p>
                  )}
                  {gaIdValid === false && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ ID de démo ou format invalide - Remplacez par votre
                      vrai ID Google Analytics
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="googleSearchConsole">
                      Google Search Console
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            Code de vérification méta tag pour Google Search
                            Console
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Trouvez-le dans Search Console → Settings →
                            Verification
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="googleSearchConsole"
                    value={settings.seo?.googleSearchConsole || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "seo",
                        "googleSearchConsole",
                        e.target.value
                      )
                    }
                    className="mt-1"
                    placeholder="Code de vérification"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="googleTagManagerId">
                    Google Tag Manager ID
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Format : GTM-XXXXXXX (7 caractères alphanumériques)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Trouvez votre ID dans Google Tag Manager → Admin →
                          Container ID
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <Input
                    id="googleTagManagerId"
                    value={settings.seo?.googleTagManagerId || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "seo",
                        "googleTagManagerId",
                        e.target.value
                      )
                    }
                    className={`mt-1 pr-10 ${
                      gtmIdValid === true
                        ? "border-green-500 focus:ring-green-500"
                        : gtmIdValid === false
                        ? "border-orange-500 focus:ring-orange-500"
                        : ""
                    }`}
                    placeholder="GTM-XXXXXXX"
                  />
                  {gtmIdValid === true && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                  {gtmIdValid === false && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                  )}
                </div>
                {gtmIdValid === true && (
                  <p className="text-xs text-green-600 mt-1">✓ ID valide</p>
                )}
                {gtmIdValid === false && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ ID de démo ou format invalide
                  </p>
                )}
              </div>

              {/* Options SEO */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sitemapEnabled">
                      Générer automatiquement le sitemap.xml
                    </Label>
                    <p className="text-sm text-gray-500">
                      Crée automatiquement le fichier sitemap pour les moteurs
                      de recherche
                    </p>
                  </div>
                  <Switch
                    id="sitemapEnabled"
                    checked={settings.seo?.sitemapEnabled || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("seo", "sitemapEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="robotsTxtEnabled">
                      Générer automatiquement le robots.txt
                    </Label>
                    <p className="text-sm text-gray-500">
                      Crée automatiquement le fichier robots.txt pour contrôler
                      l'indexation
                    </p>
                  </div>
                  <Switch
                    id="robotsTxtEnabled"
                    checked={settings.seo?.robotsTxtEnabled || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("seo", "robotsTxtEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="structuredData">
                      Activer les données structurées Schema.org
                    </Label>
                    <p className="text-sm text-gray-500">
                      Ajoute automatiquement les balises Schema.org pour
                      améliorer le référencement
                    </p>
                  </div>
                  <Switch
                    id="structuredData"
                    checked={settings.seo?.structuredData || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("seo", "structuredData", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Actions et prévisualisation */}
        <div className="space-y-6">
          {/* Connexion Google OAuth */}
          <GoogleOAuthConnect />

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Générer sitemap
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Générer robots.txt
              </Button>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/seo/keywords")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyser les mots-clés
              </Button>
            </CardContent>
          </Card>

          {/* Prévisualisation SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Prévisualisation Google
              </CardTitle>
              <CardDescription>
                Comment votre site apparaîtra dans les résultats de recherche
                Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm">
                  <p className="text-blue-600 text-xs mb-1">
                    {settings.seo?.canonicalUrl ||
                      "https://www.kairo-digital.fr"}
                  </p>
                  <h3 className="text-lg text-blue-800 font-medium mb-1 line-clamp-1">
                    {settings.seo?.metaTitle ||
                      "KAIRO Digital | Agence web & consulting digital"}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {settings.seo?.metaDescription ||
                      "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale. Création de sites modernes, optimisation SEO et consulting digital."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminSEOSettingsPage() {
  return (
    <ProtectedAdminPage requiredPermissions={["canView", "canEdit"]}>
      <AdminErrorBoundary>
        <TooltipProvider>
          <SEOSettingsContent />
        </TooltipProvider>
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
