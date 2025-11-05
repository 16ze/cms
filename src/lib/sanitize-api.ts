/**
 * 🧹 SANITIZATION API
 * ==================
 *
 * Sanitization renforcée pour les inputs API
 * Protection contre les injections SQL, XSS, et corruption de données
 */

import { sanitizeObject, sanitizeInput } from "./security";
import { z } from "zod";

/**
 * Sanitizer pour les données JSON entrantes
 */
export function sanitizeApiInput<T extends Record<string, unknown>>(data: T): T {
  return sanitizeObject(data);
}

/**
 * Valider et sanitizer les données avec Zod
 */
export function validateAndSanitize<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  // D'abord valider avec Zod
  const validated = schema.parse(data);
  
  // Ensuite sanitizer
  if (typeof validated === "object" && validated !== null) {
    return sanitizeObject(validated as Record<string, unknown>) as T;
  }
  
  return validated;
}

/**
 * Vérifier la structure des données pour éviter la corruption
 */
export function validateDataStructure(
  data: unknown,
  maxDepth: number = 10,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; error?: string } {
  const dataString = JSON.stringify(data);
  
  // Vérifier la taille
  if (dataString.length > maxSize) {
    return {
      valid: false,
      error: `Data size exceeds maximum allowed size of ${maxSize} bytes`,
    };
  }
  
  // Vérifier la profondeur
  const depth = getObjectDepth(data);
  if (depth > maxDepth) {
    return {
      valid: false,
      error: `Data depth exceeds maximum allowed depth of ${maxDepth} levels`,
    };
  }
  
  return { valid: true };
}

/**
 * Calculer la profondeur d'un objet
 */
function getObjectDepth(obj: unknown, currentDepth: number = 0): number {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return currentDepth;
  }
  
  if (Array.isArray(obj)) {
    return Math.max(
      ...obj.map((item) => getObjectDepth(item, currentDepth + 1)),
      currentDepth
    );
  }
  
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return currentDepth;
  }
  
  return Math.max(
    ...keys.map((key) =>
      getObjectDepth((obj as Record<string, unknown>)[key], currentDepth + 1)
    ),
    currentDepth
  );
}

/**
 * Vérifier qu'aucun tenantId n'est présent dans les données d'entrée
 * (doit être injecté automatiquement par le middleware)
 */
export function assertNoTenantIdInInput(data: Record<string, unknown>): void {
  if ("tenantId" in data) {
    throw new Error(
      "tenantId should not be provided in input data - it is automatically set by the middleware"
    );
  }
}

/**
 * Nettoyer les données avant sauvegarde Prisma
 */
export function cleanDataForPrisma<T extends Record<string, unknown>>(
  data: T
): T {
  // Supprimer les champs dangereux
  const cleaned = { ...data };
  
  // Liste des champs à supprimer
  const dangerousFields = ["__proto__", "constructor", "prototype"];
  
  dangerousFields.forEach((field) => {
    delete cleaned[field];
  });
  
  // Sanitizer tous les strings
  return sanitizeObject(cleaned);
}

