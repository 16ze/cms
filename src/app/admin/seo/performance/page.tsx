"use client";

import { useState } from "react";
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
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Monitor,
  Smartphone,
  Clock,
  MousePointer,
  Eye,
  Info,
  BarChart3,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

/**
 * Interface pour les métriques de performance
 */
interface PerformanceMetrics {
  pageSpeed: {
    mobile: number;
    desktop: number;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  resources: {
    totalSize: number;
    images: number;
    scripts: number;
    stylesheets: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    impact: "high" | "medium" | "low";
    fix: string;
  }>;
}

function PerformancePageContent() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [performanceResults, setPerformanceResults] =
    useState<PerformanceMetrics | null>(null);

  /**
   * Effectuer le test de performance
   */
  const handleTestPerformance = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/admin/seo/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du test de performance");
      }

      const result = await response.json();
      setPerformanceResults(result.data);
      toast.success("Test de performance terminé");
    } catch (error) {
      console.error("Erreur test performance:", error);
      toast.error("Erreur lors du test de performance");
    } finally {
      setTesting(false);
    }
  };

  /**
   * Obtenir la couleur selon le score
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  /**
   * Obtenir le label selon le score
   */
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Bon";
    if (score >= 50) return "Moyen";
    return "Faible";
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Performance du Site
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Testez la vitesse et les Core Web Vitals de votre site
          </p>
        </div>

        {/* Bouton de test */}
        <div className="mb-6">
          <Button onClick={handleTestPerformance} disabled={testing} size="lg">
            {testing ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Zap className="h-5 w-5 mr-2" />
            )}
            {testing ? "Test en cours..." : "Tester les Performances"}
          </Button>
        </div>

        {performanceResults && (
          <>
            {/* Dashboard Performance - PageSpeed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Mobile Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    PageSpeed Mobile
                  </CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      performanceResults.pageSpeed.mobile
                    )}`}
                  >
                    {performanceResults.pageSpeed.mobile}/100
                  </div>
                  <Progress
                    value={performanceResults.pageSpeed.mobile}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {getScoreLabel(performanceResults.pageSpeed.mobile)}
                  </p>
                </CardContent>
              </Card>

              {/* Desktop Score */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    PageSpeed Desktop
                  </CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      performanceResults.pageSpeed.desktop
                    )}`}
                  >
                    {performanceResults.pageSpeed.desktop}/100
                  </div>
                  <Progress
                    value={performanceResults.pageSpeed.desktop}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {getScoreLabel(performanceResults.pageSpeed.desktop)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Core Web Vitals */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>
                  Métriques essentielles pour l'expérience utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LCP */}
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">LCP</span>
                      </div>
                      <Badge
                        variant={
                          performanceResults.coreWebVitals.lcp <= 2500
                            ? "default"
                            : "destructive"
                        }
                      >
                        {performanceResults.coreWebVitals.lcp <= 2500
                          ? "Bon"
                          : "À améliorer"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {performanceResults.coreWebVitals.lcp}ms
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Largest Contentful Paint
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Objectif: &lt; 2.5s
                    </p>
                  </div>

                  {/* FID */}
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">FID</span>
                      </div>
                      <Badge
                        variant={
                          performanceResults.coreWebVitals.fid <= 100
                            ? "default"
                            : "destructive"
                        }
                      >
                        {performanceResults.coreWebVitals.fid <= 100
                          ? "Bon"
                          : "À améliorer"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {performanceResults.coreWebVitals.fid}ms
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      First Input Delay
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Objectif: &lt; 100ms
                    </p>
                  </div>

                  {/* CLS */}
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">CLS</span>
                      </div>
                      <Badge
                        variant={
                          performanceResults.coreWebVitals.cls <= 0.1
                            ? "default"
                            : "destructive"
                        }
                      >
                        {performanceResults.coreWebVitals.cls <= 0.1
                          ? "Bon"
                          : "À améliorer"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">
                      {performanceResults.coreWebVitals.cls.toFixed(3)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cumulative Layout Shift
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Objectif: &lt; 0.1
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyse des ressources */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Analyse des Ressources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold">
                      {(performanceResults.resources.totalSize / 1024).toFixed(
                        0
                      )}{" "}
                      KB
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Taille totale
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold">
                      {performanceResults.resources.images}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Images</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold">
                      {performanceResults.resources.scripts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scripts JS
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-lg font-bold">
                      {performanceResults.resources.stylesheets}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Feuilles CSS
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations */}
            {performanceResults.recommendations &&
              performanceResults.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Recommandations d'Optimisation
                    </CardTitle>
                    <CardDescription>
                      Actions pour améliorer les performances de votre site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceResults.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg ${
                            rec.impact === "high"
                              ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                              : rec.impact === "medium"
                              ? "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
                              : "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {rec.impact === "high" ? (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                ) : rec.impact === "medium" ? (
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <Info className="h-4 w-4 text-blue-600" />
                                )}
                                <p className="font-medium text-sm">
                                  {rec.message}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <strong>Solution:</strong> {rec.fix}
                              </p>
                            </div>
                            <Badge
                              variant={
                                rec.impact === "high"
                                  ? "destructive"
                                  : rec.impact === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {rec.impact === "high"
                                ? "Impact Élevé"
                                : rec.impact === "medium"
                                ? "Impact Moyen"
                                : "Impact Faible"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </>
        )}

        {/* État initial */}
        {!performanceResults && !testing && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Aucun test de performance effectué
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Cliquez sur le bouton ci-dessus pour lancer un test de
                performance complet
              </p>
            </CardContent>
          </Card>
        )}

        {/* Aide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />À propos des tests de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>PageSpeed Insights :</strong> Mesure la vitesse de
                chargement de votre site sur mobile et desktop. Un score
                supérieur à 90 est excellent.
              </p>
              <p>
                <strong>Core Web Vitals :</strong> Métriques Google officielles
                pour l'expérience utilisateur :
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>
                  <strong>LCP</strong> (Largest Contentful Paint) : Temps
                  d'affichage du contenu principal (&lt; 2.5s = bon)
                </li>
                <li>
                  <strong>FID</strong> (First Input Delay) : Temps de réponse à
                  la première interaction (&lt; 100ms = bon)
                </li>
                <li>
                  <strong>CLS</strong> (Cumulative Layout Shift) : Stabilité
                  visuelle de la page (&lt; 0.1 = bon)
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/seo/analysis")}
                >
                  <BarChart3 className="h-3 w-3 mr-2" />
                  Analyse Technique
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/seo/settings")}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Paramètres SEO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminSEOPerformancePage() {
  return (
    <ProtectedAdminPage page="performance">
      <AdminErrorBoundary>
        <PerformancePageContent />
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
