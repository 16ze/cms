import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./seo.css";
import "@/styles/design-system.css";
import "@/styles/micro-interactions.css";
import "@/styles/button-enhancements.css";
import CookieConsent from "@/components/CookieConsent";
import ConditionalChatbot from "@/components/conditional-chatbot";
import { DesignSyncProvider } from "@/components/design-sync-provider";
import DynamicStyleInjector from "@/components/design/DynamicStyleInjector";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { BackToTop } from "@/components/ui/back-to-top";
import { ErrorHandlerSetup } from "@/components/ErrorHandlerSetup";
import { SecuritySetup } from "@/components/SecuritySetup";
import { Suspense } from "react";
import {
  GoogleAnalyticsLazy,
  ConditionalChatbotLazy,
  LazyComponentWrapper,
} from "@/lib/lazy-components";
import companyData from "@/config/company.json";
import contentData from "@/config/content.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Métadonnées SEO dynamiques récupérées depuis /admin/settings
 * Permet de modifier le SEO sans rebuild
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Récupérer les paramètres depuis la base de données
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/settings`, {
      cache: "no-store", // Toujours frais
    });

    if (response.ok) {
      const data = await response.json();
      const seo = data.seoSettings || {};

      // Utiliser les settings de la base si disponibles
      return {
        metadataBase: new URL(
          seo.canonicalUrl || companyData.company.seo.siteUrl
        ),
        title: {
          default: seo.defaultMetaTitle || companyData.company.seo.defaultTitle,
          template: `%s | ${data.siteName || companyData.company.name}`,
        },
        description:
          seo.defaultMetaDescription ||
          companyData.company.seo.defaultDescription,
        generator: "Next.js",
        applicationName: data.siteName || companyData.company.name,
        referrer: "origin-when-cross-origin",
        keywords: seo.keywords || companyData.company.seo.keywords,
        authors: [
          {
            name: data.siteName || companyData.company.name,
            url: seo.canonicalUrl || companyData.company.seo.siteUrl,
          },
        ],
        creator: data.siteName || companyData.company.name,
        publisher: data.siteName || companyData.company.name,
        category: "Web Development",
        formatDetection: {
          email: false,
          address: false,
          telephone: false,
        },
        robots: {
          index: seo.robotsTxtEnabled !== false,
          follow: seo.robotsTxtEnabled !== false,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
        openGraph: {
          type: "website",
          locale: "fr_FR",
          url: seo.canonicalUrl || companyData.company.seo.siteUrl,
          title:
            seo.ogTitle ||
            seo.defaultMetaTitle ||
            companyData.company.seo.defaultTitle,
          description:
            seo.ogDescription ||
            seo.defaultMetaDescription ||
            companyData.company.seo.defaultDescription,
          siteName: data.siteName || companyData.company.name,
          images: [
            seo.ogImage ||
              `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
          ],
        },
        twitter: {
          card: (seo.twitterCard as any) || "summary_large_image",
          title:
            seo.ogTitle ||
            seo.defaultMetaTitle ||
            companyData.company.seo.defaultTitle,
          description:
            seo.ogDescription ||
            seo.defaultMetaDescription ||
            companyData.company.seo.defaultDescription,
          creator: companyData.company.seo.twitterHandle,
          images: [
            seo.ogImage ||
              `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
          ],
        },
        alternates: {
          canonical: seo.canonicalUrl || companyData.company.seo.siteUrl,
          languages: {
            fr: seo.canonicalUrl || companyData.company.seo.siteUrl,
            en: `${seo.canonicalUrl || companyData.company.seo.siteUrl}/en`,
          },
        },
        verification: {
          google:
            seo.googleSearchConsole ||
            companyData.company.seo.googleSiteVerification,
        },
      };
    }
  } catch (error) {
    console.error(
      "⚠️ Erreur chargement SEO settings, utilisation des fallbacks:",
      error
    );
  }

  // Fallback sur les valeurs de company.json si l'API échoue
  return {
    metadataBase: new URL(companyData.company.seo.siteUrl),
    title: {
      default: companyData.company.seo.defaultTitle,
      template: `%s | ${companyData.company.name} - ${companyData.company.industry}`,
    },
    description: companyData.company.seo.defaultDescription,
    generator: "Next.js",
    applicationName: companyData.company.name,
    referrer: "origin-when-cross-origin",
    keywords: companyData.company.seo.keywords,
    authors: [
      {
        name: companyData.company.name,
        url: companyData.company.seo.siteUrl,
      },
    ],
    creator: companyData.company.name,
    publisher: companyData.company.name,
    category: "Web Development",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: companyData.company.seo.siteUrl,
      title: companyData.company.seo.defaultTitle,
      description: companyData.company.seo.defaultDescription,
      siteName: companyData.company.name,
      images: [
        `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: companyData.company.seo.defaultTitle,
      description: companyData.company.seo.defaultDescription,
      creator: companyData.company.seo.twitterHandle,
      images: [
        `${companyData.company.seo.siteUrl}${companyData.company.branding.ogImage}`,
      ],
    },
    alternates: {
      canonical: companyData.company.seo.siteUrl,
      languages: {
        fr: companyData.company.seo.siteUrl,
        en: `${companyData.company.seo.siteUrl}/en`,
      },
    },
    verification: {
      google: companyData.company.seo.googleSiteVerification,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <link rel="canonical" href={companyData.company.seo.siteUrl} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: companyData.company.name,
              url: companyData.company.seo.siteUrl,
              logo: `${companyData.company.seo.siteUrl}/images/logo.png`,
              description: companyData.company.description,
              address: {
                "@type": "PostalAddress",
                streetAddress: companyData.company.contact.address.street,
                addressLocality: companyData.company.contact.address.city,
                postalCode: companyData.company.contact.address.postalCode,
                addressCountry: companyData.company.contact.address.countryCode,
                addressRegion: companyData.company.contact.address.region,
              },
              sameAs: [
                companyData.company.social.facebook,
                companyData.company.social.instagram,
                companyData.company.social.linkedin,
                companyData.company.social.twitter,
              ],
              geo: {
                "@type": "GeoCoordinates",
                latitude:
                  companyData.company.contact.address.coordinates.latitude,
                longitude:
                  companyData.company.contact.address.coordinates.longitude,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: companyData.company.hours.days,
                  opens: companyData.company.hours.opens,
                  closes: companyData.company.hours.closes,
                },
              ],
              areaServed: {
                "@type": "GeoCircle",
                geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude:
                    companyData.company.contact.address.coordinates.latitude,
                  longitude:
                    companyData.company.contact.address.coordinates.longitude,
                },
                geoRadius: companyData.company.services.areaServed.radius,
              },
              serviceArea: {
                "@type": "GeoCircle",
                geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude:
                    companyData.company.contact.address.coordinates.latitude,
                  longitude:
                    companyData.company.contact.address.coordinates.longitude,
                },
                geoRadius: companyData.company.services.areaServed.radius,
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: companyData.company.contact.phone,
                contactType: "customer service",
                availableLanguage: ["French", "English"],
                email: companyData.company.contact.email,
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `Services ${companyData.company.name}`,
                itemListElement: companyData.company.services.mainServices.map(
                  (service: string) => ({
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: service,
                      description: service,
                    },
                  })
                ),
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorHandlerSetup />
          <SecuritySetup />
          <ScrollToTop />
          <BackToTop />
          <DynamicStyleInjector />
          <DesignSyncProvider>
            {children}
            <Toaster />
            <CookieConsent />
            <LazyComponentWrapper>
              <GoogleAnalyticsLazy />
              <ConditionalChatbotLazy />
            </LazyComponentWrapper>
          </DesignSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
