import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface SEOAnalysis {
  // Scores séparés
  technicalScore: number;
  googleScore: number | null;
  combinedScore: number;

  // Indicateurs de connexion
  googleConnected: boolean;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;

  // Données techniques (toujours disponibles)
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

  // Données Google (si connecté)
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

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.kairo-digital.fr";

    // Initialiser l'analyse avec la nouvelle structure
    const analysis: SEOAnalysis = {
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
    };

    // 1. Vérifier l'existence des fichiers SEO essentiels
    const publicDir = join(process.cwd(), "public");

    // Vérifier sitemap.xml
    const sitemapPath = join(publicDir, "sitemap.xml");
    if (!existsSync(sitemapPath)) {
      analysis.technicalAnalysis.issues.push({
        type: "error",
        message: "Sitemap.xml manquant",
        fix: "Générer le sitemap.xml depuis les paramètres SEO",
        priority: "high",
      });
      analysis.technicalAnalysis.metrics.criticalIssues++;
    } else {
      analysis.technicalAnalysis.metrics.pagesAnalyzed++;
    }

    // Vérifier robots.txt
    const robotsPath = join(publicDir, "robots.txt");
    if (!existsSync(robotsPath)) {
      analysis.technicalAnalysis.issues.push({
        type: "error",
        message: "robots.txt manquant",
        fix: "Générer le robots.txt depuis les paramètres SEO",
        priority: "high",
      });
      analysis.technicalAnalysis.metrics.criticalIssues++;
    }

    // 2. Analyser les paramètres SEO actuels et vérifier la connexion Google
    try {
      const settingsResponse = await fetch(`${baseUrl}/api/settings`);
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        const seoSettings = settings.seoSettings || {};

        // Vérifier la connexion Google OAuth réelle
        analysis.googleAnalyticsId = seoSettings.googleAnalyticsId;

        // Vérifier OAuth Google en temps réel via API
        try {
          console.log("🔍 Vérification OAuth via API...");
          const oauthStatusResponse = await fetch(
            `${baseUrl}/api/auth/google/status`
          );

          if (oauthStatusResponse.ok) {
            const oauthStatus = await oauthStatusResponse.json();
            console.log("🔍 Statut OAuth récupéré:", oauthStatus);

            analysis.googleConnected = oauthStatus.connected || false;

            if (analysis.googleConnected) {
              console.log(
                "✅ OAuth Google connecté - Données réelles disponibles"
              );

              // RÉCUPÉRATION DES DONNÉES GOOGLE IMMÉDIATEMENT
              try {
                const { createGoogleAnalyticsClient } = await import(
                  "@/lib/analytics/google-analytics-client"
                );

                const googleClient = createGoogleAnalyticsClient(
                  analysis.googleAnalyticsId
                );

                if (googleClient) {
                  console.log(
                    "🔌 Tentative de récupération des données Google..."
                  );

                  // Utiliser l'URL Search Console configurée
                  const searchConsoleUrl =
                    seoSettings.googleSearchConsole ||
                    "sc-domain:kairo-digital.fr";
                  console.log("🔍 Search Console URL:", searchConsoleUrl);

                  const googleData = await googleClient.getAllData(
                    searchConsoleUrl
                  );

                  if (googleData) {
                    // Données Google réelles récupérées
                    analysis.googleData = googleData;

                    // Calculer le score Google basé sur les données réelles
                    const analyticsScore =
                      googleData.analytics.bounceRate &&
                      googleData.analytics.bounceRate < 0.5
                        ? 80
                        : 60;
                    const pageSpeedScore =
                      googleData.pageSpeed.mobile &&
                      googleData.pageSpeed.desktop
                        ? (googleData.pageSpeed.mobile +
                            googleData.pageSpeed.desktop) /
                          2
                        : 75;
                    const searchScore =
                      googleData.searchConsole.ctr &&
                      googleData.searchConsole.ctr > 0.03
                        ? 85
                        : 70;

                    analysis.googleScore = Math.round(
                      (analyticsScore + pageSpeedScore + searchScore) / 3
                    );

                    console.log("✅ Données Google récupérées avec succès");
                  } else {
                    console.log(
                      "⚠️ Google Analytics configuré mais aucune donnée retournée"
                    );
                    analysis.googleData = null;
                    analysis.googleScore = null;
                  }
                } else {
                  console.log(
                    "ℹ️ Google Analytics: Configuration incomplète - Pas de données"
                  );
                  analysis.googleData = null;
                  analysis.googleScore = null;
                }
              } catch (googleError) {
                console.error(
                  "❌ Erreur récupération données Google:",
                  googleError
                );
                analysis.googleData = null;
                analysis.googleScore = null;
              }
            } else {
              console.log(
                "⚠️ OAuth Google non connecté - Pas de données Google"
              );
            }
          } else {
            analysis.googleConnected = false;
            console.log("⚠️ Impossible de vérifier le statut OAuth");
          }
        } catch (error) {
          analysis.googleConnected = false;
          console.error("❌ Erreur vérification OAuth:", error);
        }

        if (
          seoSettings.googleTagManagerId &&
          seoSettings.googleTagManagerId.startsWith("GTM-")
        ) {
          analysis.googleTagManagerId = seoSettings.googleTagManagerId;
        }

        // Vérifier meta title
        if (
          !seoSettings.defaultMetaTitle ||
          seoSettings.defaultMetaTitle.length < 30
        ) {
          analysis.technicalAnalysis.issues.push({
            type: "warning",
            message: "Meta title trop court ou manquant",
            fix: "Ajouter un titre de 50-60 caractères dans les paramètres SEO",
            priority: "medium",
          });
          analysis.technicalAnalysis.metrics.warnings++;
        }

        // Vérifier meta description
        if (
          !seoSettings.defaultMetaDescription ||
          seoSettings.defaultMetaDescription.length < 120
        ) {
          analysis.technicalAnalysis.issues.push({
            type: "warning",
            message: "Meta description trop courte ou manquante",
            fix: "Ajouter une description de 150-160 caractères dans les paramètres SEO",
            priority: "medium",
          });
          analysis.technicalAnalysis.metrics.warnings++;
        }

        // Vérifier Google Analytics (suggestion si non configuré)
        if (!seoSettings.googleAnalyticsId) {
          analysis.technicalAnalysis.suggestions.push({
            type: "improvement",
            message: "Google Analytics non configuré",
            impact: "high",
            implementation:
              "Ajouter votre ID Google Analytics dans les paramètres SEO",
          });
          analysis.technicalAnalysis.metrics.improvements++;
        }

        // Vérifier Google Search Console
        if (!seoSettings.googleSearchConsole) {
          analysis.technicalAnalysis.suggestions.push({
            type: "improvement",
            message: "Google Search Console non configuré",
            impact: "high",
            implementation:
              "Ajouter votre code de vérification dans les paramètres SEO",
          });
          analysis.technicalAnalysis.metrics.improvements++;
        }

        // Vérifier Open Graph
        if (!seoSettings.ogTitle || !seoSettings.ogDescription) {
          analysis.technicalAnalysis.issues.push({
            type: "warning",
            message: "Balises Open Graph incomplètes",
            fix: "Configurer les titres et descriptions Open Graph dans les paramètres SEO",
            priority: "medium",
          });
          analysis.technicalAnalysis.metrics.warnings++;
        }

        // Vérifier données structurées
        if (!seoSettings.structuredData) {
          analysis.technicalAnalysis.suggestions.push({
            type: "improvement",
            message: "Données structurées Schema.org non activées",
            impact: "high",
            implementation:
              "Activer les données structurées dans les paramètres SEO",
          });
          analysis.technicalAnalysis.metrics.improvements++;
        }
      }
    } catch (error) {
      analysis.technicalAnalysis.issues.push({
        type: "error",
        message: "Impossible de récupérer les paramètres SEO",
        fix: "Vérifier la configuration de l'API des paramètres",
        priority: "high",
      });
      analysis.technicalAnalysis.metrics.criticalIssues++;
    }

    // 3. Vérifier les pages principales
    const pagesToCheck = [
      "/",
      "/about",
      "/services",
      "/portfolio",
      "/contact",
      "/blog",
    ];

    for (const page of pagesToCheck) {
      try {
        const pageResponse = await fetch(`${baseUrl}${page}`);
        if (pageResponse.ok) {
          analysis.technicalAnalysis.metrics.pagesAnalyzed++;

          // Vérifier la présence de balises meta dans le HTML
          const html = await pageResponse.text();

          if (
            !html.includes("<title>") &&
            !html.includes('meta name="title"')
          ) {
            analysis.technicalAnalysis.issues.push({
              type: "error",
              message: `Balise title manquante sur ${page}`,
              fix: "Ajouter une balise title unique pour cette page",
              priority: "high",
            });
            analysis.technicalAnalysis.metrics.criticalIssues++;
          }

          if (!html.includes('meta name="description"')) {
            analysis.technicalAnalysis.issues.push({
              type: "warning",
              message: `Meta description manquante sur ${page}`,
              fix: "Ajouter une meta description pour cette page",
              priority: "medium",
            });
            analysis.technicalAnalysis.metrics.warnings++;
          }

          if (!html.includes("og:title") && !html.includes("og:description")) {
            analysis.technicalAnalysis.issues.push({
              type: "warning",
              message: `Balises Open Graph manquantes sur ${page}`,
              fix: "Ajouter les balises Open Graph pour cette page",
              priority: "medium",
            });
            analysis.technicalAnalysis.metrics.warnings++;
          }
        }
      } catch (error) {
        analysis.technicalAnalysis.issues.push({
          type: "error",
          message: `Page ${page} inaccessible`,
          fix: "Vérifier que la page existe et est accessible",
          priority: "high",
        });
        analysis.technicalAnalysis.metrics.criticalIssues++;
      }
    }

    // 4. Les données Google sont déjà récupérées dans la section OAuth ci-dessus

    // 5. Calculer les scores séparés
    const totalChecks = 15; // Nombre total de vérifications techniques
    const passedChecks =
      totalChecks -
      analysis.technicalAnalysis.metrics.criticalIssues -
      analysis.technicalAnalysis.metrics.warnings * 0.5;
    analysis.technicalScore = Math.max(
      0,
      Math.min(100, Math.round((passedChecks / totalChecks) * 100))
    );

    // Calculer le score combiné
    if (analysis.googleScore !== null) {
      analysis.combinedScore = Math.round(
        (analysis.technicalScore + analysis.googleScore) / 2
      );
    } else {
      analysis.combinedScore = analysis.technicalScore;
    }

    // 6. Ajouter des suggestions d'amélioration basées sur l'analyse réelle
    if (analysis.technicalScore < 70) {
      analysis.technicalAnalysis.suggestions.push({
        type: "improvement",
        message: "Score technique faible - Optimisation urgente requise",
        impact: "high",
        implementation:
          "Corriger les erreurs critiques et améliorer les métadonnées",
      });
    }

    if (analysis.technicalAnalysis.metrics.pagesAnalyzed < 5) {
      analysis.technicalAnalysis.suggestions.push({
        type: "improvement",
        message: "Pages principales manquantes",
        impact: "medium",
        implementation:
          "Créer les pages about, services, portfolio, contact, blog",
      });
    }

    // Synchroniser les métriques
    analysis.metrics = { ...analysis.technicalAnalysis.metrics };
    analysis.metrics.totalIssues = analysis.technicalAnalysis.issues.length;

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse SEO:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse SEO" },
      { status: 500 }
    );
  }
}
