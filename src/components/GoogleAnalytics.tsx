'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Composant Google Analytics avec configuration dynamique
 * Récupère l'ID depuis /admin/settings
 * S'active automatiquement seulement si l'ID est configuré
 */
export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null);
  const [gtmId, setGtmId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer comme monté pour éviter les erreurs de réhydratation
    setMounted(true);

    // Récupérer les IDs depuis les paramètres du site
    async function fetchAnalyticsIds() {
      try {
        const response = await fetch('/api/settings', {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          
          // Google Analytics ID
          if (data.seoSettings?.googleAnalyticsId) {
            const id = data.seoSettings.googleAnalyticsId.trim();
            if (id && id.startsWith('G-')) {
              setGaId(id);
              console.log('✅ Google Analytics activé:', id);
            }
          }

          // Google Tag Manager ID
          if (data.seoSettings?.googleTagManagerId) {
            const id = data.seoSettings.googleTagManagerId.trim();
            if (id && id.startsWith('GTM-')) {
              setGtmId(id);
              console.log('✅ Google Tag Manager activé:', id);
            }
          }
        }
      } catch (error) {
        // Silencieux en cas d'erreur - pas critique
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Impossible de charger les IDs analytics:', error);
        }
      }
    }

    fetchAnalyticsIds();
  }, []);

  // Ne rien rendre avant le montage côté client pour éviter les erreurs de réhydratation
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Google Analytics (GA4) - Conditionnel */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
            onError={(e) => {
              // Ignorer les erreurs de chargement en développement
              if (process.env.NODE_ENV === 'development') {
                console.warn('Erreur chargement GA:', e);
              }
            }}
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

      {/* Google Tag Manager (GTM) - Conditionnel */}
      {gtmId && (
        <>
          {/* Utiliser Next.js Script component avec dangerouslySetInnerHTML
              Le script GTM utilise uniquement appendChild pour éviter les erreurs DOM */}
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                  var j=d.createElement(s);
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtm.js?id='+i;
                  d.head.appendChild(j);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
            onError={() => {
              // Ignorer silencieusement les erreurs de chargement
            }}
          />
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
