"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  ExternalLink,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";

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

interface AlertSummary {
  total: number;
  unread: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export default function KeywordAlertsWidget() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/seo/keywords/alerts");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAlerts(result.data.alerts);
          setSummary(result.data.summary);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await fetch("/api/admin/seo/keywords/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alertId,
          action: "mark_as_read"
        })
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
      
      if (summary) {
        setSummary({
          ...summary,
          unread: Math.max(0, summary.unread - 1)
        });
      }
    } catch (error) {
      console.error("Erreur lors du marquage de l'alerte:", error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case "trend":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "threat":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "keyword":
        return "bg-blue-100 text-blue-800";
      case "content":
        return "bg-green-100 text-green-800";
      case "technical":
        return "bg-purple-100 text-purple-800";
      case "competitor":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alertes SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Chargement des alertes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alertes SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Aucune alerte</h3>
            <p className="text-sm text-gray-600 mb-4">
              Votre SEO est en bonne santé ! Aucune action urgente requise.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/seo/keywords")}
            >
              Voir l'analyse complète
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alertes SEO
            {summary.unread > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {summary.unread}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/seo/keywords")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir tout
          </Button>
        </div>
        
        {/* Résumé des alertes */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{summary.critical} critique{summary.critical > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>{summary.high} importante{summary.high > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{summary.medium} moyen{summary.medium > 1 ? 'nes' : 'ne'}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {displayedAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border ${
                alert.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(alert.type)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(alert.category)}`}>
                    {alert.category}
                  </span>
                  <Badge className={getSeverityColor(alert.severity)} size="sm">
                    {alert.severity}
                  </Badge>
                  {!alert.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => markAsRead(alert.id)}
                    title={alert.read ? "Marquer comme non lu" : "Marquer comme lu"}
                  >
                    {alert.read ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.timeline}
                </span>
                <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
              </div>
              
              {!alert.read && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <strong>Action :</strong> {alert.action}
                </div>
              )}
            </div>
          ))}
          
          {alerts.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Voir moins
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Voir {alerts.length - 3} alerte{alerts.length - 3 > 1 ? 's' : ''} de plus
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
