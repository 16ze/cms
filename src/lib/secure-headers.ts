/**
 * 🛡️ SECURE HEADERS MIDDLEWARE
 * =============================
 *
 * Middleware global pour injecter les headers de sécurité
 * sur toutes les routes API
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Headers de sécurité renforcés selon les meilleures pratiques OWASP
 */
export function getSecureHeaders(): HeadersInit {
  const headers: HeadersInit = {
    // Protection contre clickjacking
    "X-Frame-Options": "DENY",
    
    // Empêcher le MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Politique de referrer stricte
    "Referrer-Policy": "same-origin",
    
    // HSTS pour forcer HTTPS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    
    // Protection contre les ressources cross-origin
    "Cross-Origin-Resource-Policy": "same-origin",
    
    // Protection contre les embeddings cross-origin
    "Cross-Origin-Embedder-Policy": "require-corp",
    
    // Permissions Policy (anciennement Feature-Policy)
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    
    // XSS Protection (obsolète mais toujours utile pour anciens navigateurs)
    "X-XSS-Protection": "1; mode=block",
  };

  return headers;
}

/**
 * Appliquer les headers de sécurité à une réponse
 */
export function applySecureHeaders(response: NextResponse): NextResponse {
  const headers = getSecureHeaders();
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}

/**
 * Créer une réponse avec headers de sécurité
 */
export function secureResponse(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init);
  return applySecureHeaders(response);
}

/**
 * Créer une réponse d'erreur sécurisée
 */
export function secureErrorResponse(
  error: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  return secureResponse(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

