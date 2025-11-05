/**
 * 🔒 SÉCURITÉ DES SESSIONS AMÉLIORÉE
 * ===================================
 * 
 * Système de sessions avec:
 * - HMAC SHA-512 pour la signature
 * - Expiration courte (30 min)
 * - Refresh tokens chiffrés en base
 * - Rotation automatique de tokens
 */

import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { encrypt, decrypt, generateSecureToken } from "./crypto-utils";
import { enhancedLogger } from "./logger";

export const ADMIN_SESSION_COOKIE = "admin_session" as const;
export const REFRESH_TOKEN_COOKIE = "refresh_token" as const;
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 30; // 30 minutes
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 jours

export interface AdminSessionPayload {
  email: string;
  name: string;
  id: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN";
  loginTime: string;
  tenantId?: string;
  tenantSlug?: string;
  userType: "SUPER_ADMIN" | "TENANT_USER";
}

export interface AdminSessionClaims extends AdminSessionPayload {
  iat: number;
  exp: number;
  jti: string; // JWT ID pour rotation
}

export type AdminSessionVerificationResult =
  | { valid: true; claims: AdminSessionClaims }
  | { valid: false; reason: AdminSessionErrorCode };

export type AdminSessionErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_FORMAT"
  | "INVALID_SIGNATURE"
  | "EXPIRED_TOKEN"
  | "MISSING_SECRET"
  | "REVOKED_TOKEN";

/**
 * Obtenir le secret de session (minimum 64 caractères requis)
 */
export const getAdminSessionSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 64) {
    throw Object.assign(
      new Error(
        "ADMIN_SESSION_SECRET doit être défini et faire au moins 64 caractères"
      ),
      { code: "MISSING_SECRET" }
    );
  }
  return secret;
};

/**
 * Encoder en base64url
 */
const toBase64Url = (buffer: Buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

/**
 * Décoder depuis base64url
 */
const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64");
};

/**
 * Comparaison à temps constant pour éviter les attaques par timing
 */
const timingSafeCompare = (a: Buffer, b: Buffer) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

/**
 * Signer une session avec HMAC SHA-512
 */
export const signAdminSession = (
  payload: AdminSessionPayload,
  secret: string,
  maxAgeSeconds: number = ACCESS_TOKEN_MAX_AGE_SECONDS
) => {
  if (secret.length < 64) {
    throw new Error("ADMIN_SESSION_SECRET doit faire au moins 64 caractères");
  }

  const header = { alg: "HS512", typ: "JWT" };
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + maxAgeSeconds;
  const jti = generateSecureToken(16); // ID unique pour rotation

  const claims: AdminSessionClaims = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
    jti,
  };

  const encodedHeader = toBase64Url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = toBase64Url(Buffer.from(JSON.stringify(claims)));

  // Utiliser HMAC SHA-512 au lieu de SHA-256
  const signature = crypto
    .createHmac("sha512", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  return `${encodedHeader}.${encodedPayload}.${toBase64Url(signature)}`;
};

/**
 * Vérifier une session signée avec HMAC SHA-512
 */
export const verifyAdminSession = (
  token: string | undefined,
  secret: string
): AdminSessionVerificationResult => {
  if (!token) return { valid: false, reason: "MISSING_TOKEN" };

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  // Vérifier la signature avec HMAC SHA-512
  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const actualSignature = fromBase64Url(encodedSignature);

  if (!timingSafeCompare(expectedSignature, actualSignature)) {
    return { valid: false, reason: "INVALID_SIGNATURE" };
  }

  try {
    const payloadBuffer = fromBase64Url(encodedPayload);
    const claims = JSON.parse(
      payloadBuffer.toString("utf8")
    ) as AdminSessionClaims;

    if (!claims || typeof claims.exp !== "number" || !claims.jti) {
      return { valid: false, reason: "INVALID_FORMAT" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) {
      return { valid: false, reason: "EXPIRED_TOKEN" };
    }

    return { valid: true, claims };
  } catch (error) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }
};

/**
 * Créer un refresh token et le stocker en base (chiffré)
 */
export async function createRefreshToken(
  userId: string,
  userType: "SUPER_ADMIN" | "TENANT_USER",
  tenantId?: string
): Promise<string> {
  const token = generateSecureToken(32); // 256 bits
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);
  
  // Chiffrer le token avant stockage
  const encryptedToken = encrypt(token);

  await prisma.refreshToken.create({
    data: {
      token: encryptedToken,
      userId,
      userType,
      tenantId: tenantId || null,
      expiresAt,
    },
  });

  return token; // Retourner le token en clair pour le cookie
}

/**
 * Valider et utiliser un refresh token
 */
export async function validateRefreshToken(
  token: string
): Promise<{
  valid: boolean;
  userId?: string;
  userType?: "SUPER_ADMIN" | "TENANT_USER";
  tenantId?: string | null;
  reason?: string;
}> {
  try {
    // Chiffrer le token pour le chercher en base
    const encryptedToken = encrypt(token);

    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: encryptedToken },
    });

    if (!refreshToken) {
      return { valid: false, reason: "TOKEN_NOT_FOUND" };
    }

    // Vérifier expiration
    if (refreshToken.expiresAt < new Date()) {
      // Marquer comme révoqué
      await prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: { revoked: true, revokedAt: new Date() },
      });
      return { valid: false, reason: "EXPIRED" };
    }

    // Vérifier si révoqué
    if (refreshToken.revoked) {
      return { valid: false, reason: "REVOKED" };
    }

    // Mettre à jour lastUsedAt
    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      valid: true,
      userId: refreshToken.userId,
      userType: refreshToken.userType as "SUPER_ADMIN" | "TENANT_USER",
      tenantId: refreshToken.tenantId,
    };
  } catch (error) {
    enhancedLogger.error("Error validating refresh token", error);
    return { valid: false, reason: "INTERNAL_ERROR" };
  }
}

/**
 * Révoquer un refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    const encryptedToken = encrypt(token);
    
    await prisma.refreshToken.updateMany({
      where: {
        token: encryptedToken,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    enhancedLogger.error("Error revoking refresh token", error);
  }
}

/**
 * Révoquer tous les refresh tokens d'un utilisateur
 */
export async function revokeAllUserRefreshTokens(
  userId: string,
  userType: "SUPER_ADMIN" | "TENANT_USER"
): Promise<void> {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        userType,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    enhancedLogger.error("Error revoking all user refresh tokens", error);
  }
}

/**
 * Nettoyer les refresh tokens expirés (à appeler périodiquement)
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    enhancedLogger.error("Error cleaning up expired refresh tokens", error);
    return 0;
  }
}

/**
 * Wrapper pour NextRequest
 */
export const verifyAdminSessionFromRequest = (request: NextRequest) => {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = getAdminSessionSecret();

  if (!token || typeof token !== "string") {
    return {
      success: false,
      error: "MISSING_TOKEN",
    };
  }

  const result = verifyAdminSession(token, secret);

  if (result.valid) {
    return {
      success: true,
      data: result.claims,
    };
  } else {
    return {
      success: false,
      error: result.reason,
    };
  }
};

