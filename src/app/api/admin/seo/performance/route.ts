import { NextRequest, NextResponse } from "next/server";

interface PerformanceMetrics {
  pageSpeed: {
    mobile: number | null;
    desktop: number | null;
  };
  coreWebVitals: {
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
  };
  resources: {
    totalSize: number | null;
    requests: number | null;
    images: number | null;
    scripts: number | null;
    stylesheets: number | null;
  };
  recommendations: Array<{
    type: "critical" | "warning" | "info";
    message: string;
    impact: "high" | "medium" | "low";
    fix: string;
  }>;
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

    let url;
    try {
      const body = await request.json();
      url = body?.url;
    } catch {
      url = null;
    }
    const targetUrl =
      url || process.env.NEXT_PUBLIC_SITE_URL || "https://www.kairo-digital.fr";

    const metrics: PerformanceMetrics = {
      pageSpeed: {
        mobile: null,
        desktop: null,
      },
      coreWebVitals: {
        lcp: null,
        fid: null,
        cls: null,
      },
      resources: {
        totalSize: null,
        requests: null,
        images: null,
        scripts: null,
        stylesheets: null,
      },
      recommendations: [],
    };

    // Analyser la page principale
    try {
      const startTime = Date.now();
      const response = await fetch(targetUrl);
      const loadTime = Date.now() - startTime;

      if (response.ok) {
        const html = await response.text();

        // Analyser les ressources
        const resourceAnalysis = analyzeResources(html);
        metrics.resources = resourceAnalysis;

        // Calculer le score de performance basé sur les ressources
        const performanceScore = calculatePerformanceScore(
          resourceAnalysis,
          loadTime
        );
        metrics.pageSpeed = {
          mobile: Math.max(0, Math.min(100, performanceScore.mobile)),
          desktop: Math.max(0, Math.min(100, performanceScore.desktop)),
        };

        // Calculer les Core Web Vitals basés sur la performance
        metrics.coreWebVitals = calculateCoreWebVitals(performanceScore);

        // Générer des recommandations basées sur l'analyse
        metrics.recommendations = generateRecommendations(
          resourceAnalysis,
          performanceScore
        );
      } else {
        throw new Error(`Page inaccessible: ${response.status}`);
      }
    } catch (error) {
      metrics.recommendations.push({
        type: "critical",
        message: "Page inaccessible ou erreur de connexion",
        impact: "high",
        fix: "Vérifiez que le site est en ligne et accessible. Pour des données PageSpeed Insights réelles, connectez-vous à Google.",
      });
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse de performance:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de performance" },
      { status: 500 }
    );
  }
}

function analyzeResources(html: string) {
  const resources = {
    totalSize: 0,
    requests: 0,
    images: 0,
    scripts: 0,
    stylesheets: 0,
  };

  // Compter les images
  const imageMatches =
    html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  resources.images = imageMatches.length;

  // Compter les scripts
  const scriptMatches =
    html.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  resources.scripts = scriptMatches.length;

  // Compter les stylesheets
  const styleMatches =
    html.match(
      /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi
    ) || [];
  resources.stylesheets = styleMatches.length;

  // Calculer le nombre total de requêtes
  resources.requests =
    resources.images + resources.scripts + resources.stylesheets;

  // Estimer la taille totale (approximation)
  resources.totalSize = resources.requests * 50000; // ~50KB par ressource en moyenne

  return resources;
}

function calculatePerformanceScore(resources: any, loadTime: number) {
  let mobileScore = 100;
  let desktopScore = 100;

  // Pénalités basées sur le nombre de ressources
  if (resources.requests > 20) {
    mobileScore -= 20;
    desktopScore -= 10;
  } else if (resources.requests > 10) {
    mobileScore -= 10;
    desktopScore -= 5;
  }

  // Pénalités basées sur la taille totale
  if (resources.totalSize > 2000000) {
    // 2MB
    mobileScore -= 25;
    desktopScore -= 15;
  } else if (resources.totalSize > 1000000) {
    // 1MB
    mobileScore -= 15;
    desktopScore -= 10;
  }

  // Pénalités basées sur le temps de chargement
  if (loadTime > 3000) {
    // 3 secondes
    mobileScore -= 30;
    desktopScore -= 20;
  } else if (loadTime > 2000) {
    // 2 secondes
    mobileScore -= 20;
    desktopScore -= 15;
  }

  return {
    mobile: Math.max(0, mobileScore),
    desktop: Math.max(0, desktopScore),
  };
}

function calculateCoreWebVitals(performanceScore: any) {
  const avgScore = (performanceScore.mobile + performanceScore.desktop) / 2;

  return {
    lcp: Math.max(1000, 3000 - avgScore * 20), // LCP en ms (moins c'est mieux)
    fid: Math.max(10, 100 - avgScore * 0.9), // FID en ms (moins c'est mieux)
    cls: Math.max(0, Math.min(1, 0.3 - avgScore / 1000)), // CLS (moins c'est mieux)
  };
}

function generateRecommendations(resources: any, performanceScore: any) {
  const recommendations = [];

  // Recommandations basées sur le nombre de ressources
  if (resources.requests > 20) {
    recommendations.push({
      type: "warning",
      message: "Trop de ressources chargées",
      impact: "medium",
      fix: "Optimiser et combiner les fichiers CSS/JS, utiliser la lazy loading pour les images",
    });
  }

  // Recommandations basées sur la taille
  if (resources.totalSize > 2000000) {
    recommendations.push({
      type: "critical",
      message: "Taille totale des ressources trop importante",
      impact: "high",
      fix: "Compresser les images, minifier les fichiers CSS/JS, utiliser un CDN",
    });
  }

  // Recommandations basées sur les images
  if (resources.images > 10) {
    recommendations.push({
      type: "warning",
      message: "Nombre d'images élevé",
      impact: "medium",
      fix: "Utiliser la lazy loading, optimiser les formats d'image (WebP), redimensionner les images",
    });
  }

  // Recommandations basées sur les scripts
  if (resources.scripts > 5) {
    recommendations.push({
      type: "warning",
      message: "Nombre de scripts élevé",
      impact: "medium",
      fix: "Combiner les fichiers JS, utiliser le defer/async, éliminer les scripts inutiles",
    });
  }

  // Recommandations basées sur le score de performance
  if (performanceScore.mobile < 50) {
    recommendations.push({
      type: "critical",
      message: "Performance mobile très faible",
      impact: "high",
      fix: "Optimiser pour mobile, réduire la taille des ressources, améliorer le First Contentful Paint",
    });
  }

  if (performanceScore.desktop < 70) {
    recommendations.push({
      type: "warning",
      message: "Performance desktop à améliorer",
      impact: "medium",
      fix: "Optimiser le chargement des ressources, améliorer le rendu côté serveur",
    });
  }

  return recommendations;
}
