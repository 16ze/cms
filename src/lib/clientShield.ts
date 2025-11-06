/**
 * clientShield.ts
 * Sécurité front-end — WAF client-side + intégrité + anti-XSS runtime
 * @version 2.0 - Version simplifiée et optimisée
 */

type ShieldOptions = {
  enableIntegrityCheck?: boolean;
  logSuspicious?: boolean;
  reportURI?: string;
};

/**
 * Types de menaces détectées (pour compatibilité avec l'existant)
 */
export enum ThreatType {
  XSS = "XSS",
  SQL_INJECTION = "SQL_INJECTION",
  CSRF = "CSRF",
  DOM_INJECTION = "DOM_INJECTION",
  SCRIPT_INJECTION = "SCRIPT_INJECTION",
  PROTOCOL_MANIPULATION = "PROTOCOL_MANIPULATION",
}

/**
 * Contexte d'une menace détectée (pour compatibilité avec l'existant)
 */
export interface ThreatContext {
  type: ThreatType;
  source: string;
  payload: string;
  url?: string;
  method?: string;
  timestamp: number;
  userAgent: string;
  stack?: string;
}

/**
 * Fonction helper pour créer un ThreatContext (pour compatibilité)
 */
export function createThreatContext(
  type: ThreatType,
  source: string,
  payload: string,
  additionalInfo?: {
    url?: string;
    method?: string;
    stack?: string;
  }
): ThreatContext {
  return {
    type,
    source,
    payload: payload.substring(0, 500),
    url: additionalInfo?.url,
    method: additionalInfo?.method,
    timestamp: Date.now(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    stack: additionalInfo?.stack,
  };
}

/**
 * Fonction helper pour reporter une menace (pour compatibilité)
 */
export async function reportThreat(threat: ThreatContext): Promise<void> {
  const reportURI = "/api/security/report";

  try {
    await fetch(reportURI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(threat),
      keepalive: true,
    }).catch(() => {
      // Ignorer les erreurs silencieusement
    });
  } catch {
    // Ignorer les erreurs silencieusement
  }
}


export class ClientShield {
  private options: ShieldOptions;

  constructor(options?: ShieldOptions) {
    this.options = {
      enableIntegrityCheck: true,
      logSuspicious: true,
      ...options,
    };
    this.init();
  }

  private init() {
    this.setupGlobalGuards();
    this.watchDOMMutations();
    this.protectEval();
    this.injectIntegrity();
  }

  /** Intercepte les scripts ou injections suspectes */
  private setupGlobalGuards() {
    window.addEventListener("error", (e) => this.handleEvent("error", e));
    window.addEventListener("unhandledrejection", (e) =>
      this.handleEvent("unhandledrejection", e)
    );

    document.addEventListener(
      "securitypolicyviolation",
      (e: SecurityPolicyViolationEvent) =>
        this.handleEvent("csp-violation", e)
    );
  }

  /** Surveille les mutations DOM (injection XSS runtime) */
  private watchDOMMutations() {
    // Désactiver la surveillance DOM en développement pour éviter les conflits avec React
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      // En développement, la surveillance DOM est trop agressive et cause des conflits avec React
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          m.addedNodes.forEach((n) => {
            try {
              if (
                n.nodeType === Node.ELEMENT_NODE &&
                (n as HTMLElement).tagName === "SCRIPT"
              ) {
                const script = n as HTMLScriptElement;
                const src = script.getAttribute("src") || "";

                // Ignorer TOUS les scripts légitimes (Next.js, React, Google Analytics, etc.)
                if (
                  src.includes("/_next/") ||
                  src.includes("localhost") ||
                  src.includes("127.0.0.1") ||
                  src.includes("next-dev") ||
                  src.includes("turbopack") ||
                  src.includes("googletagmanager.com") ||
                  src.includes("google-analytics.com") ||
                  src.includes("gtag/js") ||
                  src.includes("gtm.js")
                ) {
                  return; // Script légitime, ignorer
                }

                // Ignorer les scripts sans src (scripts inline créés par React/Next.js)
                if (!src && script.textContent) {
                  const textContent = script.textContent.substring(0, 500);
                  if (
                    textContent.includes("__next") ||
                    textContent.includes("React") ||
                    textContent.includes("webpack") ||
                    textContent.includes("__NEXT_DATA__") ||
                    textContent.includes("next/dist") ||
                    textContent.includes("dataLayer") ||
                    textContent.includes("gtag") ||
                    textContent.includes("googletagmanager") ||
                    textContent.includes("__REACT_DEVTOOLS") ||
                    textContent.includes("ReactDOM") ||
                    textContent.includes("webpackHotUpdate")
                  ) {
                    return; // Script légitime
                  }
                }

                // Si on arrive ici, c'est vraiment suspect (uniquement en production)
                this.log("⚠️ Script injection suspect détecté", src || script.textContent?.substring(0, 50));
                
                // Supprimer le script de manière sécurisée SANS utiliser removeChild
                // Utiliser remove() qui est plus sûr et ne cause pas d'erreurs
                try {
                  // Utiliser remove() directement, qui est plus sûr que removeChild
                  if (script.remove) {
                    script.remove();
                  } else if (script.parentNode) {
                    // Fallback seulement si remove() n'est pas disponible
                    try {
                      script.parentNode.removeChild(script);
                    } catch {
                      // Ignorer silencieusement - le script peut déjà être supprimé
                    }
                  }
                } catch (removeError: any) {
                  // Ignorer toutes les erreurs de suppression silencieusement
                  // Ces erreurs sont non critiques et causent du spam en développement
                }

                this.report("script-injection", src || script.textContent?.substring(0, 100) || "unknown");
              }
            } catch (error) {
              // Ignorer toutes les erreurs lors de l'inspection des nœuds
              // Peut se produire si le nœud est déjà supprimé par React
            }
          });
        }
      }
    });

    // Observer uniquement en production, et avec un délai pour éviter les conflits avec React
    setTimeout(() => {
      try {
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } catch (error) {
        // Ignorer silencieusement si l'observation échoue
      }
    }, 1000); // Délai pour laisser React finir son rendu initial
  }

  /** Interdit l'usage de eval / Function / new Function */
  private protectEval() {
    const block = () => {
      throw new Error("⚠️ Appel bloqué par ClientShield: eval interdit");
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      (window as any).eval = block;
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      (window as any).Function = block;
    } catch (error) {
      // En mode strict ou certains navigateurs, ces propriétés peuvent être non-configurables
      console.warn("Could not block eval/Function:", error);
    }
  }

  /** Vérifie l'intégrité du DOM principal */
  private injectIntegrity() {
    if (!this.options.enableIntegrityCheck) return;

    const baseline = document.documentElement.innerHTML.length;
    setInterval(() => {
      const diff = Math.abs(
        document.documentElement.innerHTML.length - baseline
      );
      if (diff > 2000) {
        this.log("⚠️ Possible altération DOM détectée", diff);
        this.report("dom-tamper", diff.toString());
      }
    }, 30000);
  }

  private handleEvent(type: string, event: any) {
    // Filtrer les erreurs DOM non critiques de React/Next.js
    const errorMessage = event?.message || event?.reason?.message || String(event?.reason || event || "");
    const errorName = event?.error?.name || event?.reason?.name || "";

    // Ignorer les erreurs DOM communes de React/Next.js qui ne sont pas critiques
    const ignoredErrors = [
      "insertBefore",
      "removeChild",
      "Failed to execute 'insertBefore'",
      "Failed to execute 'removeChild'",
      "The node before which the new node is to be inserted is not a child",
      "The node to be removed is not a child",
      "not a child",
      "not a child of this node",
      "Suspense boundary",
      "server rendering",
      "Switched to client rendering",
      "Could not finish this Suspense boundary",
      "The server could not finish this Suspense boundary",
      "Hydration failed",
      "Hydration",
      "Hydration mismatch",
    ];

    const shouldIgnore = ignoredErrors.some(
      (ignored) => errorMessage.includes(ignored) || errorName.includes(ignored)
    );

    if (shouldIgnore) {
      // Ces erreurs sont généralement causées par React/Next.js pendant le hot-reload
      // et ne sont pas critiques pour la sécurité
      return;
    }

    this.log(`🚨 [ClientShield] ${type}`, event.message || event.reason || event);
    this.report(type, event.message || event.reason || "Unknown");
  }

  private log(...args: any[]) {
    if (this.options.logSuspicious) console.warn("[ClientShield]", ...args);
  }

  private report(type: string, details: string) {
    if (!this.options.reportURI) return;

    // Format compatible avec l'API /api/security/report
    const reportData = {
      type: type,
      source: "client-shield",
      payload: details.substring(0, 500),
      url: location.href,
      method: "GET",
      timestamp: Date.now(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    // Utiliser fetch au lieu de sendBeacon pour avoir un meilleur contrôle
    fetch(this.options.reportURI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
      keepalive: true,
    }).catch(() => {
      // Ignorer les erreurs silencieusement
    });
  }
}

/**
 * Instance globale du ClientShield
 */
let clientShieldInstance: ClientShield | null = null;

/**
 * Initialiser le Client Shield (pour compatibilité avec SecuritySetup)
 */
export function initClientShield(): void {
  if (typeof window === "undefined") return;

  // DÉSACTIVER complètement ClientShield en développement pour éviter les conflits avec React
  // La surveillance DOM cause trop de faux positifs et d'erreurs avec React/Next.js
  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    // En développement, ne pas initialiser ClientShield pour éviter les conflits
    console.log("🛡️ Client Shield désactivé en développement (évite les conflits avec React)");
    return;
  }

  if (!clientShieldInstance) {
    clientShieldInstance = new ClientShield({
      reportURI: "/api/security/report",
      enableIntegrityCheck: true,
      logSuspicious: false, // Désactiver les logs en production aussi pour éviter le spam
    });
    console.log("🛡️ Client Shield initialisé");
  }
}

/**
 * Obtenir les statistiques de sécurité (pour compatibilité)
 */
export function getSecurityStats(): {
  threatCount: number;
  threats: ThreatContext[];
} {
  // Pour la version simplifiée, retourner des stats vides
  // Les stats sont gérées côté serveur via l'API /api/security/report
  return { threatCount: 0, threats: [] };
}

// Initialisation automatique (client-side uniquement) - DÉSACTIVÉE en développement
if (typeof window !== "undefined") {
  // Ne pas initialiser automatiquement - laisser SecuritySetup gérer l'initialisation
  // pour éviter les conflits avec React en développement
}
