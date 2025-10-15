/**
 * Google Analytics Client avec authentification OAuth
 *
 * Ce module gère l'intégration avec l'API Google Analytics via OAuth2.
 *
 * @module GoogleAnalyticsClient
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { google } from "googleapis";
import { createOAuthService } from "@/lib/google-oauth-service";

export interface AnalyticsData {
  sessions: number | null;
  pageViews: number | null;
  bounceRate: number | null;
  avgSessionDuration: number | null;
}

export interface PageSpeedData {
  mobile: number | null;
  desktop: number | null;
}

export interface SearchConsoleData {
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  position: number | null;
}

export interface GoogleDataResponse {
  analytics: AnalyticsData;
  pageSpeed: PageSpeedData;
  searchConsole: SearchConsoleData;
}

/**
 * Client Google Analytics avec OAuth2
 */
export class GoogleAnalyticsClient {
  private googleAnalyticsId: string;

  constructor(googleAnalyticsId: string) {
    this.googleAnalyticsId = googleAnalyticsId;
  }

  /**
   * Vérifie si le client est configuré et authentifié
   */
  public async isConfigured(): Promise<boolean> {
    try {
      const oauthService = createOAuthService();
      return oauthService && (await oauthService.isAuthenticated());
    } catch (error) {
      console.warn("⚠️ Erreur vérification configuration OAuth:", error);
      return false;
    }
  }

  /**
   * Vérifie si le client est authentifié avec Google
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const oauthService = createOAuthService();

      if (!oauthService) {
        return false;
      }

      return await oauthService.isAuthenticated();
    } catch (error) {
      console.warn("⚠️ Erreur vérification authentification:", error);
      return false;
    }
  }

  /**
   * Récupère les données Google Analytics via OAuth
   */
  public async getAnalyticsData(): Promise<AnalyticsData | null> {
    try {
      const oauthService = createOAuthService();

      if (!oauthService) {
        console.log("⚠️ OAuth non configuré");
        return null;
      }

      const isAuth = await oauthService.isAuthenticated();

      if (!isAuth) {
        console.log("⚠️ Non authentifié avec Google");
        return null;
      }

      const auth = await oauthService.getAuthenticatedClient();
      const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

      if (!propertyId) {
        console.log("⚠️ GOOGLE_ANALYTICS_PROPERTY_ID manquant");
        return null;
      }

      const analyticsDataClient = new BetaAnalyticsDataClient({
        auth,
        // Fix pour la version récente de l'API Google
        universeDomain: "googleapis.com",
      });

      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: "30daysAgo",
            endDate: "today",
          },
        ],
        metrics: [
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      });

      return {
        sessions: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0"),
        pageViews: parseInt(
          response.rows?.[0]?.metricValues?.[1]?.value || "0"
        ),
        bounceRate: parseFloat(
          response.rows?.[0]?.metricValues?.[2]?.value || "0"
        ),
        avgSessionDuration: parseFloat(
          response.rows?.[0]?.metricValues?.[3]?.value || "0"
        ),
      };
    } catch (error) {
      console.error("❌ Erreur Analytics:", error);
      return null;
    }
  }

  /**
   * Récupère les données PageSpeed Insights
   */
  public async getPageSpeedData(url: string): Promise<PageSpeedData | null> {
    try {
      const pagespeedApiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

      if (!pagespeedApiKey) {
        return null;
      }

      const [mobileResponse, desktopResponse] = await Promise.all([
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            url
          )}&strategy=mobile&key=${pagespeedApiKey}`
        ),
        fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
            url
          )}&strategy=desktop&key=${pagespeedApiKey}`
        ),
      ]);

      const mobileData = mobileResponse.ok ? await mobileResponse.json() : null;
      const desktopData = desktopResponse.ok
        ? await desktopResponse.json()
        : null;

      return {
        mobile: mobileData
          ? Math.round(
              mobileData.lighthouseResult?.categories?.performance?.score * 100
            )
          : null,
        desktop: desktopData
          ? Math.round(
              desktopData.lighthouseResult?.categories?.performance?.score * 100
            )
          : null,
      };
    } catch (error) {
      console.error("❌ Erreur PageSpeed:", error);
      return null;
    }
  }

  /**
   * Récupère les données Search Console via OAuth
   */
  public async getSearchConsoleData(
    siteUrl: string,
    keyword?: string,
    period?: string
  ): Promise<any> {
    try {
      const oauthService = createOAuthService();

      if (!oauthService) {
        return null;
      }

      const isAuth = await oauthService.isAuthenticated();

      if (!isAuth) {
        return null;
      }

      const auth = await oauthService.getAuthenticatedClient();
      const searchConsole = google.searchconsole({ version: "v1", auth });

      // Déterminer la période
      let startDate: string;
      let endDate: string;

      if (period === "previous_period") {
        startDate = getDateNDaysAgo(60);
        endDate = getDateNDaysAgo(30);
      } else {
        startDate = getDateNDaysAgo(30);
        endDate = getDateNDaysAgo(0);
      }

      // Si un mot-clé spécifique est demandé
      if (keyword) {
        const response = await searchConsole.searchanalytics.query({
          siteUrl: siteUrl,
          requestBody: {
            startDate,
            endDate,
            dimensions: ["query"],
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: "query",
                    operator: "equals",
                    expression: keyword,
                  },
                ],
              },
            ],
            rowLimit: 1,
          },
        });

        if (response.data.rows && response.data.rows.length > 0) {
          const row = response.data.rows[0];
          return {
            rows: [
              {
                impressions: row.impressions || 0,
                clicks: row.clicks || 0,
                ctr: row.ctr || 0,
                position: row.position || 0,
              },
            ],
          };
        }

        // Aucune donnée pour ce mot-clé spécifique
        return { rows: [] };
      }

      // Données générales du site (retourner les top mots-clés)
      const response = await searchConsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"], // Retourner par mot-clé
          rowLimit: 25, // Top 25 mots-clés
        },
      });

      if (response.data.rows && response.data.rows.length > 0) {
        // Retourner les données dans le même format que pour un keyword spécifique
        return {
          rows: response.data.rows.map((row: any) => ({
            keys: row.keys,
            impressions: row.impressions || 0,
            clicks: row.clicks || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
          })),
        };
      }

      return null;
    } catch (error) {
      console.warn("⚠️ Erreur Search Console:", error);
      return null;
    }
  }

  /**
   * Récupère les données concurrentielles pour un mot-clé spécifique
   */
  public async getCompetitorData(
    keyword: string,
    competitorDomains: string[],
    yourDomain: string
  ): Promise<{
    yourPosition: number | null;
    competitors: Array<{
      domain: string;
      position: number | null;
      clicks: number | null;
    }>;
  }> {
    try {
      // Récupérer la position de votre site
      const yourData = await this.getSearchConsoleData(yourDomain, keyword);
      const yourPosition = yourData?.rows?.[0]?.position
        ? parseFloat(yourData.rows[0].position)
        : null;

      const competitors = [];

      // Récupérer les positions des concurrents
      for (const domain of competitorDomains) {
        try {
          const competitorData = await this.getSearchConsoleData(
            `https://${domain}`,
            keyword
          );

          competitors.push({
            domain,
            position: competitorData?.rows?.[0]?.position
              ? parseFloat(competitorData.rows[0].position)
              : null,
            clicks: competitorData?.rows?.[0]?.clicks
              ? parseInt(competitorData.rows[0].clicks)
              : null,
          });
        } catch (error) {
          console.log(
            `⚠️ Impossible de récupérer les données pour ${domain}:`,
            error.message
          );
          competitors.push({
            domain,
            position: null,
            clicks: null,
          });
        }
      }

      return {
        yourPosition,
        competitors,
      };
    } catch (error) {
      console.error(`❌ Erreur récupération données concurrentielles:`, error);
      return {
        yourPosition: null,
        competitors: competitorDomains.map((domain) => ({
          domain,
          position: null,
          clicks: null,
        })),
      };
    }
  }

  /**
   * Récupère toutes les données Google
   */
  public async getAllData(siteUrl: string): Promise<GoogleDataResponse | null> {
    try {
      console.log("🔌 Récupération des données Google en cours...");

      const [analytics, pageSpeed, searchConsole] = await Promise.all([
        this.getAnalyticsData(),
        this.getPageSpeedData(siteUrl),
        this.getSearchConsoleData(siteUrl),
      ]);

      // Si toutes les données sont null, retourner null
      if (!analytics && !pageSpeed && !searchConsole) {
        console.log("⚠️ Aucune donnée Google récupérée");
        return null;
      }

      console.log("✅ Données Google récupérées avec succès");

      return {
        analytics: analytics || {
          sessions: null,
          pageViews: null,
          bounceRate: null,
          avgSessionDuration: null,
        },
        pageSpeed: pageSpeed || {
          mobile: null,
          desktop: null,
        },
        searchConsole: searchConsole || {
          impressions: null,
          clicks: null,
          ctr: null,
          position: null,
        },
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des données Google:",
        error
      );
      return null;
    }
  }
}

/**
 * Factory pour créer un client Google Analytics
 */
export function createGoogleAnalyticsClient(
  googleAnalyticsId: string | null
): GoogleAnalyticsClient | null {
  // Vérifier si c'est un ID de démo
  const demoIds = ["G-58FT91034E", "G-XXXXXXXXXX", "G-YOUR-GA-ID"];
  if (!googleAnalyticsId || demoIds.includes(googleAnalyticsId)) {
    return null;
  }

  return new GoogleAnalyticsClient(googleAnalyticsId);
}

// Helper function
function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}
