/**
 * 🛡️ SANITISATION DES ERREURS PRISMA
 * ===================================
 * 
 * Empêche la fuite d'informations sensibles depuis les erreurs Prisma
 * - Masque les IDs de base de données
 * - Cache les détails de schéma
 * - Génère des messages d'erreur génériques en production
 */

import { Prisma } from "@prisma/client";
import { enhancedLogger } from "./logger";

/**
 * Masquer les IDs Prisma dans les messages d'erreur
 */
function maskPrismaIds(message: string): string {
  // Masquer les IDs UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  return message.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "[ID_MASQUÉ]"
  );
}

/**
 * Masquer les noms de colonnes/tables sensibles
 */
function maskSensitiveFields(message: string): string {
  const sensitiveFields = [
    "password",
    "secret",
    "token",
    "key",
    "email",
    "hashedPassword",
    "refreshToken",
    "accessToken",
  ];

  let sanitized = message;
  for (const field of sensitiveFields) {
    const regex = new RegExp(`\\b${field}\\b`, "gi");
    sanitized = sanitized.replace(regex, "[FIELD_MASQUÉ]");
  }

  return sanitized;
}

/**
 * Sanitiser une erreur Prisma pour la production
 */
export function sanitizePrismaError(
  error: unknown,
  fallbackMessage: string = "Une erreur de base de données s'est produite"
): {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
} {
  const isProduction = process.env.NODE_ENV === "production";

  // Logger l'erreur complète en interne
  if (error instanceof Error) {
    enhancedLogger.error("Prisma error occurred", error, {
      name: error.name,
      stack: isProduction ? undefined : error.stack,
    });
  } else {
    enhancedLogger.error("Unknown Prisma error", error as Error);
  }

  // En production, retourner un message générique
  if (isProduction) {
    return {
      message: fallbackMessage,
      code: "DATABASE_ERROR",
    };
  }

  // En développement, retourner plus de détails (mais toujours masqués)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let message = error.message;
    message = maskPrismaIds(message);
    message = maskSensitiveFields(message);

    return {
      message,
      code: error.code,
      details: {
        meta: error.meta,
      },
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    let message = error.message;
    message = maskPrismaIds(message);
    message = maskSensitiveFields(message);

    return {
      message,
      code: "VALIDATION_ERROR",
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: "Erreur d'initialisation de la base de données",
      code: "INITIALIZATION_ERROR",
    };
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return {
      message: "Erreur critique de la base de données",
      code: "PANIC_ERROR",
    };
  }

  if (error instanceof Error) {
    let message = error.message;
    message = maskPrismaIds(message);
    message = maskSensitiveFields(message);

    return {
      message,
    };
  }

  return {
    message: fallbackMessage,
  };
}

/**
 * Wrapper pour exécuter une opération Prisma avec gestion d'erreurs sanitisée
 */
export async function safePrismaOperation<T>(
  operation: () => Promise<T>,
  fallbackMessage?: string
): Promise<{ success: true; data: T } | { success: false; error: string; code?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const sanitized = sanitizePrismaError(error, fallbackMessage);
    return {
      success: false,
      error: sanitized.message,
      code: sanitized.code,
    };
  }
}

