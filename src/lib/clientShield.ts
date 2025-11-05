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
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          m.addedNodes.forEach((n) => {
            if (
              n.nodeType === Node.ELEMENT_NODE &&
              (n as HTMLElement).tagName === "SCRIPT"
            ) {
              this.log("⚠️ Script injection détecté", n);
              (n as HTMLElement).remove();
              this.report("script-injection", n.outerHTML);
            }
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
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
    this.log(`🚨 [ClientShield] ${type}`, event.message || event.reason || event);
    this.report(type, event.message || event.reason || "Unknown");
  }

  private log(...args: any[]) {
    if (this.options.logSuspicious) console.warn("[ClientShield]", ...args);
  }

  private report(type: string, details: string) {
    if (!this.options.reportURI) return;

    const reportData = {
      type,
      details,
      url: location.href,
      ts: Date.now(),
    };

    navigator.sendBeacon(
      this.options.reportURI,
      JSON.stringify(reportData)
    );
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

  if (!clientShieldInstance) {
    clientShieldInstance = new ClientShield({
      reportURI: "/api/security/report",
      enableIntegrityCheck: true,
      logSuspicious: process.env.NODE_ENV === "development",
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

// Initialisation automatique (client-side uniquement)
if (typeof window !== "undefined") {
  initClientShield();
}
