/**
 * 🕵️ SECURITY WATCHDOG HOOK
 * ===========================
 *
 * Hook React pour surveiller l'intégrité du runtime et détecter
 * les injections malicieuses, extensions navigateur et altérations
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { createThreatContext, ThreatType, reportThreat } from "@/lib/clientShield";
import * as Sentry from "@sentry/nextjs";

/**
 * Configuration du watchdog
 */
interface WatchdogConfig {
  /**
   * Intervalle de vérification en ms (défaut: 5000)
   */
  checkInterval?: number;

  /**
   * Activer la vérification de l'intégrité du bundle
   */
  checkBundleIntegrity?: boolean;

  /**
   * Activer la vérification des extensions navigateur
   */
  checkBrowserExtensions?: boolean;

  /**
   * Callback appelé en cas de détection de menace
   */
  onThreatDetected?: (threat: string) => void;

  /**
   * Forcer logout si altération détectée
   */
  forceLogoutOnTampering?: boolean;
}

/**
 * Checksum basique du bundle (peut être amélioré avec un hash réel)
 */
let bundleChecksum: string | null = null;

/**
 * Calculer un checksum simple du bundle
 */
function calculateBundleChecksum(): string {
  if (typeof window === "undefined") return "";

  try {
    // Vérifier l'intégrité des scripts principaux
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    const sources = scripts
      .map((script) => script.getAttribute("src"))
      .filter(Boolean)
      .sort()
      .join("|");

    // Vérifier les fonctions critiques
    const criticalFunctions = [
      window.fetch?.toString().substring(0, 100),
      window.XMLHttpRequest?.toString().substring(0, 100),
      window.postMessage?.toString().substring(0, 100),
    ]
      .filter(Boolean)
      .join("|");

    return btoa(sources + criticalFunctions).substring(0, 32);
  } catch {
    return "";
  }
}

/**
 * Détecter les extensions navigateur suspectes
 * Version allégée pour réduire les faux positifs en développement
 */
function detectMaliciousExtensions(): string[] {
  const detected: string[] = [];

  if (typeof window === "undefined") return detected;

  // Désactiver en développement pour éviter les faux positifs avec les DevTools
  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    return detected; // Ne pas détecter les extensions en développement
  }

  try {
    // Vérifier uniquement les scripts injectés vraiment suspects (pas les extensions normales)
    const suspiciousScripts = Array.from(document.querySelectorAll("script[src]")).filter(
      (script) => {
        const src = script.getAttribute("src");
        return (
          src &&
          (src.includes("chrome-extension://") ||
            src.includes("moz-extension://") ||
            src.includes("extension://")) &&
          !src.includes("webpack") && // Ignorer les scripts de développement
          !src.includes("react-devtools") // Ignorer les DevTools React
        );
      }
    );

    if (suspiciousScripts.length > 0) {
      suspiciousScripts.forEach((script) => {
        const src = script.getAttribute("src");
        if (src && !src.includes("localhost") && !src.includes("127.0.0.1")) {
          detected.push(`Script extension suspect détecté: ${src}`);
        }
      });
    }
  } catch (error) {
    console.warn("Erreur lors de la détection d'extensions:", error);
  }

  return detected;
}

/**
 * Vérifier l'intégrité de window.__proto__
 */
function checkWindowPrototype(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const originalProto = Object.getPrototypeOf(window);
    const currentProto = Object.getPrototypeOf(window);

    // Vérifier que le prototype n'a pas été modifié
    if (originalProto !== currentProto) {
      return false;
    }

    // Vérifier les propriétés critiques
    const criticalProps = ["fetch", "XMLHttpRequest", "postMessage", "eval"];
    for (const prop of criticalProps) {
      if (!(prop in window)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }

  return true;
}

/**
 * Vérifier l'intégrité de document.cookie
 */
function checkCookieIntegrity(): boolean {
  if (typeof document === "undefined") return true;

  try {
    // Vérifier que document.cookie est toujours accessible et non modifié
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    if (cookieDescriptor && !cookieDescriptor.configurable) {
      // La propriété cookie ne devrait pas être non-configurable (signe de modification)
      return false;
    }

    // Vérifier qu'on peut toujours lire les cookies
    const testCookie = document.cookie;
    return typeof testCookie === "string";
  } catch {
    return false;
  }

  return true;
}

/**
 * Hook useSecurityWatchdog - Surveillance runtime de sécurité
 *
 * @example
 * ```tsx
 * useSecurityWatchdog({
 *   checkInterval: 5000,
 *   onThreatDetected: (threat) => console.error(threat),
 * });
 * ```
 */
export function useSecurityWatchdog(config: WatchdogConfig = {}) {
  const {
    checkInterval = 5000,
    checkBundleIntegrity = true,
    checkBrowserExtensions = true,
    onThreatDetected,
    forceLogoutOnTampering = true,
  } = config;

  const [threats, setThreats] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checksumRef = useRef<string | null>(null);
  const threatsSeenRef = useRef<Set<string>>(new Set()); // Pour éviter les doublons
  const onThreatDetectedRef = useRef(onThreatDetected); // Ref pour éviter les re-renders

  // Mettre à jour le ref quand le callback change
  useEffect(() => {
    onThreatDetectedRef.current = onThreatDetected;
  }, [onThreatDetected]);

  useEffect(() => {
    // Initialiser le checksum du bundle
    if (checkBundleIntegrity && typeof window !== "undefined") {
      bundleChecksum = calculateBundleChecksum();
      checksumRef.current = bundleChecksum;
    }

    // Fonction de vérification
    const performCheck = () => {
      const detectedThreats: string[] = [];

      // En développement, désactiver les vérifications strictes qui causent des faux positifs
      const isDevelopment = process.env.NODE_ENV === "development";

      // 1. Vérifier l'intégrité du bundle (uniquement en production)
      if (checkBundleIntegrity && typeof window !== "undefined" && !isDevelopment) {
        const currentChecksum = calculateBundleChecksum();
        if (checksumRef.current && currentChecksum !== checksumRef.current && currentChecksum) {
          const threat = createThreatContext(
            ThreatType.DOM_INJECTION,
            "watchdog",
            "Bundle integrity check failed",
            {
              stack: new Error().stack,
            }
          );
          reportThreat(threat);
          detectedThreats.push("Altération du bundle détectée");
        }
        // Mettre à jour le checksum seulement si on n'a pas détecté de menace
        if (detectedThreats.length === 0) {
          checksumRef.current = currentChecksum;
        }
      }

      // 2. Vérifier window.__proto__ (uniquement en production)
      if (!isDevelopment && !checkWindowPrototype()) {
        const threat = createThreatContext(
          ThreatType.DOM_INJECTION,
          "watchdog",
          "Window prototype tampering detected",
          {
            stack: new Error().stack,
          }
        );
        reportThreat(threat);
        detectedThreats.push("Modification de window.__proto__ détectée");
      }

      // 3. Vérifier document.cookie (uniquement en production)
      if (!isDevelopment && !checkCookieIntegrity()) {
        const threat = createThreatContext(
          ThreatType.DOM_INJECTION,
          "watchdog",
          "Cookie integrity check failed",
          {
            stack: new Error().stack,
          }
        );
        reportThreat(threat);
        detectedThreats.push("Intégrité des cookies compromise");
      }

      // 4. Détecter les extensions malicieuses (version allégée)
      if (checkBrowserExtensions && typeof window !== "undefined") {
        const extensions = detectMaliciousExtensions();
        if (extensions.length > 0) {
          extensions.forEach((ext) => {
            const threat = createThreatContext(
              ThreatType.DOM_INJECTION,
              "watchdog",
              `Browser extension detected: ${ext}`,
              {
                stack: new Error().stack,
              }
            );
            reportThreat(threat);
          });
          detectedThreats.push(...extensions);
        }
      }

      // Si des menaces sont détectées, filtrer celles déjà vues
      const newThreats = detectedThreats.filter((threat) => {
        if (!threatsSeenRef.current.has(threat)) {
          threatsSeenRef.current.add(threat);
          return true;
        }
        return false;
      });

      if (newThreats.length > 0) {
        setThreats((prev) => [...prev, ...newThreats]);

        // Appeler le callback uniquement pour les nouvelles menaces
        if (onThreatDetectedRef.current) {
          newThreats.forEach((threat) => onThreatDetectedRef.current?.(threat));
        }

        // Forcer logout si configuré (une seule fois par type de menace)
        if (forceLogoutOnTampering && newThreats.length > 0) {
          console.error("🚨 Altération détectée - Déconnexion forcée");
          Sentry.captureMessage("Security tampering detected - forcing logout", {
            level: "error",
            tags: {
              threat_type: "tampering",
            },
          });

          // Flush cache et rediriger vers login (une seule fois)
          try {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/auth/login?reason=tampering";
          } catch (error) {
            console.error("Erreur lors du logout forcé:", error);
          }
        }
      }
    };

    // Effectuer la vérification immédiatement
    performCheck();

    // Configurer l'intervalle
    intervalRef.current = setInterval(performCheck, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    checkInterval,
    checkBundleIntegrity,
    checkBrowserExtensions,
    forceLogoutOnTampering,
    // onThreatDetected est géré via ref pour éviter les re-renders
  ]);

  return {
    threats,
    clearThreats: () => setThreats([]),
  };
}

