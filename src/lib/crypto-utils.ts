/**
 * 🔐 CRYPTO UTILITIES
 * ===================
 * 
 * Utilitaires de chiffrement pour tokens et secrets
 * - AES-256-GCM pour chiffrement symétrique
 * - Génération de secrets sécurisés
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 16; // 128 bits pour GCM
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits pour l'authentification GCM
const KEY_LENGTH = 32; // 256 bits pour AES-256

/**
 * Obtenir la clé de chiffrement depuis les variables d'environnement
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ADMIN_SESSION_SECRET || process.env.ENCRYPTION_KEY;
  
  if (!key || key.length < 64) {
    throw new Error(
      "ADMIN_SESSION_SECRET ou ENCRYPTION_KEY doit être défini et faire au moins 64 caractères"
    );
  }

  // Dériver une clé de 256 bits depuis le secret
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * Chiffrer une donnée avec AES-256-GCM
 * 
 * @param plaintext - Texte en clair à chiffrer
 * @returns Chaîne base64url contenant: salt:iv:tag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Dériver une clé unique depuis le salt et la clé principale
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, "sha512");

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  
  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const tag = cipher.getAuthTag();

  // Combiner: salt:iv:tag:ciphertext en base64url
  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  
  return combined
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Déchiffrer une donnée chiffrée avec AES-256-GCM
 * 
 * @param encrypted - Chaîne base64url contenant: salt:iv:tag:ciphertext
 * @returns Texte en clair
 */
export function decrypt(encrypted: string): string {
  try {
    // Décoder depuis base64url
    const normalized = encrypted.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLength);
    const combined = Buffer.from(padded, "base64");

    // Extraire les composants
    let offset = 0;
    const salt = combined.slice(offset, offset + SALT_LENGTH);
    offset += SALT_LENGTH;
    const iv = combined.slice(offset, offset + IV_LENGTH);
    offset += IV_LENGTH;
    const tag = combined.slice(offset, offset + TAG_LENGTH);
    offset += TAG_LENGTH;
    const ciphertext = combined.slice(offset);

    const key = getEncryptionKey();
    
    // Dériver la même clé depuis le salt
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, "sha512");

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    throw new Error(`Échec du déchiffrement: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
  }
}

/**
 * Générer un token aléatoire sécurisé
 * 
 * @param length - Longueur en bytes (défaut: 32)
 * @returns Token hexadécimal
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hasher une valeur avec SHA-512
 * 
 * @param value - Valeur à hasher
 * @returns Hash hexadécimal SHA-512
 */
export function sha512Hash(value: string): string {
  return crypto.createHash("sha512").update(value).digest("hex");
}

