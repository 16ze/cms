/**
 * Système intelligent de filtrage des concurrents par secteur d'activité
 * Permet d'adapter l'analyse concurrentielle à n'importe quel secteur
 */

interface SectorPattern {
  domainKeywords: string[]; // Mots-clés dans le nom de domaine
  contentKeywords: string[]; // Mots-clés dans le titre/contenu
  excludeKeywords?: string[]; // Mots-clés à exclure
}

/**
 * Patterns de détection par secteur d'activité
 * Extensible pour supporter n'importe quel secteur
 */
export const SECTOR_PATTERNS: Record<string, SectorPattern> = {
  // === SECTEUR WEB & DIGITAL ===
  web_agency: {
    domainKeywords: [
      "agence",
      "web",
      "digital",
      "studio",
      "dev",
      "design",
      "creative",
      "interactive",
      "media",
    ],
    contentKeywords: [
      "agence web",
      "création site",
      "développement web",
      "design web",
      "digital",
      "webdesign",
      "webmarketing",
    ],
    excludeKeywords: ["wikipedia", "definition", "dictionnaire", "cours"],
  },

  // === SECTEUR E-COMMERCE ===
  ecommerce: {
    domainKeywords: [
      "shop",
      "boutique",
      "store",
      "commerce",
      "vente",
      "market",
    ],
    contentKeywords: [
      "boutique en ligne",
      "e-commerce",
      "vente en ligne",
      "acheter",
      "magasin",
    ],
    excludeKeywords: ["wikipedia", "guide", "comment faire"],
  },

  // === SECTEUR RESTAURATION ===
  restaurant: {
    domainKeywords: [
      "restaurant",
      "resto",
      "bistro",
      "brasserie",
      "cafe",
      "traiteur",
    ],
    contentKeywords: [
      "restaurant",
      "cuisine",
      "menu",
      "réservation",
      "gastronomie",
    ],
    excludeKeywords: ["recette", "wikipedia", "tripadvisor"],
  },

  // === SECTEUR ARTISANAT ===
  artisan: {
    domainKeywords: [
      "plombier",
      "electricien",
      "menuisier",
      "artisan",
      "renovation",
      "travaux",
    ],
    contentKeywords: [
      "artisan",
      "réparation",
      "installation",
      "dépannage",
      "travaux",
    ],
    excludeKeywords: ["annuaire", "pagesjaunes", "wikipedia"],
  },

  // === SECTEUR IMMOBILIER ===
  immobilier: {
    domainKeywords: ["immobilier", "immo", "agence", "maison", "logement"],
    contentKeywords: [
      "immobilier",
      "vente",
      "location",
      "appartement",
      "maison",
    ],
    excludeKeywords: ["seloger", "leboncoin", "pap"],
  },

  // === SECTEUR SANTÉ ===
  sante: {
    domainKeywords: [
      "medecin",
      "docteur",
      "clinique",
      "cabinet",
      "sante",
      "medical",
    ],
    contentKeywords: ["consultation", "soins", "médecin", "santé", "patient"],
    excludeKeywords: ["wikipedia", "ameli", "doctolib"],
  },

  // === SECTEUR JURIDIQUE ===
  juridique: {
    domainKeywords: ["avocat", "notaire", "cabinet", "juridique", "droit"],
    contentKeywords: ["conseil", "juridique", "droit", "avocat", "notaire"],
    excludeKeywords: ["legifrance", "service-public", "wikipedia"],
  },

  // === SECTEUR FORMATION ===
  formation: {
    domainKeywords: [
      "formation",
      "ecole",
      "institut",
      "academie",
      "learning",
      "training",
    ],
    contentKeywords: [
      "formation",
      "cours",
      "apprendre",
      "école",
      "certification",
    ],
    excludeKeywords: ["pole-emploi", "wikipedia", "onisep"],
  },

  // === SECTEUR CONSULTING ===
  consulting: {
    domainKeywords: [
      "consulting",
      "conseil",
      "consultant",
      "expertise",
      "advisory",
    ],
    contentKeywords: [
      "conseil",
      "consulting",
      "expertise",
      "accompagnement",
      "stratégie",
    ],
    excludeKeywords: ["wikipedia", "definition", "emploi"],
  },

  // === SECTEUR PAR DÉFAUT (business local) ===
  local_business: {
    domainKeywords: ["service", "pro", "professionnel", "expert", "local"],
    contentKeywords: ["service", "professionnel", "expert", "spécialiste"],
    excludeKeywords: ["pagesjaunes", "yelp", "google", "facebook"],
  },
};

/**
 * Liste globale d'exclusion (sites non-concurrents)
 */
export const GLOBAL_EXCLUDE_DOMAINS = [
  // Encyclopédies et références
  "wikipedia.org",
  "wikihow.com",
  "larousse.fr",
  "dictionnaire.com",

  // Annuaires génériques
  "pagesjaunes.fr",
  "yelp.fr",
  "yelp.com",
  "google.com",
  "google.fr",

  // Réseaux sociaux
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "youtube.com",

  // Sites gouvernementaux
  "gouv.fr",
  "service-public.fr",
  "legifrance.gouv.fr",

  // Marketplaces génériques
  "amazon.fr",
  "cdiscount.fr",
  "fnac.com",
  "leboncoin.fr",

  // Autres
  "tripadvisor.fr",
  "booking.com",
];

interface SearchResult {
  position: number;
  domain: string;
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Filtre les concurrents par secteur d'activité
 */
export function filterCompetitorsBySector(
  results: SearchResult[],
  sector: string,
  yourDomain: string,
  customExclusions: string[] = []
): SearchResult[] {
  const patterns = SECTOR_PATTERNS[sector] || SECTOR_PATTERNS.local_business;
  const allExclusions = [...GLOBAL_EXCLUDE_DOMAINS, ...customExclusions];

  return results
    .filter((result) => {
      const domain = result.domain.toLowerCase();
      const title = result.title.toLowerCase();
      const snippet = (result.snippet || "").toLowerCase();
      const fullText = `${title} ${snippet}`;

      // 1. Exclure votre propre site
      if (domain.includes(yourDomain) || yourDomain.includes(domain)) {
        return false;
      }

      // 2. Exclure les sites de la liste globale
      if (allExclusions.some((excluded) => domain.includes(excluded))) {
        console.log(`   🚫 Exclu (liste globale): ${domain}`);
        return false;
      }

      // 3. Exclure les sites avec mots-clés interdits
      if (
        patterns.excludeKeywords &&
        patterns.excludeKeywords.some((keyword) => domain.includes(keyword))
      ) {
        console.log(`   🚫 Exclu (mot-clé interdit): ${domain}`);
        return false;
      }

      // 4. Vérifier si le domaine contient des mots-clés du secteur
      const hasSectorDomain = patterns.domainKeywords.some((keyword) =>
        domain.includes(keyword)
      );

      // 5. Vérifier si le contenu mentionne des mots-clés du secteur
      const hasSectorContent = patterns.contentKeywords.some((keyword) =>
        fullText.includes(keyword)
      );

      // Accepter si le domaine OU le contenu correspondent au secteur
      const isRelevant = hasSectorDomain || hasSectorContent;

      if (isRelevant) {
        console.log(
          `   ✅ Concurrent pertinent: ${domain} (secteur: ${sector})`
        );
      } else {
        console.log(`   ⚠️ Non pertinent: ${domain}`);
      }

      return isRelevant;
    })
    .slice(0, 5); // Limiter aux 5 meilleurs concurrents filtrés
}

/**
 * Détecte automatiquement le secteur basé sur les mots-clés
 */
export function detectSectorFromKeywords(keywords: string[]): string {
  const keywordText = keywords.join(" ").toLowerCase();

  // Web & Digital
  if (
    ["agence", "web", "site", "développement", "digital"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "web_agency";
  }

  // E-commerce
  if (
    ["boutique", "e-commerce", "shop", "vente", "magasin"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "ecommerce";
  }

  // Restaurant
  if (
    ["restaurant", "resto", "cuisine", "gastronomie"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "restaurant";
  }

  // Artisan
  if (
    ["plombier", "electricien", "artisan", "travaux", "renovation"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "artisan";
  }

  // Immobilier
  if (
    ["immobilier", "immo", "appartement", "maison"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "immobilier";
  }

  // Santé
  if (
    ["medecin", "docteur", "sante", "clinique", "cabinet medical"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "sante";
  }

  // Juridique
  if (
    ["avocat", "notaire", "juridique", "droit"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "juridique";
  }

  // Formation
  if (
    ["formation", "ecole", "cours", "learning"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "formation";
  }

  // Consulting
  if (
    ["consulting", "conseil", "consultant", "expertise"].some((kw) =>
      keywordText.includes(kw)
    )
  ) {
    return "consulting";
  }

  // Défaut
  return "local_business";
}

/**
 * Enrichit les résultats avec des métadonnées de pertinence
 */
export function scoreCompetitorRelevance(
  result: SearchResult,
  sector: string
): number {
  const patterns = SECTOR_PATTERNS[sector] || SECTOR_PATTERNS.local_business;
  const domain = result.domain.toLowerCase();
  const title = result.title.toLowerCase();
  const snippet = (result.snippet || "").toLowerCase();
  const fullText = `${domain} ${title} ${snippet}`;

  let score = 0;

  // Points pour mots-clés dans le domaine (plus important)
  patterns.domainKeywords.forEach((keyword) => {
    if (domain.includes(keyword)) score += 3;
  });

  // Points pour mots-clés dans le contenu
  patterns.contentKeywords.forEach((keyword) => {
    if (fullText.includes(keyword)) score += 1;
  });

  // Pénalité pour mots-clés exclus
  if (patterns.excludeKeywords) {
    patterns.excludeKeywords.forEach((keyword) => {
      if (fullText.includes(keyword)) score -= 5;
    });
  }

  return Math.max(0, score);
}

/**
 * Filtre et trie les concurrents par pertinence
 */
export function filterAndRankCompetitors(
  results: SearchResult[],
  sector: string,
  yourDomain: string,
  maxResults: number = 5
): SearchResult[] {
  console.log(`\n🎯 Filtrage concurrents pour secteur: ${sector}`);

  // Filtrer par secteur
  const filtered = filterCompetitorsBySector(results, sector, yourDomain);

  // Scorer et trier par pertinence
  const scored = filtered
    .map((result) => ({
      ...result,
      relevanceScore: scoreCompetitorRelevance(result, sector),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  console.log(
    `\n📊 ${scored.length} concurrent(s) pertinent(s) trouvé(s) (sur ${results.length} résultats)`
  );

  return scored.slice(0, maxResults);
}
