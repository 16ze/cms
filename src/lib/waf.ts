/**
 * 🛡️ WEB APPLICATION FIREWALL (WAF)
 * ==================================
 * 
 * Protection contre les attaques courantes:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - LFI (Local File Inclusion)
 * - Path Traversal
 * - Command Injection
 */

import { NextRequest, NextResponse } from "next/server";
import { secureErrorResponse } from "./secure-headers";

// Logger Edge-compatible (pas d'import de pino)
// Toujours utiliser logger-edge dans le middleware (Edge Runtime)
const enhancedLogger = require("./logger-edge").enhancedLogger;

// Sentry désactivé dans Edge Runtime (pas compatible)
let Sentry: any = null;

export interface WAFResult {
  blocked: boolean;
  reason?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

/**
 * Patterns d'attaque XSS
 */
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick, onload, etc.
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /vbscript:/i,
  /<img[^>]*src[^>]*=.*javascript:/i,
  /<svg[^>]*onload/i,
];

/**
 * Patterns d'attaque SQL Injection
 */
const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|CAST|CONVERT)\b)/i,
  /('|"|;|\s|^)(OR|AND)\s+\d+\s*=\s*\d+/i,
  /('|"|;|\s|^)(OR|AND)\s+'[^']*'\s*=\s*'[^']*'/i,
  /(\bOR\b\s+\d+\s*=\s*\d+\s*--)/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bDROP\b.*\bTABLE\b)/i,
  /(\bDELETE\b.*\bFROM\b)/i,
  /(\bEXEC\b|\bEXECUTE\b)/i,
  /(--|#|\/\*|\*\/)/i, // Commentaires SQL
  /(;|\||&|\$\(|`)/i, // Caractères de séparation
];

/**
 * Patterns d'attaque LFI / Path Traversal
 */
const LFI_PATTERNS = [
  /\.\.\/|\.\.\\|\.\.%2F|\.\.%5C/i, // Path traversal
  /\/etc\/passwd/i,
  /\/proc\/self\/environ/i,
  /\/windows\/win\.ini/i,
  /\/etc\/shadow/i,
  /file:\/\//i,
  /php:\/\/filter/i,
  /\.\.\/\.\.\/\.\./i,
];

/**
 * Patterns d'attaque Command Injection
 */
const COMMAND_INJECTION_PATTERNS = [
  /(\||;|\&|\$\(|`|>\s*\/|<\s*\/)/i,
  /\b(cat|ls|pwd|whoami|id|uname|ps|kill|rm|mv|cp|chmod|chown)\b/i,
  /\b(cmd|command|exec|system|shell_exec|passthru|popen|proc_open)\s*\(/i,
];

/**
 * Vérifier une chaîne contre les patterns d'attaque
 */
function checkStringAgainstPatterns(
  value: string,
  patterns: RegExp[],
  attackType: string
): WAFResult | null {
  for (const pattern of patterns) {
    if (pattern.test(value)) {
      return {
        blocked: true,
        reason: `Attaque ${attackType} détectée`,
        severity: attackType === "SQL Injection" ? "critical" : "high",
      };
    }
  }
  return null;
}

/**
 * Analyser une valeur (récursif pour objets et tableaux)
 */
function analyzeValue(value: unknown, path: string = ""): WAFResult | null {
  if (typeof value === "string") {
    // Vérifier XSS
    const xssResult = checkStringAgainstPatterns(value, XSS_PATTERNS, "XSS");
    if (xssResult) {
      return { ...xssResult, reason: `XSS détecté dans ${path || "données"}` };
    }

    // Vérifier SQL Injection
    const sqliResult = checkStringAgainstPatterns(
      value,
      SQLI_PATTERNS,
      "SQL Injection"
    );
    if (sqliResult) {
      return {
        ...sqliResult,
        reason: `SQL Injection détecté dans ${path || "données"}`,
      };
    }

    // Vérifier LFI
    const lfiResult = checkStringAgainstPatterns(value, LFI_PATTERNS, "LFI");
    if (lfiResult) {
      return {
        ...lfiResult,
        reason: `LFI/Path Traversal détecté dans ${path || "données"}`,
      };
    }

    // Vérifier Command Injection
    const cmdResult = checkStringAgainstPatterns(
      value,
      COMMAND_INJECTION_PATTERNS,
      "Command Injection"
    );
    if (cmdResult) {
      return {
        ...cmdResult,
        reason: `Command Injection détecté dans ${path || "données"}`,
      };
    }
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const result = analyzeValue(value[i], `${path}[${i}]`);
      if (result) return result;
    }
  } else if (value && typeof value === "object") {
    for (const [key, val] of Object.entries(value)) {
      const result = analyzeValue(val, path ? `${path}.${key}` : key);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Vérifier la taille du payload (max 1 Mo)
 */
function checkPayloadSize(request: NextRequest): WAFResult | null {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 1024 * 1024; // 1 Mo

    if (size > maxSize) {
      return {
        blocked: true,
        reason: `Payload trop volumineux: ${size} bytes (max: ${maxSize} bytes)`,
        severity: "medium",
      };
    }
  }

  return null;
}

/**
 * Headers HTTP standards à exclure de l'analyse WAF
 * Ces headers sont normaux et peuvent contenir des patterns suspects mais sont sûrs
 */
const SAFE_HTTP_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'accept-charset',
  'user-agent',
  'referer',
  'origin',
  'connection',
  'cache-control',
  'content-length',
  'content-type',
  'content-encoding',
  'content-language',
  'cookie', // Header cookie standard (contient les tokens de session)
  'dnt',
  'upgrade-insecure-requests',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-user',
  'sec-fetch-dest',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-ch-ua-platform',
];

/**
 * Routes à exclure du WAF
 * Ces routes peuvent recevoir des données qui déclenchent des faux positifs
 */
const WAF_EXCLUDED_ROUTES = [
  '/api/security/report', // Route de rapport CSP qui peut contenir des patterns suspects dans les rapports
  '/api/public/design', // Route publique pour le design (pas de risques de sécurité)
  '/api/settings', // Route publique pour les paramètres (si utilisée côté client)
  '/api/auth/login', // Routes de login - nécessitent des mots de passe qui peuvent déclencher des faux positifs
  '/api/auth/login/', // Routes de login avec slash
  '/api/auth/me', // Route de vérification de session - doit être accessible sans authentification pour vérifier si l'utilisateur est connecté
];

/**
 * Analyser une requête avec le WAF
 */
export async function analyzeRequest(request: NextRequest): Promise<WAFResult> {
  // Exclure certaines routes du WAF
  const pathname = request.nextUrl.pathname;
  if (WAF_EXCLUDED_ROUTES.some(route => pathname.startsWith(route))) {
    return { blocked: false };
  }

  // Vérifier la taille du payload
  const sizeCheck = checkPayloadSize(request);
  if (sizeCheck) {
    return sizeCheck;
  }

  // Analyser les headers (exclure les headers HTTP standards pour éviter les faux positifs)
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // Ignorer les headers HTTP standards qui peuvent contenir des patterns suspects mais sont sûrs
    if (!SAFE_HTTP_HEADERS.includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  // Analyser seulement les headers non standards
  if (Object.keys(headers).length > 0) {
    const headersResult = analyzeValue(headers, "headers");
    if (headersResult) {
      return headersResult;
    }
  }

  // Analyser les query params
  const queryParams: Record<string, string | string[]> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const queryResult = analyzeValue(queryParams, "query");
  if (queryResult) {
    return queryResult;
  }

  // Analyser le body (pour POST/PUT/PATCH)
  if (
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    try {
      // Cloner la requête pour pouvoir lire le body
      const clonedRequest = request.clone();
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await clonedRequest.json();
        const bodyResult = analyzeValue(body, "body");
        if (bodyResult) {
          return bodyResult;
        }
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await clonedRequest.formData();
        const formObject: Record<string, string> = {};
        formData.forEach((value, key) => {
          formObject[key] = value.toString();
        });
        const formResult = analyzeValue(formObject, "form");
        if (formResult) {
          return formResult;
        }
      } else if (contentType.includes("text/")) {
        const text = await clonedRequest.text();
        const textResult = analyzeValue({ content: text }, "body");
        if (textResult) {
          return textResult;
        }
      }
    } catch (error) {
      // Erreur lors de la lecture du body (peut être normal)
      // Ne pas bloquer pour cette raison
    }
  }

  // Analyser l'URL
  const urlResult = analyzeValue(request.url, "url");
  if (urlResult) {
    return urlResult;
  }

  // Aucune attaque détectée
  return { blocked: false };
}

/**
 * Appliquer le WAF à une requête
 */
export async function applyWAF(
  request: NextRequest
): Promise<NextResponse | null> {
  const wafResult = await analyzeRequest(request);

  if (wafResult.blocked) {
    const ip = request.headers.get("x-forwarded-for") || request.ip || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Logger l'incident
    enhancedLogger.error("WAF: Requête bloquée", new Error(wafResult.reason || "Attaque détectée"), {
      ip,
      userAgent,
      path: request.nextUrl.pathname,
      method: request.method,
      severity: wafResult.severity,
      reason: wafResult.reason,
    });

    // Envoyer à Sentry pour monitoring (seulement si disponible et pas en Edge Runtime)
    if (Sentry) {
      Sentry.captureMessage("WAF: Requête bloquée", {
        level: wafResult.severity === "critical" ? "error" : "warning",
        tags: {
          waf: true,
          severity: wafResult.severity,
          reason: wafResult.reason,
        },
        extra: {
          ip,
          userAgent,
          path: request.nextUrl.pathname,
          method: request.method,
        },
      });
    }

    // Retourner une réponse d'erreur générique
    return secureErrorResponse(
      "Requête rejetée pour des raisons de sécurité",
      403,
      {
        code: "WAF_BLOCKED",
      }
    );
  }

  // Requête autorisée
  return null;
}

