import { NextRequest, NextResponse } from "next/server";

interface SmartAlert {
  id: string;
  type:
    | "opportunity"
    | "threat"
    | "trend"
    | "technical"
    | "content"
    | "competitive";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  action: string;
  timeline: string;
  category: "keyword" | "content" | "technical" | "competitive";
  data?: any;
  timestamp: string;
  read: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const authResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/verify`
      );
      if (!authResponse.ok) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    // Récupérer les paramètres SEO
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const settingsResponse = await fetch(`${baseUrl}/api/settings`);

    if (!settingsResponse.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les paramètres SEO" },
        { status: 500 }
      );
    }

    const settings = await settingsResponse.json();
    const seoSettings = settings.seoSettings || {};
    const businessInfo = settings.businessSettings || settings.general || {};

    const alerts: SmartAlert[] = [];
    const timestamp = new Date().toISOString();
    const currentKeywords =
      seoSettings.keywords?.split(",").map((k: string) => k.trim()) || [];

    let hasRealData = false;

    try {
      const { createGoogleAnalyticsClient } = await import(
        "@/lib/analytics/google-analytics-client"
      );

      const googleClient = createGoogleAnalyticsClient(
        seoSettings.googleAnalyticsId
      );

      if (googleClient) {
        const isAuth = await googleClient.isAuthenticated();
        if (isAuth) {
          hasRealData = true;
          console.log(
            "🔌 Génération d'alertes basées sur les vraies données Google"
          );

          const realDataAlerts = await generateRealDataAlerts(
            googleClient,
            currentKeywords,
            baseUrl
          );
          alerts.push(...realDataAlerts);
        }
      }
    } catch (error) {
      console.error("❌ Erreur OAuth pour les alertes:", error);
      throw new Error(
        `Erreur lors de la récupération des données Google pour les alertes: ${error.message}`
      );
    }

    // Si pas de vraies données, lancer une erreur
    if (!hasRealData) {
      console.log("ℹ️ Aucune donnée Google disponible");
      throw new Error(
        "Impossible de générer des alertes sans connexion Google Analytics. Veuillez vous connecter à Google."
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
        unread: alerts.filter((alert) => !alert.read).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la génération des alertes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération des alertes" },
      { status: 500 }
    );
  }
}

/**
 * Génère des alertes basées sur les vraies données Google Search Console
 */
async function generateRealDataAlerts(
  googleClient: any,
  currentKeywords: string[],
  baseUrl: string
): Promise<SmartAlert[]> {
  const alerts: SmartAlert[] = [];
  const timestamp = new Date().toISOString();

  try {
    for (const keyword of currentKeywords) {
      const searchConsoleData = await googleClient.getSearchConsoleData(
        baseUrl,
        keyword
      );

      if (
        searchConsoleData &&
        searchConsoleData.rows &&
        searchConsoleData.rows.length > 0
      ) {
        const row = searchConsoleData.rows[0];
        const position = parseFloat(row.position || "0");
        const clicks = parseInt(row.clicks || "0");
        const impressions = parseInt(row.impressions || "0");
        const ctr = parseFloat(row.ctr || "0");

        // Alerte si position chute
        if (position > 10) {
          alerts.push({
            id: `position-drop-${keyword.replace(/\s+/g, "-")}`,
            type: "threat",
            severity: position > 20 ? "critical" : "high",
            title: `Position en chute pour "${keyword}"`,
            message: `Le mot-clé "${keyword}" est position ${position}, soit une chute significative`,
            action: "Optimiser le contenu et les balises pour ce mot-clé",
            timeline: "Action urgente requise",
            category: "keyword",
            data: {
              keyword,
              currentPosition: position,
              targetPosition: 5,
            },
            timestamp,
            read: false,
          });
        }

        // Alerte si CTR faible
        if (position < 10 && ctr < 0.03) {
          alerts.push({
            id: `low-ctr-${keyword.replace(/\s+/g, "-")}`,
            type: "opportunity",
            severity: "medium",
            title: `CTR faible pour "${keyword}"`,
            message: `Le CTR de ${(ctr * 100).toFixed(
              1
            )}% est en dessous de la moyenne pour la position ${position}`,
            action: "Améliorer le titre et la meta description pour ce mot-clé",
            timeline: "Impact visible dans 2-3 semaines",
            category: "keyword",
            data: {
              keyword,
              currentCTR: ctr,
              position,
              targetCTR: 0.05,
            },
            timestamp,
            read: false,
          });
        }

        // Alerte si trafic en baisse
        if (clicks < 10 && impressions > 100) {
          alerts.push({
            id: `traffic-drop-${keyword.replace(/\s+/g, "-")}`,
            type: "threat",
            severity: "medium",
            title: `Trafic en baisse pour "${keyword}"`,
            message: `${impressions} impressions mais seulement ${clicks} clics ce mois`,
            action: "Analyser la concurrence et optimiser le contenu",
            timeline: "Action requise cette semaine",
            category: "keyword",
            data: {
              keyword,
              impressions,
              clicks,
              ctr,
            },
            timestamp,
            read: false,
          });
        }
      }
    }

    console.log(
      `✅ ${alerts.length} alertes générées basées sur les vraies données`
    );
    return alerts;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la génération d'alertes avec vraies données:",
      error
    );
    return [];
  }
}
