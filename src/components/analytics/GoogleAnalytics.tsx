'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Composant pour charger conditionnellement Google Analytics et Google Tag Manager
 * Les IDs sont récupérés depuis /admin/settings
 * Si les IDs sont vides, rien ne se charge (parfait pour un template)
 */
export function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null);
  const [gtmId, setGtmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les IDs depuis les paramètres du site
    async function fetchAnalyticsIds() {
      try {
        const response = await fetch('/api/settings', {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          
          // Vérifier et définir les IDs s'ils existent
          if (data.seoSettings?.googleAnalyticsId) {
            const id = data.seoSettings.googleAnalyticsId.trim();
            if (id && id.startsWith('G-')) {
              setGaId(id);
              console.log('✅ Google Analytics activé:', id);
            }
          }

          if (data.seoSettings?.googleTagManagerId) {
            const id = data.seoSettings.googleTagManagerId.trim();
            if (id && id.startsWith('GTM-')) {
              setGtmId(id);
              console.log('✅ Google Tag Manager activé:', id);
            }
          }
        }
      } catch (error) {
        console.error('⚠️ Erreur chargement IDs analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsIds();
  }, []);

  // Ne rien afficher pendant le chargement
  if (loading) {
    return null;
  }

  return (
    <>
      {/* Google Analytics (GA4) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager (GTM) */}
      {gtmId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
    </>
  );
}

