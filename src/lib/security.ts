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

// Rate limiting Redis (optionnel, pour production)
let redisRateLimiter: any = null;

/**
 * Initialiser le rate limiter Redis si disponible
 */
async function initRedisRateLimiter() {
  if (redisRateLimiter !== null) {
    return redisRateLimiter; // Déjà initialisé
  }

  // Vérifier si Redis est configuré
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      redisRateLimiter = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(100, "1 m"), // Par défaut
        analytics: true,
      });

      enhancedLogger.info("Redis rate limiter initialized");
      return redisRateLimiter;
    } catch (error) {
      enhancedLogger.warn("Failed to initialize Redis rate limiter, using memory cache", {
        error: error instanceof Error ? error.message : String(error),
      });
      redisRateLimiter = false; // Marquer comme échoué pour éviter de réessayer
    }
  }

  redisRateLimiter = false;
  return null;
}

/**
 * Rate limiting par IP
 */
export interface RateLimitOptions {
  windowMs?: number; // Fenêtre de temps en ms
  maxRequests?: number; // Nombre max de requêtes
  identifier?: string; // Identifiant custom (IP par défaut)
  useRedis?: boolean; // Forcer l'utilisation de Redis même si disponible
}

/**
 * Middleware de rate limiting avec support Redis
 */
export function rateLimit(
  options: RateLimitOptions = {}
): (request: NextRequest) => Promise<NextResponse | null> | NextResponse | null {
  const {
    windowMs = 60000, // 1 minute par défaut
    maxRequests = 100, // 100 requêtes par défaut
    useRedis = true, // Utiliser Redis si disponible
  } = options;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const identifier =
      options.identifier ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    // Essayer d'utiliser Redis si disponible
    if (useRedis) {
      const redisLimiter = await initRedisRateLimiter();
      if (redisLimiter) {
        try {
          const result = await redisLimiter.limit(identifier);
          const remaining = result.remaining;
          const reset = result.reset;

          if (!result.allowed) {
            enhancedLogger.warn("Rate limit exceeded (Redis)", {
              identifier,
              remaining,
              maxRequests,
              path: request.nextUrl.pathname,
            });

            return NextResponse.json(
              {
                error: "Too many requests",
                message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
                retryAfter: Math.ceil((reset - Date.now()) / 1000),
              },
              {
                status: 429,
                headers: {
                  "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                  "X-RateLimit-Limit": String(maxRequests),
                  "X-RateLimit-Remaining": String(Math.max(0, remaining)),
                  "X-RateLimit-Reset": String(reset),
                },
              }
            );
          }

          // Requête autorisée
          return null;
        } catch (error) {
          enhancedLogger.error("Redis rate limit error, falling back to memory", {
            error: error instanceof Error ? error.message : String(error),
          });
          // Fallback sur mémoire
        }
      }
    }

    // Fallback sur mémoire locale (LRU cache)
    const key = `rate-limit:${identifier}`;
    const current = rateLimitCache.get(key) || 0;

    if (current >= maxRequests) {
      enhancedLogger.warn("Rate limit exceeded (Memory)", {
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

