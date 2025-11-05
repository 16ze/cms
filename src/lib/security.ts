/**
 * 🔒 SECURITY UTILITIES
 * =====================
 *
 * Fonctions utilitaires pour la sécurité du CMS
 * - Rate limiting
 * - Input sanitization
 * - CSRF protection helpers
 * - Security headers
 */

import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { enhancedLogger } from "@/lib/logger";

// Rate limiting cache (mémoire locale - pour production utiliser Redis)
const rateLimitCache = new LRUCache<string, number>({
  max: 10000,
  ttl: 60000, // 1 minute
});

/**
 * Rate limiting par IP
 */
export interface RateLimitOptions {
  windowMs?: number; // Fenêtre de temps en ms
  maxRequests?: number; // Nombre max de requêtes
  identifier?: string; // Identifiant custom (IP par défaut)
}

/**
 * Middleware de rate limiting
 */
export function rateLimit(
  options: RateLimitOptions = {}
): (request: NextRequest) => NextResponse | null {
  const {
    windowMs = 60000, // 1 minute par défaut
    maxRequests = 100, // 100 requêtes par défaut
  } = options;

  return (request: NextRequest): NextResponse | null => {
    const identifier =
      options.identifier ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    const key = `rate-limit:${identifier}`;
    const current = rateLimitCache.get(key) || 0;

    if (current >= maxRequests) {
      enhancedLogger.warn("Rate limit exceeded", {
        identifier,
        current,
        maxRequests,
        path: request.nextUrl.pathname,
      });

      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
          retryAfter: Math.ceil(windowMs / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(windowMs / 1000)),
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": String(Math.max(0, maxRequests - current)),
            "X-RateLimit-Reset": String(Date.now() + windowMs),
          },
        }
      );
    }

    rateLimitCache.set(key, current + 1, { ttl: windowMs });
    return null; // Pas de limite atteinte, continuer
  };
}

/**
 * Sanitize input string (prévention XSS basique)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Supprimer les chevrons
    .replace(/javascript:/gi, "") // Supprimer javascript:
    .replace(/on\w+=/gi, "") // Supprimer les handlers d'événements
    .trim();
}

/**
 * Valider et sanitizer un objet complet
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key] as string) as T[Extract<keyof T, string>];
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Vérifier l'origine de la requête (CSRF protection basique)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // En développement, autoriser localhost
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // En production, vérifier l'origine
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
  const requestOrigin = origin || referer;

  if (!requestOrigin) {
    return false;
  }

  return allowedOrigins.some((allowed) => requestOrigin.startsWith(allowed));
}

/**
 * Headers de sécurité renforcés
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  };
}

/**
 * Appliquer les headers de sécurité à une réponse
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Vérifier si une requête est authentifiée (helper)
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const authCookie = request.cookies.get("admin_session") || request.cookies.get("tenant_session");

  if (!authCookie) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication required",
      },
      { status: 401 }
    );
  }

  return null;
}

