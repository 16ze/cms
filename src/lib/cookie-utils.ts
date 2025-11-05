/**
 * 🔒 COOKIE HELPER - Normalisation des cookies de session
 * 
 * Garantit que tous les cookies de session utilisent les mêmes paramètres sécurisés
 */

import { NextResponse } from "next/server";

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
}

/**
 * Configuration standardisée pour les cookies de session
 */
export const STANDARD_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
} as const;

/**
 * Définir un cookie de session avec les paramètres sécurisés standardisés
 */
export function setSecureCookie(
  response: NextResponse,
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  response.cookies.set(name, value, {
    ...STANDARD_COOKIE_OPTIONS,
    maxAge: options.maxAge || 60 * 60 * 24 * 7, // 7 jours par défaut
    domain: options.domain,
    path: options.path || STANDARD_COOKIE_OPTIONS.path,
  });
}

/**
 * Supprimer un cookie de session
 */
export function deleteSecureCookie(
  response: NextResponse,
  name: string,
  options: Pick<CookieOptions, "domain" | "path"> = {}
): void {
  response.cookies.set(name, "", {
    ...STANDARD_COOKIE_OPTIONS,
    maxAge: -1,
    expires: new Date("1970-01-01"),
    domain: options.domain,
    path: options.path || STANDARD_COOKIE_OPTIONS.path,
  });
}

