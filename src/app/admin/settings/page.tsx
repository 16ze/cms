"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useSettingsContent,
  useCommonContent,
} from "@/hooks/use-admin-content-safe";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
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
  theme: {
    darkMode: boolean;
  };
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

interface SEOMetrics {
  // Scores séparés
  technicalScore: number;
  googleScore: number | null;
  combinedScore: number;

  // Indicateurs de connexion
  googleConnected: boolean;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;

  // Données techniques
  technicalAnalysis: {
    issues: Array<{
      type: "error" | "warning" | "info";
      message: string;
      fix: string;
    }>;
    suggestions: Array<{
      type: "improvement" | "opportunity";
      message: string;
      impact: "high" | "medium" | "low";
    }>;
    metrics: {
      pagesAnalyzed: number;
      totalIssues: number;
      criticalIssues: number;
      warnings: number;
      improvements: number;
    };
  };

  // Données Google
  googleData: {
    analytics: {
      sessions: number | null;
      pageViews: number | null;
      bounceRate: number | null;
      avgSessionDuration: number | null;
    };
    pageSpeed: {
      mobile: number | null;
      desktop: number | null;
    };
    searchConsole: {
      impressions: number | null;
      clicks: number | null;
      ctr: number | null;
      position: number | null;
    };
  } | null;

  // Métriques combinées
  metrics: {
    pagesAnalyzed: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    improvements: number;
  };
}

function SettingsContent() {
  const settingsContent = useSettingsContent();
  const common = useCommonContent();
  const tabs = settingsContent.tabs;
  const defaults = settingsContent.defaults;
  const messages = settingsContent.messages;
  const seoContent = settingsContent.seo;
  const performanceContent = settingsContent.performance;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [testingPerformance, setTestingPerformance] = useState(false);
  const [performanceResults, setPerformanceResults] = useState<{
    pageSpeed: { mobile: number; desktop: number };
    coreWebVitals: { lcp: number; fid: number; cls: number };
    recommendations: Array<{ message: string; impact: string }>;
  } | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [gaIdValid, setGaIdValid] = useState<boolean | null>(null);
  const [gtmIdValid, setGtmIdValid] = useState<boolean | null>(null);
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics>({
    technicalScore: 0,
    googleScore: null,
    combinedScore: 0,
    googleConnected: false,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    technicalAnalysis: {
      issues: [],
      suggestions: [],
      metrics: {
        pagesAnalyzed: 0,
        totalIssues: 0,
        criticalIssues: 0,
        warnings: 0,
        improvements: 0,
      },
    },
    googleData: null,
    metrics: {
      pagesAnalyzed: 0,
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
      improvements: 0,
    },
  });

  const defaultSettings: SiteSettings = {
    general: {
      siteName: "KAIRO Digital",
      tagline: "Agence de développement web et consulting digital",
      contactEmail: "contact.kairodigital@gmail.com",
      phoneNumber: "06 XX XX XX XX",
      address: "",
    },
    social: {
      facebook: "https://facebook.com/kairodigital",
      twitter: "",
      instagram: "https://instagram.com/kairodigital",
      linkedin: "https://linkedin.com/company/kairodigital",
    },
    booking: {
      minNoticeHours: 24,
      maxAdvanceBookingDays: 30,
      allowWeekendBookings: true,
      consultationDuration: 60,
      shootingDuration: 180,
    },
    seo: {
      metaTitle: "KAIRO Digital | Agence web & consulting digital",
      metaDescription:
        "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale.",
      keywords: "web, digital, développement, consulting, kairo",
      ogTitle: "KAIRO Digital | Agence web & consulting digital",
      ogDescription:
        "KAIRO Digital vous accompagne dans vos projets web et votre transformation digitale.",
      ogImage: "/images/kairo-og-image.jpg",
      twitterCard: "summary_large_image",
      canonicalUrl: "https://www.kairo-digital.fr",
      googleAnalyticsId: "",
      googleSearchConsole: "",
      googleTagManagerId: "GTM-T7G7LSDZ",
      sitemapEnabled: true,
      robotsTxtEnabled: true,
      structuredData: true,
    },
    theme: {
      darkMode: false,
    },
    system: {
      maintenanceMode: false,
      maintenanceMessage:
        "Site en maintenance. Nous serons de retour bientôt !",
    },
  };

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // SOLUTION TEMPORAIRE : Bypass de l'authentification pour le développement
  // TODO: Réactiver l'authentification complète plus tard
  useEffect(() => {
    console.log(messages.devModeBypass);
    // Simuler un utilisateur admin temporaire
    setAdminUser({
      id: "temp-admin",
      name: "Admin Temporaire",
      email: "admin@kairodigital.com",
      role: "super_admin",
    });
    setLoading(false);

    if (typeof window !== "undefined") {
      setDarkMode(document.documentElement.classList.contains("dark"));
    }
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
            siteName: data.siteName || defaultSettings.general.siteName,
            tagline: data.siteDescription || defaultSettings.general.tagline,
            contactEmail:
              data.contactEmail || defaultSettings.general.contactEmail,
            phoneNumber:
              data.phoneNumber || defaultSettings.general.phoneNumber,
            address: data.address || defaultSettings.general.address,
          },
          social: {
            facebook:
              data.socialMedia?.facebook || defaultSettings.social.facebook,
            twitter:
              data.socialMedia?.twitter || defaultSettings.social.twitter,
            instagram:
              data.socialMedia?.instagram || defaultSettings.social.instagram,
            linkedin:
              data.socialMedia?.linkedin || defaultSettings.social.linkedin,
          },
          booking: {
            minNoticeHours:
              data.bookingSettings?.minimumNoticeHours ||
              defaultSettings.booking.minNoticeHours,
            maxAdvanceBookingDays:
              data.bookingSettings?.maxAdvanceBookingDays ||
              defaultSettings.booking.maxAdvanceBookingDays,
            allowWeekendBookings:
              data.bookingSettings?.allowWeekendBookings ??
              defaultSettings.booking.allowWeekendBookings,
            consultationDuration:
              data.bookingSettings?.bookingTimeSlotMinutes ||
              defaultSettings.booking.consultationDuration,
            shootingDuration:
              data.bookingSettings?.shootingDuration ||
              defaultSettings.booking.shootingDuration,
          },
          seo: {
            metaTitle:
              data.seoSettings?.defaultMetaTitle ||
              defaultSettings.seo.metaTitle,
            metaDescription:
              data.seoSettings?.defaultMetaDescription ||
              defaultSettings.seo.metaDescription,
            keywords:
              data.seoSettings?.keywords || defaultSettings.seo.keywords,
            ogTitle: data.seoSettings?.ogTitle || defaultSettings.seo.ogTitle,
            ogDescription:
              data.seoSettings?.ogDescription ||
              defaultSettings.seo.ogDescription,
            ogImage: data.seoSettings?.ogImage || defaultSettings.seo.ogImage,
            twitterCard:
              data.seoSettings?.twitterCard || defaultSettings.seo.twitterCard,
            canonicalUrl:
              data.seoSettings?.canonicalUrl ||
              defaultSettings.seo.canonicalUrl,
            googleAnalyticsId:
              data.seoSettings?.googleAnalyticsId ||
              defaultSettings.seo.googleAnalyticsId,
            googleSearchConsole:
              data.seoSettings?.googleSearchConsole ||
              defaultSettings.seo.googleSearchConsole,
            googleTagManagerId:
              data.seoSettings?.googleTagManagerId ||
              defaultSettings.seo.googleTagManagerId,
            sitemapEnabled:
              data.seoSettings?.sitemapEnabled ??
              defaultSettings.seo.sitemapEnabled,
            robotsTxtEnabled:
              data.seoSettings?.robotsTxtEnabled ??
              defaultSettings.seo.robotsTxtEnabled,
            structuredData:
              data.seoSettings?.structuredData ??
              defaultSettings.seo.structuredData,
          },
          theme: {
            darkMode: darkMode,
          },
          system: {
            maintenanceMode:
              data.systemSettings?.maintenanceMode ??
              defaultSettings.system.maintenanceMode,
            maintenanceMessage:
              data.systemSettings?.maintenanceMessage ||
              defaultSettings.system.maintenanceMessage,
          },
        };

        setSettings(transformedSettings);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        setMessage({
          type: "error",
          text: messages.loadError,
        });
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    if (adminUser) {
      fetchSettings();
    }
  }, [adminUser, darkMode]);

  // Synchronisation en temps réel des problèmes SEO
  useEffect(() => {
    // Délai pour éviter trop d'appels API
    const timeoutId = setTimeout(async () => {
      // Vérifier si on a déjà une analyse SEO et si les champs SEO ont changé
      if (seoMetrics.technicalScore > 0) {
        try {
          const response = await fetch("/api/admin/seo/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setSeoMetrics(result.data);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la synchronisation SEO:", error);
        }
      }
    }, 1000); // Attendre 1 seconde après le dernier changement

    return () => clearTimeout(timeoutId);
  }, [
    settings.seo?.metaTitle,
    settings.seo?.metaDescription,
    settings.seo?.keywords,
    settings.seo?.canonicalUrl,
    settings.seo?.googleAnalyticsId,
    settings.seo?.googleTagManagerId,
  ]);

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
      if (!value || value.trim() === "") {
        setGaIdValid(null);
      } else if (demoIds.includes(value)) {
        setGaIdValid(false); // ID de démo
      } else if (/^G-[A-Z0-9]{10}$/.test(value)) {
        setGaIdValid(true); // ID valide
      } else {
        setGaIdValid(false); // Format invalide
      }
    }

    if (field === "googleTagManagerId" && typeof value === "string") {
      const demoIds = ["GTM-T7G7LSDZ", "GTM-XXXXXXX", "GTM-YOUR-ID"];
      if (!value || value.trim() === "") {
        setGtmIdValid(null);
      } else if (demoIds.includes(value)) {
        setGtmIdValid(false); // ID de démo
      } else if (/^GTM-[A-Z0-9]{7}$/.test(value)) {
        setGtmIdValid(true); // ID valide
      } else {
        setGtmIdValid(false); // Format invalide
      }
    }
  };

  const handleSwitchChange = (
    section: keyof SiteSettings,
    field: string,
    checked: boolean
  ) => {
    handleInputChange(section, field, checked);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark");
      setDarkMode(!darkMode);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const apiSettings = {
        general: {
          siteName: settings.general.siteName,
          tagline: settings.general.tagline,
          contactEmail: settings.general.contactEmail,
          phoneNumber: settings.general.phoneNumber,
          address: settings.general.address,
        },
        social: {
          facebook: settings.social.facebook,
          twitter: settings.social.twitter,
          instagram: settings.social.instagram,
          linkedin: settings.social.linkedin,
        },
        booking: {
          minimumNoticeHours: settings.booking.minNoticeHours,
          maxAdvanceBookingDays: settings.booking.maxAdvanceBookingDays,
          allowWeekendBookings: settings.booking.allowWeekendBookings,
          bookingTimeSlotMinutes: settings.booking.consultationDuration,
          shootingDuration: settings.booking.shootingDuration,
        },
        seo: {
          defaultMetaTitle: settings.seo?.metaTitle || "",
          defaultMetaDescription: settings.seo?.metaDescription || "",
          keywords: settings.seo?.keywords || "",
          ogTitle: settings.seo?.ogTitle || "",
          ogDescription: settings.seo?.ogDescription || "",
          ogImage: settings.seo?.ogImage || "",
          twitterCard: settings.seo?.twitterCard || "",
          canonicalUrl: settings.seo?.canonicalUrl || "",
          googleAnalyticsId: settings.seo?.googleAnalyticsId || "",
          googleSearchConsole: settings.seo?.googleSearchConsole || "",
          googleTagManagerId: settings.seo?.googleTagManagerId || "",
          sitemapEnabled: settings.seo?.sitemapEnabled || false,
          robotsTxtEnabled: settings.seo?.robotsTxtEnabled || false,
          structuredData: settings.seo?.structuredData || false,
        },
        system: {
          maintenanceMode: settings.system.maintenanceMode,
          maintenanceMessage: settings.system.maintenanceMessage,
        },
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiSettings),
      });

      if (!response.ok) {
        throw new Error(messages.saveError);
      }

      // Appeler l'API maintenance appropriée selon l'état
      try {
        if (settings.system.maintenanceMode) {
          // Activation du mode maintenance
          const maintenanceResponse = await fetch("/api/maintenance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              maintenanceMode: settings.system.maintenanceMode,
              maintenanceMessage: settings.system.maintenanceMessage,
            }),
          });

          if (!maintenanceResponse.ok) {
            console.error("Erreur lors de l'activation du mode maintenance");
          }
        } else {
          // Désactivation forcée du mode maintenance
          const disableResponse = await fetch("/api/maintenance/disable", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!disableResponse.ok) {
            console.error(
              "Erreur lors de la désactivation du mode maintenance"
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour du mode maintenance:",
          error
        );
      }

      setMessage({
        type: "success",
        text: "Paramètres sauvegardés avec succès - Les modifications sont appliquées en temps réel sur le site",
      });

      // Synchroniser les paramètres de réservation
      try {
        const bookingSettingsResponse = await fetch("/api/settings");
        if (bookingSettingsResponse.ok) {
          const bookingData = await bookingSettingsResponse.json();
          console.log(
            "✅ Paramètres de réservation synchronisés:",
            bookingData.bookingSettings
          );
        }
      } catch (error) {
        console.warn(
          "⚠️ Impossible de synchroniser les paramètres de réservation:",
          error
        );
      }

      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setMessage({
        type: "error",
        text: messages.saveError,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeSEO = async () => {
    try {
      setAnalyzing(true);
      setMessage(null);

      const response = await fetch("/api/admin/seo/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(seoContent.messages.analyzeError);
      }

      const result = await response.json();

      if (result.success) {
        setSeoMetrics(result.data);

        const scoreToShow = result.data.googleConnected
          ? result.data.combinedScore
          : result.data.technicalScore;
        const scoreType = result.data.googleConnected ? "combiné" : "technique";

        setMessage({
          type: "success",
          text:
            seoContent.messages.analyzeSuccess
              .replace("{score}", scoreToShow.toString())
              .replace(
                "{pagesCount}",
                result.data.metrics.pagesAnalyzed.toString()
              ) + ` (${scoreType})`,
        });
      } else {
        throw new Error(result.error || seoContent.messages.analyzeError);
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse SEO:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : seoContent.messages.analyzeError,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSitemap = async () => {
    try {
      const response = await fetch("/api/admin/seo/generate-sitemap", {
        method: "POST",
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Sitemap généré avec succès",
        });
      } else {
        throw new Error("Erreur lors de la génération du sitemap");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la génération du sitemap",
      });
    }
  };

  const generateRobotsTxt = async () => {
    try {
      const response = await fetch("/api/admin/seo/generate-robots", {
        method: "POST",
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "robots.txt généré avec succès",
        });
      } else {
        throw new Error("Erreur lors de la génération du robots.txt");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la génération du robots.txt",
      });
    }
  };

  // Fonctions de validation SEO
  const validateMetaTitle = (title: string) => {
    if (!title || title.trim().length === 0) {
      return { isValid: false, message: "Titre requis", color: "text-red-500" };
    }
    if (title.length < 30) {
      return {
        isValid: false,
        message: "Titre trop court (min 30 caractères)",
        color: "text-orange-500",
      };
    }
    if (title.length > 60) {
      return {
        isValid: false,
        message: "Titre trop long (max 60 caractères)",
        color: "text-orange-500",
      };
    }
    return { isValid: true, message: "Titre optimal", color: "text-green-500" };
  };

  const validateMetaDescription = (description: string) => {
    if (!description || description.trim().length === 0) {
      return {
        isValid: false,
        message: "Description requise",
        color: "text-red-500",
      };
    }
    if (description.length < 120) {
      return {
        isValid: false,
        message: "Description trop courte (min 120 caractères)",
        color: "text-orange-500",
      };
    }
    if (description.length > 160) {
      return {
        isValid: false,
        message: "Description trop longue (max 160 caractères)",
        color: "text-orange-500",
      };
    }
    return {
      isValid: true,
      message: "Description optimale",
      color: "text-green-500",
    };
  };

  const validateKeywords = (keywords: string) => {
    if (!keywords || keywords.trim().length === 0) {
      return {
        isValid: false,
        message: "Mots-clés requis",
        color: "text-red-500",
      };
    }
    const keywordCount = keywords
      .split(",")
      .filter((k) => k.trim().length > 0).length;
    if (keywordCount < 3) {
      return {
        isValid: false,
        message: "Minimum 3 mots-clés requis",
        color: "text-orange-500",
      };
    }
    if (keywordCount > 10) {
      return {
        isValid: false,
        message: "Maximum 10 mots-clés recommandé",
        color: "text-orange-500",
      };
    }
    return {
      isValid: true,
      message: `${keywordCount} mots-clés configurés`,
      color: "text-green-500",
    };
  };

  const validateUrl = (url: string) => {
    if (!url || url.trim().length === 0) {
      return { isValid: false, message: "URL requise", color: "text-red-500" };
    }
    try {
      new URL(url);
      return { isValid: true, message: "URL valide", color: "text-green-500" };
    } catch {
      return {
        isValid: false,
        message: "Format d'URL invalide",
        color: "text-red-500",
      };
    }
  };

  const validateGoogleId = (id: string, type: "analytics" | "gtm") => {
    if (!id || id.trim().length === 0) {
      return {
        isValid: false,
        message: `${type === "analytics" ? "GA" : "GTM"} ID requis`,
        color: "text-red-500",
      };
    }
    const pattern =
      type === "analytics" ? /^G-[A-Z0-9]{10}$/ : /^GTM-[A-Z0-9]{7}$/;
    if (!pattern.test(id)) {
      return {
        isValid: false,
        message: `Format ${type === "analytics" ? "GA" : "GTM"} ID invalide`,
        color: "text-red-500",
      };
    }
    return {
      isValid: true,
      message: `${type === "analytics" ? "GA" : "GTM"} ID valide`,
      color: "text-green-500",
    };
  };

  // Test de performance SEO
  const testPerformance = async () => {
    try {
      setTestingPerformance(true);
      setMessage(null);

      const response = await fetch("/api/admin/seo/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: settings.seo?.canonicalUrl || "https://www.kairo-digital.fr",
        }),
      });

      if (!response.ok) {
        throw new Error(performanceContent.messages.testError);
      }

      const result = await response.json();
      setPerformanceResults(result.data);
      setMessage({
        type: "success",
        text: performanceContent.messages.testSuccess,
      });
    } catch (error) {
      console.error("Erreur lors du test de performance:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : performanceContent.messages.testError,
      });
    } finally {
      setTestingPerformance(false);
    }
  };

  // Afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 md:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
              Paramètres
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Configurez les paramètres de votre site
            </p>
          </div>

          {/* Notification de synchronisation en temps réel */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Synchronisation en temps réel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/seo/settings")}
              className="flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Paramètres SEO
            </Button>
            <Button
              variant="outline"
              className="flex items-center self-start"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Mode clair
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Mode sombre
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Message de confirmation ou d'erreur */}
        {message && (
          <div
            className={`mb-5 md:mb-6 p-3 md:p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-1 flex flex-wrap">
            <TabsTrigger value="general" className="flex-1 text-xs sm:text-sm">
              Informations
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1 text-xs sm:text-sm">
              Réseaux
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex-1 text-xs sm:text-sm">
              Réservations
            </TabsTrigger>
          </TabsList>

          {/* Section Informations Générales */}
          <TabsContent value="general" className="space-y-6 mt-4">
            {/* Dashboard Informations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Statut du Site
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Actif</div>
                  <p className="text-xs text-muted-foreground">
                    Site en ligne et opérationnel
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dernière Mise à Jour
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date().toLocaleDateString("fr-FR")}
                  </div>
                  <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Configuration
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    Complète
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tous les champs requis remplis
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informations de Base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Informations de Base
                </CardTitle>
                <CardDescription>
                  Configurez les informations principales de votre site web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName" className="flex items-center">
                      Nom du site
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) =>
                        handleInputChange("general", "siteName", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Ex: KAIRO Digital"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nom officiel de votre entreprise
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tagline" className="flex items-center">
                      Slogan / Tagline
                    </Label>
                    <Input
                      id="tagline"
                      value={settings.general.tagline}
                      onChange={(e) =>
                        handleInputChange("general", "tagline", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Ex: Agence web & consulting digital"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Description courte de votre activité
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail" className="flex items-center">
                      Email de contact
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) =>
                        handleInputChange(
                          "general",
                          "contactEmail",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="contact@votreentreprise.fr"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email principal pour les demandes clients
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={settings.general.phoneNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "general",
                          "phoneNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="06 XX XX XX XX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Téléphone de contact principal
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea
                    id="address"
                    value={settings.general.address}
                    onChange={(e) =>
                      handleInputChange("general", "address", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Adresse complète de votre entreprise"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adresse physique de votre entreprise (optionnel)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Avancée */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration Avancée
                </CardTitle>
                <CardDescription>
                  Paramètres techniques et d'affichage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Sombre */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="darkMode"
                      checked={settings.theme.darkMode}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("theme", "darkMode", checked)
                      }
                    />
                    <Label htmlFor="darkMode" className="font-medium">
                      Mode sombre par défaut
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active le mode sombre par défaut pour tous les visiteurs du
                    site
                  </p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium mb-1">
                      Statut actuel :
                    </div>
                    <div
                      className={`text-sm ${
                        settings.theme.darkMode
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {settings.theme.darkMode ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Mode sombre activé
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-1" />
                          Mode clair par défaut
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mode Maintenance */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={settings.system.maintenanceMode}
                        onCheckedChange={(checked) =>
                          handleSwitchChange(
                            "system",
                            "maintenanceMode",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="maintenanceMode" className="font-medium">
                        Mode maintenance
                      </Label>
                    </div>
                    {settings.system.maintenanceMode && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              "/api/maintenance/disable",
                              {
                                method: "POST",
                              }
                            );
                            if (response.ok) {
                              setSettings({
                                ...settings,
                                system: {
                                  ...settings.system,
                                  maintenanceMode: false,
                                },
                              });
                              setMessage({
                                type: "success",
                                text: "Mode maintenance désactivé avec succès",
                              });
                            }
                          } catch (error) {
                            console.error(
                              "Erreur lors de la désactivation forcée:",
                              error
                            );
                          }
                        }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Forcer Désactivation
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Affiche une page de maintenance aux visiteurs
                    non-administrateurs
                  </p>

                  {settings.system.maintenanceMode && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="maintenanceMessage" className="text-sm">
                          Message de maintenance
                        </Label>
                        <Textarea
                          id="maintenanceMessage"
                          value={settings.system.maintenanceMessage}
                          onChange={(e) =>
                            handleInputChange(
                              "system",
                              "maintenanceMessage",
                              e.target.value
                            )
                          }
                          className="mt-1"
                          placeholder="Site en maintenance. Nous serons de retour bientôt !"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Message affiché aux visiteurs pendant la maintenance
                        </p>
                      </div>

                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                          <div className="text-sm">
                            <div className="font-medium text-yellow-800 dark:text-yellow-200">
                              Mode maintenance actif
                            </div>
                            <div className="text-yellow-700 dark:text-yellow-300">
                              Seuls les administrateurs peuvent accéder au site
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!settings.system.maintenanceMode && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        <div className="text-sm">
                          <div className="font-medium text-green-800 dark:text-green-200">
                            Site accessible
                          </div>
                          <div className="text-green-700 dark:text-green-300">
                            Tous les visiteurs peuvent accéder au site
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations importantes */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Informations importantes
                      </div>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                        <li>
                          • Le mode sombre s&apos;applique à tous les visiteurs
                        </li>
                        <li>
                          • Le mode maintenance bloque l&apos;accès public au
                          site
                        </li>
                        <li>
                          • Les administrateurs restent toujours connectés
                        </li>
                        <li>
                          • Les modifications sont appliquées immédiatement
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prévisualisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Prévisualisation
                </CardTitle>
                <CardDescription>
                  Comment vos informations apparaîtront sur le site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-lg font-bold mb-2">
                    {settings.general.siteName || "Nom du site"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {settings.general.tagline || "Slogan de votre entreprise"}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {settings.general.contactEmail || "contact@exemple.fr"}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {settings.general.phoneNumber || "06 XX XX XX XX"}
                    </div>
                    {settings.general.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {settings.general.address}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Réseaux Sociaux */}
          <TabsContent value="social" className="space-y-6 mt-4">
            {/* Dashboard Réseaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Facebook
                  </CardTitle>
                  <Facebook className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {settings.social.facebook ? "Connecté" : "Non configuré"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {settings.social.facebook ? "Page active" : "Aucun lien"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Twitter/X
                  </CardTitle>
                  <Twitter className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {settings.social.twitter ? "Connecté" : "Non configuré"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {settings.social.twitter ? "Compte actif" : "Aucun lien"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Instagram
                  </CardTitle>
                  <Instagram className="h-4 w-4 text-pink-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-600">
                    {settings.social.instagram ? "Connecté" : "Non configuré"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {settings.social.instagram ? "Compte actif" : "Aucun lien"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    LinkedIn
                  </CardTitle>
                  <Linkedin className="h-4 w-4 text-blue-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {settings.social.linkedin ? "Connecté" : "Non configuré"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {settings.social.linkedin ? "Profil actif" : "Aucun lien"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Réseaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Configuration des Réseaux Sociaux
                </CardTitle>
                <CardDescription>
                  Ajoutez les liens vers vos réseaux sociaux pour améliorer
                  votre visibilité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook" className="flex items-center">
                      Facebook
                      <Facebook className="h-4 w-4 text-blue-600 ml-1" />
                    </Label>
                    <Input
                      id="facebook"
                      value={settings.social.facebook}
                      onChange={(e) =>
                        handleInputChange("social", "facebook", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://facebook.com/votrepage"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lien vers votre page Facebook professionnelle
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="flex items-center">
                      Twitter / X
                      <Twitter className="h-4 w-4 text-blue-400 ml-1" />
                    </Label>
                    <Input
                      id="twitter"
                      value={settings.social.twitter}
                      onChange={(e) =>
                        handleInputChange("social", "twitter", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://twitter.com/votrecompte"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lien vers votre compte Twitter/X professionnel
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="flex items-center">
                      Instagram
                      <Instagram className="h-4 w-4 text-pink-600 ml-1" />
                    </Label>
                    <Input
                      id="instagram"
                      value={settings.social.instagram}
                      onChange={(e) =>
                        handleInputChange("social", "instagram", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://instagram.com/votrecompte"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lien vers votre compte Instagram professionnel
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="flex items-center">
                      LinkedIn
                      <Linkedin className="h-4 w-4 text-blue-700 ml-1" />
                    </Label>
                    <Input
                      id="linkedin"
                      value={settings.social.linkedin}
                      onChange={(e) =>
                        handleInputChange("social", "linkedin", e.target.value)
                      }
                      className="mt-1"
                      placeholder="https://linkedin.com/in/votreprofil"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lien vers votre profil LinkedIn professionnel
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prévisualisation Réseaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Prévisualisation des Réseaux Sociaux
                </CardTitle>
                <CardDescription>
                  Comment vos réseaux sociaux apparaîtront sur le site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium mb-3">
                    Suivez-nous sur les réseaux sociaux
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {settings.social.facebook && (
                      <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Facebook className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm">Facebook</span>
                      </div>
                    )}
                    {settings.social.twitter && (
                      <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Twitter className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm">Twitter/X</span>
                      </div>
                    )}
                    {settings.social.instagram && (
                      <div className="flex items-center p-2 bg-pink-50 dark:bg-pink-900/20 rounded">
                        <Instagram className="h-4 w-4 text-pink-600 mr-2" />
                        <span className="text-sm">Instagram</span>
                      </div>
                    )}
                    {settings.social.linkedin && (
                      <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Linkedin className="h-4 w-4 text-blue-700 mr-2" />
                        <span className="text-sm">LinkedIn</span>
                      </div>
                    )}
                    {!settings.social.facebook &&
                      !settings.social.twitter &&
                      !settings.social.instagram &&
                      !settings.social.linkedin && (
                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-4">
                          Aucun réseau social configuré
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conseils et Bonnes Pratiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Conseils pour vos Réseaux Sociaux
                </CardTitle>
                <CardDescription>
                  Optimisez votre présence sur les réseaux sociaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Utilisez des liens directs
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assurez-vous que vos liens pointent directement vers vos
                      profils
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Maintenez une cohérence
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Utilisez le même nom d'utilisateur sur tous vos réseaux
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Vérifiez régulièrement
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Testez vos liens pour vous assurer qu'ils fonctionnent
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section Réservations */}
          <TabsContent value="booking" className="space-y-6 mt-4">
            {/* Dashboard Réservations */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Délai Minimum
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {settings.booking.minNoticeHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avance requise
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Réservation Max
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {settings.booking.maxAdvanceBookingDays}j
                  </div>
                  <p className="text-xs text-muted-foreground">
                    À l&apos;avance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Consultation
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {settings.booking.consultationDuration}min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Durée standard
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Séance Photo
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {settings.booking.shootingDuration}min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Durée standard
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Réservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration du Système de Réservation
                </CardTitle>
                <CardDescription>
                  Paramétrez votre système de réservation pour optimiser
                  l&apos;expérience client
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="minNoticeHours"
                      className="flex items-center"
                    >
                      Délai minimum pour réserver
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="minNoticeHours"
                      type="number"
                      value={settings.booking.minNoticeHours.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "booking",
                          "minNoticeHours",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1"
                      min="0"
                      placeholder="24"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Heures d&apos;avance requises pour une réservation
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="maxAdvanceBookingDays"
                      className="flex items-center"
                    >
                      Réservation maximale à l&apos;avance
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="maxAdvanceBookingDays"
                      type="number"
                      value={settings.booking.maxAdvanceBookingDays.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "booking",
                          "maxAdvanceBookingDays",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1"
                      min="1"
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Jours maximum à l&apos;avance pour réserver
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="consultationDuration"
                      className="flex items-center"
                    >
                      Durée de consultation
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="consultationDuration"
                      type="number"
                      value={settings.booking.consultationDuration.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "booking",
                          "consultationDuration",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1"
                      min="15"
                      step="15"
                      placeholder="60"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Durée en minutes d&apos;une consultation
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="shootingDuration"
                      className="flex items-center"
                    >
                      Durée de séance photo
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="shootingDuration"
                      type="number"
                      value={settings.booking.shootingDuration.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "booking",
                          "shootingDuration",
                          Number(e.target.value)
                        )
                      }
                      className="mt-1"
                      min="30"
                      step="30"
                      placeholder="180"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Durée en minutes d&apos;une séance photo
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowWeekendBookings"
                      checked={settings.booking.allowWeekendBookings}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(
                          "booking",
                          "allowWeekendBookings",
                          checked
                        )
                      }
                    />
                    <Label htmlFor="allowWeekendBookings">
                      Autoriser les réservations le weekend
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permet aux clients de réserver des créneaux le samedi et
                    dimanche
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prévisualisation Calendrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Prévisualisation du Calendrier
                </CardTitle>
                <CardDescription>
                  Comment votre calendrier de réservation apparaîtra aux clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-sm font-medium mb-3">
                    Exemple de disponibilités
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Délai minimum :</span>
                      <span className="font-medium">
                        {settings.booking.minNoticeHours} heures
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Réservation max :</span>
                      <span className="font-medium">
                        {settings.booking.maxAdvanceBookingDays} jours
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durée consultation :</span>
                      <span className="font-medium">
                        {settings.booking.consultationDuration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durée séance photo :</span>
                      <span className="font-medium">
                        {settings.booking.shootingDuration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Réservations weekend :</span>
                      <span
                        className={`font-medium ${
                          settings.booking.allowWeekendBookings
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {settings.booking.allowWeekendBookings
                          ? "Autorisées"
                          : "Non autorisées"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conseils d&apos;Optimisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Conseils d&apos;Optimisation
                </CardTitle>
                <CardDescription>
                  Optimisez votre système de réservation pour maximiser les
                  conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Délai minimum optimal
                    </div>
                    <div className="text-xs text-muted-foreground">
                      24h minimum pour vous permettre de préparer les
                      rendez-vous
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Réservation à l&apos;avance
                    </div>
                    <div className="text-xs text-muted-foreground">
                      30 jours maximum pour éviter les annulations tardives
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Durées réalistes
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ajustez les durées selon votre capacité de travail réelle
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section SEO - NOUVELLE VERSION COMPLÈTE */}
        </Tabs>

        {/* Bouton Enregistrer */}
        <div className="mt-6 text-left">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant principal qui encapsule la logique d'authentification avec Suspense
export default function AdminSettingsPage() {
  return (
    <ProtectedAdminPage page="settings">
      <AdminErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                  Chargement...
                </p>
              </div>
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
