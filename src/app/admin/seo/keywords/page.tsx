"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Search,
  Eye,
  MousePointer,
  Users,
  Zap,
  Clock,
  ExternalLink,
  RefreshCw,
  Filter,
  Download,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectedAdminPage } from "@/components/admin/ProtectedAdminPage";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";

interface KeywordPerformance {
  keyword: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  trend: "up" | "down" | "stable";
  change: number;
  searchVolume: number;
  difficulty: "low" | "medium" | "high";
  opportunity: number;
}

interface TrendingKeyword {
  keyword: string;
  searchVolume: number;
  trend: number;
  seasonality: "high" | "medium" | "low";
  category: string;
  opportunity: "high" | "medium" | "low";
  competition: "low" | "medium" | "high";
}

interface CompetitorGap {
  keyword: string;
  yourPosition: number | null;
  competitorPositions: Array<{
    domain: string;
    position: number;
    url: string;
  }>;
  gap: number;
  opportunity: "high" | "medium" | "low";
  potentialTraffic: number;
}

interface KeywordSuggestion {
  keyword: string;
  reason: string;
  potential: {
    searchVolume: number;
    difficulty: "low" | "medium" | "high";
    opportunity: number;
  };
  action: string;
  expectedImpact: string;
  category: "primary" | "long-tail" | "local" | "seasonal";
  priority: "high" | "medium" | "low";
}

interface ContentSuggestion {
  type: "page" | "blog" | "section";
  title: string;
  keywords: string[];
  content: string;
  structure: {
    h1: string;
    h2: string[];
    metaDescription: string;
  };
  expectedTraffic: number;
  difficulty: "easy" | "medium" | "hard";
  timeframe: string;
}

interface SmartAlert {
  id: string;
  type: "opportunity" | "threat" | "trend" | "technical" | "competitor";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  action: string;
  timeline: string;
  category: "keyword" | "content" | "technical" | "competitor" | "performance";
  timestamp: string;
  read: boolean;
}

interface KeywordAnalysisData {
  currentKeywords: KeywordPerformance[];
  trendingKeywords: TrendingKeyword[];
  competitorGaps: CompetitorGap[];
  suggestions: {
    keywordOpportunities: KeywordSuggestion[];
    contentSuggestions: ContentSuggestion[];
  };
  summary: {
    totalKeywords: number;
    averagePosition: number;
    monthlyTraffic: number;
    trend: "up" | "down" | "stable";
    opportunities: number;
    threats: number;
  };
}

function KeywordsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<KeywordAnalysisData | null>(null);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");

  const fetchKeywordAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch("/api/admin/seo/keywords/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse des mots-clés");
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        toast.success("Analyse des mots-clés mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'analyse des mots-clés");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/seo/keywords/alerts");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAlerts(result.data.alerts);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchKeywordAnalysis(), fetchAlerts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Chargement de l'analyse des mots-clés...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analyse des mots-clés
          </h1>
          <p className="text-gray-600 mt-1">
            Surveillance en temps réel et suggestions intelligentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchKeywordAnalysis}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {analyzing ? "Analyse..." : "Analyser"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres SEO
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes intelligentes ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium text-sm">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-blue-600">
                        <strong>Action :</strong> {alert.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Voir toutes les alertes ({alerts.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mots-clés surveillés
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.summary.totalKeywords}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {data.summary.trend === "up"
                    ? "En hausse"
                    : data.summary.trend === "down"
                    ? "En baisse"
                    : "Stable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Position moyenne
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.summary.averagePosition}
                  </p>
                </div>
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Progress
                  value={Math.max(0, 100 - data.summary.averagePosition * 5)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Trafic mensuel
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.summary.monthlyTraffic}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Clics organiques</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Opportunités
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.summary.opportunities}
                  </p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {data.summary.threats} menaces détectées
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      {data && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="current">Mots-clés actuels</TabsTrigger>
            <TabsTrigger value="trending">Tendances</TabsTrigger>
            <TabsTrigger value="competitors">Concurrents</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mots-clés actuels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Mots-clés actuels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.currentKeywords.slice(0, 5).map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {keyword.keyword}
                          </p>
                          <p className="text-xs text-gray-500">
                            Position {keyword.position} • {keyword.clicks} clics
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(keyword.trend)}
                          <Badge
                            className={getOpportunityColor(
                              keyword.opportunity > 70
                                ? "high"
                                : keyword.opportunity > 40
                                ? "medium"
                                : "low"
                            )}
                          >
                            {keyword.opportunity}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tendances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Mots-clés en tendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.trendingKeywords.slice(0, 5).map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {keyword.keyword}
                          </p>
                          <p className="text-xs text-gray-500">
                            {keyword.searchVolume} recherches/mois •
                            <span
                              className={
                                keyword.trend > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {keyword.trend > 0 ? "+" : ""}
                              {keyword.trend}%
                            </span>
                          </p>
                        </div>
                        <Badge
                          className={getOpportunityColor(keyword.opportunity)}
                        >
                          {keyword.opportunity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mots-clés actuels */}
          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Performances des mots-clés actuels</span>
                  <Badge variant="outline">
                    {data.currentKeywords.length} mots-clés
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Mot-clé</th>
                        <th className="text-left p-3">Position</th>
                        <th className="text-left p-3">Impressions</th>
                        <th className="text-left p-3">Clics</th>
                        <th className="text-left p-3">CTR</th>
                        <th className="text-left p-3">Tendance</th>
                        <th className="text-left p-3">Opportunité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.currentKeywords.map((keyword, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{keyword.keyword}</p>
                              <p className="text-xs text-gray-500">
                                Vol. {keyword.searchVolume}/mois
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={getDifficultyColor(keyword.difficulty)}
                            >
                              {keyword.position}
                            </Badge>
                          </td>
                          <td className="p-3">{keyword.impressions}</td>
                          <td className="p-3">{keyword.clicks}</td>
                          <td className="p-3">
                            {(keyword.ctr * 100).toFixed(1)}%
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {getTrendIcon(keyword.trend)}
                              {keyword.change !== 0 && (
                                <span className="text-xs text-gray-500">
                                  {keyword.change > 0 ? "+" : ""}
                                  {keyword.change}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={getOpportunityColor(
                                keyword.opportunity > 70
                                  ? "high"
                                  : keyword.opportunity > 40
                                  ? "medium"
                                  : "low"
                              )}
                            >
                              {keyword.opportunity}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tendances */}
          <TabsContent value="trending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Mots-clés en tendance
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Découvrez les nouvelles opportunités basées sur les tendances
                  actuelles
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.trendingKeywords.map((keyword, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{keyword.keyword}</h4>
                          <p className="text-sm text-gray-500">
                            {keyword.searchVolume} recherches/mois
                          </p>
                        </div>
                        <Badge
                          className={getOpportunityColor(keyword.opportunity)}
                        >
                          {keyword.opportunity}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Tendance :</span>
                          <span
                            className={
                              keyword.trend > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {keyword.trend > 0 ? "+" : ""}
                            {keyword.trend}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Concurrence :</span>
                          <Badge
                            variant="outline"
                            className={getDifficultyColor(keyword.competition)}
                          >
                            {keyword.competition}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Saisonnalité :</span>
                          <Badge
                            variant="outline"
                            className={
                              keyword.seasonality === "high"
                                ? "bg-orange-100 text-orange-800"
                                : keyword.seasonality === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {keyword.seasonality}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Concurrents */}
          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Analyse concurrentielle
                  </div>
                  <div className="flex items-center gap-2">
                    {data.competitorGaps.some(
                      (gap) => gap.competitorPositions.length > 0
                    ) ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Données réelles Google
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200"
                      >
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        Données simulées
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {data.competitorGaps.some(
                    (gap) => gap.competitorPositions.length > 0
                  )
                    ? "Analyse basée sur les vraies positions Google Search Console"
                    : "Connectez-vous à Google Analytics pour obtenir les vraies données concurrentielles"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.competitorGaps.map((gap, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{gap.keyword}</h4>
                          <p className="text-sm text-gray-500">
                            Votre position : {gap.yourPosition || "Non classé"}
                          </p>
                        </div>
                        <Badge className={getOpportunityColor(gap.opportunity)}>
                          {gap.opportunity}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Gap :</strong> {gap.gap} positions derrière le
                          leader
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Potentiel :</strong> {gap.potentialTraffic}{" "}
                          visiteurs/mois
                        </p>
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">
                            Concurrents :
                          </p>
                          <div className="space-y-1">
                            {gap.competitorPositions
                              .slice(0, 3)
                              .map((comp, compIndex) => (
                                <div
                                  key={compIndex}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>{comp.domain}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      Pos. {comp.position}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions */}
          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Suggestions de mots-clés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Nouvelles opportunités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.suggestions.keywordOpportunities.map(
                      (suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">
                                {suggestion.keyword}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {suggestion.reason}
                              </p>
                            </div>
                            <Badge
                              className={getOpportunityColor(
                                suggestion.priority
                              )}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Volume :</span>
                              <span>
                                {suggestion.potential.searchVolume}/mois
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Difficulté :</span>
                              <Badge
                                variant="outline"
                                className={getDifficultyColor(
                                  suggestion.potential.difficulty
                                )}
                              >
                                {suggestion.potential.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Opportunité :</span>
                              <span className="font-medium">
                                {suggestion.potential.opportunity}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Action :</strong> {suggestion.action}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {suggestion.expectedImpact}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions de contenu */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Suggestions de contenu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.suggestions.contentSuggestions.map(
                      (suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">
                                {suggestion.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Type : {suggestion.type} •{" "}
                                {suggestion.expectedTraffic} visiteurs/mois
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                suggestion.difficulty === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : suggestion.difficulty === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {suggestion.difficulty}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">
                                Mots-clés cibles :
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {suggestion.keywords.map((keyword, kwIndex) => (
                                  <Badge
                                    key={kwIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Délai :</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {suggestion.timeframe}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-green-50 rounded">
                            <p className="text-sm text-green-800">
                              <strong>H1 :</strong> {suggestion.structure.h1}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              <strong>Meta :</strong>{" "}
                              {suggestion.structure.metaDescription}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function AdminKeywordsPage() {
  return (
    <ProtectedAdminPage requiredPermissions={["canView", "canEdit"]}>
      <AdminErrorBoundary>
        <KeywordsContent />
      </AdminErrorBoundary>
    </ProtectedAdminPage>
  );
}
