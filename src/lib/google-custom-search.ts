/**
 * Service Google Custom Search API
 * Permet de récupérer les vraies positions des concurrents sur Google
 * Gratuit jusqu'à 100 requêtes/jour (3000/mois)
 */

interface SearchResult {
  position: number;
  domain: string;
  title: string;
  url: string;
  snippet?: string;
}

interface CompetitorPosition {
  domain: string;
  position: number;
  url: string;
}

/**
 * Récupère les résultats de recherche Google pour un mot-clé donné
 */
export async function getGoogleSearchResults(
  keyword: string,
  location: string = "fr",
  numResults: number = 10,
  startIndex: number = 1
): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  // Vérifier la configuration
  if (!apiKey || !searchEngineId) {
    console.log("⚠️ Google Custom Search API non configurée");
    return [];
  }

  try {
    console.log(`🔍 Recherche Google pour "${keyword}" (locale: ${location})`);

    // Construire l'URL de l'API
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("key", apiKey);
    url.searchParams.append("cx", searchEngineId);
    url.searchParams.append("q", keyword);
    url.searchParams.append("gl", location); // Géolocalisation
    url.searchParams.append("hl", location); // Langue de l'interface
    url.searchParams.append("num", Math.min(numResults, 10).toString()); // Max 10 par requête
    url.searchParams.append("start", startIndex.toString()); // Index de départ

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erreur API Google Custom Search:", errorData);

      // Vérifier si c'est une erreur de quota
      if (response.status === 429 || errorData.error?.code === 429) {
        console.log("⚠️ Quota Google Custom Search dépassé (limite: 100/jour)");
      }

      return [];
    }

    const data = await response.json();

    // Vérifier si on a des résultats
    if (!data.items || data.items.length === 0) {
      console.log(`ℹ️ Aucun résultat trouvé pour "${keyword}"`);
      return [];
    }

    // Extraire les résultats
    const results: SearchResult[] = data.items.map(
      (item: any, index: number) => {
        let domain = "unknown";
        try {
          domain = new URL(item.link).hostname.replace("www.", "");
        } catch (e) {
          console.warn(`⚠️ URL invalide: ${item.link}`);
        }

        return {
          position: index + 1,
          domain,
          title: item.title,
          url: item.link,
          snippet: item.snippet,
        };
      }
    );

    console.log(`✅ ${results.length} résultats récupérés pour "${keyword}"`);
    return results;
  } catch (error) {
    console.error("❌ Erreur lors de la recherche Google:", error);
    return [];
  }
}

/**
 * Récupère les positions des concurrents pour un mot-clé donné
 */
export async function getCompetitorPositions(
  keyword: string,
  competitorDomains: string[],
  yourDomain: string,
  location: string = "fr"
): Promise<{
  yourPosition: number | null;
  competitors: CompetitorPosition[];
}> {
  // Récupérer les 20 premiers résultats (2 requêtes de 10)
  const results1to10 = await getGoogleSearchResults(keyword, location, 10, 1);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Attendre 500ms entre les requêtes
  const results11to20 = await getGoogleSearchResults(keyword, location, 10, 11);

  // Combiner les résultats et ajuster les positions
  const allResults = [
    ...results1to10,
    ...results11to20.map((r) => ({ ...r, position: r.position + 10 })),
  ];

  if (allResults.length === 0) {
    return {
      yourPosition: null,
      competitors: [],
    };
  }

  // Nettoyer le domaine utilisateur (enlever www., https://, etc.)
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

  // Extraire les positions des concurrents
  const competitors: CompetitorPosition[] = [];

  for (const domain of competitorDomains) {
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    const result = allResults.find((r) => r.domain.includes(cleanDomain));

    if (result) {
      competitors.push({
        domain: cleanDomain,
        position: result.position,
        url: result.url,
      });
    }
  }

  console.log(
    `📊 Analyse "${keyword}": Votre position = ${
      yourPosition || "Non trouvé"
    }, ` + `${competitors.length} concurrent(s) trouvé(s)`
  );

  return {
    yourPosition,
    competitors,
  };
}

/**
 * Analyse complète des concurrents pour plusieurs mots-clés
 */
export async function analyzeCompetitorsForKeywords(
  keywords: string[],
  competitorDomains: string[],
  yourDomain: string,
  location: string = "fr"
): Promise<
  Array<{
    keyword: string;
    yourPosition: number | null;
    competitors: CompetitorPosition[];
    topCompetitors: SearchResult[];
  }>
> {
  const results = [];

  for (const keyword of keywords) {
    try {
      // Récupérer les positions
      const positions = await getCompetitorPositions(
        keyword,
        competitorDomains,
        yourDomain,
        location
      );

      // Récupérer aussi le top 10 général
      const topResults = await getGoogleSearchResults(keyword, location, 10);

      results.push({
        keyword,
        yourPosition: positions.yourPosition,
        competitors: positions.competitors,
        topCompetitors: topResults,
      });

      // Attendre un peu entre chaque requête pour éviter le rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Erreur analyse "${keyword}":`, error);
    }
  }

  return results;
}

/**
 * Vérifie si l'API Google Custom Search est configurée
 */
export function isGoogleCustomSearchConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CUSTOM_SEARCH_API_KEY &&
    process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
  );
}
