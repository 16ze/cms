"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  AlertCircle,
  Target,
  Zap,
  RefreshCw,
  CheckCircle,
  Search,
  ExternalLink,
  AlertTriangle,
  Info,
  Lightbulb,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

/**
 * Interface pour les métriques SEO
 */
interface SEOMetrics {
  technicalScore: number;
  googleScore: number | null;
  combinedScore: number;
  googleConnected: boolean;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  technicalAnalysis: {
    issues: Array<{
      type: "error" | "warning" | "info";
      message: string;
      fix: string;
      priority: "high" | "medium" | "low";
    }>;
    suggestions: Array<{
      type: "improvement" | "opportunity";
      message: string;
      impact: "high" | "medium" | "low";
      implementation: string;
    }>;
    metrics: {
      pagesAnalyzed: number;
      totalIssues: number;
      criticalIssues: number;
      warnings: number;
      improvements: number;
    };
  };
  googleData: any;
  metrics: {
    pagesAnalyzed: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    improvements: number;
  };
}

function AnalysisPageContent() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
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

  /**
   * Effectuer l'analyse SEO technique
   */
  const handleAnalyzeSEO = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/admin/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse SEO");
      }

      const result = await response.json();
      setSeoMetrics(result.data);
      toast.success("Analyse SEO terminée avec succès");
    } catch (error) {
      console.error("Erreur analyse SEO:", error);
      toast.error("Erreur lors de l'analyse SEO");
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Charger l'analyse au montage du composant
   */
  useEffect(() => {
    handleAnalyzeSEO();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Analyse Technique SEO
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Analyse détaillée de votre site avec suggestions d'amélioration pour
            un meilleur référencement
          </p>
        </div>

        {/* Indicateurs de connexion Google */}
        {seoMetrics.technicalScore > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Analyse Technique</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vérification automatique
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {seoMetrics.googleConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Données Google</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {seoMetrics.googleConnected
                        ? "Connecté et opérationnel"
                        : "Non configuré"}
                    </p>
                  </div>
                </div>
              </div>
              {!seoMetrics.googleConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/seo/settings")}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Configurer Google
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dashboard SEO - 4 Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Carte Score SEO */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score SEO</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {seoMetrics.technicalScore > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {seoMetrics.googleConnected
                      ? seoMetrics.combinedScore
                      : seoMetrics.technicalScore}
                    /100
                  </div>
                  <Progress
                    value={
                      seoMetrics.googleConnected
                        ? seoMetrics.combinedScore
                        : seoMetrics.technicalScore
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(seoMetrics.googleConnected
                      ? seoMetrics.combinedScore
                      : seoMetrics.technicalScore) >= 90
                      ? "Excellent"
                      : (seoMetrics.googleConnected
                          ? seoMetrics.combinedScore
                          : seoMetrics.technicalScore) >= 80
                      ? "Bon"
                      : (seoMetrics.googleConnected
                          ? seoMetrics.combinedScore
                          : seoMetrics.technicalScore) >= 70
                      ? "Moyen"
                      : "À améliorer"}
                  </p>
                  {seoMetrics.googleConnected && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Technique: {seoMetrics.technicalScore}/100</p>
                      <p>Google: {seoMetrics.googleScore}/100</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Chargement...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte Problèmes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problèmes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {seoMetrics.technicalScore > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {seoMetrics.technicalAnalysis.issues.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {
                      seoMetrics.technicalAnalysis.issues.filter(
                        (i) => i.type === "error"
                      ).length
                    }{" "}
                    erreurs,{" "}
                    {
                      seoMetrics.technicalAnalysis.issues.filter(
                        (i) => i.type === "warning"
                      ).length
                    }{" "}
                    avertissements
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Analyse...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte Suggestions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {seoMetrics.technicalScore > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {seoMetrics.technicalAnalysis.suggestions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Améliorations disponibles
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Analyse...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carte Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm"
                onClick={handleAnalyzeSEO}
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {seoMetrics.technicalScore > 0 ? "Réanalyser" : "Analyser SEO"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/admin/seo/keywords")}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Mots-clés
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Problèmes et Suggestions côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problèmes détectés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Problèmes Détectés
              </CardTitle>
              <CardDescription>
                Problèmes techniques qui affectent votre référencement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seoMetrics.technicalScore === 0 ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Analyse SEO en cours...
                  </p>
                </div>
              ) : seoMetrics.technicalAnalysis.issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-green-600">
                  <CheckCircle className="h-12 w-12 mb-3" />
                  <p className="font-medium">Aucun problème détecté</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre configuration SEO est optimale
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {seoMetrics.technicalAnalysis.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        issue.type === "error"
                          ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                          : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {issue.type === "error" ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                            <p className="font-medium text-sm">
                              {issue.message}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Solution:</strong> {issue.fix}
                          </p>
                          <Badge
                            variant={
                              issue.priority === "high"
                                ? "destructive"
                                : issue.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            Priorité:{" "}
                            {issue.priority === "high"
                              ? "Élevée"
                              : issue.priority === "medium"
                              ? "Moyenne"
                              : "Faible"}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            issue.type === "error" ? "destructive" : "secondary"
                          }
                        >
                          {issue.type === "error" ? "Erreur" : "Avertissement"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestions d'amélioration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Suggestions d'Amélioration
              </CardTitle>
              <CardDescription>
                Opportunités pour améliorer votre classement SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seoMetrics.technicalScore === 0 ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Analyse SEO en cours...
                  </p>
                </div>
              ) : seoMetrics.technicalAnalysis.suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-green-600">
                  <CheckCircle className="h-12 w-12 mb-3" />
                  <p className="font-medium">Excellente optimisation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aucune suggestion pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {seoMetrics.technicalAnalysis.suggestions.map(
                    (suggestion, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          suggestion.impact === "high"
                            ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                            : suggestion.impact === "medium"
                            ? "border-purple-200 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 bg-gray-50 dark:bg-gray-900/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb
                                className={`h-4 w-4 ${
                                  suggestion.impact === "high"
                                    ? "text-blue-600"
                                    : suggestion.impact === "medium"
                                    ? "text-purple-600"
                                    : "text-gray-600"
                                }`}
                              />
                              <p className="font-medium text-sm">
                                {suggestion.message}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              <strong>Implémentation:</strong>{" "}
                              {suggestion.implementation}
                            </p>
                          </div>
                          <Badge
                            variant={
                              suggestion.impact === "high"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {suggestion.impact === "high"
                              ? "Impact Élevé"
                              : suggestion.impact === "medium"
                              ? "Impact Moyen"
                              : "Impact Faible"}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Métriques détaillées */}
        {seoMetrics.technicalScore > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Métriques Détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {seoMetrics.metrics.pagesAnalyzed}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pages analysées
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {seoMetrics.metrics.criticalIssues}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Problèmes critiques
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {seoMetrics.metrics.warnings}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avertissements
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {seoMetrics.metrics.improvements}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Améliorations
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {seoMetrics.technicalScore}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score technique
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aide et documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />À propos de l'analyse technique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Analyse Technique :</strong> Vérifie la présence des
                fichiers essentiels (sitemap.xml, robots.txt), les métadonnées,
                les balises Open Graph et la configuration Google.
              </p>
              <p>
                <strong>Données Google :</strong> Si OAuth est configuré,
                l'analyse récupère également vos métriques Google Analytics et
                Search Console pour un score combiné plus précis.
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/seo/settings")}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Paramètres SEO
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/seo/performance")}
                >
                  <Zap className="h-3 w-3 mr-2" />
                  Test de Performance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminSEOAnalysisPage() {
  return (
    <ProtectedAdminPage page="analysis">
      <AdminErrorBoundary>
        <AnalysisPageContent />
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
