import Script from "next/script";
import { MainLayout } from "@/components/layout/main-layout";
import ModernHomePage from "@/components/pages/modern-home-page";
import companyData from "@/config/company.json";
import contentData from "@/config/content.json";
import { generateDynamicMetadata } from "@/lib/dynamic-metadata";

export async function generateMetadata() {
  // La homepage utilise les metadata par défaut (pas de override)
  return generateDynamicMetadata();
}

export default function Home() {
  return (
    <MainLayout>
      <Script id="schema-website" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: `${companyData.company.seo.siteUrl}/`,
          name: companyData.company.name,
          description: companyData.company.description,
          potentialAction: {
            "@type": "SearchAction",
            target: `${companyData.company.seo.siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        })}
      </Script>

      <Script id="schema-business" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: companyData.company.name,
          description: companyData.company.description,
          url: companyData.company.seo.siteUrl,
          telephone: companyData.company.contact.phone,
          email: companyData.company.contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: companyData.company.contact.address.street,
            addressLocality: companyData.company.contact.address.city,
            postalCode: companyData.company.contact.address.postalCode,
            addressCountry: companyData.company.contact.address.countryCode,
            addressRegion: companyData.company.contact.address.region,
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: companyData.company.contact.address.coordinates.latitude,
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
          sameAs: [
            companyData.company.social.facebook,
            companyData.company.social.instagram,
            companyData.company.social.linkedin,
            companyData.company.social.twitter,
          ],
        })}
      </Script>

      {/* Contenu moderne de la page d'accueil */}
      <ModernHomePage />
    </MainLayout>
  );
}
