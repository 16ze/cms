/**
 * 🔐 SECURE STORAGE HOOK
 * =======================
 *
 * Hook pour le stockage sécurisé avec chiffrement
 * Gestion des cookies sécurisés (SameSite, Secure, HttpOnly simulation)
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createThreatContext, ThreatType, reportThreat } from "@/lib/clientShield";
import * as Sentry from "@sentry/nextjs";

/**
 * Configuration du stockage sécurisé
 */
interface SecureStorageConfig {
  /**
   * Durée de vie du token en ms (défaut: 10 minutes)
   */
  tokenLifetime?: number;

  /**
   * Activer la rotation automatique des tokens
   */
  enableTokenRotation?: boolean;
}

/**
 * Clé de chiffrement dérivée de la session
 */
let encryptionKey: CryptoKey | null = null;

/**
 * Initialiser la clé de chiffrement
 */
async function initEncryptionKey(sessionId: string): Promise<CryptoKey> {
  if (encryptionKey) return encryptionKey;

  try {
    // Dériver une clé depuis le sessionId
    const encoder = new TextEncoder();
    const data = encoder.encode(sessionId + "kairo-secure-storage-salt");

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      data,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    encryptionKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("kairo-salt-2024"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return encryptionKey;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la clé de chiffrement:", error);
    throw error;
  }
}

/**
 * Chiffrer une valeur
 */
async function encryptValue(value: string, sessionId: string): Promise<string> {
  try {
    const key = await initEncryptionKey(sessionId);
    const encoder = new TextEncoder();
    const data = encoder.encode(value);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );

    // Combiner IV et données chiffrées
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Encoder en base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    throw error;
  }
}

/**
 * Déchiffrer une valeur
 */
async function decryptValue(encryptedValue: string, sessionId: string): Promise<string> {
  try {
    const key = await initEncryptionKey(sessionId);
    const combined = Uint8Array.from(atob(encryptedValue), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    throw error;
  }
}

/**
 * Obtenir un sessionId unique
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  // Essayer de récupérer depuis sessionStorage
  let sessionId = sessionStorage.getItem("__kairo_session_id__");

  if (!sessionId) {
    // Générer un nouvel ID
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("__kairo_session_id__", sessionId);
  }

  return sessionId;
}

/**
 * Hook useSecureStorage - Stockage sécurisé avec chiffrement
 *
 * @example
 * ```tsx
 * const { setSecureItem, getSecureItem, removeSecureItem } = useSecureStorage();
 *
 * await setSecureItem("token", "my-secret-token");
 * const token = await getSecureItem("token");
 * ```
 */
export function useSecureStorage(config: SecureStorageConfig = {}) {
  const { tokenLifetime = 10 * 60 * 1000, enableTokenRotation = true } = config;
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionId] = useState(() => getSessionId());

  /**
   * Stocker une valeur de manière sécurisée
   */
  const setSecureItem = useCallback(
    async (key: string, value: string): Promise<void> => {
      if (typeof window === "undefined") return;

      try {
        // Vérifier que la valeur ne contient pas de menaces
        const threats = [
          /<script[\s>]/i,
          /javascript:/i,
          /on\w+\s*=/i,
        ].some((pattern) => pattern.test(value));

        if (threats) {
          const threat = createThreatContext(
            ThreatType.XSS,
            "secureStorage",
            value.substring(0, 500),
            {
              stack: new Error().stack,
            }
          );
          reportThreat(threat);
          throw new Error("Valeur contenant des menaces détectées");
        }

        // Chiffrer la valeur
        const encrypted = await encryptValue(value, sessionId);

        // Stocker avec timestamp
        const item = {
          value: encrypted,
          timestamp: Date.now(),
          expiresAt: Date.now() + tokenLifetime,
        };

        localStorage.setItem(`__secure_${key}__`, JSON.stringify(item));
      } catch (error) {
        console.error(`Erreur lors du stockage sécurisé de ${key}:`, error);
        Sentry.captureException(error, {
          tags: {
            operation: "setSecureItem",
            key,
          },
        });
        throw error;
      }
    },
    [sessionId, tokenLifetime]
  );

  /**
   * Récupérer une valeur sécurisée
   */
  const getSecureItem = useCallback(
    async (key: string): Promise<string | null> => {
      if (typeof window === "undefined") return null;

      try {
        const stored = localStorage.getItem(`__secure_${key}__`);
        if (!stored) return null;

        const item = JSON.parse(stored);

        // Vérifier l'expiration
        if (item.expiresAt && Date.now() > item.expiresAt) {
          localStorage.removeItem(`__secure_${key}__`);
          return null;
        }

        // Déchiffrer
        const decrypted = await decryptValue(item.value, sessionId);
        return decrypted;
      } catch (error) {
        console.error(`Erreur lors de la récupération sécurisée de ${key}:`, error);
        Sentry.captureException(error, {
          tags: {
            operation: "getSecureItem",
            key,
          },
        });
        return null;
      }
    },
    [sessionId]
  );

  /**
   * Supprimer une valeur sécurisée
   */
  const removeSecureItem = useCallback((key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`__secure_${key}__`);
  }, []);

  /**
   * Nettoyer toutes les valeurs expirées
   */
  const cleanupExpired = useCallback(() => {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith("__secure_")) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const item = JSON.parse(stored);
            if (item.expiresAt && Date.now() > item.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Ignorer les erreurs de parsing
        }
      }
    }
  }, []);

  /**
   * Rotation automatique des tokens
   */
  useEffect(() => {
    if (!enableTokenRotation || typeof window === "undefined") return;

    const rotateTokens = async () => {
      cleanupExpired();

      // Rotation des tokens actifs
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("__secure_")) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item = JSON.parse(stored);
              const age = Date.now() - item.timestamp;

              // Si le token a plus de 50% de sa durée de vie, le renouveler
              if (age > tokenLifetime * 0.5 && item.expiresAt > Date.now()) {
                const decrypted = await decryptValue(item.value, sessionId);
                if (decrypted) {
                  await setSecureItem(key.replace("__secure_", "").replace("__", ""), decrypted);
                }
              }
            }
          } catch {
            // Ignorer les erreurs
          }
        }
      }
    };

    // Rotation toutes les 5 minutes
    rotationIntervalRef.current = setInterval(rotateTokens, 5 * 60 * 1000);

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [enableTokenRotation, tokenLifetime, sessionId, setSecureItem, cleanupExpired]);

  // Cleanup au montage
  useEffect(() => {
    cleanupExpired();
  }, [cleanupExpired]);

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    cleanupExpired,
  };
}

/**
 * Fonction utilitaire pour définir un cookie sécurisé (simulation côté client)
 * Note: Les vrais cookies HttpOnly doivent être définis côté serveur
 */
export function setSecureCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): void {
  if (typeof document === "undefined") return;

  const {
    maxAge = 3600,
    domain = window.location.hostname,
    path = "/",
    secure = true,
    sameSite = "strict",
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite}`;

  if (secure && window.location.protocol === "https:") {
    cookie += "; Secure";
  }

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  document.cookie = cookie;
}

/**
 * Fonction utilitaire pour obtenir un cookie sécurisé
 */
export function getSecureCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

