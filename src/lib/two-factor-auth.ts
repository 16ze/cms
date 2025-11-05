/**
 * 🔐 AUTHENTIFICATION À DEUX FACTEURS (2FA)
 * ==========================================
 * 
 * Implémentation TOTP (Time-based One-Time Password) pour Super Admin
 * Utilise speakeasy pour générer et valider les codes TOTP
 * Secrets chiffrés avec AES-256-GCM
 */

import * as speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "./prisma";
import { encrypt, decrypt, generateSecureToken } from "./crypto-utils";
import { enhancedLogger } from "./logger";

/**
 * Générer un secret TOTP pour un Super Admin
 */
export async function generate2FASecret(superAdminId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  // Générer le secret TOTP
  const secret = speakeasy.generateSecret({
    name: `KAIRO CMS (Super Admin)`,
    issuer: "KAIRO Digital",
    length: 32, // Secret de 32 caractères
  });

  // Générer 10 codes de secours
  const backupCodes = Array.from({ length: 10 }, () => generateSecureToken(8));

  // Chiffrer le secret et les codes de secours
  const encryptedSecret = encrypt(secret.base32 || "");
  const encryptedBackupCodes = encrypt(JSON.stringify(backupCodes));

  // Sauvegarder en base (ou mettre à jour si existe déjà)
  await prisma.superAdmin2FA.upsert({
    where: { superAdminId },
    create: {
      superAdminId,
      secret: encryptedSecret,
      backupCodes: encryptedBackupCodes,
      isEnabled: false, // Pas encore activé tant que l'utilisateur n'a pas validé
    },
    update: {
      secret: encryptedSecret,
      backupCodes: encryptedBackupCodes,
      isEnabled: false,
    },
  });

  // Générer le QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

  return {
    secret: secret.base32 || "",
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Activer le 2FA pour un Super Admin (après validation du code)
 */
export async function enable2FA(
  superAdminId: string,
  verificationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const twoFA = await prisma.superAdmin2FA.findUnique({
      where: { superAdminId },
    });

    if (!twoFA) {
      return { success: false, error: "2FA non configuré" };
    }

    // Déchiffrer le secret
    const secret = decrypt(twoFA.secret);

    // Vérifier le code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: verificationCode,
      window: 2, // Autoriser ±2 fenêtres de temps (60 secondes)
    });

    if (!verified) {
      return { success: false, error: "Code invalide" };
    }

    // Activer le 2FA
    await prisma.superAdmin2FA.update({
      where: { superAdminId },
      data: { isEnabled: true },
    });

    return { success: true };
  } catch (error) {
    enhancedLogger.error("Error enabling 2FA", error);
    return { success: false, error: "Erreur lors de l'activation" };
  }
}

/**
 * Vérifier un code TOTP ou un code de secours
 */
export async function verify2FA(
  superAdminId: string,
  code: string
): Promise<{ success: boolean; usedBackupCode?: boolean; error?: string }> {
  try {
    const twoFA = await prisma.superAdmin2FA.findUnique({
      where: { superAdminId },
    });

    if (!twoFA || !twoFA.isEnabled) {
      return { success: false, error: "2FA non activé" };
    }

    // Déchiffrer le secret
    const secret = decrypt(twoFA.secret);

    // Vérifier le code TOTP
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (verified) {
      return { success: true };
    }

    // Si le code TOTP échoue, vérifier les codes de secours
    if (twoFA.backupCodes) {
      const backupCodes = JSON.parse(decrypt(twoFA.backupCodes)) as string[];
      const backupIndex = backupCodes.indexOf(code);

      if (backupIndex !== -1) {
        // Retirer le code de secours utilisé
        backupCodes.splice(backupIndex, 1);
        const encryptedBackupCodes = encrypt(JSON.stringify(backupCodes));

        await prisma.superAdmin2FA.update({
          where: { superAdminId },
          data: { backupCodes: encryptedBackupCodes },
        });

        return { success: true, usedBackupCode: true };
      }
    }

    return { success: false, error: "Code invalide" };
  } catch (error) {
    enhancedLogger.error("Error verifying 2FA", error);
    return { success: false, error: "Erreur lors de la vérification" };
  }
}

/**
 * Vérifier si le 2FA est activé pour un Super Admin
 */
export async function is2FAEnabled(superAdminId: string): Promise<boolean> {
  try {
    const twoFA = await prisma.superAdmin2FA.findUnique({
      where: { superAdminId },
    });

    return twoFA?.isEnabled || false;
  } catch (error) {
    enhancedLogger.error("Error checking 2FA status", error);
    return false;
  }
}

/**
 * Désactiver le 2FA pour un Super Admin
 */
export async function disable2FA(superAdminId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.superAdmin2FA.update({
      where: { superAdminId },
      data: {
        isEnabled: false,
        backupCodes: null,
      },
    });

    return { success: true };
  } catch (error) {
    enhancedLogger.error("Error disabling 2FA", error);
    return { success: false, error: "Erreur lors de la désactivation" };
  }
}

