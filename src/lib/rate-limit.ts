/**
 * 🚦 GLOBAL RATE LIMITER
 * ======================
 *
 * Rate limiter global utilisant Upstash Redis
 * Protection contre les attaques par déni de service
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { secureErrorResponse } from "./secure-headers";
import { enhancedLogger } from "./logger";

// Instance Redis pour le rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Rate limiter global pour les routes API
 */
export const globalApiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requêtes par minute
  analytics: true,
  prefix: "@upstash/ratelimit/api",
});

/**
 * Rate limiter strict pour les routes d'authentification
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 tentatives par minute
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});

/**
 * Rate limiter pour les routes admin
 */
export const adminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 m"), // 200 requêtes par minute
  analytics: true,
  prefix: "@upstash/ratelimit/admin",
});

/**
 * Rate limiter pour les routes super-admin
 */
export const superAdminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, "1 m"), // 500 requêtes par minute
  analytics: true,
  prefix: "@upstash/ratelimit/super-admin",
});

/**
 * Obtenir l'identifiant pour le rate limiting
 */
function getRateLimitIdentifier(request: NextRequest): string {
  // Priorité : IP de la requête
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = request.ip || realIp || forwardedFor?.split(",")[0]?.trim() || "unknown";
  
  // Si l'utilisateur est authentifié, utiliser son ID pour un rate limiting plus précis
  const authCookie = request.cookies.get("admin_session") || request.cookies.get("tenant_session");
  if (authCookie) {
    // Essayer d'extraire l'ID utilisateur du cookie (si disponible)
    try {
      const cookieValue = authCookie.value;
      // Le cookie pourrait contenir un JWT ou un ID, on utilise l'IP par défaut
      // mais on pourrait améliorer cela en décodant le token
    } catch {
      // Ignorer les erreurs de parsing
    }
  }
  
  return ip;
}

/**
 * Appliquer le rate limiting sur une requête
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter?: Ratelimit
): Promise<NextResponse | null> {
  const selectedLimiter = limiter || globalApiRateLimiter;
  
  // En développement, skip le rate limiting si Redis n'est pas configuré
  if (
    process.env.NODE_ENV === "development" &&
    (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
  ) {
    enhancedLogger.warn("Rate limiting skipped - Redis not configured", {
      path: request.nextUrl.pathname,
    });
    return null;
  }

  const identifier = getRateLimitIdentifier(request);
  
  try {
    const { success, limit, remaining, reset } = await selectedLimiter.limit(identifier);
    
    if (!success) {
      enhancedLogger.warn("Rate limit exceeded", {
        identifier,
        limit,
        remaining,
        reset,
        path: request.nextUrl.pathname,
      });
      
      return secureErrorResponse(
        "Too many requests",
        429,
        {
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
          limit,
          remaining,
        }
      );
    }
    
    // Pas de limite atteinte
    return null;
  } catch (error) {
    // En cas d'erreur Redis, logger mais ne pas bloquer la requête
    enhancedLogger.error("Rate limit error", error, {
      identifier,
      path: request.nextUrl.pathname,
    });
    
    // En production, on pourrait choisir de bloquer ou de permettre
    // Pour l'instant, on permet en cas d'erreur
    return null;
  }
}

/**
 * Wrapper pour ajouter les headers de rate limit à une réponse
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(reset / 1000)));
  
  return response;
}

