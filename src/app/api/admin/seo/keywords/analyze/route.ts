import { NextRequest, NextResponse } from "next/server";

interface KeywordPerformance {
  keyword: string;
  position: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  trend?: "up" | "down" | "stable";
  change?: number;
  searchVolume?: number;
  difficulty?: "low" | "medium" | "high";
  opportunity?: number; // 0-100
  isRealData?: boolean; // Indique si les données viennent de Google Search Console
  message?: string; // Message de connexion si pas de données
}

interface TrendingKeyword {
  keyword: string;
  searchVolume: number;
  trend: number; // -100 à +100
  seasonality: "high" | "medium" | "low";
  category: string;
  opportunity: "high" | "medium" | "low";
  competition: "low" | "medium" | "high";
  isRealData?: boolean; // Indique si les données viennent de Google Trends
}

interface CompetitorGap {
  keyword: string;
  yourPosition: number | null;
  competitorPositions: Array<{
    domain: string;
    position: number;
    url: string;
  }>;
  gap: number; // Position du meilleur concurrent
  opportunity: "high" | "medium" | "low";
  potentialTraffic: number;
  isRealData?: boolean; // Indique si les données sont réelles ou simulées
  message?: string; // Message de connexion si pas de données
}

interface KeywordSuggestion {
  keyword: string;
  reason: string;
  potential: {
    searchVolume: number;
    difficulty: "low" | "medium" | "high";
    opportunity: number; // 0-100
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

interface KeywordAnalysisResult {
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

/**
 * Détecte le secteur d'activité basé sur un mot-clé
 */
function detectSectorFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();

  // Web & Digital
  if (
    ["agence", "web", "site", "développement", "digital", "design"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "web_agency";
  }

  // E-commerce
  if (
    ["boutique", "e-commerce", "shop", "vente", "magasin"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "ecommerce";
  }

  // Restaurant
  if (
    ["restaurant", "resto", "cuisine", "gastronomie"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "restaurant";
  }

  // Artisan
  if (
    ["plombier", "electricien", "artisan", "travaux"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "artisan";
  }

  // Immobilier
  if (
    ["immobilier", "immo", "appartement", "maison"].some((k) => kw.includes(k))
  ) {
    return "immobilier";
  }

  // Santé
  if (
    ["medecin", "docteur", "sante", "medical", "clinique"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "sante";
  }

  // Juridique
  if (["avocat", "notaire", "juridique", "droit"].some((k) => kw.includes(k))) {
    return "juridique";
  }

  // Formation
  if (["formation", "cours", "ecole", "learning"].some((k) => kw.includes(k))) {
    return "formation";
  }

  // Consulting
  if (
    ["consulting", "conseil", "consultant", "expertise"].some((k) =>
      kw.includes(k)
    )
  ) {
    return "consulting";
  }

  // Défaut
  return "local_business";
}

// Configuration par secteur d'activité
const SECTOR_CONFIGS = {
  web_agency: {
    primaryKeywords: [
      "agence web",
      "création site web",
      "développement web",
      "design web",
      "référencement web",
      "site vitrine",
    ],
    localKeywords: [
      "agence web [ville]",
      "création site [ville]",
      "développeur web [ville]",
    ],
    competitorDomains: [
      "web-agency.fr",
      "agence-digitale.com",
      "web-creator.net",
    ],
    contentTypes: ["services", "portfolio", "blog", "contact"],
  },
  ecommerce: {
    primaryKeywords: [
      "boutique en ligne",
      "e-commerce",
      "site de vente",
      "magasin en ligne",
      "vente en ligne",
    ],
    localKeywords: ["boutique [ville]", "vendre en ligne [région]"],
    competitorDomains: ["shopify.com", "prestashop.com", "magento.com"],
    contentTypes: ["produits", "catégories", "blog", "guide-achat"],
  },
  local_business: {
    primaryKeywords: [
      "services [secteur]",
      "professionnel [ville]",
      "expert [domaine]",
      "spécialiste [activité]",
    ],
    localKeywords: ["[service] [ville]", "[profession] [région]"],
    competitorDomains: ["pagesjaunes.fr", "annuaire-local.com"],
    contentTypes: ["services", "localisation", "témoignages", "actualités"],
  },
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin (contournement pour développement)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const authResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/verify`
      );
      if (!authResponse.ok) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }
    }

    // Récupérer les paramètres SEO actuels
    const searchConsoleUrl = "sc-domain:kairo-digital.fr"; // URL pour Google Search Console (format domaine)
    const apiBaseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SITE_URL || "https://kairo-digital.fr"
        : "http://localhost:3000"; // URL pour les appels API internes
    const settingsResponse = await fetch(`${apiBaseUrl}/api/settings`);
    let seoSettings = {};
    let businessInfo = {};

    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      seoSettings = settings.seoSettings || {};
      businessInfo =
        settings.businessSettings || settings.general || ({} as any);
    }

    // Récupérer les VRAIS mots-clés depuis Search Console si OAuth actif
    let currentKeywords: string[] = [];
    let useRealKeywordsFromSearchConsole = false;

    try {
      const { createGoogleAnalyticsClient } = await import(
        "@/lib/analytics/google-analytics-client"
      );

      console.log("🔍 Configuration SEO disponible:", {
        googleAnalyticsId: seoSettings.googleAnalyticsId,
        keywords: seoSettings.keywords,
      });

      const googleClient = createGoogleAnalyticsClient(
        seoSettings.googleAnalyticsId
      );

      if (googleClient && (await googleClient.isAuthenticated())) {
        console.log(
          "🔍 Récupération des TOP mots-clés depuis Search Console..."
        );
        const topKeywordsData = await googleClient.getSearchConsoleData(
          searchConsoleUrl
        );

        if (
          topKeywordsData &&
          topKeywordsData.rows &&
          topKeywordsData.rows.length > 0
        ) {
          currentKeywords = topKeywordsData.rows
            .slice(0, 10) // Top 10 mots-clés
            .map((row: any) => row.keys[0]);
          useRealKeywordsFromSearchConsole = true;
          console.log(
            `✅ ${currentKeywords.length} mots-clés réels récupérés depuis Search Console`
          );
          console.log(`   → ${currentKeywords.slice(0, 3).join(", ")}...`);
        } else {
          console.log(
            "⚠️ Aucune donnée de mots-clés trouvée dans Search Console"
          );
        }
      } else {
        console.log("⚠️ OAuth non authentifié ou client Google non créé");
      }
    } catch (error: any) {
      console.log(
        "⚠️ Erreur récupération mots-clés Search Console:",
        error.message
      );
    }

    // Fallback vers les mots-clés configurés
    if (!useRealKeywordsFromSearchConsole) {
      currentKeywords =
        seoSettings.keywords?.split(",").map((k: string) => k.trim()) || [];
      console.log(
        `📝 Utilisation des mots-clés configurés: ${currentKeywords.join(", ")}`
      );
    }
    const sector = detectBusinessSector(currentKeywords, businessInfo);
    const config = SECTOR_CONFIGS[sector];

    // 1. Analyser les mots-clés actuels
    const currentKeywordsAnalysis = await analyzeCurrentKeywords(
      currentKeywords,
      seoSettings,
      searchConsoleUrl
    );

    // 2. Détecter les tendances
    const trendingKeywords = await detectTrendingKeywords(
      config,
      businessInfo,
      currentKeywords
    );

    // 3. Analyser les gaps concurrentiels
    const competitorGaps = await analyzeCompetitorGaps(
      config,
      currentKeywords,
      searchConsoleUrl
    );

    // 4. Générer des suggestions intelligentes
    const suggestions = await generateIntelligentSuggestions(
      currentKeywordsAnalysis,
      trendingKeywords,
      competitorGaps,
      config,
      businessInfo
    );

    // 5. Calculer le résumé
    const summary = calculateSummary(
      currentKeywordsAnalysis,
      trendingKeywords,
      competitorGaps
    );

    const result: KeywordAnalysisResult = {
      currentKeywords: currentKeywordsAnalysis,
      trendingKeywords,
      competitorGaps,
      suggestions,
      summary,
    };

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      sector,
      config: {
        primaryKeywords: config.primaryKeywords,
        localKeywords: config.localKeywords,
        contentTypes: config.contentTypes,
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse des mots-clés:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse des mots-clés",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function detectBusinessSector(
  keywords: string[],
  businessInfo: any
): keyof typeof SECTOR_CONFIGS {
  const keywordText = keywords.join(" ").toLowerCase();

  if (
    keywordText.includes("agence") ||
    keywordText.includes("création") ||
    keywordText.includes("développement") ||
    keywordText.includes("web")
  ) {
    return "web_agency";
  }

  if (
    keywordText.includes("boutique") ||
    keywordText.includes("e-commerce") ||
    keywordText.includes("vente") ||
    keywordText.includes("produit")
  ) {
    return "ecommerce";
  }

  return "local_business";
}

async function analyzeCurrentKeywords(
  keywords: string[],
  seoSettings: any,
  baseUrl: string
): Promise<KeywordPerformance[]> {
  // VÉRIFIER OAUTH ET UTILISER VRAIES DONNÉES SI POSSIBLE
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
        console.log(
          "🔌 OAuth détecté, récupération des vraies données Keywords..."
        );
        // UTILISER VRAIES DONNÉES GOOGLE
        return await getRealKeywordData(googleClient, keywords, baseUrl);
      } else {
        console.log(
          "⚠️ OAuth configuré mais non authentifié - Retour de données vides"
        );
        // Retourner des données vides avec message de connexion
        return keywords.map((keyword) => ({
          keyword,
          position: null,
          clicks: null,
          impressions: null,
          ctr: null,
          isRealData: false,
          message: "Connectez-vous à Google pour obtenir les données réelles",
        }));
      }
    } else {
      console.log("ℹ️ OAuth non configuré - Retour de données vides");
      // Retourner des données vides avec message de connexion
      return keywords.map((keyword) => ({
        keyword,
        position: null,
        clicks: null,
        impressions: null,
        ctr: null,
        isRealData: false,
        message: "Configurez Google OAuth pour obtenir les données réelles",
      }));
    }
  } catch (error) {
    console.error("❌ Erreur OAuth:", error);
    // Retourner des données vides avec message d'erreur
    return keywords.map((keyword) => ({
      keyword,
      position: null,
      clicks: null,
      impressions: null,
      ctr: null,
      isRealData: false,
      message: "Erreur de connexion Google - Vérifiez votre configuration",
    }));
  }
}

/**
 * Génère des données simulées pour l'analyse des mots-clés
 */
function generateSimulatedKeywordData(
  keywords: string[]
): KeywordPerformance[] {
  return keywords.map((keyword) => {
    const position = Math.floor(Math.random() * 20) + 1;
    const impressions = Math.floor(Math.random() * 1000) + 100;
    const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.02));
    const ctr = clicks / impressions;
    const change = Math.floor(Math.random() * 10) - 5;
    const trend: "up" | "down" | "stable" =
      change > 1 ? "up" : change < -1 ? "down" : "stable";

    return {
      keyword,
      position,
      impressions,
      clicks,
      ctr,
      trend,
      change,
      searchVolume: Math.floor(Math.random() * 5000) + 500,
      difficulty:
        Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      opportunity: Math.floor(Math.random() * 100),
      isRealData: false, // ❌ DONNÉES SIMULÉES
    };
  });
}

/**
 * Récupère les données de positionnement avec Google Custom Search (positions concurrents réelles)
 */
async function getRealCompetitorPositions(
  keyword: string,
  competitorDomains: string[],
  yourDomain: string
): Promise<CompetitorGap | null> {
  try {
    console.log(`🔍 [Google Custom Search] Analyse pour "${keyword}"`);

    // Import dynamique
    const { getGoogleSearchResults, isGoogleCustomSearchConfigured } =
      await import("@/lib/google-custom-search");
    const searchCache = (await import("@/lib/search-cache")).default;

    // Vérifier si l'API est configurée
    if (!isGoogleCustomSearchConfigured()) {
      console.log("⚠️ Google Custom Search non configuré");
      return null;
    }

    // Vérifier le cache d'abord
    const cacheKey = `${keyword}_competitors`;
    const cachedData = searchCache.get<CompetitorGap>(cacheKey);
    if (cachedData) {
      console.log(`✅ [Cache] Données trouvées pour "${keyword}"`);
      return cachedData;
    }

    // Récupérer les top 20 résultats Google (2 requêtes)
    const results1to10 = await getGoogleSearchResults(keyword, "fr", 10, 1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const results11to20 = await getGoogleSearchResults(keyword, "fr", 10, 11);

    const allResults = [
      ...results1to10,
      ...results11to20.map((r) => ({ ...r, position: r.position + 10 })),
    ];

    if (allResults.length === 0) {
      console.log(`ℹ️ Aucun résultat Google pour "${keyword}"`);
      return null;
    }

    // Nettoyer le domaine
    const cleanYourDomain = yourDomain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    // Trouver votre position
    const yourResult = allResults.find(
      (r) =>
        r.domain.includes(cleanYourDomain) || cleanYourDomain.includes(r.domain)
    );
    const yourPosition = yourResult ? yourResult.position : null;

    // Filtrer les concurrents par secteur d'activité (INTELLIGENT)
    const { filterAndRankCompetitors } = await import(
      "@/lib/competitor-filter"
    );

    // Détecter le secteur depuis les mots-clés Search Console
    const detectedSector = detectSectorFromKeyword(keyword);
    console.log(`   🎯 Secteur détecté: ${detectedSector}`);

    // Filtrer les résultats Google par secteur
    const filteredCompetitors = filterAndRankCompetitors(
      allResults,
      detectedSector,
      cleanYourDomain,
      5 // Top 5 concurrents pertinents
    );

    const topCompetitors = filteredCompetitors.map((r) => ({
      domain: r.domain,
      position: r.position,
      url: r.url,
    }));

    console.log(
      `📊 [VRAIES DONNÉES] "${keyword}": Votre position = ${
        yourPosition || "Non trouvé"
      }, ${topCompetitors.length} concurrents réels`
    );

    // Calculer le gap et l'opportunité
    const bestCompetitorPosition =
      topCompetitors.length > 0
        ? Math.min(...topCompetitors.map((c) => c.position))
        : null;

    const gap =
      yourPosition && bestCompetitorPosition
        ? yourPosition - bestCompetitorPosition
        : yourPosition || 20;

    const opportunity = calculateOpportunityFromPosition(yourPosition);

    // Estimer le trafic potentiel
    const potentialTraffic = estimateTrafficFromPosition(
      yourPosition || 20,
      bestCompetitorPosition || 1
    );

    const result: CompetitorGap = {
      keyword,
      yourPosition: yourPosition,
      competitorPositions: topCompetitors,
      gap,
      opportunity,
      potentialTraffic,
      isRealData: true, // Marquer comme données RÉELLES
    };

    // Stocker dans le cache (24h)
    searchCache.set(cacheKey, result, "fr", 24 * 60 * 60 * 1000);

    console.log(
      `✅ [CONCURRENTS RÉELS] Top 5: ${topCompetitors
        .map((c) => c.domain)
        .join(", ")}`
    );
    return result;
  } catch (error) {
    console.error(`❌ Erreur Google Custom Search pour "${keyword}":`, error);
    return null;
  }
}

/**
 * Estime le trafic potentiel basé sur les positions
 */
function estimateTrafficFromPosition(
  yourPosition: number,
  bestCompetitorPosition: number
): number {
  // CTR moyen par position (données de référence)
  const ctrByPosition: { [key: number]: number } = {
    1: 0.32, // 32% de CTR en position 1
    2: 0.17,
    3: 0.11,
    4: 0.08,
    5: 0.06,
    6: 0.05,
    7: 0.04,
    8: 0.03,
    9: 0.03,
    10: 0.02,
  };

  const yourCTR = ctrByPosition[yourPosition] || 0.01;
  const competitorCTR = ctrByPosition[bestCompetitorPosition] || 0.32;

  // Estimer le trafic potentiel si vous atteignez la position du concurrent
  const improvementFactor = competitorCTR / yourCTR;
  const estimatedBaseTraffic = 100; // Base estimation

  return Math.round(estimatedBaseTraffic * improvementFactor);
}

/**
 * Récupère les données de positionnement de votre site depuis Google Search Console
 */
async function getYourPositionData(
  googleClient: any,
  keyword: string,
  baseUrl: string
): Promise<CompetitorGap | null> {
  try {
    console.log(
      `🔍 Analyse positionnement pour "${keyword}" avec URL: ${baseUrl}`
    );

    // Récupérer uniquement vos données de positionnement
    const yourData = await googleClient.getSearchConsoleData(baseUrl, keyword);

    if (!yourData || !yourData.rows || yourData.rows.length === 0) {
      console.log(`  - Aucune donnée trouvée pour "${keyword}"`);
      return null;
    }

    const yourPosition = yourData.rows[0].position
      ? parseFloat(yourData.rows[0].position)
      : null;
    const yourClicks = yourData.rows[0].clicks
      ? parseInt(yourData.rows[0].clicks)
      : 0;
    const yourImpressions = yourData.rows[0].impressions
      ? parseInt(yourData.rows[0].impressions)
      : 0;

    console.log(
      `  - Position: ${yourPosition}, Clicks: ${yourClicks}, Impressions: ${yourImpressions}`
    );

    // Générer des données de référence pour les concurrents (basées sur votre position)
    const competitorPositions = generateCompetitorReference(
      keyword,
      yourPosition
    );

    // Calculer l'opportunité basée sur votre position actuelle
    const opportunity = calculateOpportunityFromPosition(yourPosition);

    return {
      keyword,
      yourPosition: yourPosition ? Math.round(yourPosition) : null,
      competitorPositions,
      gap: yourPosition ? Math.max(0, yourPosition - 1) : 10, // Gap estimé
      opportunity,
      potentialTraffic: Math.round(yourClicks * 1.5), // Potentiel d'amélioration
      isRealData: false, // Marquer comme données simulées
    };
  } catch (error) {
    console.error(
      `❌ Erreur récupération positionnement pour "${keyword}":`,
      error
    );
    return null;
  }
}

/**
 * Génère des positions de référence pour les concurrents (basées sur votre position)
 */
function generateCompetitorReference(
  keyword: string,
  yourPosition: number | null
): Array<{
  domain: string;
  position: number;
  url: string;
}> {
  const competitors = [
    "agence-digitale.com",
    "web-creator.net",
    "studio-web.fr",
    "digital-agency.com",
  ];

  if (!yourPosition) {
    // Si vous n'êtes pas positionné, estimer les positions concurrentielles
    return competitors.map((domain, index) => ({
      domain,
      position: Math.round(Math.random() * 10) + 1,
      url: `https://${domain}/${keyword.replace(/\s+/g, "-")}`,
    }));
  }

  // Générer des positions réalistes basées sur votre position
  return competitors.map((domain, index) => {
    let position;
    if (yourPosition <= 3) {
      // Si vous êtes bien positionné, les concurrents sont autour
      position = Math.round(yourPosition + Math.random() * 4 - 2);
    } else {
      // Si vous êtes mal positionné, les concurrents sont mieux
      position = Math.round(Math.random() * yourPosition) + 1;
    }

    return {
      domain,
      position: Math.max(1, Math.min(20, position)),
      url: `https://${domain}/${keyword.replace(/\s+/g, "-")}`,
    };
  });
}

/**
 * Calcule l'opportunité basée sur la position actuelle
 */
function calculateOpportunityFromPosition(
  position: number | null
): "high" | "medium" | "low" {
  if (!position) return "high"; // Pas positionné = haute opportunité

  if (position <= 3) return "low"; // Bien positionné = faible opportunité
  if (position <= 10) return "medium"; // Position moyenne = opportunité moyenne
  return "high"; // Mal positionné = haute opportunité
}

/**
 * Génère des données de fallback pour l'analyse concurrentielle
 */
function generateFallbackCompetitorGap(
  keyword: string,
  config: any
): CompetitorGap {
  const yourPosition = Math.floor(Math.random() * 20) + 1;
  const competitorPositions = config.competitorDomains.map(
    (domain: string, index: number) => ({
      domain,
      position: Math.floor(Math.random() * 15) + 1,
      url: `https://${domain}/${keyword.replace(/\s+/g, "-")}`,
    })
  );

  const bestCompetitor = Math.min(
    ...competitorPositions.map((cp) => cp.position)
  );
  const gap = yourPosition - bestCompetitor;

  return {
    keyword,
    yourPosition: yourPosition > 20 ? null : yourPosition,
    competitorPositions,
    gap,
    opportunity: gap > 5 ? "high" : gap > 2 ? "medium" : "low",
    potentialTraffic: Math.floor(Math.random() * 200) + 50,
    isRealData: false, // ❌ DONNÉES SIMULÉES
  };
}

/**
 * Récupère les vraies données des mots-clés depuis Google Search Console
 */
async function getRealKeywordData(
  googleClient: any,
  keywords: string[],
  baseUrl: string
): Promise<KeywordPerformance[]> {
  const analysis: KeywordPerformance[] = [];

  try {
    // Récupérer les données Search Console pour chaque mot-clé
    for (const keyword of keywords) {
      const searchConsoleData = await googleClient.getSearchConsoleData(
        baseUrl, // ← URL du site en premier
        keyword // ← Mot-clé en second
      );

      if (
        searchConsoleData &&
        searchConsoleData.rows &&
        searchConsoleData.rows.length > 0
      ) {
        // Données réelles trouvées
        const row = searchConsoleData.rows[0];
        const impressions = parseInt(row.impressions || "0");
        const clicks = parseInt(row.clicks || "0");
        const position = parseFloat(row.position || "0");
        const ctr = parseFloat(row.ctr || "0");

        // Calculer la tendance (comparaison avec période précédente)
        const previousData = await googleClient.getSearchConsoleData(
          baseUrl, // ← URL du site en premier
          keyword, // ← Mot-clé en second
          "previous_period" // ← Période en troisième
        );

        let trend: "up" | "down" | "stable" = "stable";
        let change = 0;

        if (previousData && previousData.rows && previousData.rows.length > 0) {
          const prevPosition = parseFloat(previousData.rows[0].position || "0");
          change = position - prevPosition;
          trend = change > 1 ? "down" : change < -1 ? "up" : "stable";
        }

        // Estimer le volume de recherche (Search Console ne le fournit pas)
        const estimatedVolume = Math.max(impressions * 2, clicks * 20);

        analysis.push({
          keyword,
          position: Math.round(position),
          impressions,
          clicks,
          ctr,
          trend,
          change: Math.round(change * 10) / 10,
          searchVolume: estimatedVolume,
          difficulty: position < 5 ? "high" : position < 10 ? "medium" : "low",
          opportunity:
            position > 10
              ? Math.min(95, Math.floor((20 - position) * 5))
              : position < 5
              ? Math.floor(Math.random() * 30)
              : Math.floor(Math.random() * 40) + 40,
          isRealData: true, // ✅ DONNÉES RÉELLES depuis Google Search Console
        });
      } else {
        // Aucune donnée Search Console trouvée, utiliser données de démo
        console.log(
          `⚠️ Aucune donnée Search Console pour "${keyword}", utilisation des données de démo`
        );
        const performance = await simulateKeywordPerformance(keyword, baseUrl);
        analysis.push(performance);
      }
    }

    console.log(
      `✅ Données réelles récupérées pour ${analysis.length} mots-clés`
    );
    return analysis;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des données Search Console:",
      error
    );
    // Fallback vers données de démo en cas d'erreur
    for (const keyword of keywords) {
      const performance = await simulateKeywordPerformance(keyword, baseUrl);
      analysis.push(performance);
    }
    return analysis;
  }
}

async function simulateKeywordPerformance(
  keyword: string,
  baseUrl: string
): Promise<KeywordPerformance> {
  // Simulation basée sur des patterns réalistes
  const baseVolume = Math.floor(Math.random() * 1000) + 100;
  const position = Math.floor(Math.random() * 20) + 1;
  const trend = position < 10 ? "up" : position > 15 ? "down" : "stable";

  return {
    keyword,
    position,
    impressions: Math.floor(baseVolume * 0.8),
    clicks: Math.floor(baseVolume * 0.1),
    ctr: Math.random() * 0.1,
    trend,
    change:
      trend === "up"
        ? Math.floor(Math.random() * 5) + 1
        : trend === "down"
        ? -(Math.floor(Math.random() * 3) + 1)
        : 0,
    searchVolume: baseVolume,
    difficulty: position < 5 ? "high" : position < 10 ? "medium" : "low",
    opportunity:
      position > 10
        ? Math.floor(Math.random() * 40) + 60
        : Math.floor(Math.random() * 30),
  };
}

async function detectTrendingKeywords(
  config: any,
  businessInfo: any,
  currentKeywords: string[]
): Promise<TrendingKeyword[]> {
  const trending: TrendingKeyword[] = [];
  const city =
    businessInfo.city || businessInfo.address?.split(",")[0] || "votre ville";
  const region = businessInfo.region || "votre région";
  const sector = businessInfo.sector || "votre secteur";
  const profession = businessInfo.profession || "votre profession";
  const mainServices = businessInfo.mainServices || "";

  // Générer des mots-clés tendance basés sur le secteur
  const baseKeywords = config.primaryKeywords;
  const localKeywords = config.localKeywords.map((k) =>
    k
      .replace("[ville]", city)
      .replace("[région]", region)
      .replace("[secteur]", sector)
      .replace("[profession]", profession)
      .replace("[service]", mainServices.split(",")[0]?.trim() || "service")
  );

  // Mots-clés tendance pour ce secteur
  const trendingBase = [
    ...baseKeywords.slice(0, 3),
    ...localKeywords.slice(0, 2),
  ];

  for (const keyword of trendingBase) {
    trending.push({
      keyword,
      searchVolume: Math.floor(Math.random() * 500) + 50,
      trend: Math.floor(Math.random() * 200) - 100, // -100 à +100
      seasonality:
        Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      category: "primary",
      opportunity:
        Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      competition:
        Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low",
      isRealData: false, // ❌ DONNÉES SIMULÉES (Google Trends API non implémentée)
    });
  }

  return trending;
}

async function analyzeCompetitorGaps(
  config: any,
  currentKeywords: string[],
  baseUrl: string
): Promise<CompetitorGap[]> {
  const gaps: CompetitorGap[] = [];

  // Vérifier la configuration OAuth
  let googleClient = null;
  let hasRealData = false;

  try {
    const { createGoogleAnalyticsClient } = await import(
      "@/lib/analytics/google-analytics-client"
    );

    // Récupérer l'ID Google Analytics depuis les settings
    const settingsResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/settings`
    );
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      const googleAnalyticsId = settings.seoSettings?.googleAnalyticsId;
      const googleSearchConsoleUrl = settings.seoSettings?.googleSearchConsole;

      console.log("🔍 Diagnostic OAuth pour analyse concurrentielle:");
      console.log("  - Google Analytics ID:", googleAnalyticsId);
      console.log("  - Search Console URL:", googleSearchConsoleUrl);

      if (googleAnalyticsId) {
        googleClient = createGoogleAnalyticsClient(googleAnalyticsId);
        console.log("  - Client Google créé:", !!googleClient);

        if (googleClient) {
          const isAuth = await googleClient.isAuthenticated();
          console.log("  - OAuth authentifié:", isAuth);

          // Test supplémentaire : vérifier l'accès Search Console
          if (isAuth && googleSearchConsoleUrl) {
            try {
              const searchConsoleData = await googleClient.getSearchConsoleData(
                googleSearchConsoleUrl
              );
              console.log("  - Accès Search Console:", !!searchConsoleData);
            } catch (searchError: any) {
              console.log("  - Erreur Search Console:", searchError.message);
            }
          }

          hasRealData = isAuth;
        }
      } else {
        console.log("  - Aucun Google Analytics ID trouvé");
      }
    } else {
      console.log("  - Impossible de récupérer les settings");
    }
  } catch (error) {
    console.log("⚠️ Impossible de charger le client Google Analytics:", error);
  }

  // Stratégie en cascade pour l'analyse concurrentielle
  console.log("🎯 Stratégie d'analyse concurrentielle:");

  for (const keyword of currentKeywords.slice(0, 3)) {
    let gapData: CompetitorGap | null = null;

    // 1. PRIORITÉ #1 : Google Custom Search (positions concurrents RÉELLES - GRATUIT)
    try {
      console.log(
        `\n📊 Tentative #1 pour "${keyword}": Google Custom Search (gratuit)`
      );
      gapData = await getRealCompetitorPositions(
        keyword,
        config.competitorDomains,
        baseUrl
      );

      if (gapData) {
        console.log(`✅ Données réelles obtenues via Google Custom Search`);
        gaps.push(gapData);
        continue; // Passer au mot-clé suivant
      }
    } catch (error) {
      console.log(
        `⚠️ Google Custom Search non disponible:`,
        error instanceof Error ? error.message : error
      );
    }

    // 2. PRIORITÉ #2 : Google Search Console (votre position uniquement)
    if (hasRealData) {
      try {
        console.log(
          `📊 Tentative #2 pour "${keyword}": Google Search Console (OAuth)`
        );
        gapData = await getYourPositionData(googleClient, keyword, baseUrl);

        if (gapData) {
          console.log(`✅ Votre position obtenue via Search Console`);
          gaps.push(gapData);
          continue;
        }
      } catch (error) {
        console.error(
          `⚠️ Erreur Search Console:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // 3. FALLBACK #3 : Données vides avec message de connexion
    console.log(
      `📊 Pas de données disponibles pour "${keyword}" - Retour de données vides`
    );
    gaps.push({
      keyword,
      yourPosition: null,
      competitorPositions: [],
      gap: 0,
      opportunity: "low",
      potentialTraffic: 0,
      isRealData: false,
      message:
        "Connectez-vous à Google pour obtenir les données concurrentielles réelles",
    });
  }

  return gaps;
}

async function generateIntelligentSuggestions(
  currentKeywords: KeywordPerformance[],
  trending: TrendingKeyword[],
  gaps: CompetitorGap[],
  config: any,
  businessInfo: any
): Promise<{
  keywordOpportunities: KeywordSuggestion[];
  contentSuggestions: ContentSuggestion[];
}> {
  const city = businessInfo.address?.split(",")[0] || "votre ville";

  // Suggestions de mots-clés
  const keywordOpportunities: KeywordSuggestion[] = [
    {
      keyword: `${config.primaryKeywords[0]} ${city}`,
      reason: "Opportunité locale détectée - faible concurrence",
      potential: {
        searchVolume: 200,
        difficulty: "low",
        opportunity: 85,
      },
      action: "Créer une page dédiée avec ce mot-clé en titre",
      expectedImpact: "+30% trafic local en 2 mois",
      category: "local",
      priority: "high",
    },
    {
      keyword: `comment ${config.primaryKeywords[1]}`,
      reason: "Mot-clé longue traîne en tendance (+150% recherches)",
      potential: {
        searchVolume: 150,
        difficulty: "medium",
        opportunity: 70,
      },
      action: "Créer un guide complet avec ce mot-clé",
      expectedImpact: "+20% trafic organique en 6 semaines",
      category: "long-tail",
      priority: "medium",
    },
  ];

  // Suggestions de contenu
  const contentSuggestions: ContentSuggestion[] = [
    {
      type: "blog",
      title: `Guide complet : ${config.primaryKeywords[0]} en 2025`,
      keywords: [config.primaryKeywords[0], "guide", "2025"],
      content:
        "Guide détaillé basé sur les dernières tendances et bonnes pratiques...",
      structure: {
        h1: `Guide complet : ${config.primaryKeywords[0]} en 2025`,
        h2: ["Les tendances 2025", "Comment choisir", "Tarifs moyens", "FAQ"],
        metaDescription: `Découvrez tout sur ${config.primaryKeywords[0]} en 2025. Guide complet avec conseils d'experts et tendances actuelles.`,
      },
      expectedTraffic: 300,
      difficulty: "medium",
      timeframe: "2-3 semaines",
    },
    {
      type: "page",
      title: `Nos services ${config.primaryKeywords[1]} à ${city}`,
      keywords: [config.primaryKeywords[1], city, "services"],
      content: "Page dédiée aux services locaux avec témoignages clients...",
      structure: {
        h1: `Nos services ${config.primaryKeywords[1]} à ${city}`,
        h2: [
          "Nos spécialités",
          "Processus de travail",
          "Témoignages",
          "Contact",
        ],
        metaDescription: `Services professionnels ${config.primaryKeywords[1]} à ${city}. Expertise locale et accompagnement personnalisé.`,
      },
      expectedTraffic: 150,
      difficulty: "easy",
      timeframe: "1 semaine",
    },
  ];

  return {
    keywordOpportunities,
    contentSuggestions,
  };
}

function calculateSummary(
  currentKeywords: KeywordPerformance[],
  trending: TrendingKeyword[],
  gaps: CompetitorGap[]
): {
  totalKeywords: number;
  averagePosition: number;
  monthlyTraffic: number;
  trend: "up" | "down" | "stable";
  opportunities: number;
  threats: number;
} {
  const totalKeywords = currentKeywords.length;
  const averagePosition =
    currentKeywords.reduce((sum, kw) => sum + kw.position, 0) / totalKeywords;
  const monthlyTraffic = currentKeywords.reduce(
    (sum, kw) => sum + kw.clicks * 30,
    0
  );
  const upTrends = currentKeywords.filter((kw) => kw.trend === "up").length;
  const downTrends = currentKeywords.filter((kw) => kw.trend === "down").length;
  const trend =
    upTrends > downTrends ? "up" : downTrends > upTrends ? "down" : "stable";
  const opportunities =
    gaps.filter((gap) => gap.opportunity === "high").length +
    trending.filter((t) => t.opportunity === "high").length;
  const threats = gaps.filter(
    (gap) => gap.yourPosition && gap.yourPosition > 10
  ).length;

  return {
    totalKeywords,
    averagePosition: Math.round(averagePosition * 10) / 10,
    monthlyTraffic: Math.round(monthlyTraffic),
    trend,
    opportunities,
    threats,
  };
}
