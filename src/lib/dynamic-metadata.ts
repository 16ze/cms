import { Metadata } from "next";
import companyData from "@/config/company.json";

/**
 * Génère les métadonnées SEO dynamiques pour une page spécifique
 * Récupère les paramètres depuis /admin/settings
 * Fallback sur company.json si erreur
 */
export async function generateDynamicMetadata(
  pageTitle?: string,
  pageDescription?: string,
  pageKeywords?: string,
  pageImage?: string
): Promise<Metadata> {
  try {
    // Récupérer les paramètres SEO depuis la base
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/settings`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const seo = data.seoSettings || {};
      
      // Construire les metadata avec les settings de la base
      const siteName = data.siteName || companyData.company.name;
      const fullTitle = pageTitle 
        ? `${pageTitle} | ${siteName}`
        : seo.defaultMetaTitle || companyData.company.seo.defaultTitle;
      
      const description = pageDescription 
        || seo.defaultMetaDescription 
        || companyData.company.seo.defaultDescription;
      
      const keywords = pageKeywords 
        || seo.keywords 
        || companyData.company.seo.keywords;
      
      const canonicalUrl = seo.canonicalUrl || companyData.company.seo.siteUrl;
      
      const ogImageUrl = pageImage 
        || seo.ogImage 
        || `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`;

      return {
        title: fullTitle,
        description,
        keywords,
        openGraph: {
          title: seo.ogTitle || fullTitle,
          description: seo.ogDescription || description,
          url: canonicalUrl,
          siteName,
          images: [ogImageUrl],
          type: "website",
          locale: "fr_FR",
        },
        twitter: {
          card: (seo.twitterCard as any) || "summary_large_image",
          title: seo.ogTitle || fullTitle,
          description: seo.ogDescription || description,
          images: [ogImageUrl],
          creator: companyData.company.seo.twitterHandle,
        },
        alternates: {
          canonical: canonicalUrl,
        },
        robots: {
          index: seo.robotsTxtEnabled !== false,
          follow: seo.robotsTxtEnabled !== false,
        },
      };
    }
  } catch (error) {
    console.error('⚠️ Erreur génération metadata dynamique:', error);
  }

  // Fallback sur company.json
  const siteName = companyData.company.name;
  const fullTitle = pageTitle 
    ? `${pageTitle} | ${siteName}`
    : companyData.company.seo.defaultTitle;

  return {
    title: fullTitle,
    description: pageDescription || companyData.company.seo.defaultDescription,
    keywords: pageKeywords || companyData.company.seo.keywords,
    openGraph: {
      title: fullTitle,
      description: pageDescription || companyData.company.seo.defaultDescription,
      url: companyData.company.seo.siteUrl,
      siteName,
      images: [
        pageImage || `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
      ],
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription || companyData.company.seo.defaultDescription,
      images: [
        pageImage || `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
      ],
      creator: companyData.company.seo.twitterHandle,
    },
    alternates: {
      canonical: companyData.company.seo.siteUrl,
    },
  };
}

